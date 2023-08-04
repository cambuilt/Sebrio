import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { WorkListService } from '../services/work-list.service';
import { WorkListRequestDialogComponent } from '../work-list-request-dialog/work-list-request-dialog.component';
import { UtilsService } from '../services/utils.service';
import { ConfirmReserveDialogComponent } from '../work-list-builder/confirm-reserve-dialog/confirm-reserve-dialog.component';
import { WorkListFilterComponent } from './work-list-filter/work-list-filter.component';
import { TranslationService } from 'angular-l10n';
import { WorkListMobileComponent } from './work-list-mobile/work-list-mobile.component';
import { WorkListDesktopComponent } from './work-list-desktop/work-list-desktop.component';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import * as moment from 'moment-timezone';
import { WorkListPreviewComponent } from './work-list-preview/work-list-preview.component';
import { WorkListCollectComponent } from './work-list-collect/work-list-collect.component';
import { WorkListCancelledComponent } from '../work-list-builder/work-list-cancelled/work-list-cancelled.component';
import { NotificationService } from '../services/notification.service';

@Component({
	selector: 'app-work-list',
	templateUrl: './work-list.component.html',
	styleUrls: ['./work-list.component.css']
})
export class WorkListComponent implements OnInit, OnDestroy, AfterViewInit {
	columns = { table: [], display: [] };
	columnStorageName = 'WORK_LIST_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	showMobile = true;
	currentWindowWidth: any;
	selectedRowId = '';
	collectButtonDisabled = false;
	showFilter = false;
	filterValue = '';
	collections = [];
	recentlyChanged = [];
	canManualRefresh: Observable<boolean>;
	canSupersedeReservations: Observable<boolean>;
	periodText: Observable<string>;
	currentPhleb: any;
	autoSubscription: any;
	dataSubscription: any;
	filterSubscription: any;
	notifySubscription: any;
	changesSubscription: any;

	overflownAt: any;
	showDesktop = true;

	platform;
	userAgentCategory;

	online: Observable<boolean>;

	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('workListCollect') workListCollect: WorkListCollectComponent;
	@ViewChild('workListFilter') workListFilter: WorkListFilterComponent;
	@ViewChild('workListMobile') workListMobile: WorkListMobileComponent;
	@ViewChild('workListDesktop') workListDesktop: WorkListDesktopComponent;
	@ViewChild('workListPreview') workListPreview: WorkListPreviewComponent;
	@ViewChild('workListCancelled') workListCancelled: WorkListCancelledComponent;

	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;

	constructor(public translation: TranslationService, public utilsService: UtilsService, private workListService: WorkListService, private notificationService: NotificationService,
		private router: Router, private authService: AuthService, private errorAlert: MatDialog, public dialog: MatDialog) {
		this.setColumnStorageName();
		this.selectTableColumns();
		this.utilsService.readTableColumns(this.columns, this.columnStorageName);
		this.utilsService.setTableColumns(this.columns);
		this.canManualRefresh = this.workListService.fnCanManualRefresh();
		this.canSupersedeReservations = this.workListService.canSupersede();
		this.periodText = this.workListService.getPeriodText();
		this.currentPhleb = this.authService.currentUser;
		this.workListService.resetPeriodText();
		this.workListService.setWorkListFilter(undefined);
		this.autoRefresh();
		this.autoFilter();
		this.platform = window.navigator.platform;
		if (navigator.userAgent.match(/Android/)) {
			this.userAgentCategory = 'Android';
		} else if (navigator.platform.match(/Mac/i)) {
			this.userAgentCategory = 'Mac';
		} else if (navigator.platform.match(/Win/i)) {
			this.userAgentCategory = 'Windows';
		}
		this.online = this.authService.status;
	}

	ngOnInit() {
		const poweredBy = document.querySelector('.poweredBy2');
		poweredBy.innerHTML = document.querySelector('.poweredBy').innerHTML;
		this.initialSizeAdjust();
		if (this.workListService.builderObj !== undefined) {
			this.workListService.searchObj = JSON.parse(JSON.stringify(this.workListService.builderObj));
		}
		if (this.workListService.patientsToDisplay.length) {
			this.refreshData();
		}
		this.authService.setCurrentPage('work-list');
		if (this.authService.needsPwdUpdate === true) { // check to see if they need pwd update
			setTimeout(() => this.openChangePasswordDialog(), 500);
		}
		/* const previousButton: HTMLButtonElement = document.querySelector('.mat-paginator-navigation-previous');
		previousButton.title = this.translation.translate('Label.Previous');
		const nextButton: HTMLButtonElement = document.querySelector('.mat-paginator-navigation-next');
		nextButton.title = this.translation.translate('Label.Next'); */
		const screen: HTMLDivElement = document.querySelector('.maintenance-page');
		setTimeout(() => screen.hidden = !screen.hidden, 300);
	}

