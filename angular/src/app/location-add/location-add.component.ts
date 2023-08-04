import { Component, EventEmitter, Output, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { LocationService } from '../services/location.service';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { PhonePipe } from '../phone.pipe';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';
import { CollectionListService } from '../services/collection-list.service';

@Component({
	selector: 'app-location-add',
	templateUrl: './location-add.component.html',
	styleUrls: ['./location-add.component.css']
})

export class LocationAddComponent implements AfterViewInit {
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
	wasTab = false;
	addAnother: boolean;
	headerText: string;
	labOptions = [];
	pristineObject: any;
	wasInactive = false;
	isAssociated = false;
	location: any = {
		Code: '',
		Description: '',
		Phone: '',
		LabId: '',
		IsActive: true,
		Location: {
			StreetAddress1: '',
			StreetAddress2: '',
			City: '',
			Country: 'USA',
			County: '',
			PostalCode: '',
			State: ''
		},
	};

	objectForm = [];
	@ViewChild('code') code: NgModel;
	@ViewChild('lab') lab: NgModel;
	@ViewChild('phone') phone: NgModel;

	constructor(private collectionService: CollectionListService, public utilsService: UtilsService, private activeEntitiesService: ActiveEntitiesService, private locationService: LocationService, private unsavedChangesAlert: MatDialog, private phonePipe: PhonePipe, public translation: TranslationService) { }

	ngAfterViewInit() {
		this.objectForm.push(this.code);
		this.objectForm.push(this.lab);
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

	addLocation() {
		this.headerText = this.translation.translate('Label.Add location');
		this.clearFields();
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
		this.utilsService.disabledSelect([document.querySelector('#countryField')], true, true);
	}

	editLocation(id: string) {
		console.log('id for location to edit: ', id);
		this.headerText = this.translation.translate('Label.Edit location');
		this.properties.rowID = id;
		if (this.utilsService.checkOnlineStatus()) {
			this.locationService.getLocation(id).subscribe(response => {
				this.location = response.json();
				this.checkAssociation();
				if (this.location.IsActive === false) { this.wasInactive = true; }
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

	show() {
		this.properties.isDrawerOpen = true;
		this.properties.hideOverlay = false;
		this.properties.showOverlay = true;
		this.getLabs();
		this.goToTop();
	}

	goToTop() {
		document.querySelector('app-location-add .drawer-content').scrollTop = 0;
	}

	updateDescription() {
		if (this.properties.manualDescriptionInput !== true) {
			this.location.Description = this.location.Code;
		}
	}

	checkDescriptionChange() {
		if (this.location.Description !== this.location.Code) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.location.Description === '' || this.location.Description === null) {
			this.properties.manualDescriptionInput = false;
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

	trimFields() {
		Object.keys(this.location).forEach(key => {
			if (key !== 'IsActive') {
				if (key === 'Location') {
					Object.keys(this.location[key]).forEach(k => {
						this.location[key][k] = this.location[key][k].trim();
					});
				} else {
					if (this.location[key] === null) {
						console.log(`Key: ${key} of location is null`);
					} else {
						this.location[key] = this.location[key].trim();
					}
				}
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.location)) {
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
		this.pristineObject = JSON.stringify(this.location);
	}

	states() {
		return this.utilsService.states;
	}

	counties() {
		if (this.location.Location.State === '') {
			return [];
		} else {
			return this.utilsService.counties[this.location.Location.State];
		}
	}

	resetExists() {
		this.locationService.locationExists = false;
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			this.addAnother = addAnother;
			if (this.properties.rowID === '') {
				this.locationService.createLocation(JSON.stringify(this.location)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else if (error.status === 409) {
						this.locationService.locationExists = true; this.goToTop(); this.saveForm();
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.locationService.updateLocation(this.properties.rowID, JSON.stringify(this.location)).subscribe(response => { this.saveOnComplete(response); }, error => {
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
				this.utilsService.openSnackBar(`${this.translation.translate('Label.Location added')}`);
			}
			if (!this.addAnother) {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Location added')}`);
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Location saved')}`);
				}
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Location')} ${this.location.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	getLabs() {
		this.isAssociated = false;
		if (this.utilsService.checkOnlineStatus()) {
			this.labOptions = [];
			this.activeEntitiesService.getActiveLabs().subscribe(res => {
				res.json().forEach(lab => {
					this.labOptions.push(lab.Code);
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

	checkAssociation() {
		// this.isAssociated = false;
		// if (this.utilsService.checkOnlineStatus()) {
		// 	this.collectionService.getCollectionLists().subscribe(response => {
		// 		response.json().forEach(c => {
		// 			if (c.IsActive == true) {
		// 				this.collectionService.getCollectionList(c.Code).subscribe(res => {
		// 					const list = res.json();
		// 					list.AssociatedCollectionLocations.forEach(loc => {
		// 						if (loc.Id === this.location.Code) { this.isAssociated = true; return; }
		// 					});
		// 				});
		// 			}
		// 		});
		// 	}, error => {
		// 		if (error.status === 401) {
		// 			this.utilsService.handle401(error);
		// 		} else {
		// 			this.utilsService.showError(`Error: ${error}`);
		// 		}
		// 	});
		// }
	}

	checkDeactivate(addAnother) { // if not a new entry and the record was not inactive
		if (this.wasInactive === false && this.location.IsActive === false && this.properties.rowID !== '') { // check if theres anything associated
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
						this.location.IsActive = 1;
						if (this.pristineObject !== JSON.stringify(this.location)) {
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
		this.resetAdd();
		this.utilsService.removeListeners([document.querySelector('#firstFormField'), document.querySelector('#countryField')], true);
		this.location = {
			Code: '',
			Description: '',
			Phone: '',
			LabId: '',
			IsActive: true,
			Location: {
				StreetAddress1: '',
				StreetAddress2: '',
				City: '',
				Country: 'USA',
				County: '',
				PostalCode: '',
				State: ''
			},
		};
		this.isAssociated = false;
		this.wasInactive = false;
		this.resetPristine();
	}

	blur() {
		this.location.Phone = this.phonePipe.transform(this.location.Phone);
	}
}
