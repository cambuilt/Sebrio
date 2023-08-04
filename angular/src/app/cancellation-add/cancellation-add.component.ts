import { Component, EventEmitter, Output, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { CancellationService } from '../services/cancellation.service';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';
import { a } from '@angular/core/src/render3';
import { ActiveEntitiesService } from '../services/active-entities.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-cancellation-add',
	templateUrl: './cancellation-add.component.html',
	styleUrls: ['cancellation-add.component.css']
})
export class CancellationAddComponent implements AfterViewInit {
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
	labOptions = [];
	addAnother: boolean;
	headerText: string;
	pristineObject: any;
	wasTab = false;
	cancellation: any = {
		Code: '',
		Description: '',
		IsActive: true,
		Laboratory: {
			Id: ''
		}
	};

	objectForm = [];
	@ViewChild('code') code: NgModel;
	@ViewChild('lab') lab: NgModel;

	constructor(private activeEntitiesService: ActiveEntitiesService, public utilsService: UtilsService, private cancellationService: CancellationService, private unsavedChangesAlert: MatDialog, public translation: TranslationService) {
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
		this.cancellationService.cancellationExists = false;
	}

	getLabs() {
		if (this.utilsService.checkOnlineStatus()) {
			this.labOptions = [];
			this.activeEntitiesService.getActiveLabs().subscribe(response => {
				console.log('labs: ', response.json());
				response.json().forEach(lab => {
					this.labOptions.push(lab);
				});
			});
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


	addCancellation() {
		this.resetPristine();
		this.headerText = this.translation.translate('Label.Add cancellation');
		this.properties.rowID = '';
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
	}

	editCancellation(id: string) {
		this.resetAdd();
		this.headerText = this.translation.translate('Label.Edit cancellation');
		this.properties.rowID = id;
		if (this.utilsService.checkOnlineStatus()) {
			this.cancellationService.getCancellation(id).subscribe(response => {
				console.log('respone for edit: ', response.json());
				this.cancellation = response.json();
				this.resetPristine();
				this.utilsService.disabledSelect([], false, false);
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
		this.properties.hideOverlay = false;
		this.properties.showOverlay = true;
		this.properties.isDrawerOpen = true;
		this.goToTop();
	}

	goToTop() {
		document.querySelector('rmp-cancellation-add .drawer-content').scrollTop = 0;
	}

	trimFields() {
		Object.keys(this.cancellation).forEach(key => {
			if (key !== 'IsActive' && key !== 'Laboratory') {
				this.cancellation[key] = this.cancellation[key].trim();
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.cancellation)) {
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
			this.cancellation.Description = this.cancellation.Code;
		}
	}

	checkDescriptionChange() {
		if (this.cancellation.Description !== this.cancellation.Code) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.cancellation.Description === '' || this.cancellation.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}


	resetPristine() {
		this.pristineObject = JSON.stringify(this.cancellation);
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			this.addAnother = addAnother;
			if (this.properties.rowID === '') {
				this.cancellationService.createCancellation(JSON.stringify(this.cancellation)).subscribe(response => {
					this.saveOnComplete(response);
				}, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else if (error.status === 409) {
						this.cancellationService.cancellationExists = true; this.saveForm();
					} else { this.utilsService.showError(`Error: ${error}`); }
				});
			} else {
				this.cancellationService.updateCancellation(this.properties.rowID, JSON.stringify(this.cancellation)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 401) { this.utilsService.handle401(error); } else { this.utilsService.showError(error); }
				});
			}
		}
	}

	saveOnComplete(response) {
		if (response.status === 200) {
			const add = this.translation.translate('Label.Cancellation saved');
			this.clearFields();
			if (!this.addAnother) {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Cancellation added')}`);
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Cancellation saved')}`);
				}
			} else if (this.addAnother) {
				this.headerText = this.translation.translate('Label.Add cancellation');
				this.onSave.emit(true);
				this.utilsService.openSnackBar(`${this.translation.translate('Label.Cancellation added')}`);
			}
		} else {
			this.utilsService.showError(`${this.translation.translate(`MainMenu.Cancellation ${this.cancellation.Code} Label.could not be saved due an unknown error. If the error persists please contact support`)}`);
		}
	}

	clearFields() {
		this.utilsService.removeListeners([], false);
		this.resetAdd();
		this.cancellation = {
			Code: '',
			Description: '',
			IsActive: true,
			Laboratory: {
				Id: ''
			}
		};
		this.resetPristine();
	}
}
