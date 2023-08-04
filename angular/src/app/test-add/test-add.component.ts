import { Component, EventEmitter, Output, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { TestService } from '../services/test.service';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '@angular/forms';
import { TranslationService } from 'angular-l10n';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-test-add',
	templateUrl: './test-add.component.html',
	styleUrls: ['test-add.component.css']
})
export class TestAddComponent implements OnInit, AfterViewInit {
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
	pristineObject: any;
	test: any = {
		Code: '',
		Description: '',
		HandlingInstructions: '',
		Lab: '',
		LabDepartment: '',
		DefaultContainer: '',
		Volume: '',
		Destination: '',
		ChargeAmount: '',
		IsActive: true
	};
	labs = [];
	defaultContainers = [];
	newEntry = true;
	objectForm = [];
	@ViewChild('code') code: NgModel;
	@ViewChild('charge') charge: NgModel;
	@ViewChild('handling') handling: NgModel;
	@ViewChild('labForm') labForm: NgModel;
	@ViewChild('defaultContainer') defaultContainer: NgModel;
	@ViewChild('volume') volume: NgModel;
	@ViewChild('destination') destination: NgModel;

	constructor(public utilsService: UtilsService, private testService: TestService, private activeEntitiesService: ActiveEntitiesService, private errorAlert: MatDialog, public translation: TranslationService) { }

	ngAfterViewInit() {
		this.objectForm.push(this.charge);
		this.objectForm.push(this.code);
		this.objectForm.push(this.handling);
		this.objectForm.push(this.labForm);
		this.objectForm.push(this.defaultContainer);
		this.objectForm.push(this.volume);
		this.objectForm.push(this.destination);
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

	ngOnInit() {
		this.getLabs();
		// this.getContainers();
	}

	getLabs() {
		if (this.utilsService.checkOnlineStatus()) {
			this.activeEntitiesService.getActiveLabs().subscribe(response => {
				const labs = response.json();
				labs.forEach(lab => {
					this.labs.push(lab);
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

	getContainers(id) {
		if (this.utilsService.checkOnlineStatus()) {
			console.log('should be getting default containers for lab... ', id);
			this.activeEntitiesService.getActiveContainersForLab(id).subscribe(response => {
				let containers = response.json();
				console.log('all containers for lab: ', id, ': ', response.json());
				this.defaultContainers = [];
				containers.forEach(container => {
					if (container.Code !== '') {
						this.defaultContainers.push( container.Code );
					}
				});
				console.log('these containers are from the getActiveContainersForLab() response and have a Code so we are going to display these containers for lab:  ', id, ': ', this.defaultContainers);
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
		}
	}

	// getLocationsAssociated(labID) {
	// 	this.activeEntitiesService.getActiveLocations().subscribe(response => {
	// 		console.log('response.json for locations: ', response.json());
	// 		this.locationsAssociated = response.json().filter(location => location.LabId === labID);
	// 	}, error => {
	// 		if (error.status === 401) {
	// 			this.utilsService.handle401(error);
	// 		} else {
	// 			this.utilsService.showError(`Error: ${error}`);
	// 		}
	// 	});
	// }

	resetExists() {
		this.testService.testExists = false;
	}

	addTest() {
		this.headerText = this.translation.translate('Label.Add test');
		this.properties.rowID = '';
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
	}

	editTest(id: string) {
		console.log('id passed to test edit: ', id);
		if (this.utilsService.checkOnlineStatus()) {
			this.headerText = this.translation.translate('Label.Edit test');
			this.properties.rowID = id;
			this.testService.getTest(id).subscribe(response => {
				this.test = response.json();
				console.log('test to edit: ', response.json());
				if (response.json().Laboratory.Id !== '') {
					this.getContainers(response.json().Laboratory.Id);
				}
				this.test.ChargeAmount = `$${response.json().ChargeAmount}`;
				this.test.Lab = response.json().Laboratory.Code;
				this.resetPristine();
				this.newEntry = false;
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
		this.clearFields();
		this.goToTop();
	}

	goToTop() {
		document.querySelector('rmp-test-add .drawer-content').scrollTop = 0;
	}

	closeDrawer() {
		this.newEntry = true;
		this.properties.isDrawerOpen = false;
		this.utilsService.closeSnackBar();
		this.properties.manualDescriptionInput = false;
	}

	trimFields() {
		Object.keys(this.test).forEach(key => {
			console.log('key: ', key);
			if (key !== 'IsActive' && key !== 'Laboratory' && key !== 'Lab') {
				this.test[key] = this.test[key].trim();
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.test)) {
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

	resetPristine() {
		this.pristineObject = JSON.stringify(this.test);
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			if (this.saveForm()) {
				this.addAnother = addAnother;
				this.test.ChargeAmount = this.test.ChargeAmount.replace('$', '');
				console.log('testAmount: ', this.test.ChargeAmount);
				if (this.properties.rowID === '') {
					this.testService.createTest(JSON.stringify(this.test)).subscribe(response => { this.saveOnComplete(response); }, error => {
						if (error.status === 409) {
							this.testService.testExists = true; this.goToTop(); this.saveForm(); return;
						} else if (error.status === 401) {
							this.utilsService.handle401(error);
						} else {
							this.utilsService.showError(`Error: ${error}`);
						}
					});
				} else {
					this.testService.updateTest(this.properties.rowID, JSON.stringify(this.test)).subscribe(response => { this.saveOnComplete(response); }, error => {
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

	saveOnComplete(response) {
		if (response.status === 200) {
			this.clearFields();
			if (this.addAnother) {
				this.onSave.emit(true);
				this.utilsService.openSnackBar(this.translation.translate('Label.Test added'));
				this.headerText = this.translation.translate('Label.Add test');
			}
			if (!this.addAnother) {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(this.translation.translate('Label.Test added'));
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(this.translation.translate('Label.Test saved'));
				}
			}
		} else {
			this.showError(`${this.translation.translate('MainMenu.Test')} ${this.test.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	clearFields() {
		this.utilsService.removeListeners([], false);
		this.resetAdd();
		this.test = {
			Code: '',
			Description: '',
			HandlingInstructions: '',
			Lab: '',
			LabDepartment: '',
			DefaultContainer: '',
			Volume: '',
			Destination: '',
			ChargeAmount: '',
			IsActive: true
		};
		this.resetPristine();
	}

	showError(errorMessage) {
		this.errorAlert.open(ErrorDialogComponent, {
			panelClass: 'err-dialog',
			backdropClass: 'errorOverlay',
			data: errorMessage,
			autoFocus: false
		});
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
			this.test.Description = this.test.Code;
		}
	}

	checkDescriptionChange() {
		if (this.test.Description !== this.test.Code) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.test.Description === '' || this.test.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}
}
