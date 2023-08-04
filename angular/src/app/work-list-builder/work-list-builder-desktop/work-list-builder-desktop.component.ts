import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WorkListService } from '../../services/work-list.service';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { WorkListRequestDialogComponent } from '../../work-list-request-dialog/work-list-request-dialog.component';
import { AuthService } from '../../services/auth.service';
import { ConfirmReserveDialogComponent } from '../confirm-reserve-dialog/confirm-reserve-dialog.component';
import { TranslationService } from 'angular-l10n';
import * as moment from 'moment-timezone';

@Component({
	selector: 'app-work-list-builder-desktop',
	templateUrl: './work-list-builder-desktop.component.html',
	styleUrls: ['./work-list-builder-desktop.component.css']
})
export class WorkListBuilderDesktopComponent implements OnInit {
	@Input() data: any;
	@Output() emitPaginatorChange = new EventEmitter();
	selectedRowId = '';
	patients: any;
	grid = {
		sort: {
			column: '',
			sortOn: '',
			order: ''
		}
	};
	columns = { display: [] };
	parentColumns = [];
	canManualRefresh: Observable<boolean>;
	canSupersedeReservations: Observable<boolean>;
	canDisplayLocationAddress: Observable<boolean>;
	canDisplayHomeDrawAddress: Observable<boolean>;
	canDisplayBed: Observable<boolean>;
	canDisplayProblemList: Observable<boolean>;
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
		this.bedSubscription = this.canDisplayBed.subscribe(response => {
			if (response !== undefined) {
				this.showBed = response;
				this.resetColumns();
			}
		});
		this.setColumns();
		if (!(this.workListService.patientsToDisplay.length > 0)) {
			this.updatePaginatorRange();
		}
	}

	getPatientsByLocation(location) {
		if (this.patients !== undefined) {
			if (this.patients.length > 0) {
				return this.patients.filter(patient => patient.CollectedLocation.Code === location);
			}
		}
	}

	getNumberPatientsByLocation(location) {
		if (this.patients !== undefined) {
			if (this.patients.length > 0) {
				return this.patients.filter(patient => patient.CollectedLocation.Code === location).length;
			}
		}
	}

	refreshData() {
		if (this.workListService.patientsToDisplay.length > 0) {
			this.patients = this.workListService.patientsToDisplay;
			this.numberCollections();
		} else {
			this.patients = [];
			this.paginationTotal = this.paginationStart = this.paginationEnd = 0;
		}
		this.getCollectionsToDisplay();
	}

	numberCollections() {
		let count = 0;
		this.patients.forEach(patient => {
			patient.count = count;
			count++;
		});
		this.paginationTotal = count;
		this.updatePaginatorRange();
	}

	getCollectionsToDisplay() {
		if (this.patients.length) {
			this.paginationStart = (this.pageIndex * this.paginatorSelected);
			this.paginationEnd = Math.min((this.pageIndex * this.paginatorSelected + this.paginatorSelected), this.paginationTotal);
		} else {
			this.paginationTotal = 0;
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
		this.selectedRowId = '';
		this.getCollectionsToDisplay();
	}

	updatePaginatorNumber() {
		this.pageIndex = 0;
		this.getCollectionsToDisplay();
	}

	sortOnRefresh() {
		if (this.grid.sort.column !== '') {
			let multiplier = 1;
			if (this.grid.sort.order === 'asc') {
				multiplier = -1;
			}
			this.patients.sort((a, b) => {
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
			this.patients.sort((a, b) => {
				if (a.Id > b.Id) {
					return (1);
				}
				if (a.Id < b.Id) {
					return (-1);
				}
				return 0;
			});
		} else {
			this.patients.sort((a, b) => {
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

	getRequestTimer(row) {
		return this.workListService.getRequestTimer(row);
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

	checkUser(row) {
		this.workListService.checkUser(row);
	}

	formatTime(datetime) {
		return this.workListService.formatTime(datetime);
	}

	requestLocked(row) {
		this.workListService.resetCleanTime();
		this.dialog.open(WorkListRequestDialogComponent, {
			width: '433px',
			data: { row: row }
		});
	}

	reserveAll() {
		const availableCollections = this.patients.filter(patient => patient.Status === 'Available' || patient.Status === '');
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
			}
		}
	}

	cycleReserved(current) {
		this.workListService.cycleReserved(current);
	}

	setColumns() {
		this.columns.display = [];
		const names = ['Name', 'DOB', 'Gender', 'MRN', 'Location', 'Priority', 'Problem list', 'Time', 'Bed', 'Reserved'];
		const display = ['Name', 'Date of Birth', 'Gender', 'MRN', 'Location', 'Priority', 'Problem list', 'Time', 'Bed', ''];
		for (let i = 0; i < names.length; i++) {
			this.columns.display.push({ id: i, name: names[i], display: this.translation.translate('Label.' + display[i]), checked: true });
		}
	}

	resetColumns() {
		this.columns.display = [];
		const names = ['Name', 'DOB', 'Gender', 'MRN', 'Location', 'Priority', 'Problem list', 'Time', 'Bed', 'Reserved'];
		const display = ['Name', 'Date of Birth', 'Gender', 'MRN', 'Location', 'Priority', 'Problem list', 'Time', 'Bed'];
		const sortOn = ['Patient.LastName', 'Patient.DateOfBirth', 'Patient.Gender', 'Patient.MRN', 'CollectedLocation.Code', 'Priority.Description', 'ProblemList', 'ScheduledTime', 'Bed', 'Status'];
		const tableShow = ['Patient.FullName', 'Patient.DateOfBirth', 'Patient.Gender', 'Patient.MRN', 'CollectedLocation.Code', 'Priority.Description', 'ProblemList', 'ScheduledTime', 'Bed', ''];
		for (let i = 0; i < names.length; i++) {
			let check = true;
			if (names[i] === 'Bed' && this.showBed === false) {
				check = false;
			}
			this.columns.display.push({ id: i, name: names[i], display: this.translation.translate('Label.' + display[i]), sortOn: sortOn[i], tableShow: tableShow[i], checked: check });
		}
	}

	updateColumns(cols) {
		const names = ['Name', 'DOB', 'Gender', 'MRN', 'Location', 'Priority', 'Problem list', 'Time', 'Bed', 'Timer', 'Reserved'];
		const display = ['Name', 'Date of Birth', 'Gender', 'MRN', 'Location', 'Priority', 'Problem list', 'Time', 'Bed', 'Timer', 'Reserved'];
		const sortOn = ['Patient.LastName', 'Patient.DateOfBirth', 'Patient.Gender', 'Patient.MRN', 'CollectedLocation.Code', 'Priority.Description', 'ProblemList', 'ScheduledDateTime', 'Bed', '', 'Status'];
		this.columns.display = [];
		let i = 0;
		cols.forEach(col => {
			this.columns.display.push({ id: i, name: names[names.indexOf(col)], display: display[names.indexOf(col)], sortOn: sortOn[names.indexOf(col)], checked: true });
			i++;
		});
	}

	showColumn(name) {
		return (this.columns.display.map(col => col.name).indexOf(name) > -1);
	}

	selectRow(patient) {
		this.selectedRowId = patient.Id;
	}

	hoverAddressRow(event) {
		event.target.previousSibling.previousSibling.style.backgroundColor = getComputedStyle(event.target).backgroundColor;
	}

	leaveAddressRow(event) {
		event.target.previousSibling.previousSibling.style.backgroundColor = 'white';
	}

}
