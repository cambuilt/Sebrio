import { Component, EventEmitter, Output, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { PriorityService } from '../services/priority.service';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { CollectionListService } from '../services/collection-list.service';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';
import { ActiveEntitiesService } from '../services/active-entities.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-priority-add',
	templateUrl: './priority-add.component.html',
	styleUrls: ['./priority-add.component.css']
})
export class PriorityAddComponent implements AfterViewInit {
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
	addAnother: boolean;
	headerText: string;
	pristineObject: any;
	wasTab = false;
	priority: any = {
		Code: '',
		Description: '',
		Priority: '',
		ShowColor: false,
		IsActive: true,
		Laboratory: {
			Id: ''
		}
	};
	options = [
		'Stat',
		'Routine',
		'Fasting',
		'ASAP',
		'Future'
	];
	labOptions = [];
	objectForm = [];
	@ViewChild('code') code: NgModel;
	@ViewChild('lab') lab: NgModel;
	@ViewChild('priorityForm') priorityForm: NgModel;

	constructor(private activeEntitiesService: ActiveEntitiesService, private collectionService: CollectionListService, public utilsService: UtilsService, private priorityService: PriorityService, private unsavedChangesAlert: MatDialog, public translation: TranslationService) {
		this.getLabs();
	}

	ngAfterViewInit() {
		this.objectForm.push(this.code);
		this.objectForm.push(this.lab);
		this.objectForm.push(this.priorityForm);
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

	resetExists() {
		this.priorityService.priorityExists = false;
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

	addPriority() {
		this.headerText = this.translation.translate('Label.Add priority');
		this.properties.rowID = '';
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
	}

	editPriority(id: string) {
		if (this.utilsService.checkOnlineStatus()) {
			this.headerText = this.translation.translate('Label.Edit priority');
			this.properties.rowID = id;
			this.priorityService.getPriority(id).subscribe(response => {
				this.priority = response.json();
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
		this.clearFields();
		this.goToTop();
	}

	goToTop() {
		document.querySelector('rmp-priority-add .drawer-content').scrollTop = 0;
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
			this.priority.Description = this.priority.Code;
		}
	}

	checkDescriptionChange() {
		if (this.priority.Description !== this.priority.Code) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.priority.Description === '' || this.priority.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}

	trimFields() {
		Object.keys(this.priority).forEach(key => {
			if (key !== 'IsActive') {
				if (typeof this.priority[key] === 'string') {
					this.priority[key] = this.priority[key].trim();
				}
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.priority)) {
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
		this.pristineObject = JSON.stringify(this.priority);
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			this.addAnother = addAnother;

			if (this.properties.rowID === '') {
				this.priorityService.createPriority(JSON.stringify(this.priority)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 409) {
						this.priorityService.priorityExists = true; this.goToTop(); this.saveForm();
					} else if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.priorityService.updatePriority(this.properties.rowID, JSON.stringify(this.priority)).subscribe(response => { this.saveOnComplete(response); }, error => {
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
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Priority added')}`);
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Priority saved')}`);
				}
			} else if (this.addAnother) {
				this.onSave.emit(true);
				this.headerText = this.translation.translate('Label.Add priority');
				this.utilsService.openSnackBar(`${this.translation.translate('Label.Priority added')}`);
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Priority')} ${this.priority.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	clearFields() {
		this.utilsService.removeListeners([], false);
		this.resetAdd();
		this.priority = {
			Code: '',
			Description: '',
			Priority: '',
			ShowColor: false,
			IsActive: true,
			Laboratory: {
				Id: ''
			}
		};
		this.isAssociated = false;
		this.wasInactive = false;
		this.resetPristine();
	}

	checkAssociation() {
		// this.isAssociated = false;
		// if (this.utilsService.checkOnlineStatus()) {
		// 	this.collectionService.getCollectionLists().subscribe(response => {
		// 		response.json().forEach(c => {
		// 			if (c.IsActive == true) {
		// 				this.collectionService.getCollectionList(c.Code).subscribe(res => {
		// 					const list = res.json();
		// 					list.AssociatedPriorities.forEach(p => {
		// 						if (p.Id === this.priority.Code) { this.isAssociated = true; return; }
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
		if (this.wasInactive === false && this.priority.IsActive === false && this.properties.rowID !== '') { // check if theres anything associated
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
						this.priority.IsActive = true;
						if (this.pristineObject !== JSON.stringify(this.priority)) {
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

}
