import { Component, EventEmitter, Output, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { WorkloadService } from '../services/workload.service';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { CollectionListService } from '../services/collection-list.service';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';

@Component({
	selector: 'app-workload-add',
	templateUrl: './workload-add.component.html',
	styleUrls: ['./workload-add.component.css']
})
export class WorkloadAddComponent implements AfterViewInit {
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
	wasInactive = false;
	isAssociated = false;
	addAnother: boolean;
	headerText: string;
	pristineObject: any;
	wasTab = false;
	labOptions = [];
	workload: any = {
		Code: '',
		Description: '',
		LaboratoryId: '',
		IsActive: true
	};
	objectForm = [];
	@ViewChild('code') code: NgModel;
	@ViewChild('lab') lab: NgModel;

	constructor(private collectionService: CollectionListService, private activeEntitiesService: ActiveEntitiesService, public utilsService: UtilsService, private workloadService: WorkloadService, private unsavedChangesAlert: MatDialog, public translation: TranslationService) {
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
		this.workloadService.workloadExists = false;
	}

	getLabs() {
		this.labOptions = [];
		this.activeEntitiesService.getActiveLabs().subscribe(response => {
			const labs = response.json();
			labs.forEach(lab => {
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

	addWorkload() {
		this.resetPristine();
		this.headerText = this.translation.translate('Label.Add workload');
		this.properties.rowID = '';
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
	}

	editWorkload(id: string) {
		if (this.utilsService.checkOnlineStatus()) {
			this.headerText = this.translation.translate('Label.Edit workload');
			this.properties.rowID = id;
			this.workloadService.getWorkload(id).subscribe(response => {
				this.workload = response.json();
				this.checkAssociation();
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
		document.querySelector('app-workload-add .drawer-content').scrollTop = 0;
	}

	trimFields() {
		Object.keys(this.workload).forEach(key => {
			if (key !== 'IsActive') {
				this.workload[key] = this.workload[key].trim();
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.workload)) {
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
			this.workload.Description = this.workload.Code;
		}
	}

	checkDescriptionChange() {
		if (this.workload.Description !== this.workload.Code) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.workload.Description === '' || this.workload.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.workload);
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			this.addAnother = addAnother;
			if (this.properties.rowID === '') {
				this.workloadService.createWorkload(JSON.stringify(this.workload)).subscribe(response => { this.saveOnComplete(response); }, error => {
					console.log('error trying to create workload: ', error);
					if (error.status === 409) {
						this.workloadService.workloadExists = true; this.saveForm(); return;
					} else if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.workloadService.updateWorkload(this.properties.rowID, JSON.stringify(this.workload)).subscribe(response => { this.saveOnComplete(response); }, error => {
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
					this.utilsService.openPwdSnackBar(this.translation.translate('Label.Workload added'));
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(this.translation.translate('Label.Workload saved'));
				}
			} else if (this.addAnother) {
				this.onSave.emit(true);
				this.headerText = this.translation.translate('Label.Add workload');
				this.utilsService.openSnackBar(this.translation.translate('Label.Workload added'));
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Workload')} ${this.workload.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	clearFields() {
		this.utilsService.removeListeners([], false);
		this.resetAdd();
		this.workload = {
			Code: '',
			Description: '',
			IsActive: true
		};
		this.resetPristine();
	}

	checkDeactivate(addAnother) { // if not a new entry and the record was not inactive
		if (this.wasInactive === false && this.workload.IsActive === false && this.properties.rowID !== '') { // check if theres anything associated
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
						this.workload.IsActive = true;
						if (this.pristineObject !== JSON.stringify(this.workload)) {
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
		this.collectionService.getCollectionLists().subscribe(response => {
			response.json().forEach(c => {
				if (c.IsActive == true) {
					this.collectionService.getCollectionList(c.Code).subscribe(res => {
						const list = res.json();
						if (list.Laboratory.Id === this.workload.LaboratoryId && list.IsActive == true) { console.log('association found'); this.isAssociated = true; return; }
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

	checkForm(addAnother) {
		if (this.saveForm()) {
			this.checkDeactivate(addAnother);
		} else {
			this.goToTop();
		}
	}
}
