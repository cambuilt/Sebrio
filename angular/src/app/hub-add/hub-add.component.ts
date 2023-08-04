import { Component, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { ImageUploadService, } from '../services/image-upload.service';
import { HubService } from '../services/hub.service';
import { PhonePipe } from '../phone.pipe';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';
import { CollectionListService } from '../services/collection-list.service';
import { LabSelectorComponent } from '../lab-selector/lab-selector.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-hub-add',
	templateUrl: './hub-add.component.html',
	styleUrls: ['./hub-add.component.css']
})
export class HubAddComponent implements AfterViewInit {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	@ViewChild('hubUser') hubUser: UserSelectorComponent;
	@ViewChild('addLab') addLab: LabSelectorComponent;

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
	statesArray = [];
	pristineObject: any;
	wasTab = false;
	wasInactive = false;
	isAssociated = false;
	hub: any = {
		Name: '',
		Description: '',
		StreetAddress1: '',
		StreetAddress2: '',
		City: '',
		State: '',
		County: '',
		Country: 'USA',
		PostalCode: '',
		Phone: '',
		IsActive: true,
		Users: [{
			FirstName: '',
			LastName: '',
			Username: '',
			Email: '',
			AvatarURL: ''
		}],
		Laboratories: []
	};
	errorLabs = [];
	objectForm = [];
	labErrorMessage: any;
	@ViewChild('name') name: NgModel;
	@ViewChild('streetAddress1') streetAddress1: NgModel;
	@ViewChild('city') city: NgModel;
	@ViewChild('state') state: NgModel;
	@ViewChild('postalCode') postalCode: NgModel;
	@ViewChild('phone') phone: NgModel;

	constructor(private collectionService: CollectionListService, private phonePipe: PhonePipe, public utilsService: UtilsService, private hubService: HubService, private imageUploadService: ImageUploadService, private unsavedChangesAlert: MatDialog, public translation: TranslationService) {
	}

