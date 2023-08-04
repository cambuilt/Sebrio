import { Component, OnInit, Output, EventEmitter, HostListener, AfterViewInit, ViewChild } from '@angular/core';
import { TranslationService } from 'angular-l10n';
import { WorkListService } from 'src/app/services/work-list.service';
import { MatDialog } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';
import { WorkListRequestDialogComponent } from 'src/app/work-list-request-dialog/work-list-request-dialog.component';
import * as moment from 'moment-timezone';
import { Observable } from 'rxjs';
import { WorkListPreviewComponent } from '../work-list-preview/work-list-preview.component';

@Component({
	selector: 'app-work-list-mobile',
	templateUrl: './work-list-mobile.component.html',
	styleUrls: ['./work-list-mobile.component.css']
})
export class WorkListMobileComponent implements OnInit {
	@Output() cycleReserve = new EventEmitter();
	@Output() reserveAllMobile = new EventEmitter();
	@Output() emitPaginatorChange = new EventEmitter();
	@Output() changePreview = new EventEmitter();
	@Output() openCancelledCollection = new EventEmitter();
	@Output() selectCollection = new EventEmitter();
	@ViewChild('workListPreview') workListPreview: WorkListPreviewComponent;
	patients: any;
	patientsToDisplay: any;

	currentPhleb: any;

	displayBed: Observable<boolean>;
	canDisplayLocationAddress: Observable<boolean>;
	canDisplayHomeDrawAddress: Observable<boolean>;

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

	tableWidth = 0;

	notificationChanges: any;

	constructor(public translation: TranslationService, private workListService: WorkListService, public dialog: MatDialog, private authService: AuthService) {
		this.currentPhleb = this.authService.currentUser;
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

	processNotificationChanges() {
		this.workListService.notificationChanges.forEach(change => {
			const coll = this.patients.find(collection => collection.Id === change.Id);
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
		if (data && data.length) {
			this.patients = data;
			this.processNotificationChanges();
		} else {
			this.patients = [];
		}
		this.getPatientsToDisplay();
	}

	getPatientsToDisplay() {
		if (this.patients.length) {
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
		this.selectedRow = '';
		this.getPatientsToDisplay();
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

	cycleReserved(collection) {
		this.cycleReserve.emit(collection);
	}

	reserveAll() {
		this.reserveAllMobile.emit();
	}

	openCancelled(patient) {
		if (patient.IsCancelled) {
			this.openCancelledCollection.emit(patient);
		}
	}

	previewCollection(patient) {
		this.changePreview.emit(patient);
	}

	selectRow(patient) {
		this.workListService.resetCleanTime();
		this.selectedRow = patient.Id;
		this.selectCollection.emit(this.selectedRow);
	}
}
