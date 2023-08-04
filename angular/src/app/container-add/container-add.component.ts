import { Component, EventEmitter, Output, AfterViewInit, ViewChild } from '@angular/core';
import { UtilsService } from '../services/utils.service';
import { MatDialog } from '@angular/material';
import { ContainerService } from '../services/container.service';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { MccColorPickerComponent } from 'material-community-components/color-picker/color-picker.component';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';
import { TestService } from '../services/test.service';
import { ActiveEntitiesService } from '../services/active-entities.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-container-add',
	templateUrl: './container-add.component.html',
	styleUrls: ['./container-add.component.css']
})
export class ContainerAddComponent implements AfterViewInit {
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
	container: any = {
		Code: '',
		Name: '',
		Description: '',
		Volume: '',
		ContainerType: '',
		TopColor: 'none',
		ContainerRank: '',
		SpecimenCode: '',
		DrawOrder: '',
		StorageCode: '',
		IsActive: true,
		Laboratory: {
			Id: ''
		}
	};
	labOptions = [];
	isAssociated = false;
	wasInactive = false;
	containerRanks = ['A', 'P'];
	nameTranslation;
	showColorPicker = false;
	objectForm = [];
	@ViewChild('code') code: NgModel;
	@ViewChild('name') name: NgModel;
	@ViewChild('volume') volume: NgModel;
	@ViewChild('type') type: NgModel;
	@ViewChild('rank') rank: NgModel;
	@ViewChild('specimen') specimen: NgModel;
	@ViewChild('draw') draw: NgModel;
	@ViewChild('storage') storage: NgModel;
	@ViewChild('colorPicker') colorPicker: any;
	@ViewChild('colorPickerIcon') colorPickerIcon: any;
	@ViewChild('confirmButton') confirmButton: any;
	@ViewChild('lab') lab: any;

	constructor(private activeEntitiesService: ActiveEntitiesService, private testService: TestService, public utilsService: UtilsService, private containerService: ContainerService, public translation: TranslationService, private unsavedChangesAlert: MatDialog) {
		this.nameTranslation = this.translation.translate('Label.Name');
		this.getLabs();
	}

	ngAfterViewInit() {
		this.objectForm.push(this.code);
		this.objectForm.push(this.lab);
		this.objectForm.push(this.name);
		this.objectForm.push(this.volume);
		this.objectForm.push(this.type);
		this.objectForm.push(this.rank);
		this.objectForm.push(this.specimen);
		this.objectForm.push(this.draw);
		this.objectForm.push(this.storage);
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
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
			this.checkDeactivate(addAnother);
		} else {
			this.goToTop();
		}
	}

	resetExists() {
		this.containerService.containerExists = false;
	}

	checkDeactivate(addAnother) { // if not a new entry and the record was not inactive
		if (this.wasInactive === false && this.container.IsActive === false && this.properties.rowID !== '') { // check if theres anything associated
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
						this.container.IsActive = true;
						if (this.pristineObject !== JSON.stringify(this.container)) {
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
			this.testService.getTests().subscribe(response => {
				const tests = response.json();
				tests.forEach(test => {
					if (this.container.Code === test.DefaultContainer && test.IsActive == true) { this.isAssociated = true; }
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

	addContainer() {
		this.headerText = this.translation.translate('Label.Add container');
		this.properties.rowID = '';
		this.show();
		// console.log(this.container);
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
	}

	editContainer(id: string) {
		// this.containerService.deleteContainer(id).subscribe(response => {
		// 	console.log('delete is', response);
		// });
		this.headerText = this.translation.translate('Label.Edit container');
		this.properties.rowID = id;
		if (this.utilsService.checkOnlineStatus()) {
			this.containerService.getContainer(id).subscribe(response => {
				this.colorPicker.setColor(response.json().TopColor);
				this.container = response.json();
				console.log('container to edit: ', response.json());
				if (this.container.IsActive === false) { this.wasInactive = true; }
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
		this.resetAdd();
		this.clearFields();
		this.goToTop();
	}

	goToTop() {
		document.querySelector('rmp-container-add .drawer-content').scrollTop = 0;
	}

	trimFields() {
		Object.keys(this.container).forEach(key => {
			if (key !== 'IsActive' && key !== 'Laboratory') {
				if (typeof this.container[key] === 'string') {
					this.container[key] = this.container[key].trim();
				}
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		console.log('pristine: ', this.pristineObject);
		console.log('container: ', JSON.stringify(this.container));
		if (this.pristineObject !== JSON.stringify(this.container)) {
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
				} else { this.utilsService.closeDrawer(this.properties); this.showColorPicker = false; }
			});
		} else {
			this.utilsService.closeDrawer(this.properties); this.showColorPicker = false;
		}
	}

	tabEvent() {
		this.wasTab = true;
	}

	blurCode() {
		// if (this.wasTab === true) {
		// 	const descriptionField: HTMLInputElement = document.querySelector('#descriptionField');
		// 	descriptionField.focus();
		// 	console.log('focused on description');
		// 	this.wasTab = false;
		// }
	}

	updateDescription() {
		if (this.properties.manualDescriptionInput !== true) {
			this.container.Description = this.container.Code;
		}
	}

	checkDescriptionChange() {
		if (this.container.Description !== this.container.Code) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.container.Description === '' || this.container.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.container);
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.addAnother = addAnother;
			if (this.properties.rowID === '') {
				this.containerService.createContainer(JSON.stringify(this.container)).subscribe(response => { this.saveOnComplete(response); }, error => {
					console.log('error: ', error);
					if (error.status === 409) {
						this.containerService.containerExists = true; console.log('containerExists: ', this.containerService.containerExists); this.saveForm();
						this.goToTop();
					} else if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.containerService.updateContainer(this.properties.rowID, JSON.stringify(this.container)).subscribe(response => { this.saveOnComplete(response); }, error => {
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
					this.utilsService.closeDrawer(this.properties); this.showColorPicker = false;
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Container added')}`);
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties); this.showColorPicker = false;
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Container saved')}`);
				}
			} else if (this.addAnother) {
				this.onSave.emit(true);
				this.headerText = this.translation.translate('Label.Add container');
				this.utilsService.openSnackBar(`${this.translation.translate('Label.Container added')}`);
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Container')} ${this.container.Name} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	clearFields() {
		this.utilsService.removeListeners([], false);
		this.colorPicker.resetAdd();
		this.resetAdd();
		this.colorPicker.reset();
		document.getElementById('colorPickerIcon').style.color = 'rgba(0, 0, 0, 0.54)';
		this.container = {
			Code: '',
			Name: '',
			Description: '',
			Volume: '',
			ContainerType: '',
			TopColor: '',
			ContainerRank: '',
			SpecimenCode: '',
			DrawOrder: '',
			StorageCode: '',
			IsActive: true,
			Laboratory: {
				Id: ''
			}
		};
		this.isAssociated = false;
		this.wasInactive = false;
		this.resetPristine();
	}

	selectColor(event) {
		this.container.TopColor = event;
		this.showColorPicker = false;
	}

	toggleColorPicker() {
		if (this.colorPicker.show === true) {
			this.colorPicker.close();
		} else {
			if (this.container.TopColor !== '' && this.container.TopColor !== null) {
				this.colorPicker.setColor(this.container.TopColor);
			}
			this.colorPicker.show = true;
		}
		this.colorPicker.open = !this.colorPicker.open;
		this.showColorPicker = !this.showColorPicker;
	}
}
