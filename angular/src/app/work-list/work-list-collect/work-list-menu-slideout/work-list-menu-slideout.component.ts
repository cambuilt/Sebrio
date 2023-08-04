import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import { TranslationService } from 'angular-l10n';
import { WorkListProblemListComponent } from '../menu-items/work-list-problem-list/work-list-problem-list.component';
import { WorkListCancelComponent } from '../menu-items/work-list-cancel/work-list-cancel.component';
import { WorkListPrintCommComponent } from '../menu-items/work-list-print-comm/work-list-print-comm.component';
import { WorkListPrintPatientComponent } from '../menu-items/work-list-print-patient/work-list-print-patient.component';
import { WorkListRescheduleComponent } from '../menu-items/work-list-reschedule/work-list-reschedule.component';
import { WorkListTransferComponent } from '../menu-items/work-list-transfer/work-list-transfer.component';
import { WorkListIdentifyComponent } from '../work-list-identify/work-list-identify.component';
import { WorkListMenuComponent } from '../work-list-menu/work-list-menu.component';
import { WorkListPatientComponent } from '../work-list-patient/work-list-patient.component';
import { PrintService } from 'src/app/services/print.service';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-work-list-menu-slideout',
	templateUrl: './work-list-menu-slideout.component.html',
	styleUrls: ['./work-list-menu-slideout.component.css']
})
export class WorkListMenuSlideoutComponent implements OnInit {
	@Output() closeSlideout = new EventEmitter();
	@Output() overlayClick = new EventEmitter();
	@Output() cancel = new EventEmitter();
	@Output() reschedule = new EventEmitter();
	@Output() problemList = new EventEmitter();
	@Output() printComm = new EventEmitter();
	@Output() printPatient = new EventEmitter();
	@Output() transfer = new EventEmitter();

	@Output() menuCancel = new EventEmitter();
	@Output() menuReschedule = new EventEmitter();
	@Output() menuProblemList = new EventEmitter();
	@Output() menuPrintComm = new EventEmitter();
	@Output() menuPrintPatient = new EventEmitter();
	@Output() menuTransfer = new EventEmitter();

	@Output() clickInformation = new EventEmitter();


	@ViewChild('workListMenu') workListMenu: WorkListMenuComponent;
	@ViewChild('workListCollection') workListCollection: WorkListPatientComponent;

	@ViewChild('workListProblemList') workListProblemList: WorkListProblemListComponent;
	@ViewChild('workListCancel') workListCancel: WorkListCancelComponent;
	@ViewChild('workListPrintComm') workListPrintComm: WorkListPrintCommComponent;
	@ViewChild('workListPrintPatient') workListPrintPatient: WorkListPrintPatientComponent;
	@ViewChild('workListReschedule') workListReschedule: WorkListRescheduleComponent;
	@ViewChild('workListTransfer') workListTransfer: WorkListTransferComponent;

	showDrawer = false;
	showOverlay = false;
	hideShadow = true;
	collection = new Collection();

	showPatientInfo = false;
	showMenu = false;
	showingMenuOption = true;

	showCancel = false;
	showPrintComm = false;
	showPrintPatient = false;
	showProblemList = false;
	showReschedule = false;
	showTransfer = false;

	isLoading: Observable<boolean>;

	constructor(public translation: TranslationService, private printService: PrintService) {
		this.isLoading = this.printService.loadingStatus;
	}

	ngOnInit() { }

	show(collection) {
		this.collection = collection;
		this.showDrawer = true;
	}

	close() {
		this.showDrawer = false;
	}

	clickBack() {
		this.closeSlideout.emit();
	}

	clickOverlay() {
		this.closeSlideout.emit();
	}

	toggleMenu() {
		if (this.workListMenu.showMenu === true) {
			this.workListMenu.close();
			this.showMenu = false;
		} else {
			this.workListMenu.show();
			this.showMenu = true;
		}
	}

	menuClosed() {
		this.showMenu = false;
	}

	updateShowPatientInfo(event) {
		this.showPatientInfo = event;
	}

	clickInfo() {
		this.showPatientInfo = !this.showPatientInfo;
		this.workListCollection.collection = this.collection;
		console.log(this.collection);
		this.clickInformation.emit();
		this.workListCollection.toggle();
	}

	closeButton() {
		this.closeSlideout.emit();
	}

	activateCancel() {
		this.workListCancel.load(this.collection);
		this.workListCancel.show();
		this.showCancel = true;
	}

	activatePrintComm() {
		this.workListPrintComm.load(this.collection);
		this.workListPrintComm.show();
		this.showPrintComm = true;
	}

	activatePatientComm() {
		this.workListPrintPatient.load(this.collection);
		this.workListPrintPatient.show();
		this.showPrintPatient = true;
	}

	activateProblemList() {
		this.workListProblemList.load(this.collection);
		this.workListProblemList.show();
		this.showProblemList = true;
	}

	activateReschedule() {
		this.workListReschedule.load(this.collection);
		this.workListReschedule.show();
		this.showReschedule = true;
	}

	activateTransfer() {
		this.workListTransfer.load(this.collection);
		this.workListTransfer.show();
		this.showTransfer = true;
	}

	cancelSubmit(evt) {
		this.cancel.emit(evt);
		this.closeSlideout.emit();
	}

	submitPrintComm(evt) {
		this.printComm.emit(evt);
	}

	submitPrintPatient(evt) {
		this.printPatient.emit(evt);
	}

	sendToProblemList(evt) {
		this.problemList.emit(evt);
		this.closeSlideout.emit();
	}

	submitReschedule(evt) {
		this.reschedule.emit(evt);
		this.closeSlideout.emit();
	}

	submitTransfer(evt) {
		this.transfer.emit(evt);
		this.closeSlideout.emit();
	}

	openCancel() {
		if (!this.showCancel) {
			this.menuCancel.emit();
		}
	}

	openPrintComm() {
		if (!this.showPrintComm) {
			this.menuPrintComm.emit();
		}
	}

	openPrintPatient() {
		if (!this.showPrintPatient) {
			this.menuPrintPatient.emit();
		}
	}

	openProblemList() {
		if (!this.showProblemList) {
			this.menuProblemList.emit();
		}
	}

	openReschedule() {
		if (!this.showReschedule) {
			this.menuReschedule.emit();
		}
	}

	openTransfer() {
		if (!this.showTransfer) {
			this.menuTransfer.emit();
		}
	}

}