	ngAfterViewInit(): void {
		this.loadData();
	}

	notifyBroadcast(message) {
		if (message && message.IsBroadcast === true) {
			this.notificationMessage.show(message);
		}
	}

	autoNotify() {
		if (this.notifySubscription !== undefined) {
			this.notifySubscription.unsubscribe();
		}

		if (this.changesSubscription !== undefined) {
			this.changesSubscription.unsubscribe();
		}

		this.changesSubscription = this.notificationService.getWorkListChanges().subscribe(changes => {
			this.workListService.processNotificationChangeLog(this.notificationService.workListChangeLog);
			if (this.workListDesktop) {
				this.workListDesktop.processNotificationChanges();
			}
		});

		this.notifySubscription = this.notificationService.getWorkListCollection().subscribe(collection => {
			const collectionToSelect = this.collections.find(coll => coll.Patient.MRN === collection);
			if (collectionToSelect !== undefined) {
				this.highlightRow(collectionToSelect.Id);
			}
		});
	}

	highlightRow(id) {
		if (this.workListMobile) {
			this.workListMobile.selectedRow = id;
		}
		if (this.workListDesktop) {
			this.workListDesktop.selectedRowId = id;
		}
	}

	autoRefresh() {
		if (this.router.routerState.snapshot.url === '/work-list') {
			if (this.autoSubscription) {
				this.autoSubscription.unsubscribe();
			}
			this.autoSubscription = this.workListService.getAutoRefreshTimer().subscribe(timer => {
				this.refreshData();
			});
		}
	}

	manualRefresh() {
		this.autoRefresh();
		this.refreshData();
		this.resetPageIndex();
	}

	resetPageIndex() {
		if (this.workListMobile) {
			this.workListMobile.pageIndex = 0;
		}
		if (this.workListDesktop) {
			this.workListDesktop.pageIndex = 0;
		}
	}

	switchScreen() {
		this.router.navigate(['/work-list-builder'], {});
	}

	reserveAll() {
		const availableCollections = this.collections.filter(patient => patient.Status === 'Available' || patient.Status === '');
		if (availableCollections.length && availableCollections.length > 30) {
			const dialogRef = this.dialog.open(ConfirmReserveDialogComponent, {
				width: '321px',
				data: { number: availableCollections.length },
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (result) {
					console.log('Reserving ' + availableCollections.length + ' collections.');
					this.workListService.bulkReserve(availableCollections);
				}
			});
		} else {
			console.log('Reserving ' + availableCollections.length + ' collections.');
			this.workListService.bulkReserve(availableCollections);
		}
	}

	pushToRecentlyChanged(row) {
		if (this.recentlyChanged.indexOf(row.Id) > -1) {
		} else {
			this.recentlyChanged.push(row.Id);
		}
	}

	mobileCycleReserved(collection) {
		this.cycleReserved(collection);
	}

	mobileReserveAll() {
		console.log(`Reserving all from WL...`);
		this.reserveAll();
	}

	cycleReserved(collection) {
		this.pushToRecentlyChanged(collection);
		this.workListService.cycleReservedWL(collection);
	}

	requestLocked(row) {
		this.dialog.open(WorkListRequestDialogComponent, {
			width: '433px',
			data: { row: row },
			autoFocus: false
		});
	}

	disabledCollectOverlay() {
		this.workListCollect.hideShadow = true;
		this.workListCollect.showOverlay = false;
	}

	openCancelled(collection) {
		this.workListCancelled.show(collection);
	}

	closeSneakPeek() {
		this.workListPreview.close();
	}

	closeCollect(id) {
		this.workListPreview.close();
		this.workListCollect.close();
		this.workListService.clearCollectingStorage(id);
		this.workListService.clearActionQueue(id);
	}

