import { Component, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { RoleService } from '../services/role.service';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';
import { logging } from 'selenium-webdriver';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'app-role-add',
	templateUrl: './role-add.component.html',
	styleUrls: ['./role-add.component.css']
})

export class RoleAddComponent implements AfterViewInit {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	@ViewChild('roleUser') roleUser: UserSelectorComponent;

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
	permissions = [];
	pristineObject: any;
	role: any = {
		AuthenticationFactor: {
			Code: '',
			Description: '',
			Id: ''
		},
		Id: '',
		Name: '',
		Description: '',
		IsActive: true,
		Is2FAEnabled: false,
		Users: [],
		Permissions: []
	};
	authenticationFactors = [];
	addCollectionList = false;
	createBarcodeLabels = false;
	public roleId = '';
	showUsers = true;
	wasInactive = false;
	isAssociated = false;
	objectForm = [];
	@ViewChild('name') name: NgModel;
	@ViewChild('authenticationFactor') authenticationFactor: NgModel;

	constructor(private roleService: RoleService, public activeEntitiesService: ActiveEntitiesService, public utilsService: UtilsService, private unsavedChangesAlert: MatDialog, public translation: TranslationService) {
	}

	ngAfterViewInit() {
		this.objectForm.push(this.name);
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.control.reset();
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
		if (this.wasInactive === false && this.role.IsActive === false && this.properties.rowID !== '') { // check if theres anything associated
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
						this.save(addAnother);
					} else {
						this.role.IsActive = 1;
						if (this.pristineObject !== JSON.stringify(this.getSimplePristine(this.role))) {
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
		const userArray = this.role.Users.map(row => row.Username);
		this.activeEntitiesService.getUsers();
		this.activeEntitiesService.users.subscribe(response => {
			response.forEach(user => {
				if (userArray.indexOf(user.Id) > -1) { this.isAssociated = true; return; }
			});
		});
	}

	checkForm(addAnother) { // check all fields are complete
		if (this.saveForm() || this.role.Name === 'TSA') {
			this.checkDeactivate(addAnother);
		} else {
			this.goToTop();
		}
	}

	addRole() {
		this.checkAuthenticationFactors();
		this.resetPristine();
		this.headerText = this.translation.translate('Label.Add role');
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
	}

	editRole(id: string) {
		this.checkAuthenticationFactors();
		if (this.utilsService.checkOnlineStatus()) {
			this.headerText = this.translation.translate('Label.Edit role');
			this.roleService.getRole(id).subscribe(response => {
				if (response.json().Users) {
					this.sortByLastName(response.json().Users);
				}
				this.role = response.json();
				if (!this.role.AuthenticationFactor) {
					this.role['AuthenticationFactor'] = { Code: '', Description: '', Id: '' };
				}
				this.role.Id = id;
				this.properties.rowID = id;
				if (this.role.Users) {
					this.sortByLastName(this.role.Users);
				}
				this.checkAssociation();
				if (this.role.IsActive === false) { this.wasInactive = true; }
				console.log('role to edit: ', this.role);
				this.resetPristine();
				this.utilsService.disabledSelect([], false, false);
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`${this.translation.translate('Error.Could not get role')} ${id}, Error: ${error.statusText}, Code: ${error.status}`);
				}
			});
			this.show();
		}
	}

	checkAuthenticationFactors() {
		if (this.authenticationFactors.length === 0) {
			this.roleService.getAuthenticationFactors().subscribe(response => {
				if (response.status === 200) {
					this.authenticationFactors = response.json();
				}
			}, error => {
				console.log('authenticationFactors error is', error);
			});
		}
	}

	sortByLastName(array) {
		array.sort((m, n) => {
			const a = m.LastName.toLowerCase();
			const b = n.LastName.toLowerCase();
			if (a < b) { return -1; }
			if (a > b) { return 1; }
			const c = m.FirstName.toLowerCase();
			const d = n.FirstName.toLowerCase();
			if (c < d) { return -1; }
			if (c > d) { return 1; }
			return 0;
		});
	}

