import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { Router } from '@angular/router';
import { WorkListService } from '../services/work-list.service';
import { Observable, timer } from 'rxjs';
import { WorkListRequestDialogComponent } from '../work-list-request-dialog/work-list-request-dialog.component';
import { WorkListCollectionComponent } from '../work-list-collection/work-list-collection.component';
import { WorkListGridComponent } from './work-list-grid/work-list-grid.component';
import { ConfirmReserveDialogComponent } from './confirm-reserve-dialog/confirm-reserve-dialog.component';
import { TranslationService } from 'angular-l10n';
import { WorkListBuilderMobileComponent } from './work-list-builder-mobile/work-list-builder-mobile.component';
import { WorkListBuilderMobileListComponent } from './work-list-builder-mobile-list/work-list-builder-mobile-list.component';
import { WorkListBuilderDesktopComponent } from './work-list-builder-desktop/work-list-builder-desktop.component';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { WorkListLegendComponent } from '../work-list/work-list-legend/work-list-legend.component';
import { WorkListCreateComponent } from '../work-list-create/work-list-create.component';

@Component({
	selector: 'app-work-list-builder',
	templateUrl: './work-list-builder.component.html',
	styleUrls: ['./work-list-builder.component.css']
})
export class WorkListBuilderComponent implements OnInit, OnDestroy, AfterViewInit {
	columns = { table: [], display: [] };
	columnStorageName = 'WORK_LIST_BUILDER_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	showTable = false;
	currentWindowWidth: any;
	showMobile = false;
	selectedRowId = '';
	showFilter = false;
	filterValue = '';
	collections = [];
	canManualRefresh: Observable<boolean>;
	canSupersedeReservations: Observable<boolean>;
	periodText: Observable<string>;
	groupByLocation: Observable<boolean>;
	supersedeSubscription: any;
	currentPhleb: any;
	autoSubscription: any;
	dataSubscription: any;
	groupSubscription: any;

	overflownAt: any;
	showDesktop = true;

	groupCount = 0;

	platform;

	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild('workListCollection') workListCollection: WorkListCollectionComponent;
	@ViewChild('workListGrid') workListGrid: WorkListGridComponent;
	@ViewChild('workListBuilderDesktop') workListBuilderDesktop: WorkListBuilderDesktopComponent;
	@ViewChild('workListBuilderMobile') workListBuilderMobile: WorkListBuilderMobileComponent;
	@ViewChild('workListBuilderMobileList') workListBuilderMobileList: WorkListBuilderMobileListComponent;
	@ViewChild('workListLegend') workListLegend: WorkListLegendComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild('workListCreate') workListCreate: WorkListCreateComponent;

	constructor(private workListService: WorkListService, private router: Router, private authService: AuthService, public dialog: MatDialog, public translation: TranslationService, private utilsService: UtilsService) {
		this.canSupersedeReservations = this.workListService.canSupersede();
		this.periodText = this.workListService.getPeriodText();
		this.groupByLocation = this.workListService.getGroupByLocation();
		this.setColumnStorageName();
		this.selectTableColumns();
		this.utilsService.readTableColumns(this.columns, this.columnStorageName);
		this.utilsService.setTableColumns(this.columns);
		this.canManualRefresh = this.workListService.fnCanManualRefresh();
		this.currentPhleb = this.authService.currentUser;
		this.workListService.resetPeriodText();
		this.autoRefresh();
		this.tableUpdater();
		this.platform = window.navigator.platform;
	}

	ngOnInit() {
		const poweredBy = document.querySelector('.poweredBy2');
		poweredBy.innerHTML = document.querySelector('.poweredBy').innerHTML;
		this.initialSizeAdjust();
		if (this.workListService.builderObj !== undefined) {
			this.workListService.searchObj = JSON.parse(JSON.stringify(this.workListService.builderObj));
		}

		if (this.workListService.patients.length > 0) {
			this.refreshData();
		}
		this.authService.setCurrentPage('work-list-builder');
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
		this.groupSubscription = this.groupByLocation.subscribe(response => {
			if (response !== undefined) {
				this.showTable = !response;
				this.loadData();
				this.groupCount++;
			}
		});
	}

	notifyBroadcast(message) {
		if (message && message.IsBroadcast === true) {
			this.notificationMessage.show(message);
		}
	}

	autoRefresh() {
		if (this.autoSubscription) {
			this.autoSubscription.unsubscribe();
		}
		// tslint:disable-next-line:no-shadowed-variable
		this.autoSubscription = this.workListService.getAutoRefreshTimer().subscribe(timer => {
			this.refreshData();
		});
	}