	collect(collection) {
		const collectionIDObject = {
			id: collection.Id,
			time: moment.utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z',
			canAbandon: true
		};
		localStorage.setItem('workListCollecting', JSON.stringify(collectionIDObject));
		this.workListCollect.show(collection);
	}

	collectDisabled(id) {
		const coll = this.collections.find(collection => collection.Id === id);
		if (coll !== undefined && (coll.IsCancelled || coll.Status === 'Complete')) {
			this.collectButtonDisabled = true;
		} else {
			this.collectButtonDisabled = false;
		}
	}

	collectButton() {
		this.workListService.resetCleanTime();
		let rowID = '';
		if (this.showMobile && this.workListMobile) {
			rowID = this.workListMobile.selectedRow;
		} else if (!this.showMobile && this.workListDesktop) {
			rowID = this.workListDesktop.selectedRowId;
		}
		if (rowID !== '' && rowID !== undefined) {
			const collection = this.collections.find(coll => coll.Id === rowID);
			if (collection.Status !== 'Complete') {
				this.collect(collection);
			}
		} else {
			this.utilsService.showError(this.translation.translate('Error.Please select a collection to edit'));
		}
	}

	previewCollection(patient) {
		this.workListService.resetCleanTime();
		this.workListService.workListAction({ action: 'preview', collection: patient });
		if (this.workListMobile) {
			this.workListMobile.selectedRow = patient.Id;
		}
		if (this.workListDesktop) {
			this.workListDesktop.selectedRowId = patient.Id;
		}
		if (this.showMobile) {
			if (this.workListMobile) {
				const patientIndex = this.workListMobile.patients.findIndex(collection => patient.Id === collection.Id);
				const next = (this.workListMobile.patients[patientIndex + 1] !== undefined) ? this.workListMobile.patients[patientIndex + 1] : null;
				const previous = (this.workListMobile.patients[patientIndex - 1] !== undefined) ? this.workListMobile.patients[patientIndex - 1] : null;
				this.workListPreview.previewCollection(patient, previous, next);
			}
		} else {
			if (this.workListDesktop) {
				const patientIndex = this.workListDesktop.collections.findIndex(collection => patient.Id === collection.Id);
				const next = (this.workListDesktop.collections[patientIndex + 1] !== undefined) ? this.workListDesktop.collections[patientIndex + 1] : null;
				const previous = (this.workListDesktop.collections[patientIndex - 1] !== undefined) ? this.workListDesktop.collections[patientIndex - 1] : null;
				this.workListPreview.previewCollection(patient, previous, next);
			}
		}
	}

	getNextPreview(patient) {
		if (this.showMobile) {
			if (this.workListMobile && (this.workListMobile.patients.findIndex(collection => collection.Id === patient.Id) > this.workListMobile.paginationEnd - 1)) {
				this.workListMobile.changePageIndex(1);
			}
		} else {
			if (this.workListDesktop && (this.workListDesktop.collections.findIndex(collection => collection.Id === patient.Id) > this.workListDesktop.paginationEnd - 1)) {
				this.workListDesktop.changePageIndex(1);
			}
		}
		this.previewCollection(patient);
	}

	getPreviousPreview(patient) {
		if (this.showMobile) {
			if (this.workListMobile && (this.workListMobile.patients.findIndex(collection => collection.Id === patient.Id) < this.workListMobile.paginationStart)) {
				this.workListMobile.changePageIndex(-1);
			}
		} else {
			if (this.workListDesktop && this.workListDesktop.collections.findIndex(collection => collection.Id === patient.Id) < this.workListDesktop.paginationStart) {
				this.workListDesktop.changePageIndex(-1);
			}
		}
		this.previewCollection(patient);
	}

	checkUser(row) {
		this.workListService.checkUser(row);
	}

	checkDate(element) {
		if (element.ReservationExpiration) {
			if (element.ReservationExpiration.valueOf() < (new Date().valueOf())) {
				return true;
			} else {
				return false;
			}
		} else { return false; }
	}

	formatTime(datetime) {
		return this.workListService.formatTime(datetime);
	}

	refreshData() {
		this.workListService.refreshAllCollections(this.workListService.builderObj);
		this.recentlyChanged = [];
		this.workListService.recentlyChanged = [];
	}

