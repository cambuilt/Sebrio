import { Component, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { ClientService } from '../services/client.service';
import { PhonePipe } from '../phone.pipe';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';
import { CollectionListService } from '../services/collection-list.service';
import { ActiveEntitiesService } from '../services/active-entities.service';

@Component({
	selector: 'app-client-add',
	templateUrl: './client-add.component.html',
	styleUrls: ['./client-add.component.css']
})

export class ClientAddComponent implements AfterViewInit {
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
	isAssociated = false;
	wasInactive = false;
	addEnabled = true;
	wasTab = false;
	addAnother: boolean;
	headerText: string;
	labs = [];
	wasActive = false;
	pristineObject: any;
	client: any = {
		Code: '',
		Email: '',
		IsActive: true,
		Name: '',
		Phone: '',
		Fax: '',
		Comments: '',
		Specialties: '',
		ContactPerson1: '',
		ContactPerson2: '',
		Location: {
			StreetAddress1: '',
			StreetAddress2: '',
			City: '',
			Country: 'USA',
			County: '',
			PostalCode: '',
			State: ''
		},
		// Laboratories: []
		Laboratory: {
			Id: ''
		}
	};

	labOptions = [];
	objectForm = [];
	@ViewChild('lab') lab: NgModel;
	@ViewChild('code') code: NgModel;
	@ViewChild('name') name: NgModel;

	constructor(private activeEntitiesService: ActiveEntitiesService, private collectionService: CollectionListService, public utilsService: UtilsService, private clientService: ClientService, private errorAlert: MatDialog, private phonePipe: PhonePipe, public translation: TranslationService) {
		this.getLabs();
	}

	ngAfterViewInit() {
		this.objectForm.push(this.lab);
		this.objectForm.push(this.code);
		this.objectForm.push(this.name);
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

	checkDeactivate(addAnother) { // if not a new entry and the record was not inactive
		if (this.wasInactive === false && this.client.IsActive === false && this.properties.rowID !== '') { // check if theres anything associated
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
						this.client.IsActive = 1;
						if (this.pristineObject !== JSON.stringify(this.client)) {
							this.save(addAnother);
						} else {
							this.utilsService.closeDrawer(this.properties);
							return;
						}
					}
				});
			} else { // there was no association found so deactivate and save
				console.log('checkAssociation returned false');
				this.save(addAnother);
			}
		} else { // they were not deactivating the record so save like normal
			this.save(addAnother);
		}
	}

	getLabs() {
		if (this.utilsService.checkOnlineStatus()) {
			this.labOptions = [];
			this.activeEntitiesService.getActiveLabs().subscribe(response => {
				console.log('labs: ', response.json());
				response.json().forEach(lab => {
					this.labOptions.push(lab);
				});
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
		}
	}


	checkForm(addAnother) { // check all fields are complete
		if (this.saveForm()) {
			this.checkDeactivate(addAnother);
		} else {
			this.goToTop();
		}
	}

	checkAssociation() {
		this.isAssociated = false;
		if (this.utilsService.checkOnlineStatus()) {
			this.collectionService.getCollectionLists().subscribe(response => {
				response.json().forEach(c => {
					if (c.IsActive == true) {
						this.collectionService.getCollectionList(c.Code).subscribe(res => {
							const list = res.json();
							if (list.AssociatedClients.length > 0) {
								list.AssociatedClients.forEach(client => {
									if (client.Id === this.client.Code) { this.isAssociated = true; return; }
								});
							}
						});
					}
				});
			});
		}
	}

	addClient() {
		this.headerText = this.translation.translate('Label.Add client');
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
		this.utilsService.disabledSelect([document.querySelector('#countryField')], true, true);
	}

	editClient(id: string) {
		this.headerText = this.translation.translate('Label.Edit client');
		this.properties.rowID = id;
		if (this.utilsService.checkOnlineStatus()) {
			this.clientService.getClient(id).subscribe(response => {
				this.client = response.json();
				this.checkAssociation();
				if (this.client.IsActive === false) { this.wasInactive = true; }
				this.resetPristine();
				this.utilsService.disabledSelect([document.querySelector('#firstFormField'), document.querySelector('#countryField')], true, true);
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
			this.client.Name = this.client.Code;
		}
	}

	checkDescriptionChange() {
		if (this.client.Code !== this.client.Name) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.client.Description === '' || this.client.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}

	show() {
		this.properties.isDrawerOpen = true;
		this.properties.hideOverlay = false;
		this.properties.showOverlay = true;
		this.clearFields();
		this.goToTop();
	}

	goToTop() {
		document.querySelector('app-client-add .drawer-content').scrollTop = 0;
	}

	trimFields() {
		Object.keys(this.client).forEach(key => {
			if (key !== 'IsActive' && key !== 'Laboratory') {
				if (key === 'Location') {
					Object.keys(this.client[key]).forEach(k => {
						this.client[key][k] = this.client[key][k].trim();
					});
				} else {
					if (this.client[key] !== null) {
						this.client[key] = this.client[key].trim();
					}
				}
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.client)) {
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
			this.utilsService.closeDrawer(this.properties);
		}
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.client);
	}

	states() {
		return this.utilsService.states;
	}

	counties() {
		if (this.client.Location.State === '') {
			return [];
		} else {
			return this.utilsService.counties[this.client.Location.State];
		}
	}

	resetExists() {
		this.clientService.clientExists = false;
	}

	save(addAnother) {
		this.trimFields();
		if (this.utilsService.checkOnlineStatus()) {
			this.addAnother = addAnother;
			if (this.properties.rowID === '') {
				this.clientService.createClient(JSON.stringify(this.client)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else if (error.status === 409) {
						this.clientService.clientExists = true; this.goToTop(); this.saveForm();
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.clientService.updateClient(this.properties.rowID, JSON.stringify(this.client)).subscribe(response => { this.saveOnComplete(response); }, error => {
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
				this.utilsService.openSnackBar(`${this.translation.translate('Label.Client added')}`);
			}
			if (!this.addAnother) {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Client added')}`);
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Client saved')}`);
				}
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Client')} ${this.client.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	removeLab(lab) {
		this.client.Laboratories.splice(this.client.Laboratories.indexOf(lab), 1);
		this.checkAssociation();
	}

	clearFields() {
		this.utilsService.removeListeners([document.querySelector('#firstFormField'), document.querySelector('#countryField')], true);
		this.resetAdd();
		this.client = {
			Code: '',
			Email: '',
			IsActive: true,
			Name: '',
			Phone: '',
			Fax: '',
			Comments: '',
			Specialties: '',
			ContactPerson1: '',
			ContactPerson2: '',
			Location: {
				StreetAddress1: '',
				StreetAddress2: '',
				City: '',
				Country: 'USA',
				County: '',
				PostalCode: '',
				State: ''
			},
			// Laboratories: []
			Laboratory: {
				Id: ''
			}
		};
		this.wasInactive = false;
		this.labs = [];
		this.resetPristine();
	}

	blur(fieldName: string) {
		if (fieldName === 'phone') {
			this.client.Phone = this.phonePipe.transform(this.client.Phone);
		}
		if (fieldName === 'fax') {
			this.client.Fax = this.phonePipe.transform(this.client.Fax);
		}
	}

	processLabSelect(newLabData: any) {
		this.client.Laboratories = newLabData;
		this.checkAssociation();
	}

	fullClose(save) {
		if (save) {
			this.save(false);
		} else {
			this.utilsService.closeDrawer(this.properties);
		}
	}

}
