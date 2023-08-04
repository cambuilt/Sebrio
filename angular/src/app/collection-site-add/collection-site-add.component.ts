import { Component, EventEmitter, Output, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { CollectionSiteService } from '../services/collection-site.service';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';

@Component({
	selector: 'app-collection-site-add',
	templateUrl: './collection-site-add.component.html',
	styleUrls: ['./collection-site-add.component.css']
})
export class CollectionSiteAddComponent implements AfterViewInit {
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
	labOptions = [];
	collectionSite: any = {
		Code: '',
		Description: '',
		LaboratoryId: '',
		IsActive: true
	};
	objectForm = [];
	@ViewChild('code') code: NgModel;
	@ViewChild('lab') lab: NgModel;

	constructor(private activeEntitiesService: ActiveEntitiesService, public utilsService: UtilsService, private collectionSiteService: CollectionSiteService, private errorAlert: MatDialog, public translation: TranslationService) {
		this.getLabs();
	}

	ngAfterViewInit() {
		this.objectForm.push(this.code);
		this.objectForm.push(this.lab);
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	resetExists() {
		this.collectionSiteService.siteExists = false;
	}

	getLabs() {
		if (this.utilsService.checkOnlineStatus()) {
			this.labOptions = [];
			this.activeEntitiesService.getActiveLabs().subscribe(response => {
				const labs = response.json();
				labs.forEach(lab => {
					this.labOptions.push(lab.Code);
				});
			}, error => { this.utilsService.handle401(error); });
		}
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

	checkForm(addAnother) { // check all fields are complete
		if (this.saveForm()) {
			this.save(addAnother);
		} else {
			this.goToTop();
		}
	}

	addCollectionSite() {
		this.resetPristine();
		this.headerText = this.translation.translate('Label.Add collection site');
		this.properties.rowID = '';
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
	}

	editCollectionSite(id: string) {
		this.headerText = this.translation.translate('Label.Edit collection site');
		this.properties.rowID = id;
		if (this.utilsService.checkOnlineStatus()) {
			this.collectionSiteService.getCollectionSite(id).subscribe(response => {
				this.collectionSite = response.json();
				this.resetPristine();
				this.utilsService.disabledSelect([], false, false);
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
		document.querySelector('app-collection-site-add .drawer-content').scrollTop = 0;
	}

	trimFields() {
		Object.keys(this.collectionSite).forEach(key => {
			if (key !== 'IsActive') {
				this.collectionSite[key] = this.collectionSite[key].trim();
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.collectionSite)) {
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
					this.save(false);
				} else { this.utilsService.closeDrawer(this.properties); }

			});
		} else {
			this.utilsService.closeDrawer(this.properties);
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
			this.collectionSite.Description = this.collectionSite.Code;
		}
	}

	checkDescriptionChange() {
		if (this.collectionSite.Description !== this.collectionSite.Code) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.collectionSite.Description === '' || this.collectionSite.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}


	resetPristine() {
		this.pristineObject = JSON.stringify(this.collectionSite);
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			this.addAnother = addAnother;
			if (this.properties.rowID === '') {
				this.collectionSiteService.createCollectionSite(JSON.stringify(this.collectionSite)).subscribe(response => { this.saveOnComplete(response); }, error => {
					console.log('error: ', error);
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else if (error.status === 409) {
						this.collectionSiteService.siteExists = true; console.log('siteExists: ', this.collectionSiteService.siteExists); this.saveForm();
					} else { this.utilsService.showError(`Error: ${error}`); }
				});
			} else {
				this.collectionSiteService.updateCollectionSite(this.properties.rowID, JSON.stringify(this.collectionSite)).subscribe(response => { this.saveOnComplete(response); }, error => {
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
			if (!this.addAnother) {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Collection site added')}`);
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Collection site saved')}`);
				}
			} else if (this.addAnother) {
				this.onSave.emit(true);
				this.headerText = this.translation.translate('Label.Add collection site');
				this.utilsService.openSnackBar(`${this.translation.translate('Label.Collection site added')}`);
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Collection Site')} ${this.collectionSite.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	clearFields() {
		this.utilsService.removeListeners([], false);
		this.resetAdd();
		this.collectionSite = {
			Code: '',
			Description: '',
			IsActive: true
		};
		this.resetPristine();
	}
}
