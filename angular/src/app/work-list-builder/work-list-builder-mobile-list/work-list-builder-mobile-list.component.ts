import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslationService } from 'angular-l10n';
import { WorkListService } from 'src/app/services/work-list.service';
import { MatDialog } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';
import { WorkListRequestDialogComponent } from 'src/app/work-list-request-dialog/work-list-request-dialog.component';
import { ConfirmReserveDialogComponent } from '../confirm-reserve-dialog/confirm-reserve-dialog.component';
import * as moment from 'moment-timezone';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-work-list-builder-mobile-list',
	templateUrl: './work-list-builder-mobile-list.component.html',
	styleUrls: ['./work-list-builder-mobile-list.component.css']
})
export class WorkListBuilderMobileListComponent implements OnInit {
	@Output() emitPaginatorChange = new EventEmitter();

	patients: any;
	patientsToDisplay: any;
	locations: any;
	groupByLocation = true;

	canSupersedeReservations: Observable<boolean>;
	canManualRefresh: Observable<boolean>;
	displayBed: Observable<boolean>;
	canDisplayLocationAddress: Observable<boolean>;
	canDisplayHomeDrawAddress: Observable<boolean>;
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

	constructor(public translation: TranslationService, private workListService: WorkListService, public dialog: MatDialog, private authService: AuthService) {
		this.currentPhleb = this.authService.currentUser;
		this.canSupersedeReservations = this.workListService.canSupersede();
		this.canManualRefresh = this.workListService.fnCanManualRefresh();
		this.displayBed = this.workListService.getDisplayBed();
		this.canDisplayLocationAddress = this.workListService.canDisplayLocationAddress();
		this.canDisplayHomeDrawAddress = this.workListService.canDisplayHomeDrawAddress();
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

	ngOnInit() { }

	getLocations() {
		let oldLocations = [];
		const newLocations = [];
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
		this.locations.forEach(location => {
			let expand = false;
			if (oldLocations.length) {
				expand = !oldLocations.find(loc => loc.code === location).length;
			}
			newLocations.push({ code: location, expanded: expand, address: this.patients.find(patient => patient.CollectedLocation.Code === location).CollectedLocation.Address, number: this.patients.filter(patient => patient.CollectedLocation.Code === location).length });
		});
		this.locations = newLocations;
	}

	toggleLocation(location) {
		this.locations[location].expanded = this.locations[location].expanded;
	}

	refreshData() {
		if (this.workListService.patientsToDisplay.length > 0) {
			this.patients = this.workListService.patientsToDisplay;
			this.getLocations();
		} else {
			this.patients = [];
			this.getLocations();
		}
		this.getPatientsToDisplay();
	}

	getPatientsToDisplay() {
		if (this.patients && this.patients.length) {
			this.paginationTotal = this.patients.length;
			this.patientsToDisplay = this.patients.slice((this.pageIndex * this.paginatorSelected), (this.pageIndex * this.paginatorSelected + this.paginatorSelected));
			this.paginationStart = (this.pageIndex * this.paginatorSelected);
			this.paginationEnd = Math.min((this.pageIndex * this.paginatorSelected + this.paginatorSelected), this.paginationTotal);
		} else {
			this.patientsToDisplay = [];
			this.paginationTotal = this.paginationStart = this.paginationEnd = 0;
		}
		this.updatePaginatorRange();
	}

	changePageIndex(mod) {
		if (mod > 0 && this.pageIndex > -1) {
			this.pageIndex = this.pageIndex + mod;
		} else if (mod < 0) {
			this.pageIndex = this.pageIndex + mod;
		}
		this.getPatientsToDisplay();
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

	updatePaginatorNumber() {
		this.pageIndex = 0;
		this.getPatientsToDisplay();
	}

	getPatientsByLocation(location) {
		if (this.patients !== undefined) {
			if (this.patients.length > 0) {
				return this.patients.filter(patient => patient.CollectedLocation.Code === location);
			}
		}
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
			} else {
				this.workListService.reserveAll();
			}
		}
	}

	cycleReserved(current) {
		this.workListService.cycleReserved(current);
	}

	collectionClick(patient) {
		this.selectedRow = patient;
	}

}
