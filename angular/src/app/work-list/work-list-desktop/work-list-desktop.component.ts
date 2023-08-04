import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { WorkListService } from '../../services/work-list.service';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { WorkListRequestDialogComponent } from '../../work-list-request-dialog/work-list-request-dialog.component';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from 'angular-l10n';
import { WorkListPreviewComponent } from '../work-list-preview/work-list-preview.component';

@Component({
	selector: 'app-work-list-desktop',
	templateUrl: './work-list-desktop.component.html',
	styleUrls: ['./work-list-desktop.component.css']
})
export class WorkListDesktopComponent implements OnInit, OnDestroy {
	@Output() cycleReserve = new EventEmitter();
	@Output() cycleAll = new EventEmitter();
	@Output() emitPaginatorChange = new EventEmitter();
	@Output() changePreview = new EventEmitter();
	@Output() openCancelledCollection = new EventEmitter();
	@Output() selectCollection = new EventEmitter();
	@Input() data: any;
	@ViewChild('workListPreview') workListPreview: WorkListPreviewComponent;
	locations = [];
	locationsControl: any;
	selectedRowId = '';
	selectedRow = '';
	collections: any;
	collectionsToDisplay: any;
	grid = {
		sort: {
			column: '',
			sortOn: '',
			order: ''
		}
	};
	columns = { display: [] };
	activeColumns: number;
	parentColumns = [];
	canManualRefresh: Observable<boolean>;
	canSupersedeReservations: Observable<boolean>;
	canDisplayLocationAddress: Observable<boolean>;
	canDisplayHomeDrawAddress: Observable<boolean>;
	canDisplayBed: Observable<boolean>;
	canDisplayProblemList: Observable<boolean>;
	showProblemList = true;
	showBed: boolean;
	bedSubscription: any;
	currentPhleb: any;

	paginatorOptions = [5, 10, 20, 50, 100];
	paginatorSelected = 5;
	pageIndex = 0;
	paginatedResults = [];
	paginatedLocation: any;
	paginationStart = 0;
	paginationEnd = 0;
	paginationTotal = 0;
	paginatorRange: any;

	platform: any;

	tableWidth = 0;

	notificationChanges: any;

	constructor(public translation: TranslationService, private workListService: WorkListService, public dialog: MatDialog, private authService: AuthService) {
		this.canSupersedeReservations = this.workListService.canSupersede();
		this.canManualRefresh = this.workListService.fnCanManualRefresh();
		this.canDisplayLocationAddress = this.workListService.canDisplayLocationAddress();
		this.canDisplayHomeDrawAddress = this.workListService.canDisplayHomeDrawAddress();
		this.canDisplayBed = this.workListService.getDisplayBed();
		this.canDisplayProblemList = this.workListService.getCanDisplayProblemList();
		this.currentPhleb = this.authService.currentUser;
		this.platform = window.navigator.platform;
	}

	ngOnInit() {
		this.setColumns();
		this.bedSubscription = this.canDisplayBed.subscribe(response => {
			if (response !== undefined) {
				this.showBed = response;
				this.setColumns();
			}
		});
	}

	ngOnDestroy(): void {
		if (this.bedSubscription) {
			this.bedSubscription.unsubscribe();
		}
	}

	getProperty(obj, path) {
		return path.split('.').reduce((c, d) => c[d], obj);
	}

	processNotificationChanges() {
		this.workListService.notificationChanges.forEach(change => {
			const coll = this.collections.find(collection => collection.Id === change.Id);
			if (coll !== undefined) {
				coll.changed = true;
				change.columnsChanged.forEach(c => {
					coll[c + 'Changed'] = true;
				});
			}
		});
		this.notificationChanges = this.workListService.notificationChanges;
	}

	refreshData(data) {
		if (data.length) {
			this.collections = data;
			this.processNotificationChanges();
		} else {
			this.collections = [];
		}
		this.getCollectionsToDisplay();
	}

	getCollectionsToDisplay() {
		if (this.collections.length) {
			this.paginationTotal = this.collections.length;
			this.collectionsToDisplay = this.collections.slice((this.pageIndex * this.paginatorSelected), (this.pageIndex * this.paginatorSelected + this.paginatorSelected));
			this.paginationStart = (this.pageIndex * this.paginatorSelected);
			this.paginationEnd = Math.min((this.pageIndex * this.paginatorSelected + this.paginatorSelected), this.paginationTotal);
		} else {
			this.collectionsToDisplay = [];
			this.paginationTotal = this.paginationStart = this.paginationEnd = 0;
		}
		this.updatePaginatorRange();
	}

	updatePaginatorRange() {
		if (this.paginationTotal !== 0) {
			this.paginatorRange = `${this.paginationStart + 1} - ${this.paginationEnd} of ${this.paginationTotal}`;
		} else {
			this.paginatorRange = `0 of 0`;
		}
		this.emitPaginatorChange.emit();
	}