	loadData() {
		if (this.dataSubscription) {
			this.dataSubscription.unsubscribe();
		}
		let count = 0;
		this.dataSubscription = this.workListService.getAllPatients().subscribe(response => {
			const date = new Date();
			this.collections = response.filter(patient => ((this.collectionInRecentlyChanged(patient) === true) || ((patient.Status === 'Reserved' || patient.Status === 'Locked') && patient.ReservedBy.Username === this.currentPhleb.username)));
			console.log(count + ' ' + date.getMinutes() + ':' + date.getSeconds(), this.collections);
			count++;
			this.loadDataComplete(this.collections);
		}, error => {
			this.utilsService.handle401(error);
		});
	}

	collectionInRecentlyChanged(row) {
		let found = false;
		if (this.recentlyChanged.length > 0) {
			this.recentlyChanged.forEach(collection => {
				if (collection === row.Id) {
					found = true;
				}
			});
		}
		if (this.workListService.recentlyChanged.length > 0) {
			this.workListService.recentlyChanged.forEach(collection => {
				if (collection === row.Id) {
					console.log(collection, row);
					found = true;
				}
			});
		}
		return found;
	}

	loadDataComplete(response) {
		const filteredCollections = this.filterResponse(response, this.workListService.getWorkListFilter());
		filteredCollections.length === 0 ? this.collectButtonDisabled = true : this.collectButtonDisabled = false;
		this.autoNotify();
		this.updateChildren(filteredCollections);
		if (filteredCollections.length === 0) {
			this.workListPreview.close();
		} else {
			if (filteredCollections.find(collection => collection.Id === this.workListPreview.collection.Id) !== undefined) {
				this.workListPreview.collection = filteredCollections.find(collection => collection.Id === this.workListPreview.collection.Id);
			} else {
				this.workListPreview.close();
			}
		}
		this.checkCollecting();
	}

	checkCollecting() {
		if (!this.workListCollect.showDrawer) {
			const storedCollection = localStorage.getItem('workListCollecting');
			if (storedCollection !== null) {
				console.log(JSON.parse(storedCollection));
				const collectingCollection = this.collections.find(collection => collection.Id === JSON.parse(storedCollection).id);
				if (collectingCollection !== undefined) {
					this.workListCollect.show(collectingCollection);
				}
			}
		}
	}

	updateChildren(data) {
		if (this.workListMobile) {
			this.workListMobile.refreshData(data);
		}
		if (this.workListDesktop) {
			this.workListDesktop.refreshData(data);
		}
	}

	updateCanDisplayProblemList() {
		const filter = this.workListService.getWorkListFilter();
		const searchObj = this.workListService.getFilter();

		const filterParsed = typeof (filter) === 'string' ? JSON.parse(filter) : filter;
		const searchObjParsed = typeof (searchObj) === 'string' ? JSON.parse(searchObj) : searchObj;


		let showProblemList = true;
		if ((filterParsed !== undefined && filterParsed['Problem list'] === 'No') || (searchObjParsed !== undefined && searchObjParsed.Filter && searchObjParsed.Filter.ProblemList === 'No')) {
			showProblemList = false;
		}
		if (this.workListDesktop) {
			this.workListDesktop.showProblemList = showProblemList;
		}
	}

	autoFilter() {
		if (this.filterSubscription) {
			this.filterSubscription.unsubscribe();
		}
		this.filterSubscription = this.workListService.getWorkListFilterFlag().subscribe(n => {
			if (n !== 1) {
				if (this.collections) {
					console.log(`Work list filter updated.`);
					this.resetPageIndex();
					this.loadDataComplete(this.collections);
				}
			}
			this.updateCanDisplayProblemList();
		});
	}

	filterResponse(response, filter) {
		let filteredResponse = response;
		if (filter) {
			Object.keys(filter).forEach(key => {
				if (filter[key] !== '') {
					switch (key) {
						case 'Name': filteredResponse = this.filterName(filteredResponse, filter[key]); break;
						case 'DOB': filteredResponse = this.filterDOB(filteredResponse, filter[key]); break;
						case 'Gender': filteredResponse = this.filterGender(filteredResponse, filter[key]); break;
						case 'MRN': filteredResponse = this.filterMRN(filteredResponse, filter[key]); break;
						case 'Location': filteredResponse = this.filterLocation(filteredResponse, filter[key]); break;
						case 'Priority': filteredResponse = this.filterPriority(filteredResponse, filter[key]); break;
						case 'Problem list': filteredResponse = this.filterProblemList(filteredResponse, filter[key]); break;
						case 'Time': filteredResponse = this.filterTime(filteredResponse, filter[key]); break;
						case 'Bed': filteredResponse = this.filterBed(filteredResponse, filter[key]); break;
						case 'Reserved': filteredResponse = this.filterReserved(filteredResponse, filter[key]); break;
						case 'DateFrom': filteredResponse = this.filterDate(filteredResponse, { DateFrom: filter['DateFrom'], DateTo: filter['DateTo'] }); break;

					}
				}
			});
		}
		return filteredResponse;
	}

