import { Component, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialog, MatSelect } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { CollectionListService } from '../services/collection-list.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { LocationSelectorComponent } from '../location-selector/location-selector.component';
import { ClientSelectorComponent } from '../client-selector/client-selector.component';
import { ProviderSelectorComponent } from '../provider-selector/provider-selector.component';
import { PrioritySelectorComponent } from '../priority-selector/priority-selector.component';
import { HubSelectorComponent } from '../hub-selector/hub-selector.component';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '@angular/forms';
import { TranslationService } from 'angular-l10n';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-collection-list-add',
	templateUrl: './collection-list-add.component.html',
	styleUrls: ['./collection-list-add.component.css']
})
export class CollectionListAddComponent implements AfterViewInit {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	@ViewChild('collectionListLocations') collectionListLocations: LocationSelectorComponent;
	@ViewChild('collectionListClients') collectionListClients: ClientSelectorComponent;
	@ViewChild('collectionListProviders') collectionListProviders: ProviderSelectorComponent;
	@ViewChild('collectionListPriorities') collectionListPriorities: PrioritySelectorComponent;
	@ViewChild('collectionListHubs') collectionListHubs: HubSelectorComponent;

	@ViewChild('wristbandSelector') wristbandSelector: MatSelect;
	@ViewChild('wristbandSelect1') wristbandSelect1: MatSelect;
	@ViewChild('wristbandSelect2') wristbandSelect2: MatSelect;
	@ViewChild('documentationSelector') documentationSelector: MatSelect;
	@ViewChild('documentationSelect1') documentationSelect1: MatSelect;
	@ViewChild('documentationSelect2') documentationSelect2: MatSelect;
	@ViewChild('startTee') startTee: MatSelect;
	@ViewChild('endTee') endTee: MatSelect;
	@ViewChild('startTime') startTime: ElementRef;
	@ViewChild('startDays') startDays: ElementRef;
	@ViewChild('endTime') endTime: ElementRef;
	@ViewChild('endDays') endDays: ElementRef;

	properties = {
		clearFields: () => this.clearFields(),
		isDrawerOpen: false,
		manualDescriptionInput: false,
		showOverlay: false,
		hideOverlay: false,
		rowID: ''
	};