	manualRefresh() {
		this.workListService.resetCleanTime();
		this.autoRefresh();
		this.refreshData();
		this.resetPageIndex();
	}

	reserveAll() {
		const availableCollections = this.collections.filter(patient => patient.Status === 'Available' || patient.Status === '');
		if (availableCollections.length) {
			if (availableCollections.length > 30) {
				const dialogRef = this.dialog.open(ConfirmReserveDialogComponent, {
					width: '321px',
					data: { number: availableCollections.length },
					autoFocus: false
				});
				dialogRef.beforeClose().subscribe(result => {
					if (result) {
						console.log('Reserving ' + availableCollections.length + ' collections.');
						this.workListService.reserveAll();
					}
				});
			} else {
				this.workListService.reserveAll();
			}
		}
	}

	refreshData() {
		this.workListService.getCollectionsByFilter(this.workListService.searchObj);
	}

	makeFormattedFilter(event) {
		const filter = event.Filter;
		const formattedFilter = {
			AgeMax: filter.AgeRange.upper,
			AgeMin: filter.AgeRange.lower,
			DateFrom: filter.DateFrom,
			DateTo: filter.DateTo,
			Now: filter.Now,
			TimeFrom: filter.TimeFrom,
			TimeTo: filter.TimeTo,
			CollectionList: {
				Id: event.CollectionList
			},
			CollectionLocation: {
				Id: filter.Location
			},
			Hub: {
				Id: event.Hub
			},
			Patient: {
				Gender: ((filter.Gender !== '') ? (filter.Gender[0]) : (filter.Gender))
			},
			Priority: {
				Id: filter.Priority
			},
			ProblemList: filter.ProblemList,
			Status: filter.Reserved,
			From: filter.From
		};
		return formattedFilter;
	}

	saveFilter(event) {
		if (event.Filter.Reset) {
			// Saving from Search screen
			this.workListService.filterReset();
			this.workListService.builderObj = this.makeFormattedFilter(event);
			this.workListService.searchObj = this.makeFormattedFilter(event);
		} else {
			// Saving from Filter screen
			this.workListService.resetToShow();
		}
		if (event.Filter.ProblemList && event.Filter.ProblemList === 'No') {
			this.workListService.setCanDisplayProblemList(false);
		} else {
			this.workListService.setCanDisplayProblemList(true);
		}

		this.resetPageIndex();
		this.workListService.startSearch(this.makeFormattedFilter(event));
	}

	resetPageIndex() {
		if (this.showTable && this.workListBuilderDesktop && this.workListBuilderMobileList) {
			this.workListBuilderDesktop.pageIndex = 0;
			this.workListBuilderMobileList.pageIndex = 0;
		} else if (!this.showTable && this.workListGrid && this.workListBuilderMobile) {
			this.workListGrid.pageIndex = 0;
			this.workListBuilderMobile.pageIndex = 0;
		}
	}

	loadData() {
		if (this.dataSubscription) {
			this.dataSubscription.unsubscribe();
		}
		let count = 0;
		this.dataSubscription = this.workListService.getPatients().subscribe(response => {
			const date = new Date();
			console.log(count + ' ' + date.getMinutes() + ':' + date.getSeconds(), response);
			this.collections = response;
			this.selectedRowId = '';
			this.updateChildren();
			count++;
		});
	}

	updateChildren() {
		if (!this.showMobile && !this.showTable && this.workListGrid) {
			this.workListGrid.refreshData();
			this.workListGrid.sortOnRefresh();
		}
		if (!this.showMobile && this.showTable && this.workListBuilderDesktop) {
			this.workListBuilderDesktop.refreshData();
		}
		if (this.showMobile && !this.showTable && this.workListBuilderMobile) {
			this.workListBuilderMobile.refreshData();
		}
		if (this.showMobile && this.showTable && this.workListBuilderMobileList) {
			this.workListBuilderMobileList.refreshData();
		}
	}

	formatTime(datetime) {
		return this.workListService.formatTime(datetime);
	}

	checkUser(row) {
		this.workListService.checkUser(row);
	}

	getRequestTimer(row) {
		return this.workListService.getRequestTimer(row);
	}

	switchScreen() {
		this.workListService.resetCleanTime();
		this.router.navigate(['/work-list'], {});
	}

	checkDate(element) {
		return element.ReservationExpiration && element.ReservationExpiration.valueOf() < (new Date().valueOf());
	}

