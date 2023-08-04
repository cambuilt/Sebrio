import { Component, Input, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { TranslationService } from 'angular-l10n';
import { ImageUploadService } from '../services/image-upload.service';
import { NgModel } from '@angular/forms';

@Component({
	selector: 'app-messaging-list-add',
	templateUrl: './messaging-list-add.component.html',
	styleUrls: ['./messaging-list-add.component.css']
})
export class MessagingListAddComponent implements AfterViewInit {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	@Input() listType: any;
	@ViewChild('name') name: NgModel;

	isDrawerOpen = false;
	headerText = '';
	pristineObject: any;
	objectForm = [];
	selectedList = '';
	broadcastGroup: any = {
		Name: '',
		Recipients: []
	};
	addEditTenantList = false;
	editing = false;

	constructor(private errorAlert: MatDialog, public translation: TranslationService, private utilsService: UtilsService, private imageUploadService: ImageUploadService) { }

	ngAfterViewInit() {
		this.objectForm = [];
		this.objectForm.push(this.name);
	}

	clickOverlay() {
		if (this.pristineObject !== JSON.stringify(this.broadcastGroup)) {
			const dialogRef = this.errorAlert.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'drawer-overlay-blank',
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (document.body.querySelector('.add-overlay')) {
					document.body.removeChild(document.body.querySelector('.add-overlay'));
				}
				if (result) {
					this.save();
				}
				this.closeDrawer();
			});
		} else {
			this.closeDrawer();
		}
		this.addEditTenantList = false;
	}

	save() {
		if (this.utilsService.checkOnlineStatus()) {
			if (this.saveForm()) {
				this.onSave.emit(this.broadcastGroup);
				this.addEditTenantList = false;
				this.closeDrawer();
			}
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

	addList() {
		this.headerText = this.translation.translate('Header.Add list');
		this.broadcastGroup = { Name: '', Recipients: [], GroupType: this.listType === 'Users' ? 'USER' : 'TENANT' };
		this.resetAdd();
		this.resetPristine();
		this.show();
	}

	editList(broadcastGroup) {
		this.selectedList = broadcastGroup.Name;
		this.headerText = this.translation.translate('Header.List info');
		this.show();

		if (broadcastGroup.GroupType === 'TENANT') {
			this.addEditTenantList = true;
			this.listType = 'Tenants';
		} else {
			this.listType = 'Users';
		}

		this.broadcastGroup = broadcastGroup;
		this.editing = true;
		this.resetPristine();
	}

	show() {
		this.isDrawerOpen = true;
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.utilsService.closeSnackBar();
		this.selectedList = '';
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.broadcastGroup);
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	processRecipientSelect(newRecipientData: any) {
		this.broadcastGroup.Recipients.forEach(oldRecipient => { // If old users has user not in new users, remove
			let found = false;
			const oldName = this.broadcastGroup.GroupType === 'TENANT' ? oldRecipient : `${oldRecipient.FirstName} ${oldRecipient.LastName}`;
			newRecipientData.forEach(newRecipient => {
				const newName = this.broadcastGroup.GroupType === 'TENANT' ? newRecipient : `${newRecipient.FirstName} ${newRecipient.LastName}`;
				if (oldName === newName) {
					found = true;
				}
				if (found) {
					this.removeRecipient(oldRecipient);
				}
			});
		});
		newRecipientData.forEach(newRecipient => {
			let found = false;
			const newName = this.broadcastGroup.GroupType === 'TENANT' ? newRecipient : `${newRecipient.FirstName} ${newRecipient.LastName}`;
			this.broadcastGroup.Recipients.forEach(oldRecipient => { // Search role Users, if you find a new user, no need to add
				const oldName = this.broadcastGroup.GroupType === 'TENANT' ? oldRecipient : `${oldRecipient.FirstName} ${oldRecipient.LastName}`;
				if (oldName === newName) {
					found = true;
				}
			});
			if (!found) {
				this.broadcastGroup.Recipients.push(newRecipient);
			}
		});
	}

	removeRecipient(recipient) {
		this.broadcastGroup.Recipients.splice(this.broadcastGroup.Recipients.indexOf(recipient), 1);
	}
}
