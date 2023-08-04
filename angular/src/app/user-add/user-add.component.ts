import { Component, EventEmitter, Output, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { UserService } from '../services/user.service';
import { PhonePipe } from '../phone.pipe';
import { AuthService } from '../services/auth.service';
import { TenantService } from '../services/tenant.service';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';

@Component({
	selector: 'app-user-add',
	templateUrl: './user-add.component.html',
	styleUrls: ['./user-add.component.css']
})

export class UserAddComponent implements OnInit, AfterViewInit {
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
	roles = [];
	pristineObject: any;
	user: any = {};
	wasInactive = false;
	objectForm = [];
	usernameExists = false;
	@ViewChild('email') email: NgModel;
	@ViewChild('badgeID') badgeID: NgModel;
	@ViewChild('code') code: NgModel;
	@ViewChild('phone') phone: NgModel;
	@ViewChild('firstName') firstName: NgModel;
	@ViewChild('lastName') lastName: NgModel;
	@ViewChild('username') username: NgModel;

	constructor(public translation: TranslationService, private activeEntitiesService: ActiveEntitiesService, public utilsService: UtilsService, private userService: UserService, private tenantService: TenantService, private unsavedChangesAlert: MatDialog, private phonePipe: PhonePipe, public authService: AuthService) { }

	ngAfterViewInit() {
		if (this.authService.currentUser.role !== 'RMP_RSA') {
			this.objectForm.push(this.badgeID);
			this.objectForm.push(this.code);
		}
		this.objectForm.push(this.email);
		this.objectForm.push(this.firstName);
		this.objectForm.push(this.lastName);
		this.objectForm.push(this.username);
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

	ngOnInit() {
		this.clearFields();
		this.getRoles();
	}

	addUser() {
		this.headerText = this.translation.translate('Label.Add user');
		this.show();
		if (this.authService.currentUser.role !== 'RMP_RSA') {
			setTimeout(() => {
				const firstField: HTMLInputElement = document.querySelector('#firstField');
				firstField.focus();
			}, 0);
		} else {
			setTimeout(() => {
				const secondField: HTMLInputElement = document.querySelector('#secondField');
				secondField.focus();
			}, 0);
		}
	}

	editUser(username: string) {
		if (this.utilsService.checkOnlineStatus()) {
			this.properties.rowID = username;
			this.headerText = this.translation.translate('Label.Edit user');
			this.userService.getUser(username).subscribe(response => {
				this.user = response.json();
				this.resetPristine();
				this.utilsService.disabledSelect([document.querySelector('#usernameField')], true, true);
			}, error => { this.utilsService.handle401(error); });
			if (this.user.IsActive === false) { this.wasInactive = true; }
			this.show();
		}
	}

	show() {
		this.properties.isDrawerOpen = true;
		this.properties.hideOverlay = false;
		this.properties.showOverlay = true;
		this.clearFields();
		this.getRoles();
		this.goToTop();
	}

	goToTop() {
		document.querySelector('app-user-add .drawer-content').scrollTop = 0;
	}

	clearFields() {
		this.resetAdd();
		this.utilsService.removeListeners([document.querySelector('#usernameField')], true);
		if (this.authService.currentUser.role === 'RMP_TSA') {
			this.user = {
				BadgeID: '',
				Code: '',
				FirstName: '',
				LastName: '',
				Email: '',
				IsActive: true,
				Password: '',
				Username: '',
				PhoneNumber: '',
				Role: {
					Name: '',
					Id: ''
				},
				ResetPassword: false
			};
		} else if (this.authService.currentUser.role === 'RMP_RSA') {
			this.user = {
				FirstName: '',
				LastName: '',
				Email: '',
				IsActive: true,
				Password: '',
				Username: '',
				PhoneNumber: '',
				ResetPassword: false
			};
		}
		this.wasInactive = false;
		this.roles = [];
		this.resetPristine();
		this.resetExists();
	}

	trimFields() {
		Object.keys(this.user).forEach(key => {
			if (key !== 'IsActive' && key !== 'ResetPassword') {
				if (key === 'Role') {
					Object.keys(this.user[key]).forEach(k => {
						this.user[key][k] = this.user[key][k].trim();
					});
				} else {
					this.user[key] = this.user[key].trim();
				}
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.user)) {
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
				} else { this.utilsService.closeDrawer(this.properties); this.roles = []; }

			});
		} else {
			this.utilsService.closeDrawer(this.properties);
			this.roles = [];
		}
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.user);
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			this.addAnother = addAnother;
			console.log('user to save is: ', this.user);
			if (this.properties.rowID === '') {
				this.userService.createUser(JSON.stringify(this.user)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 409) {
						this.userService.usernameExists = true; this.saveForm(); return;
					} else if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.userService.updateUser(this.user.Username, JSON.stringify(this.user)).subscribe(response => {
					this.saveOnComplete(response);
				}, error => {
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
		console.log('response from save: ', response);
		if (response.status === 200) {
			if (this.addAnother) {
				this.onSave.emit(true);
				this.utilsService.openSnackBar(`${this.translation.translate('Label.User added')}`);
			}
			if (!this.addAnother) {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.roles = [];
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.User added')}`);
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.roles = [];
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.User saved')}`);
				}
			}
			this.sendEmail();
			this.userService.getUsers();
			this.clearFields();
		} else {
			this.utilsService.showError(`${this.translation.translate('Label.User')} ${this.user.Name} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	checkForm(addAnother) { // check all fields are complete
		if (this.saveForm()) {
			if (this.authService.currentUser.role === 'RMP_TSA') {
				if (this.user.Role.Id === '') {
					this.user.IsActive = false;
				}
			}
			this.save(addAnother);
		} else {
			this.goToTop();
		}
	}

	blur() {
		this.user.PhoneNumber = this.phonePipe.transform(this.user.PhoneNumber);
	}

	getRoles() {
		if (this.authService.currentUser.role.indexOf('TSA') > -1) {
			this.activeEntitiesService.getActiveRoles().subscribe(response => {
				const allRoles = response.json();
				allRoles.forEach(role => {
					this.roles.push({ Name: role.Name, Id: role.Id });
				});
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`${this.translation.translate('Error.Could not get roles')} ${error.statusText}, ${this.translation.translate('Label.error')} ${error.status}`);
				}
			});
		}
	}

	resetExists() {
		this.userService.usernameExists = false;
	}


	setRoleId(id) {
		this.user.Role.Id = id;
	}

	sendEmail() {
		this.tenantService.getTenant(this.authService.currentUser.tenantId).subscribe(response => {
			const tenant = response.json();
			const tenantName = tenant.Name;
			const subdomain = tenant.Subdomain;
			const body = '<html><body>' +
				'<div style="width:100%;height:117px;background:#E6E6E6;text-align:center;"><img src="assets/eMyLabCollect.com.svg" class="eMyLabCollect" /></div>' +
				`<p>Hi ${this.user.FirstName} ${this.user.LastName},</p>` +
				`<p>You have been registered as a user of eMyLabCollect.com by ${tenantName}. Your username and password are as follows:</p>` +
				`<p><strong>Username:</strong> ${this.user.Username}.</p>` +
				`<p><strong>Password:</strong> [password]</p>` +
				`<p>Please click <a href='https://${subdomain}.emylabcollect.com'>${subdomain}.eMyLabCollect.com</a> to sign into the system. </p>` +
				`<p>Kind Regards,` +
				`<p>eMyLabCollect.com` +
				'</body></html>';
		});
	}
}
