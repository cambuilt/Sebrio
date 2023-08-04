import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslationService } from 'angular-l10n';
import { WorkListService } from 'src/app/services/work-list.service';
import { MatDialog } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';
import { WorkListRequestDialogComponent } from 'src/app/work-list-request-dialog/work-list-request-dialog.component';
import { ConfirmReserveDialogComponent } from '../confirm-reserve-dialog/confirm-reserve-dialog.component';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-work-list-builder-mobile',
	templateUrl: './work-list-builder-mobile.component.html',
	styleUrls: ['./work-list-builder-mobile.component.css']
})
export class WorkListBuilderMobileComponent implements OnInit {
	@Output() emitLocationChange = new EventEmitter();
	@Output() emitPaginatorChange = new EventEmitter();
	patients: any;
	locations: any;
	pinnedLocation: any;
	groupByLocation = true;

	canSupersedeReservations: Observable<boolean>;
	canManualRefresh: Observable<boolean>;
	canDisplayLocationAddress: Observable<boolean>;
	canDisplayHomeDrawAddress: Observable<boolean>;
	displayBed: Observable<boolean>;
	currentPhleb: any;

	selectedRow: any;

	paginatorRange: string;
	paginatorOptions = [5, 10, 20, 50, 100];
	paginatorSelected = 5;
	pageIndex = 0;
	paginationStart = 0;
	paginationEnd = 0;
	paginationTotal = 0;

	platform: any;
	userAgentCategory;

	locationsGrouped = [];

	constructor(public translation: TranslationService, private workListService: WorkListService, public dialog: MatDialog, private authService: AuthService) {
		this.currentPhleb = this.authService.currentUser;
		this.canSupersedeReservations = this.workListService.canSupersede();
		this.canManualRefresh = this.workListService.fnCanManualRefresh();
		this.canDisplayLocationAddress = this.workListService.canDisplayLocationAddress();
		this.canDisplayHomeDrawAddress = this.workListService.canDisplayHomeDrawAddress();
		this.displayBed = this.workListService.getDisplayBed();
		this.platform = window.navigator.platform;
		if (navigator.userAgent.match(/Android/)) {
			this.userAgentCategory = 'Android';
		} else if (navigator.userAgent.match(/iPhone|iPad|iPod/)) {
			this.userAgentCategory = 'iOS';
		} else if (navigator.platform.match(/Mac/i)) {
			this.userAgentCategory = 'Mac';
		} else if (navigator.platform.match(/Win/i)) {
			this.userAgentCategory = 'Windows';
		}
	}

	ngOnInit() {
		if (!(this.workListService.patientsToDisplay.length > 0)) {
			this.updatePaginatorRange();
		}
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
			newLocations.push({ code: location, expanded: expand, address: this.patients.find(patient => patient.CollectedLocation.Code === location).CollectedLocation.Address, number: this.patients.filter(patient => patient.CollectedLocation.Code === location).length });
		});
		this.locations = newLocations;
		this.getGroupedLocations();
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

	refreshData() {
		if (this.workListService.patientsToDisplay.length > 0) {
			this.patients = this.workListService.patientsToDisplay;
			this.getLocations();
			this.numberLocationsGrouped();
			this.getCollectionsToDisplay();
		} else if (this.workListService.getHub() === undefined) {
			this.patients = [];
			this.getLocations();
			this.getCollectionsToDisplay();
		}
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
		this.emitPaginatorChange.emit();
	}

	changePageIndex(mod) {
		this.workListService.resetCleanTime();
		if (mod > 0 && this.pageIndex > -1) {
			this.pageIndex = this.pageIndex + mod;
		} else if (mod < 0) {
			this.pageIndex = this.pageIndex + mod;
		}
		this.getCollectionsToDisplay();
	}

	updatePaginatorNumber() {
		this.pageIndex = 0;
		this.getCollectionsToDisplay();
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

	numberCollections() {
		if (this.locations.length && this.patients.length) {
			let count = 0;
			this.locations.forEach(location => {
				location.count = count;
				count++;
				let firstCollection = true;
				if (location.expanded) {
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
			if (!this.locations.filter(location => location.expanded === true).length) {
				this.paginationTotal = count - this.locations.length;
			} else {
				this.paginationTotal = count;
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

	getPatientsByLocation(location) {
		if (this.patients !== undefined) {
			if (this.patients.length > 0) {
				return this.patients.filter(patient => patient.CollectedLocation.Code === location);
			}
		}
	}

	requestLocked(row) {
		this.workListService.resetCleanTime();
		this.dialog.open(WorkListRequestDialogComponent, {
			width: '433px',
			data: { row: row }
		});
	}

	reserveAll() {
		const availableCollections = this.getAvailable();
		if (availableCollections > 30) {
			const dialogRef = this.dialog.open(ConfirmReserveDialogComponent, {
				width: '321px',
				data: { number: availableCollections },
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (result) {
					this.processReserveAll();
				}
			});
		} else {
			this.processReserveAll();
		}
	}

	getAvailable() {
		let count = 0;
		if (this.locations.length && this.patients.length) {
			this.locations.filter(location => location.expanded === true).forEach(loc => {
				count = count + this.patients.filter(patient => patient.CollectedLocation.Code === loc.code && (patient.Status === 'Available' || patient.Status === '')).length;
			});
		}
		return count;
	}

	processReserveAll() {
		const toReserve = [];
		if (this.locations.length && this.patients.length) {
			this.locations.filter(location => location.expanded === true).forEach(loc => {
				this.patients.filter(patient => patient.CollectedLocation.Code === loc.code).forEach(pat => {
					toReserve.push(pat);
				});
			});
			this.workListService.bulkReserve(toReserve);
		}
	}

	cycleReserved(current) {
		this.workListService.cycleReserved(current);
	}

	collectionClick(patient) {
		this.workListService.resetCleanTime();
		this.selectedRow = patient;
	}
}
