import { Component, EventEmitter, Output, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { LabService } from '../services/lab.service';
import { PhonePipe } from '../phone.pipe';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';
import { CollectionListService } from '../services/collection-list.service';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { LabelService } from '../services/label.service';
import { resolveRendererType2 } from '@angular/core/src/view/util';
import { TestService } from '../services/test.service';

@Component({
	selector: 'app-lab-add',
	templateUrl: './lab-add.component.html',
	styleUrls: ['./lab-add.component.css']
})

export class LabAddComponent implements AfterViewInit, OnInit {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();

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
	lab: any = {
		Code: '',
		Email: '',
		IsActive: true,
		Description: '',
		Phone: '',
		Label: '',
		Location: {
			StreetAddress1: '',
			StreetAddress2: '',
			City: '',
			Country: 'USA',
			County: '',
			PostalCode: '',
			State: ''
		},
		DefaultCollectionList: {
			CanCancelOrder: true,
			CanRescheduleOrder: true,
			CanIdentifyCollectionSite: true,
			CanTriggerExceptionReport: false,
			CanWorkloadCodeEntry: false,
			CanGenerateCommunicationLabel: false,
			LabelNumberDefault: '',
			LabelNumberMaximum: '',
			MinimumPatientIdentifiersRequired: null
		}
	};
	wasInactive = false;
	isAssociated = false;
	objectForm = [];
	four = [0, 1, 2, 3, 4];
	@ViewChild('code') code: NgModel;
	@ViewChild('phone') phone: NgModel;
	@ViewChild('email') email: NgModel;
	@ViewChild('streetAddress1') streetAddress1: NgModel;
	@ViewChild('city') city: NgModel;
	@ViewChild('state') state: NgModel;
	@ViewChild('postalCode') postalCode: NgModel;
	@ViewChild('labelNumberDefault') labelNumberDefault: NgModel;
	@ViewChild('minimumPatientID') minimumPatientID: NgModel;

	constructor(private testService: TestService, private labelService: LabelService, private activeEntitiesService: ActiveEntitiesService, private collectionService: CollectionListService, public utilsService: UtilsService, private labService: LabService, private unsavedChangesAlert: MatDialog, private phonePipe: PhonePipe, public translation: TranslationService) { }

	ngOnInit(): void {
	}

	ngAfterViewInit() {
		this.objectForm.push(this.code);
		this.objectForm.push(this.email);
		this.objectForm.push(this.labelNumberDefault);
		this.objectForm.push(this.minimumPatientID);
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	saveForm() {
		let formValid = true;
		this.objectForm.forEach(c => {
			if (!c.disabled) {
				c.control.markAsDirty();
				c.control.markAsTouched();
				c.control.updateValueAndValidity();
				if (!c.valid) {
					formValid = false;
				}
			}
		});
		return formValid;
	}

	addLab() {
		this.headerText = this.translation.translate('Label.Add lab');
		this.clearFields();
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
		this.utilsService.disabledSelect([document.querySelector('#countryField')], true, true);
	}

	editLab(id: string) {
		this.headerText = this.translation.translate('Label.Edit lab');
		this.properties.rowID = id;
		if (this.utilsService.checkOnlineStatus()) {
			this.labService.getLab(id).subscribe(response => {
				this.lab = response.json();
				console.log('lab to edit: ', response.json());
				this.utilsService.disabledSelect([document.querySelector('#firstFormField'), document.querySelector('#countryField')], true, true);
				if (this.lab.IsAssociated === true) { this.isAssociated = true; }
				// this.checkAssociation();
				this.resetPristine();
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
			this.show();
		}
	}

	show() {
		this.properties.isDrawerOpen = true;
		this.properties.hideOverlay = false;
		this.properties.showOverlay = true;
		this.goToTop();
	}

	goToTop() {
		document.querySelector('app-lab-add .drawer-content').scrollTop = 0;
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
			this.lab.Description = this.lab.Code;
		}
	}

	checkDescriptionChange() {
		if (this.lab.Description !== this.lab.Code) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.lab.Description === '' || this.lab.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}

	trimFields() {
		Object.keys(this.lab).forEach(key => {
			if (key !== 'IsActive' && key !== 'LabelColumnPairs' && key !== 'DefaultCollectionList' && key !== 'IsAssociated') {
				if (key === 'Location') {
					Object.keys(this.lab[key]).forEach(k => {
						this.lab[key][k] = this.lab[key][k].trim();
					});
				} else {
					console.log('key: ', key);
					this.lab[key] = this.lab[key].trim();
				}
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.lab)) {
			const dialogRef = this.unsavedChangesAlert.open(UnsavedChangesDialogComponent, {
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
			this.utilsService.closeDrawer(this.properties);
		}
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.lab);
	}

	states() {
		return this.utilsService.states;
	}

	counties() {
		if (this.lab.Location.State === '') {
			return [];
		} else {
			return this.utilsService.counties[this.lab.Location.State];
		}
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			this.addAnother = addAnother;
			if (this.properties.rowID === '') {
				console.log('lab is', this.lab);
				this.labService.createLab(JSON.stringify(this.lab)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.labService.updateLab(this.properties.rowID, JSON.stringify(this.lab)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
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
				this.utilsService.openSnackBar(`${this.translation.translate('Label.Lab added')}`);
			}
			if (!this.addAnother) {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Lab added')}`);
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Lab saved')}`);
				}
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Lab')} ${this.lab.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	checkDeactivate(addAnother) { // if not a new entry and the record was not inactive
		if (this.wasInactive === false && this.lab.IsActive === false && this.properties.rowID !== '') { // check if theres anything associated
			if (this.isAssociated === true) { // if so allow user to know
				const dialogRef = this.unsavedChangesAlert.open(DeactivateRecordPopupComponent, {
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
						this.lab.IsActive = true;
						if (this.pristineObject !== JSON.stringify(this.lab)) {
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
			this.save(addAnother);
		}
	}

	checkForm(addAnother) { // check all fields are complete
		if (this.saveForm()) {
			this.checkDeactivate(addAnother);
		} else {
			this.goToTop();
		}
	}

	clearFields() {
		this.utilsService.removeListeners([document.querySelector('#firstFormField'), document.querySelector('#countryField')], true);
		this.resetAdd();
		this.lab = {
			Code: '',
			Email: '',
			IsActive: true,
			Description: '',
			Phone: '',
			Label: '',
			Location: {
				StreetAddress1: '',
				StreetAddress2: '',
				City: '',
				Country: 'USA',
				County: '',
				PostalCode: '',
				State: ''
			},
			DefaultCollectionList: {
				CanCancelOrder: true,
				CanRescheduleOrder: true,
				CanIdentifyCollectionSite: true,
				CanTriggerExceptionReport: false,
				CanWorkloadCodeEntry: false,
				CanGenerateCommunicationLabel: false,
				LabelNumberDefault: '',
				LabelNumberMaximum: '',
				MinimumPatientIdentifiersRequired: null
			}
		};
		this.isAssociated = false;
		this.wasInactive = false;
		this.resetPristine();
	}

	blur() {
		this.lab.Phone = this.phonePipe.transform(this.lab.Phone);
	}

	changeCommunicationLabel() {
		if (!this.lab.DefaultCollectionList.CanGenerateCommunicationLabel) {
			this.lab.DefaultCollectionList.LabelNumberDefault = '';
			this.lab.DefaultCollectionList.LabelNumberMaximum = '';
		}
	}

	validateCommLabels() {
		if (this.lab.DefaultCollectionList.LabelNumberMaximum !== '' && this.lab.DefaultCollectionList.LabelNumberDefault !== '') {
			if (parseInt(this.lab.DefaultCollectionList.LabelNumberMaximum, 10) < parseInt(this.lab.DefaultCollectionList.LabelNumberDefault, 10)) {
				this.lab.DefaultCollectionList.LabelNumberMaximum = this.lab.DefaultCollectionList.LabelNumberDefault;
			}
		}
	}
}