	ngOnDestroy() {
		if (this.autoSubscription) {
			this.autoSubscription.unsubscribe();
		}

		if (this.dataSubscription) {
			this.dataSubscription.unsubscribe();
		}

		if (this.groupSubscription) {
			this.groupSubscription.unsubscribe();
		}
	}

	setColumnStorageName() {
		this.columnStorageName += this.authService.currentUser.role;
	}

	selectTableColumns() {
		this.columns.table = [
			{ id: 1, name: 'Name', checked: true },
			{ id: 2, name: 'DOB', checked: true },
			{ id: 3, name: 'Gender', checked: true },
			{ id: 4, name: 'MRN', checked: true },
			{ id: 5, name: 'Location', checked: true },
			{ id: 6, name: 'Priority', checked: true },
			{ id: 7, name: 'Problem list', checked: true },
			{ id: 8, name: 'Time', checked: true },
			{ id: 9, name: 'Bed', checked: true },
			{ id: 10, name: 'Timer', checked: true },
			{ id: 11, name: 'Reserved', checked: true }
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
		this.supersedeSubscription = this.canSupersedeReservations.subscribe(response => {
			this.columns.display = [];
			for (let i = 0; i < this.columns.table.length; i++) {
				if (this.columns.table[i].checked) {
					if ((this.columns.table[i].name === 'Timer' && response) || this.columns.table[i].name !== 'Timer') {
						this.columns.display.push(this.columns.table[i].name);
					}
				}
			}
			if (this.workListGrid) {
				this.workListGrid.updateColumns(this.columns.display);
			}
			if (this.workListBuilderDesktop) {
				this.workListBuilderDesktop.updateColumns(this.columns.display);
			}
		});
	}

	tableColumnsOnSave($event) {
		this.columns.table = $event.columns;
		localStorage.setItem(this.columnStorageName, JSON.stringify(this.columns.table));
		this.utilsService.setTableColumns(this.columns);
	}

	tableUpdater() {
		if (this.collections) {
			const updateTimer = timer(250);
			updateTimer.subscribe(n => {
				this.updateTable();
			});
		}
	}

	updateTable() {
		this.collections.forEach(collection => {
			const temp = collection.Requestees;
			collection.Requestees = [];
			collection.Requestees = temp;
		});
		this.tableUpdater();
	}

	initialSizeAdjust() {
		if (window.innerWidth > 916) {
			this.showMobile = false;
		} else {
			this.showMobile = true;
		}
	}

	evaluateWidth() {
		if (window.innerWidth > 916) {
			if (this.showMobile === true) {
				this.showMobile = false;
				this.updateChildren();
			}
		} else {
			if (this.showMobile === false) {
				this.showMobile = true;
				this.updateChildren();
			}
		}
	}

	clickLegend(event) {
		this.workListService.resetCleanTime();
		this.workListLegend.show(event);
	}

	openFilter() {
		this.workListService.resetCleanTime();
		this.workListCreate.openMode(true);
	}

	openSearch() {
		this.workListService.resetCleanTime();
		this.workListCreate.openMode(false);
	}

	@HostListener('window:resize') onResize() {
		this.evaluateWidth();
	}

	updateMobileLocations() {
		if (this.workListBuilderMobile) {
			this.workListBuilderMobile.locationsGrouped = this.workListGrid.locationsGrouped;
		}
	}

	updateMobilePaginator() {
		if (this.workListBuilderMobile) {
			this.workListBuilderMobile.paginatorSelected = this.workListGrid.paginatorSelected;
			this.workListBuilderMobile.pageIndex = this.workListGrid.pageIndex;
		}
	}

	updateMobileListPaginator() {
		if (this.workListBuilderMobileList) {
			this.workListBuilderMobileList.paginatorSelected = this.workListBuilderDesktop.paginatorSelected;
			this.workListBuilderMobileList.pageIndex = this.workListBuilderDesktop.pageIndex;
		}
	}

	updateGridLocations() {
		if (this.workListGrid) {
			this.workListGrid.locationsGrouped = this.workListBuilderMobile.locationsGrouped;
		}
	}

	updateGridPaginator() {
		if (this.workListGrid) {
			this.workListGrid.paginatorSelected = this.workListBuilderMobile.paginatorSelected;
			this.workListGrid.pageIndex = this.workListBuilderMobile.pageIndex;
		}
	}

	updateTablePaginator() {
		if (this.workListBuilderDesktop) {
			this.workListBuilderDesktop.paginatorSelected = this.workListBuilderMobileList.paginatorSelected;
			this.workListBuilderDesktop.pageIndex = this.workListBuilderMobileList.pageIndex;
		}
	}
}