	ngAfterViewInit() {
		this.objectForm.push(this.name);
		this.objectForm.push(this.phone);
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
		if (this.wasInactive === false && this.hub.IsActive === false && this.properties.rowID !== '') { // check if theres anything associated
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
						this.hub.IsActive = 1;
						if (this.pristineObject !== JSON.stringify(this.getSimplePristine(this.hub))) {
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

	checkAssociation() {
		this.isAssociated = false;
		if (this.utilsService.checkOnlineStatus()) {
			this.collectionService.getCollectionLists().subscribe(response => {
				const collections = response.json();
				collections.forEach(c => {
					if (c.IsActive == true) {
						this.collectionService.getCollectionList(c.Id).subscribe(res => {
							const list = res.json();
							if (list.Hub.Id === this.hub.Name && list.IsActive == true) {
								this.isAssociated = true; return;
							}
						});
					}
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

	states() {
		return this.utilsService.states;
	}

	counties() {
		if (this.hub.State === '') {
			return [];
		} else {
			return this.utilsService.counties[this.hub.State];
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
			this.hub.Description = this.hub.Name;
		}
	}

	checkDescriptionChange() {
		if (this.hub.Description !== this.hub.Name) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.hub.Description === '' || this.hub.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}

	countries() {
		return this.utilsService.countries;
	}

	processUserSelect(newUserData: any) {
		this.hub.Users = newUserData;
		this.notifyUserSelector();
	}

	removeUser(user: any) {
		this.hub.Users.splice(this.hub.Users.indexOf(user), 1);
		this.notifyUserSelector();
	}

	notifyUserSelector() {
		this.hubUser.usersInput = this.hub.Users;
	}

	addHub() {
		this.headerText = this.translation.translate('Label.Add hub');
		this.clearFields();
		this.properties.rowID = '';
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
		this.utilsService.disabledSelect([document.querySelector('#countryField')], true, true);
	}

	editHub(id: string) {
		this.headerText = this.translation.translate('Label.Edit hub');
		this.properties.rowID = id;
		if (this.utilsService.checkOnlineStatus()) {
			this.hubService.getHub(id).subscribe(response => {
				this.hub = response.json();
				console.log('hub to edit: ', response.json());
				if (this.hub.IsActive === false) { this.wasInactive = true; }
				this.checkAssociation();
				this.resetPristine();
				this.utilsService.disabledSelect([document.querySelector('#firstFormField'), document.querySelector('#countryField')], true, true);
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

	show() {
		this.properties.isDrawerOpen = true;
		this.properties.hideOverlay = false;
		this.properties.showOverlay = true;
		this.goToTop();
	}

	goToTop() {
		document.querySelector('rmp-hub-add .drawer-content').scrollTop = 0;
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			if (this.saveForm()) {
				this.addAnother = addAnother;

				if (this.properties.rowID === '') {
					this.hubService.createHub(JSON.stringify(this.hub)).subscribe(response => { this.saveOnComplete(response); }, error => {
						if (error.status === 401) {
							this.utilsService.handle401(error);
						} else if (error.status === 409) {
							console.log('error was 409', error);
							this.setLabError();
							// this.goToTop();
						} else {
							this.utilsService.showError(`Error: ${error}`);
						}
					});
				} else {
					this.hubService.updateHub(this.properties.rowID, JSON.stringify(this.hub)).subscribe(response => { this.saveOnComplete(response); }, error => {
						if (error.status === 401) {
							this.utilsService.handle401(error);
						} else if (error.status === 409) {
							console.log('error was 409', error);
							this.setLabError();
							// this.goToTop();
						} else {
							this.utilsService.showError(`Error: ${error}`);
						}
					});
				}
			} else {
				this.goToTop();
			}
		}
	}

	setLabError() {
		console.log('hubs labs: ', this.hub.Laboratories);
		this.errorLabs = [];
		this.errorLabs.push(this.hub.Laboratories[Math.floor(Math.random() * this.hub.Laboratories.length)].Code);
		this.hub.Laboratories.forEach(lab => {
			let chance = Math.floor(Math.random() * 3) + 1;
			console.log('chance: ', chance);
			if (lab.Code !== this.hub.Laboratories[0].Code) {
				if (chance === 1) { this.errorLabs.push(lab.Code); }
				if (this.errorLabs.length == 1) {
					this.labErrorMessage = `Lab already associated with Hub.`;
				} else { this.labErrorMessage = `Multiple labs already associated with Hub.`; }
			}
		});
		console.log('errorLabs: ', this.errorLabs);
	}

	findLabError(lab) {
		let hasError = false;
		if (this.errorLabs.indexOf(lab) > -1) {
			hasError = true;
		}
		return hasError;
	}

	resetErrorLabs() {
		this.errorLabs = [];
	}

	fullClose(save) {
		if (save) {
			this.save(false);
		} else {
			this.utilsService.closeDrawer(this.properties);
		}
	}

	trimFields() {
		Object.keys(this.hub).forEach(key => {
			if (key !== 'IsActive' && key !== 'Users' && key !== 'Laboratories') {
				if (this.hub[key] !== '' && this.hub[key] !== null) {
					this.hub[key] = this.hub[key].trim();
				}
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.getSimplePristine(this.hub))) {
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

	getSimplePristine(obj) {
		const simpleObj = { ...obj };
		if (simpleObj.Users.length) {
			simpleObj.Users = simpleObj.Users.map(user => user.Username);
		}
		return simpleObj;
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.getSimplePristine(this.hub));
	}

	saveOnComplete(response) {
		if (response.status === 200) {
			this.clearFields();
			if (this.addAnother) {
				this.onSave.emit(true);
				this.utilsService.openSnackBar(`${this.translation.translate('Label.Hub added')}`);
				this.headerText = this.translation.translate('Label.Add hub');
			}
			if (!this.addAnother) {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Hub added')}`);
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Hub saved')}`);
				}
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Hub')} ${this.hub.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	clearFields() {
		this.utilsService.removeListeners([document.querySelector('#firstFormField'), document.querySelector('#countryField')], true);
		this.resetAdd();
		this.hub = {
			Name: '',
			Description: '',
			StreetAddress1: '',
			StreetAddress2: '',
			City: '',
			State: '',
			County: '',
			Country: 'USA',
			PostalCode: '',
			Phone: '',
			IsActive: true,
			Users: [],
			Laboratories: []
		};
		this.isAssociated = false;
		this.wasInactive = false;
		this.resetPristine();
		this.errorLabs = [];
	}

	blurPhone(fieldName: string) {
		this.hub[fieldName] = this.phonePipe.transform(this.hub[fieldName]);
	}

	removeLab(lab) {
		this.hub.Laboratories.splice(this.hub.Laboratories.indexOf(lab), 1);
		this.checkAssociation();
		if (this.errorLabs.indexOf(lab.Code) > -1) {
			this.errorLabs.splice(this.errorLabs.indexOf(lab.Code), 1);
			if (this.errorLabs.length < 2) {
				this.labErrorMessage = `Lab already associated with Hub.`;
			} else { this.labErrorMessage = `Multiple labs already associated with Hub.`; }
		}
	}

	processLabSelect(newLabData: any) {
		this.hub.Laboratories = newLabData;
		this.checkAssociation();
	}


}