	show() {
		this.properties.isDrawerOpen = true;
		this.properties.hideOverlay = false;
		this.properties.showOverlay = true;
		this.goToTop();
	}

	goToTop() {
		document.querySelector('app-role-add .drawer-content').scrollTop = 0;
	}

	fullClose(save) {
		if (save) {
			this.save(false);
		} else {
			this.utilsService.closeDrawer(this.properties);
		}
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.getSimplePristine(this.role))) {
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
		const simpleObj = JSON.parse(JSON.stringify(obj));
		if (simpleObj.Users.length) {
			simpleObj.Users = simpleObj.Users.map(user => user.Username);
		}
		return simpleObj;
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.getSimplePristine(this.role));
	}

	trimFields() {
		Object.keys(this.role).forEach(key => {
			if (key !== 'IsActive' && key !== 'Users' && key !== 'Is2FAEnabled' && key !== 'Permissions' && key !== 'Id' && key !== 'IsReadOnly') {
				if (Object.keys(this.role[key]).length === 0) {
					this.role[key] = this.role[key].trim();
				}
			}
		});
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			if (this.role.Permissions.length < 1) {
				this.role.IsActive = false;
			}
			if (this.role.Permissions.length < 1) {
				this.role.IsActive = false;
			}
			this.addAnother = addAnother;
			const usersBody = [];
			this.role.Users.forEach(user => {
				usersBody.push({ Username: user.Username });
			});
			this.role.Users = usersBody;
			if (!!this.role.Is2FAEnabled) {
				if (this.role.AuthenticationFactor.Code === 'dateTechCode') {
					this.role.AuthenticationFactor = this.authenticationFactors[1];
				} else {
					this.role.AuthenticationFactor = this.authenticationFactors[0];
				}
			}
			if (this.role.Id === '') {
				this.roleService.createRole(JSON.stringify(this.role)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.roleService.updateRole(this.properties.rowID, JSON.stringify(this.role)).subscribe(response => { this.saveOnComplete(response); }, error => {
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
			if (this.addAnother == true) {
				this.onSave.emit(true);
				this.utilsService.openSnackBar(this.translation.translate('Label.Role added'));
				this.clearFields();
			} else {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(this.translation.translate('Label.Role added'));
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(this.translation.translate('Label.Role saved'));
				}
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Role')} ${this.role.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	processUserSelect(newUserData: any) {
		this.role.Users = newUserData;
		this.notifyUserSelector();
	}

	removePermission(permission) {
		this.role.Permissions.splice(this.role.Permissions.indexOf(permission), 1);
	}

	removeUser(user: any) {
		this.role.Users.splice(this.role.Users.indexOf(user), 1);
		this.notifyUserSelector();
	}

	notifyUserSelector() {
		this.roleUser.usersInput = this.role.Users;
	}

	clearFields() {
		this.utilsService.removeListeners([], false);
		this.resetAdd();
		this.role = {
			AuthenticationFactor: {
				Code: '',
				Description: '',
				Id: ''
			},
			Id: '',
			Name: '',
			Description: '',
			IsActive: true,
			Is2FAEnabled: false,
			Users: [],
			Permissions: []
		};
		this.isAssociated = false;
		this.wasInactive = false;
		this.resetPristine();
		this.showUsers = true;
	}

	updateDescription() {
		if (this.properties.manualDescriptionInput !== true) {
			this.role.Description = this.role.Name;
		}
	}

	checkDescriptionChange() {
		if (this.role.Description !== this.role.Name) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.role.Description === '' || this.role.Description === null) {
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

	setUser(username) {
		if (this.utilsService.checkOnlineStatus()) {
			this.activeEntitiesService.getActiveUsers().subscribe(response => {
				const selectedUser = response.json().find(user => user.Username === username);
				if (selectedUser !== undefined) {
					this.role.Users = [{ FirstName: selectedUser.FirstName, LastName: selectedUser.LastName, Username: selectedUser.Username, AvatarURL: selectedUser.AvatarURL }];
				}
			});
		}
	}
}