	addAnother: boolean;
	headerText: string;
	pristineObject: any;
	wasTab = false;
	collectionList: any = {
		Code: '',
		Description: '',
		Note: '',
		Hub: {
			Id: ''
		},
		Laboratory: {
			Id: ''
		},
		IsActive: true,
		RefreshTimeAutomatic: '',
		RefreshTimeManual: '',
		CleanCollectionListTimer: '',
		CollectionPeriodStartSelect: '',
		CollectionPeriodStartDays: '',
		CollectionPeriodStartTime: '',
		CollectionPeriodEndSelect: '',
		CollectionPeriodEndDays: '',
		CollectionPeriodEndTime: '',
		ReservationExpireTime: '',
		ReservationIsSuperseded: true,
		CollectStaff: '',
		AssociatedCollectionLocations: [],
		AssociatedClients: [],
		AssociatedProviders: [],
		AssociatedPriorities: [],
		SelectedAllAssociatedCollectionLocations: true,
		SelectedAllAssociatedClients: true,
		SelectedAllAssociatedProviders: true,
		SelectedAllAssociatedPriorities: true,
		DisplayClient: false,
		DisplayClientAddressAndPhone: false,
		DisplayCollectionLocation: false,
		DisplayHomeDrawAddress: false,
		DisplayPatientAddressAndPhone: false,
		DisplayPatientRoomBed: false,
		PatientIdentifier: '',
		PatientScanWristband: true,
		PatientWristbandCount: '',
		PatientWristband1: '',
		PatientWristbandBarcodeSegment1: '',
		PatientWristband2: '',
		PatientWristbandBarcodeSegment2: '',
		PatientWristbandBarcodeDelimiter: '',
		PatientIdDocCount: '',
		PatientIdDoc1: '',
		PatientIdDoc2: '',
		PatientScanId: true,
		PatientManualId: true,
		CanCancelOrder: true,
		CanRescheduleOrder: true,
		CanTransferToProblemList: true,
		CanIdentifyCollectionSite: true,
		CanAddCollectionNote: true,
		CanWorkloadCodeEntry: false,
		CanEnableGPSSupport: false,
		CanTriggerExceptionReport: false,
		CanGenerateCommunicationLabel: false,
		CanGroupByLocation: true,
		LabelNumberDefault: '',
		LabelNumberMaximum: '',
		CanUpdateCentralLineStatus: false,
		CentralLineDuration: '',
		RequiredFormABN: false,
		RequiredFormFinancialResponsibility: false,
		RequiredFormRequisition: false
	};
	nowChecked = false;
	labs = [];
	hubs = [];
	priorities = [];
	locationsAssociated = [];
	clientsAssociated = [];
	providersAssociated = [];
	prioritiesAssociated = [];
	plusMinus = [
		{ value: ' ' },
		{ value: '-' },
		{ value: '+' }
	];
	collectionStaff = [
		{ value: 'Nurse to collect' },
		{ value: 'Lab to collect' },
		{ value: 'Both' },
	];
	wristbandSelect = [
		{ value: this.translation.translate('Label.Account Number') },
		{ value: this.translation.translate('Label.Driver\'s License') },
		{ value: 'MRN' },
		{ value: this.translation.translate('Label.Account Number') + '/' + this.translation.translate('Label.Driver\'s License') + '/' + 'MRN' }
	];
	documentationSelect = [
		{ value: 'DOB' },
		{ value: this.translation.translate('Label.Patient Name') }
	];
	oneTwo = ['1', '2'];
	drawerOverlayOpen = 0;
	wasInactive = false;
	isAssociated = false;
	objectForm = [];
	@ViewChild('code') code: NgModel;
	@ViewChild('hubForm') hubForm: NgModel;
	@ViewChild('labForm') labForm: NgModel;
	@ViewChild('autoRefresh') autoRefresh: NgModel;
	@ViewChild('manualRefresh') manualRefresh: NgModel;
	@ViewChild('cleanListForm') cleanListForm: NgModel;
	@ViewChild('reservationTimeForm') reservationTimeForm: NgModel;
	@ViewChild('collectionStaffForm') collectionStaffForm: NgModel;
	@ViewChild('startTeeForm') startTeeForm: NgModel;
	@ViewChild('endTeeForm') endTeeForm: NgModel;
	@ViewChild('startDaysForm') startDaysForm: NgModel;
	@ViewChild('startTimeForm') startTimeForm: NgModel;
	@ViewChild('endDaysForm') endDaysForm: NgModel;
	@ViewChild('endTimeForm') endTimeForm: NgModel;
	@ViewChild('wristbandSelectorForm') wristbandSelectorForm: NgModel;
	@ViewChild('wristbandSelect1Form') wristbandSelect1Form: NgModel;
	@ViewChild('wristbandSelect1SegmentForm') wristbandSelect1SegmentForm: NgModel;
	@ViewChild('wristbandSelect2Form') wristbandSelect2Form: NgModel;
	@ViewChild('wristbandSelect2SegmentForm') wristbandSelect2SegmentForm: NgModel;
	@ViewChild('wristbandDelimiterForm') wristbandDelimiterForm: NgModel;
	@ViewChild('documentationSelectorForm') documentationSelectorForm: NgModel;
	@ViewChild('documentationSelect1Form') documentationSelect1Form: NgModel;
	@ViewChild('documentationSelect2Form') documentationSelect2Form: NgModel;
	@ViewChild('defaultLabels') defaultLabels: NgModel;
	minimumRequiredID = 0;

	constructor(public utilsService: UtilsService, private activeEntitiesService: ActiveEntitiesService, private collectionListService: CollectionListService, private errorAlert: MatDialog, public translation: TranslationService) { }

	ngAfterViewInit() {
		this.objectForm.push(this.code);
		this.objectForm.push(this.hubForm);
		this.objectForm.push(this.labForm);
		this.objectForm.push(this.autoRefresh);
		this.objectForm.push(this.manualRefresh);
		this.objectForm.push(this.cleanListForm);
		this.objectForm.push(this.reservationTimeForm);
		this.objectForm.push(this.collectionStaffForm);
		this.objectForm.push(this.startTimeForm);
		this.objectForm.push(this.endTimeForm);
		this.objectForm.push(this.startDaysForm);
		this.objectForm.push(this.endDaysForm);
		this.objectForm.push(this.wristbandSelectorForm);
		this.objectForm.push(this.wristbandSelect1Form);
		this.objectForm.push(this.wristbandSelect1SegmentForm);
		this.objectForm.push(this.wristbandSelect2Form);
		this.objectForm.push(this.wristbandSelect2SegmentForm);
		this.objectForm.push(this.wristbandDelimiterForm);
		this.objectForm.push(this.documentationSelectorForm);
		this.objectForm.push(this.documentationSelect1Form);
		this.objectForm.push(this.documentationSelect2Form);
		this.objectForm.push(this.defaultLabels);
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	resetExists() {
		this.collectionListService.collectionExists = false;
	}

	saveForm() {
		let formValid = true;
		formValid = this.checkRequiredIDs();
		this.objectForm.forEach(c => {
			if (!c.disabled) {
				if (!(c.name === 'endTime' && this.nowChecked)) {
					c.control.markAsDirty();
					c.control.markAsTouched();
					c.control.updateValueAndValidity();
					if (!c.valid) {
						formValid = false;
					}
				}
			}
		});
		return formValid;
	}

	checkDeactivate(addAnother) { // if not a new entry and the record was not inactive
		console.log('at the beginning of checkDeactivate');
		if (this.collectionList.IsActive === false && this.properties.rowID !== '') { // check if theres anything associated
			if (this.isAssociated === true) { // if so allow user to know
			const dialogRef = this.errorAlert.open(DeactivateRecordPopupComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (document.body.querySelector('.add-overlay')) {
					document.body.removeChild(document.body.querySelector('.add-overlay'));
				}
				if (result) { // they want to deactivate anyway
					this.save(false);
				} else {
					this.collectionList.IsActive = true;
					if (this.pristineObject !== JSON.stringify(this.collectionList)) {
						this.save(addAnother);
					} else {
						this.utilsService.closeDrawer(this.properties);
						return;
					}
				}
			});
			} else { // there was no association found so deactivate and save
				this.save(addAnother);
			}
		} else { // they were not deactivating the record so save like normal
			console.log('about to call save in checkDeactivate');
			this.save(addAnother);
		}
	}