	changePageIndex(mod) {
		if (mod > 0 && this.pageIndex > -1) {
			this.pageIndex = this.pageIndex + mod;
		} else if (mod < 0) {
			this.pageIndex = this.pageIndex + mod;
		}
		this.selectedRow = '';
		this.selectedRowId = '';
		this.getCollectionsToDisplay();
	}

	updatePaginatorNumber() {
		this.pageIndex = 0;
		this.getCollectionsToDisplay();
	}

	openCancelled(collection) {
		if (collection.IsCancelled) {
			this.openCancelledCollection.emit(collection);
		}
	}

	previewCollection(patient) {
		this.changePreview.emit(patient);
	}
	cycleReserved(collection) {
		this.cycleReserve.emit(collection);
	}

	reserveAll() {
		this.cycleAll.emit();
	}

	requestLocked(collection) {
		this.workListService.resetCleanTime();
		this.dialog.open(WorkListRequestDialogComponent, {
			width: '433px',
			data: { row: collection }
		});
	}

	setColumns() {
		this.columns.display = [];
		const names = ['Name', 'DOB', 'Gender', 'MRN', 'Location', 'Priority', 'Problem list', 'Time', 'Bed', 'Reserved'];
		const display = ['Name', 'Date of Birth', 'Gender', 'MRN', 'Location', 'Priority', 'Problem list', 'Time', 'Bed', ''];
		const sortOn = ['Patient.LastName', 'Patient.DateOfBirth', 'Patient.Gender', 'Patient.MRN', 'CollectedLocation.Code', 'Priority.Description', 'ProblemList', 'ScheduledTime', 'Bed', 'Status'];
		const tableShow = ['Patient.FullName', 'Patient.DateOfBirth', 'Patient.Gender', 'Patient.MRN', 'CollectedLocation.Code', 'Priority.Description', 'IsProblem', 'ScheduledTime', 'Bed', ''];
		for (let i = 0; i < names.length; i++) {
			let check = true;
			if (names[i] === 'Bed' && this.showBed === false) {
				check = false;
			}
			this.columns.display.push({ id: i, name: names[i], display: this.translation.translate('Label.' + display[i]), sortOn: sortOn[i], tableShow: tableShow[i], checked: check });
		}
		this.activeColumns = this.columns.display.filter(column => column.checked === true).length;
	}

	sortOnRefresh() {
		if (this.grid.sort.column !== '') {
			let multiplier = 1;
			if (this.grid.sort.order === 'asc') {
				multiplier = -1;
			}
			this.collections.sort((a, b) => {
				const newA = (this.grid.sort.sortOn).split('.').reduce((c, d) => c[d], a);
				const newB = (this.grid.sort.sortOn).split('.').reduce((c, d) => c[d], b);
				if (newA > newB) {
					return (1 * multiplier);
				}
				if (newA < newB) {
					return (-1 * multiplier);
				}
				return 0;
			});
		}
		this.getCollectionsToDisplay();
	}

	sort(col) {
		const storedCol = col.name;
		let multiplier = 1;
		let reset = false;
		if (this.grid.sort.column === storedCol) {
			if (this.grid.sort.order === 'desc') {
				multiplier = -1;
				this.grid.sort.order = 'asc';
			} else if (this.grid.sort.order === 'asc') {
				multiplier = 1;
				this.grid.sort.column = '';
				this.grid.sort.sortOn = '';
				this.grid.sort.order = '';
				reset = true;
			}
		} else {
			this.grid.sort.column = storedCol;
			this.grid.sort.sortOn = col.sortOn;
			this.grid.sort.order = 'desc';
		}
		if (reset) {
			this.collections.sort((a, b) => {
				if (a.Id > b.Id) {
					return (1);
				}
				if (a.Id < b.Id) {
					return (-1);
				}
				return 0;
			});
		} else {
			this.collections.sort((a, b) => {
				const newA = (col.sortOn).split('.').reduce((c, d) => c[d], a);
				const newB = (col.sortOn).split('.').reduce((c, d) => c[d], b);
				if (newA > newB) {
					return (1 * multiplier);
				}
				if (newA < newB) {
					return (-1 * multiplier);
				}
				return 0;
			});
		}
		this.getCollectionsToDisplay();
	}

	hoverAddressRow(event) {
		event.target.previousSibling.style.backgroundColor = getComputedStyle(event.target).backgroundColor;
	}

	leaveAddressRow(event) {
		event.target.previousSibling.style.backgroundColor = 'white';
	}

	selectRow(patient) {
		this.workListService.resetCleanTime();
		this.selectedRowId = patient.Id;
		this.selectCollection.emit(this.selectedRowId);
	}

}
