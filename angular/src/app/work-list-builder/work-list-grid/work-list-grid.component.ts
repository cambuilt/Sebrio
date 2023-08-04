import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WorkListService } from '../../services/work-list.service';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { WorkListRequestDialogComponent } from '../../work-list-request-dialog/work-list-request-dialog.component';
import { AuthService } from '../../services/auth.service';
import { ConfirmReserveDialogComponent } from '../confirm-reserve-dialog/confirm-reserve-dialog.component';
import { TranslationService } from 'angular-l10n';

@Component({
	selector: 'app-work-list-grid',
	templateUrl: './work-list-grid.component.html',
	styleUrls: ['./work-list-grid.component.css']
})
export class WorkListGridComponent implements OnInit {
	@Input() data: any;
	@Output() emitLocationChange = new EventEmitter();
	@Output() emitPaginatorChange = new EventEmitter();
	locations = [];
	pinnedLocation: any;
	locationsControl: any;
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

	locationsGrouped = [];

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
			this.getLocations();
			this.numberLocationsGrouped();
		} else {
			this.patients = [];
			this.getLocations();
			this.paginationTotal = 0;
		}
		this.getCollectionsToDisplay();
	}

	makeAddress(location) {
		const locationObject = this.patients.find(patient => patient.CollectedLocation.Code === location).CollectedLocation;
		let address = '';
		if (locationObject.AddressLine2 === '') {
			address = locationObject.AddressLine1 + ', ' + locationObject.City + ', ' + locationObject.State + ' ' + locationObject.ZipCode;
		} else {
			address = locationObject.AddressLine1 + ', ' + locationObject.AddressLine2 + ', ' + locationObject.City + ', ' + locationObject.State + ' ' + locationObject.ZipCode;
		}
		return address;
	}

	numberCollections() {
		if (this.locations.length && this.patients.length) {
			let count = 0;
			this.locations.forEach(location => {
				location.count = count;
				count++;
				if (location.expanded) {
					let firstCollection = true;
					this.patients.filter(collection => collection.CollectedLocation.Code === location.code).forEach(collection => {
						if (firstCollection === true) {
							count--;
							firstCollection = false;
						}
						collection.count = count;
						count++;
					});
				} else {
					this.patients.filter(collection => collection.CollectedLocation.Code === location.code).forEach(collection => {
						collection.count = -1;
					});
				}
			});
			if (this.locations.filter(location => location.expanded === true).length) {
				this.paginationTotal = count;
			} else {
				this.paginationTotal = count - this.locations.length;
			}
		}
		this.numberLocationsGrouped();
		this.updatePaginatorRange();
	}

	numberLocationsGrouped() {
		let count = 0;
		this.locationsGrouped.forEach(location => {
			location.count = count;
			count++;
			if (location.expanded) {
				let firstCollection = true;
				location.collections.forEach(collection => {
					if (firstCollection) {
						count--;
						firstCollection = false;
					}
					collection.count = count;
					count++;
				});
			}
		});
		if (this.locationsGrouped.filter(location => location.expanded).length) {
			this.paginationTotal = count;
		} else {
			this.paginationTotal = this.locationsGrouped.length;
		}
		this.updatePaginatorRange();
	}

	getGroupedLocations() {
		const tempLocations = [];
		const oldLocations = [];
		this.locationsGrouped.forEach(location => {
			oldLocations.push({ code: location.code, expanded: location.expanded });
		});
		this.locations.forEach(location => {
			let expanded = location.expanded;
			const thisOldLocation = oldLocations.find(loc => loc.code === location.code);
			if (thisOldLocation !== undefined) {
				expanded = thisOldLocation.expanded;
			}
			const locationObject = { code: location.code, expanded: expanded, address: location.address, collections: [] };
			const locationCollections = this.patients.filter(collection => collection.CollectedLocation.Code === location.code);
			locationObject.collections = locationCollections;
			tempLocations.push(locationObject);
		});
		this.locationsGrouped = tempLocations;
	}

	getLocations() {
		let oldLocations = [];
		if (this.locations !== undefined && this.locations.length) {
			oldLocations = JSON.parse(JSON.stringify(this.locations));
		}
		this.locations = Array.from(new Set(this.patients.map(patient => patient.CollectedLocation.Code))).sort((a, b) => {
			if (a > b) {
				return 1;
			}
			if (a < b) {
				return -1;
			}
			return 0;
		});
		const newLocations = [];
		this.locations.forEach(location => {
			let expand = false;
			if (oldLocations.length) {
				const oldLoc = oldLocations.find(loc => loc.code === location);
				if (oldLoc !== undefined) {
					expand = oldLoc.expanded;
				}
			}
			newLocations.push({ code: location, expanded: expand, address: this.makeAddress(location), number: this.patients.filter(patient => patient.CollectedLocation.Code === location).length });
		});
		this.locations = newLocations;
		this.getGroupedLocations();
	}

	clickLocationRow() {
		this.workListService.resetCleanTime();
	}

	clickLocation(location) {
		this.workListService.resetCleanTime();
		location.expanded = !location.expanded;
		this.emitLocationChange.emit();
		this.numberLocationsGrouped();
		this.getCollectionsToDisplay();
	}

	getCollectionsToDisplay() {
		if (this.patients.length) {
			this.paginationStart = (this.pageIndex * this.paginatorSelected);
			this.paginationEnd = Math.min((this.pageIndex * this.paginatorSelected + this.paginatorSelected), this.paginationTotal);
		} else {
			this.paginationTotal = this.paginationStart = this.paginationEnd = 0;
		}
		this.updatePaginatorRange();
		this.checkPaginatorRange();
	}

	checkPaginatorRange() {
		if (this.paginationStart > this.paginationTotal) {
			this.pageIndex = 0;
			this.getCollectionsToDisplay();
		}
	}

	updatePaginatorRange() {
		if (this.paginationTotal !== 0) {
			this.paginatorRange = `${this.paginationStart + 1} - ${this.paginationEnd} of ${this.paginationTotal}`;
			if (this.locationsGrouped.filter(location => location.expanded).length) {
				const pastDates = this.locationsGrouped.filter(location =>
					location.count <= this.paginationEnd &&
					location.expanded &&
					location.collections.length &&
					location.collections[location.collections.length - 1].count >= this.paginationStart).map(location => ({ last: location.collections[location.collections.length - 1].count, count: location.count }));
				if (pastDates.length) {
					this.pinnedLocation = pastDates.find(d => d.last === Math.min(...pastDates.map(date => date.last))).count;
				} else {
					this.pinnedLocation = -1;
				}
			} else {
				this.pinnedLocation = -1;
			}
		} else {
			this.paginatorRange = `0 of 0`;
		}

		/* if (this.paginationTotal !== 0) {
			this.paginatorRange = `${this.paginationStart + 1} - ${this.paginationEnd} of ${this.paginationTotal}`;
			const pastLocations = this.locations.filter(location => location.count <= this.paginationEnd).map(location => location.count);
			this.pinnedLocation = pastLocations[pastLocations.length - 1];
		} else {
			this.paginatorRange = `0 of 0`;
		} */
		this.emitPaginatorChange.emit();
	}

	changePageIndex(mod) {
		this.workListService.resetCleanTime();
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

			this.locationsGrouped.forEach(location => {
				location.collections.sort((a, b) => {
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
			});
		}
		this.getCollectionsToDisplay();
	}

	sort(col) {
		this.workListService.resetCleanTime();
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
			this.locationsGrouped.forEach(location => {
				location.collections.sort((a, b) => {
					if (a.Id > b.Id) {
						return (1);
					}
					if (a.Id < b.Id) {
						return (-1);
					}
					return 0;
				});
			});
		} else {
			this.locationsGrouped.forEach(location => {
				location.collections.sort((a, b) => {
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
		const names = ['Name', 'DOB', 'Gender', 'MRN', 'Priority', 'Problem list', 'Time', 'Bed', 'Reserved'];
		const display = ['Name', 'Date of Birth', 'Gender', 'MRN', 'Priority', 'Problem list', 'Time', 'Bed', ''];
		for (let i = 0; i < names.length; i++) {
			this.columns.display.push({ id: i, name: names[i], display: this.translation.translate('Label.' + display[i]), checked: true });
		}
	}

	resetColumns() {
		this.columns.display = [];
		const names = ['Name', 'DOB', 'Gender', 'MRN', 'Priority', 'Problem list', 'Time', 'Bed', 'Reserved'];
		const display = ['Name', 'Date of Birth', 'Gender', 'MRN', 'Priority', 'Problem list', 'Time', 'Bed'];
		const sortOn = ['Patient.LastName', 'Patient.DateOfBirth', 'Patient.Gender', 'Patient.MRN', 'Priority.Description', 'ProblemList', 'ScheduledTime', 'Bed', 'Status'];
		const tableShow = ['Patient.FullName', 'Patient.DateOfBirth', 'Patient.Gender', 'Patient.MRN', 'Priority.Description', 'IsProblem', 'ScheduledTime', 'Bed', ''];
		for (let i = 0; i < names.length; i++) {
			let check = true;
			if (names[i] === 'Bed' && this.showBed === false) {
				check = false;
			}
			this.columns.display.push({ id: i, name: names[i], display: this.translation.translate('Label.' + display[i]), sortOn: sortOn[i], tableShow: tableShow[i], checked: check });
		}
	}

	updateColumns(cols) {
		const names = ['Name', 'DOB', 'Gender', 'MRN', 'Priority', 'Problem list', 'Time', 'Bed', 'Timer', 'Reserved'];
		const display = ['Name', 'Date of Birth', 'Gender', 'MRN', 'Priority', 'Problem list', 'Time', 'Bed', 'Timer', 'Reserved'];
		const sortOn = ['Patient.LastName', 'Patient.DateOfBirth', 'Patient.Gender', 'Patient.MRN', 'Priority.Description', 'IsProblem', 'ScheduledTime', 'Bed', '', 'Status'];
		this.columns.display = [];
		let i = 0;
		cols.forEach(col => {
			if (col !== 'Location') {
				this.columns.display.push({ id: i, name: names[names.indexOf(col)], display: display[names.indexOf(col)], sortOn: sortOn[names.indexOf(col)], checked: true });
				i++;
			}
		});
	}

	showColumn(name) {
		return (this.columns.display.map(col => col.name).indexOf(name) > -1);
	}

	selectRow(patient) {
		this.workListService.resetCleanTime();
		this.selectedRowId = patient.Id;
	}

	hoverAddressRow(event) {
		event.target.previousSibling.previousSibling.style.backgroundColor = getComputedStyle(event.target).backgroundColor;
	}

	leaveAddressRow(event) {
		event.target.previousSibling.previousSibling.style.backgroundColor = 'white';
	}
}