	checkForm(addAnother) { // check all fields are complete
		console.log('at the beginning of checkForm');
		if (this.saveForm()) {
			this.checkDeactivate(addAnother);
		} else {
			this.goToTop();
		}
	}


	checkRequiredIDs() {
		console.log(`MinID: ${this.minimumRequiredID}, ScanWrist: ${this.collectionList.PatientScanWristband}, ManualID: ${this.collectionList.PatientManualId}`);
		if (this.minimumRequiredID !== 0) {
			if (this.collectionList.PatientScanWristband === false && this.collectionList.PatientManualId === false) {
				return this.openRequiredIDError();
			} else {
				let count = 0;
				if (this.collectionList.PatientScanWristband !== false) {
					count = count + parseInt(this.collectionList.PatientWristbandCount, 10);
				}
				/* if (this.collectionList.PatientScanId !== false) {
					count = count + parseInt(this.collectionList.PatientIdDocCount, 10);
				} */
				if (this.collectionList.PatientManualId !== false) {
					count = count + parseInt(this.collectionList.PatientIdDocCount, 10);
				}
				if (count >= this.minimumRequiredID) {
					return true;
				} else {
					return this.openRequiredIDError();
				}
			}
		} else {
			return true;
		}
	}

	openRequiredIDError() {
		const errorText = (this.minimumRequiredID > 1) ? (`At least ${this.minimumRequiredID} patient identifiers are required.`) : (`At least ${this.minimumRequiredID} patient identifier is required.`);
		const dialogRef = this.errorAlert.open(ErrorDialogComponent, {
			width: '300px',
			backdropClass: 'unsavedOverlay',
			data: errorText,
			autoFocus: false
		});
		dialogRef.beforeClose().subscribe(result => {
			if (document.body.querySelector('.add-overlay')) {
				document.body.removeChild(document.body.querySelector('.add-overlay'));
			}
			this.drawerOverlayOpen = 0;
		});
		return false;
	}

	getAssociated(labID, loadDefaults) {
		this.getLocationsAssociated(labID);
		this.getClientsAssociated(labID);
		this.getProvidersAssociated(labID);
		this.getPrioritiesAssociated(labID);

		if (loadDefaults) {
			if (this.collectionList.SelectedAllAssociatedCollectionLocations) {
				this.collectionList.AssociatedCollectionLocations = this.locationsAssociated;
			}
			if (this.collectionList.SelectedAllAssociatedClients) {
				this.collectionList.AssociatedClients = this.clientsAssociated;
			}
			if (this.collectionList.SelectedAllAssociatedProviders) {
				this.collectionList.AssociatedProviders = this.providersAssociated;
			}
			if (this.collectionList.SelectedAllAssociatedPriorities) {
				this.collectionList.AssociatedPriorities = this.prioritiesAssociated;
			}
		}

		this.activeEntitiesService.getDefaultCollectionListForLab(labID).subscribe(response => {
			this.minimumRequiredID = response.json().DefaultCollectionList.MinimumPatientIdentifiersRequired;
			if (loadDefaults) {
				this.getDefaultCollectionList(response.json());
				this.collectionList.AssociatedCollectionLocations = [];
				this.collectionList.AssociatedClients = [];
				this.collectionList.AssociatedProviders = [];
				this.collectionList.AssociatedPriorities = [];
				if (this.minimumRequiredID === 0) {
					this.collectionList.PatientScanWristband = this.collectionList.PatientScanId = this.collectionList.PatientManualId = false;
					this.scanWristbandChange();
					this.idToggleChange();
				}
			}
		}, error => { this.utilsService.handle401(error); });
	}