	filterName(array, value) {
		return array.filter(collection => (collection.Patient.FirstName.toLowerCase().indexOf(value.toLowerCase()) > -1) ||
			collection.Patient.LastName.toLowerCase().indexOf(value.toLowerCase()) > -1);
	}

	filterDOB(array, value) {
		return array.filter(collection => (collection.Patient.Age >= value.AgeRange.lower && collection.Patient.Age <= value.AgeRange.upper));
	}

	filterGender(array, value) {
		return array.filter(collection => collection.Patient.Gender === value.charAt(0));
	}

	filterMRN(array, value) {
		return array.filter(collection => collection.Patient.MRN.toLowerCase().indexOf(value.toLowerCase()) > -1);
	}

	filterLocation(array, value) {
		return array.filter(collection => collection.CollectedLocation.Code === value);
	}

	filterPriority(array, value) {
		return array.filter(collection => collection.Priority.Description === value);
	}

	filterProblemList(array, value) {
		if (value === 'Yes') {
			return array.filter(collection => collection.IsProblem);
		} else {
			return array.filter(collection => !collection.IsProblem || collection.IsProblem === undefined);
		}
	}

	filterTime(array, value) {
		return array.filter(collection => collection.ScheduledDateTime.indexOf(value) > -1);
	}

	filterBed(array, value) {
		return array.filter(collection => collection.Bed.toLowerCase().indexOf(value.toLowerCase()) > -1);
	}

	filterReserved(array, value) {
		if (value === 'Available') {
			return array.filter(collection => collection.Status === 'Available' || collection.Status === '');
		} else if (value === 'Reserved') {
			return array.filter(collection => collection.Status === 'Reserved');
		} else if (value === 'Locked') {
			return array.filter(collection => collection.Status === 'Locked');
		}
	}

	filterDate(array, dates) {
		return array.filter(collection => this.makeSimpleDate(moment(collection.ScheduledDateTime)) <= moment(dates.DateTo) && this.makeSimpleDate(moment(collection.ScheduledDateTime)) >= moment(dates.DateFrom));
	}

	makeSimpleDate(date) {
		return moment(`${date.month() + 1}-${date.date()}-${date.year()}`);
	}

	completeCollection(collection) {
		this.workListService.resetCleanTime();
		console.log(`Completing collection ${collection.Id}...`);
		this.workListService.completeCollection(collection);
		this.collectDisabled(collection.Id);
		this.utilsService.openPwdSnackBar(this.translation.translate('Label.Collection completed'));
	}

	cancelCollection(object) {
		this.workListService.resetCleanTime();
		console.log(`Cancelling collection ${object.collection.Id}...`);
		this.workListService.cancelCollection(object);
		this.utilsService.openPwdSnackBar(this.translation.translate('Label.Collection cancelled'));
	}

	rescheduleCollection(object) {
		this.workListService.resetCleanTime();
		console.log(`Rescheduling collection ${object.collection.Id}...`);
		this.workListService.rescheduleCollection(object);
		this.utilsService.openPwdSnackBar(this.translation.translate('Label.Collection rescheduled'));
	}

	problemListCollection(object) {
		this.workListService.resetCleanTime();
		console.log(`Problem Listing collection ${object.collection.Id}...`);
		this.workListService.problemListCollection(object);
		this.utilsService.openPwdSnackBar(this.translation.translate('Label.Collection moved to Problem List'));
	}

	transferCollection(object) {
		this.workListService.resetCleanTime();
		console.log(`Transferring collection ${object.collection.Id}...`);
		this.workListService.transferCollection(object);
		this.utilsService.openPwdSnackBar(this.translation.translate('Label.Collection transferred'));
	}

