import { Component, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { DeviceService } from '../services/device.service';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { fromEvent } from 'rxjs';

@Component({
	selector: 'app-device-add',
	templateUrl: './device-add.component.html',
	styleUrls: ['./device-add.component.css']
})

export class DeviceAddComponent implements AfterViewInit {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	objectForm = [];
	@ViewChild('code') code: NgModel;

	properties = {
		clearFields: () => this.clearFields(),
		isDrawerOpen: false,
		manualDescriptionInput: false,
		showOverlay: false,
		hideOverlay: false,
		rowID: ''
	};
	newDevice = false;
	wasTab = false;
	addAnother: boolean;
	headerText: string;
	pristineObject: any;
	device = {
		IsActive: true,
		Code: '',
		Description: '',
		CordovaVersion: '',
		Model: '',
		Platform: '',
		UUID: '',
		OSVersion: '',
		Manufacturer: '',
		Simulator: null,
		SerialNumber: '',
		SecretNumber: ''
	};
	mouseSubscribe: any;

	constructor(public utilsService: UtilsService, private deviceService: DeviceService, private dialogAlert: MatDialog, public translation: TranslationService) { }

	ngAfterViewInit() {
		this.objectForm.push(this.code);
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	disabledSelect() {
		const inputs = [document.querySelector('#firstFormField'), document.querySelector('#formField2'), document.querySelector('#formField3'), document.querySelector('#formField4'), document.querySelector('#formField5'), document.querySelector('#formField6'), document.querySelector('#formField7'), document.querySelector('#formField8'), document.querySelector('#formField9'), document.querySelector('#formField10')];
		if (this.device.Code !== '') {
			this.utilsService.disabledSelect(inputs, true, true);
		} else {
			this.utilsService.disabledSelect(inputs, true, false);
		}
	}

	removeListeners() {
		const inputs = [document.querySelector('#firstFormField'), document.querySelector('#formField2'), document.querySelector('#formField3'), document.querySelector('#formField4'), document.querySelector('#formField5'), document.querySelector('#formField6'), document.querySelector('#formField7'), document.querySelector('#formField8'), document.querySelector('#formField9'), document.querySelector('#formField10')];
		this.utilsService.removeListeners(inputs, true);
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

	editDevice(id: string) {
		this.headerText = `${this.translation.translate('Label.Edit')} ${this.translation.translate('Label.device')}`;
		this.properties.rowID = id;
		if (this.utilsService.checkOnlineStatus()) {
			this.deviceService.getDevice(id).subscribe(response => {
				this.device = response.json();
				if (this.device.Simulator === 0) {
					this.device.Simulator = false;
				} else if (this.device.Simulator === 1) {
					this.device.Simulator = true;
				}
				if (this.device.Code === '') { this.newDevice = true; }
				this.resetPristine();
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
		if (this.newDevice === true) {
			const firstField: HTMLInputElement = document.querySelector('#codeField');
			setTimeout(() => firstField.focus(), 100);
		}
		this.disabledSelect();
	}

	goToTop() {
		document.querySelector('app-device-add .drawer-content').scrollTop = 0;
	}

	trimFields() {
		Object.keys(this.device).forEach(key => {
			if (key !== 'IsActive' && key !== 'Simulator') {
				this.device[key] = this.device[key].trim();
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.device)) {
			const dialogRef = this.dialogAlert.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (document.body.querySelector('.add-overlay')) {
					document.body.removeChild(document.body.querySelector('.add-overlay'));
				}
				if (result) {
					this.save();
				} else { this.utilsService.closeDrawer(this.properties); }

			});
		} else {
			this.utilsService.closeDrawer(this.properties);
		}
	}

	clickDelete() {
		const dialogRef = this.dialogAlert.open(DeleteDialogComponent, {
			width: '300px',
			backdropClass: 'unsavedOverlay',
			autoFocus: false
		});
		dialogRef.beforeClose().subscribe(result => {
			if (document.body.querySelector('.add-overlay')) {
				document.body.removeChild(document.body.querySelector('.add-overlay'));
			}
			if (result) {
				this.deleteDevice();
			} else { dialogRef.close(); }

		});
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.device);
	}

	save() {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			if (this.saveForm()) {
				if (this.properties.rowID === '') {
					this.deviceService.createDevice(JSON.stringify(this.device)).subscribe(response => { this.saveOnComplete(response); }, error => {
						if (error.status === 401) {
							this.utilsService.handle401(error);
						} else {
							this.utilsService.showError(`Error: ${error}`);
						}
					});
				} else {
					this.deviceService.updateDevice(this.properties.rowID, JSON.stringify(this.device)).subscribe(response => { this.saveOnComplete(response); }, error => {
						if (error.status === 401) {
							this.utilsService.handle401(error);
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

	deleteDevice() {
		if (this.utilsService.checkOnlineStatus()) {
			this.deviceService.deleteDevice(this.properties.rowID).subscribe(response => {
				if (response.status === 200) {
					this.onSave.emit();
					this.clearFields();
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Device deleted')}`);
				} else {
					this.utilsService.showError('Device ' + this.device.Code + ' could not be deleted due an unknown error. If the error persists please contact support.');
				}
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
		}
	}

	saveOnComplete(response) {
		if (response.status === 200) {
			this.onSave.emit();
			this.clearFields();
			if (this.addAnother) {
				this.utilsService.openSnackBar(`${this.translation.translate('Label.Device saved')}`);
			}
			if (!this.addAnother) {
				this.utilsService.closeDrawer(this.properties);
				this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Device saved')}`);
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Device')} ${this.device.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	clearFields() {
		this.resetAdd();
		this.device = {
			IsActive: true,
			Code: '',
			Description: '',
			CordovaVersion: '',
			Model: '',
			Platform: '',
			UUID: '',
			OSVersion: '',
			Manufacturer: '',
			Simulator: '',
			SerialNumber: '',
			SecretNumber: ''
		};
		this.newDevice = false;
		this.resetPristine();
		this.removeListeners();
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
			this.device.Description = this.device.Code;
		}
	}

	checkDescriptionChange() {
		if (this.device.Description !== this.device.Code) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.device.Description === '' || this.device.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}
}