	tabEvent() {
		this.wasTab = true;
	}

	blurCode() {
		if (this.wasTab === true) {
			const descriptionField: HTMLInputElement = document.querySelector('#descriptionField');
			descriptionField.focus();
			this.wasTab = false;
		}
	}

	updateDescription() {
		if (this.properties.manualDescriptionInput !== true) {
			this.collectionList.Description = this.collectionList.Code;
		}
	}

	checkDescriptionChange() {
		if (this.collectionList.Description !== this.collectionList.Code) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.collectionList.Description === '' || this.collectionList.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}

	getLocationsAssociated(labID) {
		this.activeEntitiesService.getActiveLocations().subscribe(response => {
			console.log('Active locations: ', response.json());
			console.log('Lab locations: ', response.json().filter(location => location.LabId === labID));
			this.locationsAssociated = response.json().filter(location => location.LabId === labID);
		}, error => {
			if (error.status === 401) {
				this.utilsService.handle401(error);
			} else {
				this.utilsService.showError(`Error: ${error}`);
			}
		});
	}

	getClientsAssociated(labID) {
		this.activeEntitiesService.getActiveClients().subscribe(response => {
			console.log('Active clients: ', response.json());
			this.clientsAssociated = response.json().filter(client => client.Laboratory.Id === labID);
		}, error => {
			if (error.status === 401) {
				this.utilsService.handle401(error);
			} else {
				this.utilsService.showError(`Error: ${error}`);
			}
		});
	}

	getProvidersAssociated(labID) {
		this.activeEntitiesService.getActiveProviders().subscribe(response => {
			console.log('Active providers: ', response.json());
			console.log('Lab providers: ', response.json().filter(provider => provider.Laboratory.Id === labID));
			this.providersAssociated = response.json().filter(provider => provider.Laboratory.Id === labID);
			console.log('all providers: ', this.providersAssociated);
		}, error => {
			if (error.status === 401) {
				this.utilsService.handle401(error);
			} else {
				this.utilsService.showError(`Error: ${error}`);
			}
		});
	}

	getPrioritiesAssociated(labID) {
		console.log('labId: ', labID);
		this.activeEntitiesService.getActivePriorities().subscribe(response => {
			this.prioritiesAssociated = response.json().filter(priority => priority.Laboratory.Id === labID);
			console.log('priorities associated: ', this.prioritiesAssociated);
		}, error => {
			if (error.status === 401) {
				this.utilsService.handle401(error);
			} else {
				this.utilsService.showError(`Error: ${error}`);
			}
		});
	}

	getLabs() {
		this.activeEntitiesService.getActiveLabs().subscribe(response => {
			this.labs = response.json();
			console.log('this.labs: ', this.labs);
			console.log('labs returned: ', this.labs);
		}, error => {
			if (error.status === 401) {
				this.utilsService.handle401(error);
			} else {
				this.utilsService.showError(`Error: ${error}`);
			}
		});
	}

	getHubs(labID) {
		this.activeEntitiesService.getActiveHubs().subscribe(response => {
			console.log('hubs ... ', response.json());
			let hubsToPush = [];
			response.json().forEach(hub => {
				if (hub.Laboratories.length > 0) {
					hub.Laboratories.forEach(lab => {
						if (labID === lab.Id) { hubsToPush.push(hub); }
					});
				}
			});
			this.hubs = hubsToPush;
		}, error => {
			if (error.status === 401) {
				this.utilsService.handle401(error);
			} else {
				this.utilsService.showError(`Error: ${error}`);
			}
		});
	}

	labChange() {
		this.getAssociated(this.collectionList.Laboratory.Id, true);
	}

	startSelect() {
		if (this.collectionList.CollectionPeriodStartSelect === ' ') {
			this.collectionList.CollectionPeriodStartDays = '';
			setTimeout(() => this.startTime.nativeElement.focus(), 0);
		} else {
			setTimeout(() => this.startDays.nativeElement.focus(), 0);
		}
		this.evaluateCollectionPeriod();
	}

	endSelect() {
		if (this.collectionList.CollectionPeriodEndSelect === ' ') {
			this.collectionList.CollectionPeriodEndDays = '';
			setTimeout(() => this.endTime.nativeElement.focus(), 0);
		} else {
			setTimeout(() => this.endDays.nativeElement.focus(), 0);
		}
		this.evaluateCollectionPeriod();
	}

	scanWristbandChange() {
		if (!this.collectionList.PatientScanWristband) {
			this.collectionList.PatientWristbandCount = '';
			this.collectionList.PatientWristband1 = '';
			this.collectionList.PatientWristbandBarcodeSegment1 = '';
			this.collectionList.PatientWristband2 = '';
			this.collectionList.PatientWristbandBarcodeSegment2 = '';
			this.collectionList.PatientWristbandBarcodeDelimiter = '';
		}
	}