	printCommLabels(evt) {
		this.workListService.resetCleanTime();
		console.log(evt);
		if (evt === 1) {
			this.utilsService.openPwdSnackBar(this.translation.translate('Label.Label printed'));
		} else {
			this.utilsService.openPwdSnackBar(this.translation.translate('Label.Labels printed'));
		}
	}

	printPatientLabels(evt) {
		this.workListService.resetCleanTime();
		console.log(evt);
		if (evt === 1) {
			this.utilsService.openPwdSnackBar(this.translation.translate('Label.Label printed'));
		} else {
			this.utilsService.openPwdSnackBar(this.translation.translate('Label.Labels printed'));
		}
	}

	printContainerLabels(evt) {
		this.workListService.resetCleanTime();
		console.log(evt);
		if (evt === 1) {
			this.utilsService.openPwdSnackBar(this.translation.translate('Label.Label printed'));
		} else {
			this.utilsService.openPwdSnackBar(this.translation.translate('Label.Labels printed'));
		}
	}

	setColumnStorageName() {
		this.columnStorageName += this.authService.currentUser.role;
	}

	selectTableColumns() {
		this.columns.table = [
			{ id: 1, name: 'Name', checked: true },
			{ id: 2, name: 'DOB', checked: true },
			{ id: 3, name: 'Gender', checked: true, dropdown: true },
			{ id: 4, name: 'MRN', checked: true },
			{ id: 5, name: 'Location', checked: true, dropdown: true },
			{ id: 6, name: 'Priority', checked: true, dropdown: true },
			{ id: 7, name: 'Problem list', checked: true, dropdown: true },
			{ id: 8, name: 'Time', checked: true },
			{ id: 9, name: 'Bed', checked: true },
			{ id: 10, name: 'Reserved', checked: true, dropdown: true }
		];
	}

	openChangePasswordDialog(): void {
		const dialogRef = this.dialog.open(ChangePasswordComponent, {
			panelClass: 'rmp-change-pwd-dialog',
			backdropClass: 'fullPageOverlay',
			disableClose: true,
		});
	}


	setTableColumns() {
		this.columns.display = [];

		for (let i = 0; i < this.columns.table.length; i++) {
			if (this.columns.table[i].checked) {
				this.columns.display.push(this.columns.table[i].name);
			}
		}
	}

	tableColumnsOnSave($event) {
		this.columns.table = $event.columns;
		localStorage.setItem(this.columnStorageName, JSON.stringify(this.columns.table));
		this.utilsService.setTableColumns(this.columns);
	}

	ngOnDestroy() {
		if (this.autoSubscription) {
			this.autoSubscription.unsubscribe();
		}
		if (this.filterSubscription) {
			this.filterSubscription.unsubscribe();
		}
		if (this.dataSubscription) {
			this.dataSubscription.unsubscribe();
		}
	}

	getColumnsForFilter() {
		const colsToFilter = [];
		this.columns.display.forEach(element => {
			colsToFilter.push(this.columns.table.filter(col => col.name === element)[0]);
		});
		return colsToFilter;
	}

	initialSizeAdjust() {
		if (window.innerWidth > 916) {
			this.showMobile = false;
		} else {
			this.showMobile = true;
		}
	}

	@HostListener('window:resize') onResize() {
		this.evaluateWidth();
	}

	evaluateWidth() {
		if (window.innerWidth > 916) {
			if (this.showMobile === true) {
				this.showMobile = false;
				this.updateChildren(this.filterResponse(this.collections, this.workListService.getWorkListFilter()));
			}
		} else {
			if (this.showMobile === false) {
				this.showMobile = true;
				this.updateChildren(this.filterResponse(this.collections, this.workListService.getWorkListFilter()));
			}
		}
	}

	updateMobilePaginator() {
		this.workListMobile.paginatorSelected = this.workListDesktop.paginatorSelected;
		this.workListMobile.pageIndex = this.workListDesktop.pageIndex;
		this.workListMobile.paginationStart = this.workListDesktop.paginationStart;
		this.workListMobile.paginationEnd = this.workListDesktop.paginationEnd;
	}

	updateDesktopPaginator() {
		this.workListDesktop.paginatorSelected = this.workListMobile.paginatorSelected;
		this.workListDesktop.pageIndex = this.workListMobile.pageIndex;
		this.workListDesktop.paginationStart = this.workListMobile.paginationStart;
		this.workListDesktop.paginationEnd = this.workListMobile.paginationEnd;
	}
}