	idToggleChange() {
		if (!this.collectionList.PatientManualId) {
			this.collectionList.PatientIdDocCount = '';
			this.collectionList.PatientIdDoc1 = '';
			this.collectionList.PatientIdDoc2 = '';
		}
	}

	wristbandsChange() {
		if (this.collectionList.PatientWristbandCount === '1') {
			this.collectionList.PatientWristband2 = '';
			this.collectionList.PatientWristbandBarcodeSegment2 = '';
		}
		this.wristbandSelect2.value = '';
	}

	documentationChange() {
		if (this.collectionList.PatientIdDocCount === '1') {
			this.collectionList.PatientIdDoc2 = '';
		}
		this.documentationSelect2.value = '';
	}

	changeCommunicationLabel() {
		if (!this.collectionList.CanGenerateCommunicationLabel) {
			this.collectionList.LabelNumberDefault = '';
			this.collectionList.LabelNumberMaximum = '';
		}
	}

	validateCommLabels() {
		if (this.collectionList.LabelNumberMaximum !== '' && this.collectionList.LabelNumberDefault !== '') {
			if (parseInt(this.collectionList.LabelNumberMaximum, 10) < parseInt(this.collectionList.LabelNumberDefault, 10)) {
				this.collectionList.LabelNumberMaximum = this.collectionList.LabelNumberDefault;
			}
		}
	}

	loadCollectionListForValidation() {
		this.collectionListService.loadCollectionList(this.collectionList,
			[{ id: 'startTee', control: this.startTeeForm },
			{ id: 'endTee', control: this.endTeeForm },
			{ id: 'startDays', control: this.startDaysForm },
			{ id: 'endDays', control: this.endDaysForm },
			{ id: 'startTime', control: this.startTimeForm },
			{ id: 'endTime', control: this.endTimeForm }]);
	}

	addCollectionList() {
		this.headerText = this.translation.translate('Label.Add collection list');
		this.properties.rowID = '';
		this.show();
		this.clearFields();
		this.loadCollectionListForValidation();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
	}

	editCollectionList(id: string) {
		this.headerText = this.translation.translate('Label.Edit collection list');
		this.properties.rowID = id;
		if (this.utilsService.checkOnlineStatus()) {
			this.collectionListService.getCollectionList(id).subscribe(response => {
				const tempCL = response.json();
				console.log('response for edit collection list: ', response.json());
				this.interpretEndTime(tempCL);
				console.log(tempCL);
				this.collectionList = tempCL;
				this.loadCollectionListForValidation();
				if (this.collectionList.IsActive === false) { this.wasInactive = true; }
				this.getHubs(response.json().Laboratory.Id);
				this.getAssociated(response.json().Laboratory.Id, false);
				this.resetPristine();
				console.log('this.collectionList: ', this.collectionList);
				this.utilsService.disabledSelect([], false, false);
				this.getCollectionUsers(id);
				this.show();
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
		}
	}

	getCollectionUsers(id) {
		this.collectionListService.getCollectionListUsers(id).subscribe(res => {
			if (res.json().length > 0) {
				this.isAssociated = true;
			}
		});
	}

	show() {
		if (this.utilsService.checkOnlineStatus()) {
			this.getLabs();
			// this.getHubs();
			this.properties.isDrawerOpen = true;
			this.properties.hideOverlay = false;
			this.properties.showOverlay = true;
			this.goToTop();
		}
	}

	interpretEndTime(cl) {
		if (cl.CollectionPeriodEndTime === 'Now') {
			this.nowChecked = true;
			cl.CollectionPeriodEndTime = '';
		} else {
			this.nowChecked = false;
		}
	}

	changeNow(event) {
		this.nowChecked = !this.nowChecked;
		if (this.nowChecked) {
			this.endTimeForm.reset();
			this.collectionList.CollectionPeriodEndTime = '';
		}
	}

	interpretNow(cl) {
		if (this.nowChecked) {
			cl.CollectionPeriodEndTime = 'Now';
		}
	}

	focusEndTime() {
		this.nowChecked = false;
	}

	goToTop() {
		document.querySelector('rmp-collection-list-add .drawer-content').scrollTop = 0;
	}

	trimFields() {
		Object.keys(this.collectionList).forEach(key => {
			if (key !== 'IsActive' && key !== 'ReservationIsSuperseded' && key !== 'AssociatedCollectionLocations' && key !== 'AssociatedClients' && key !== 'AssociatedProviders' && key !== 'AssociatedPriorities' && key !== 'DisplayClient' && key !== 'DisplayClientAddressAndPhone' && key !== 'DisplayCollectionLocation' && key !== 'DisplayPatientAddressAndPhone' && key !== 'DisplayPatientRoomBed' && key !== 'PatientScanWristband' && key !== 'PatientScanId' && key !== 'PatientManualId' && key !== 'CanCancelOrder' && key !== 'CanRescheduleOrder' && key !== 'CanTransferToProblemList' && key !== 'CanIdentifyCollectionSite' && key !== 'CanAddCollectionNote' && key !== 'CanWorkloadCodeEntry' && key !== 'CanEnableGPSSupport' && key !== 'CanTriggerExceptionReport' && key !== 'CanGenerateCommunicationLabel' && key !== 'CanUpdateCentralLineStatus' && key !== 'RequiredFormABN' && key !== 'RequiredFormFinancialResponsibility' && key !== 'RequiredFormRequisition' && key !== 'Hub' && key !== 'Laboratory' && key !== 'CollectionPeriodStartSelect' && key !== 'CollectionPeriodEndSelect' && key !== 'LabelNumberDefault' && key !== 'PatientWristbandCount' && key !== 'LabelNumberMaximum') {
				if (typeof this.collectionList[key] === 'string') {
					this.collectionList[key] = this.collectionList[key].trim();
				}
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.collectionList)) {
			const dialogRef = this.errorAlert.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (document.body.querySelector('.add-overlay')) {
					document.body.removeChild(document.body.querySelector('.add-overlay'));
				}
				if (result) {
					this.checkForm(false);
				} else { this.utilsService.closeDrawer(this.properties); }

			});
		} else {
			if (this.drawerOverlayOpen === 1) {
				this.drawerOverlayOpen = 0;
				this.errorAlert.closeAll();
				this.utilsService.closeDrawer(this.properties);
			} else {
				if (this.checkRequiredIDs() === true) {
					this.utilsService.closeDrawer(this.properties);
				} else {
					setTimeout(() => {
						if (document.body.querySelector('.cdk-overlay-container')) {
							document.body.querySelector('.cdk-overlay-container').removeChild(document.body.querySelector('.unsavedOverlay'));
						}
					}, 0);
					this.drawerOverlayOpen = 1;
				}
			}
		}
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.collectionList);
	}

	fullClose(save) {
		if (save) {
			this.save(false);
		} else {
			this.utilsService.closeDrawer(this.properties);
		}
	}

	save(addAnother) {
		console.log('clicked the save button');
		this.trimFields();
		if (this.utilsService.checkOnlineStatus()) {
			this.addAnother = addAnother;
			const tempCL = JSON.parse(JSON.stringify(this.collectionList));
			this.interpretNow(tempCL);
			if (this.properties.rowID === '') {
				this.collectionListService.createCollectionList(JSON.stringify(tempCL)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else if (error.status === 409) {
						this.collectionListService.collectionExists = true; this.goToTop(); this.saveForm();
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.collectionListService.updateCollectionList(this.properties.rowID, JSON.stringify(tempCL)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`error adding collection list: ${error}`);
					}
				});
			}
		}
	}

	saveOnComplete(response) {
		if (response.status === 200) {
			this.clearFields();
			if (this.addAnother) {
				this.onSave.emit(true);
				this.utilsService.openSnackBar(`${this.translation.translate('Label.Collection list added')}`);
			}
			if (!this.addAnother) {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Collection list added')}`);
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Collection list saved')}`);
				}
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('Label.Collection List')} ${this.collectionList.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	clearFields() {
		this.utilsService.removeListeners([], false);
		this.resetAdd();
		this.minimumRequiredID = 0;
		this.collectionList = {
			Code: '',
			Description: '',
			Note: '',
			Hub: {
				Id: ''
			},
			Laboratory: {
				Id: ''
			},
			IsActive: true,
			RefreshTimeAutomatic: '',
			RefreshTimeManual: '',
			CleanCollectionListTimer: '',
			CollectionPeriodStartSelect: '',
			CollectionPeriodStartDays: '',
			CollectionPeriodStartTime: '',
			CollectionPeriodEndSelect: '',
			CollectionPeriodEndDays: '',
			CollectionPeriodEndTime: '',
			ReservationExpireTime: '',
			ReservationIsSuperseded: true,
			CollectStaff: '',
			AssociatedCollectionLocations: [],
			AssociatedClients: [],
			AssociatedProviders: [],
			AssociatedPriorities: [],
			SelectedAllAssociatedCollectionLocations: true,
			SelectedAllAssociatedClients: true,
			SelectedAllAssociatedProviders: true,
			SelectedAllAssociatedPriorities: true,
			DisplayClient: false,
			DisplayClientAddressAndPhone: false,
			DisplayCollectionLocation: false,
			DisplayHomeDrawAddress: false,
			DisplayPatientAddressAndPhone: false,
			DisplayPatientRoomBed: false,
			PatientIdentifier: '',
			PatientScanWristband: true,
			PatientWristbandCount: '',
			PatientWristband1: '',
			PatientWristbandBarcodeSegment1: '',
			PatientWristband2: '',
			PatientWristbandBarcodeSegment2: '',
			PatientWristbandBarcodeDelimiter: '',
			PatientIdDocCount: '',
			PatientIdDoc1: '',
			PatientIdDoc2: '',
			PatientScanId: true,
			PatientManualId: true,
			CanCancelOrder: true,
			CanRescheduleOrder: true,
			CanTransferToProblemList: true,
			CanIdentifyCollectionSite: true,
			CanAddCollectionNote: true,
			CanWorkloadCodeEntry: false,
			CanEnableGPSSupport: false,
			CanTriggerExceptionReport: false,
			CanGenerateCommunicationLabel: false,
			CanGroupByLocation: true,
			LabelNumberDefault: '',
			LabelNumberMaximum: '',
			CanUpdateCentralLineStatus: false,
			CentralLineDuration: '',
			RequiredFormABN: false,
			RequiredFormFinancialResponsibility: false,
			RequiredFormRequisition: false
		};
		this.locationsAssociated = [];
		this.clientsAssociated = [];
		this.providersAssociated = [];
		this.prioritiesAssociated = [];
		this.isAssociated = false;
		this.resetPristine();
	}

	processLocationSelect(newLocationData) {
		console.log('newLocationData: ', newLocationData);
		if (newLocationData.length) {
			this.collectionList.AssociatedCollectionLocations = newLocationData;
			this.collectionList.SelectedAllAssociatedCollectionLocations = false;
			this.collectionListLocations.selectedInput = this.collectionList.AssociatedCollectionLocations;
		} else {
			this.collectionList.AssociatedCollectionLocations = this.locationsAssociated;
			this.collectionList.SelectedAllAssociatedCollectionLocations = true;
			this.collectionListLocations.selectedInput = [];
		}
		console.log('associated locations now: ', this.collectionList.AssociatedCollectionLocations);
	}

	processClientSelect(newClientData) {
		if (newClientData.length) {
			this.collectionList.AssociatedClients = newClientData;
			this.collectionList.SelectedAllAssociatedClients = false;
			this.collectionListClients.selectedInput = this.collectionList.AssociatedClients;
		} else {
			this.collectionList.AssociatedClients = this.clientsAssociated;
			this.collectionList.SelectedAllAssociatedClients = true;
			this.collectionListClients.selectedInput = [];
		}
	}

	processProviderSelect(newProviderData) {
		console.log(newProviderData);
		if (newProviderData.length) {
			this.collectionList.AssociatedProviders = newProviderData;
			this.collectionList.SelectedAllAssociatedProviders = false;
			this.collectionListProviders.selectedInput = this.collectionList.AssociatedProviders;
		} else {
			this.collectionList.AssociatedProviders = this.providersAssociated;
			this.collectionList.SelectedAllAssociatedProviders = true;
			this.collectionListProviders.selectedInput = [];
		}
	}

	processPrioritySelect(newPriorityData) {
		const rebundledPriorities = [];
		newPriorityData.forEach(priority => {
			rebundledPriorities.push({
				Code: priority.Code,
				Id: priority.Id,
				Description: priority.Description,
				Priority: priority.Priority
			});
		});
		if (rebundledPriorities.length) {
			this.collectionList.AssociatedPriorities = rebundledPriorities;
			this.collectionList.SelectedAllAssociatedPriorities = false;
			this.collectionListPriorities.selectedInput = this.collectionList.AssociatedPriorities;
		} else {
			this.collectionList.AssociatedPriorities = this.providersAssociated;
			this.collectionList.SelectedAllAssociatedPriorities = true;
			this.collectionListPriorities.selectedInput = [];
		}
	}

	processHubSelect(newHubData) {
		this.collectionList.AssociatedHubs = newHubData;
		this.collectionListHubs.hubsInput = newHubData;
	}

	removeLocation(row) {
		this.collectionList.AssociatedCollectionLocations.splice(this.collectionList.AssociatedCollectionLocations.indexOf(row), 1);
		if (!this.collectionList.AssociatedCollectionLocations.length) {
			this.collectionList.SelectedAllAssociatedCollectionLocations = true;
			this.collectionList.AssociatedCollectionLocations = this.locationsAssociated;
		}
	}

	removeClient(row) {
		this.collectionList.AssociatedClients.splice(this.collectionList.AssociatedClients.indexOf(row), 1);
		if (!this.collectionList.AssociatedClients.length) {
			this.collectionList.SelectedAllAssociatedClients = true;
			this.collectionList.AssociatedClients = this.clientsAssociated;
		}
	}

	removeProvider(row) {
		this.collectionList.AssociatedProviders.splice(this.collectionList.AssociatedProviders.indexOf(row), 1);
		if (!this.collectionList.AssociatedProviders.length) {
			this.collectionList.SelectedAllAssociatedProviders = true;
			this.collectionList.AssociatedProviders = this.providersAssociated;
		}
	}

	removePriority(row) {
		this.collectionList.AssociatedPriorities.splice(this.collectionList.AssociatedPriorities.indexOf(row), 1);
		if (!this.collectionList.AssociatedPriorities.length) {
			this.collectionList.SelectedAllAssociatedPriorities = true;
			this.collectionList.AssociatedPriorities = this.prioritiesAssociated;
		}
	}

	removeHub(row) {
		this.collectionList.AssociatedHubs.splice(this.collectionList.AssociatedHubs.indexOf(row), 1);
	}

	getDefaultCollectionList(lab) {
		const labList = lab.DefaultCollectionList;
		this.collectionList.CanCancelOrder = labList.CanCancelOrder;
		this.collectionList.CanGenerateCommunicationLabel = labList.CanGenerateCommunicationLabel;
		this.collectionList.CanIdentifyCollectionSite = labList.CanIdentifyCollectionSite;
		this.collectionList.CanRescheduleOrder = labList.CanRescheduleOrder;
		this.collectionList.CanTriggerExceptionReport = labList.CanTriggerExceptionReport;
		this.collectionList.CanWorkloadCodeEntry = labList.CanWorkloadCodeEntry;
		this.collectionList.CanGenerateCommunicationLabel = labList.CanGenerateCommunicationLabel;
		this.collectionList.LabelNumberDefault = labList.LabelNumberDefault;
		this.collectionList.LabelNumberMaximum = labList.LabelNumberMaximum;
	}

	startDaysDisabled() {
		return (this.collectionList.CollectionPeriodStartSelect === ' ' || this.collectionList.CollectionPeriodStartSelect === '');
	}

	endDaysDisabled() {
		return (this.collectionList.CollectionPeriodEndSelect === ' ' || this.collectionList.CollectionPeriodEndSelect === '');
	}

	evaluateCollectionPeriod() {
		this.collectionListService.refreshCollectionPeriodValid();
	}

	changeHomeDraw() {
		if (this.collectionList.DisplayHomeDrawAddress === true) {
			this.collectionList.DisplayCollectionLocation = false;
		}
	}

	changeInstitutionAddress() {
		if (this.collectionList.DisplayCollectionLocation === true) {
			this.collectionList.DisplayHomeDrawAddress = false;
		}
	}

	teeDisabled(which, option) {
		const startDays = this.collectionList.CollectionPeriodStartDays;
		const startTime = this.collectionList.CollectionPeriodStartTime;
		const endDays = this.collectionList.CollectionPeriodEndDays;
		const endTime = this.collectionList.CollectionPeriodEndTime;
		if (which === 'start') {
			const endTee = this.collectionList.CollectionPeriodEndSelect;
			if (endTee === ' ') { // Only disabled when StartTime > EndTime on ' ' or if start days positive
				if (option === '-' || (option === ' ' && (startTime < endTime))) {
					return false;
				} else if (option === '+' || (option === ' ' && (startTime > endTime))) {
					return true;
				}
			} else if (endTee === '+') {
				if (option === ' ' || option === '-') {
					return false;
				} else if (option === '+') {
					if (startDays > endDays) {
						return true;
					} else if (startDays === endDays) {
						if (startTime > endTime) {
							return true;
						} else {
							return false;
						}
					} else if (startDays < endDays) {
						return false;
					}
				}
			} else if (endTee === '-') {
				if (option === ' ' || option === '+') {
					return true;
				} else if (option === '-') {
					return false;
				}
			}
		} else if (which === 'end') {
			const startTee = this.collectionList.CollectionPeriodStartSelect;
			if (startTee === ' ') {
				if ((option === ' ' && (endTime > startTime)) || option === '+') {
					return false;
				} else if ((option === ' ' && (endTime < startTime)) || option === '-') {
					return true;
				}
			} else if (startTee === '+') {
				if (option === '+' && endDays === '') {
					return false;
				} else if (option === ' ' || option === '-' || (option === '+' && endDays < startDays) || (option === '+' && endDays === startDays && endTime < startTime)) {
					return true;
				} else if ((option === '+' && endDays > startDays) || (option === '+' && endDays === startDays && endTime > startTime)) {
					return false;
				}
			} else if (startTee === '-') {
				if ((option === '-' && (endDays > startDays)) || (option === '-' && (endDays === startDays) && (startTime > endTime))) {
					return true;
				} else if (option === ' ' || option === '+' || (option === '-' && endDays < startDays)) {
					return false;
				}
			}
		}
	}
}
