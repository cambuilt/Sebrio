import { Component, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { TenantService } from '../services/tenant.service';
import { UserService } from '../services/user.service';
import { PhonePipe } from '../phone.pipe';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '@angular/forms';
import { TranslationService } from 'angular-l10n';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-tenant-add',
	templateUrl: './tenant-add.component.html',
	styleUrls: ['./tenant-add.component.css']
})

export class TenantAddComponent implements AfterViewInit {
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

	tenant: any = {
		Email: '',
		Id: '',
		IsActive: true,
		Name: '',
		PhoneNumber: '',
		Website: '',
		SubDomain: '',
		Location: {
			AddressLine1: '',
			AddressLine2: '',
			City: '',
			Country: 'USA',
			County: '',
			PostalCode: '',
			State: ''
		},
		TSAUser: {
			FirstName: '',
			LastName: '',
			Email: '',
			PhoneNumber: '',
			Username: ''
		},
		Users: []
	};

	objectForm = [];
	@ViewChild('name') name: NgModel;
	@ViewChild('streetAddress1') streetAddress1: NgModel;
	@ViewChild('city') city: NgModel;
	@ViewChild('state') state: NgModel;
	@ViewChild('postalCode') postalCode: NgModel;
	@ViewChild('phone') phone: NgModel;
	@ViewChild('email') email: NgModel;
	@ViewChild('firstName') firstName: NgModel;
	@ViewChild('lastName') lastName: NgModel;
	@ViewChild('username') username: NgModel;
	@ViewChild('emailTSA') emailTSA: NgModel;
	@ViewChild('subdomain') subdomain: NgModel;

	constructor(public utilsService: UtilsService, private tenantService: TenantService, private userService: UserService, private unsavedChangesAlert: MatDialog, private phonePipe: PhonePipe, public translation: TranslationService) { }

	ngAfterViewInit() {
		this.objectForm = [];
		this.objectForm.push(this.name);
		this.objectForm.push(this.streetAddress1);
		this.objectForm.push(this.city);
		this.objectForm.push(this.state);
		this.objectForm.push(this.postalCode);
		this.objectForm.push(this.phone);
		this.objectForm.push(this.email);
		this.objectForm.push(this.subdomain);
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	saveForm() {
		if (this.objectForm.length === 8 && this.headerText === 'Add tenant') {
			this.objectForm.push(this.firstName);
			this.objectForm.push(this.lastName);
			this.objectForm.push(this.username);
			this.objectForm.push(this.emailTSA);
		} else if (this.objectForm.length === 14 && this.headerText === 'Edit tenant') {
			for (let index = 0; index < 6; index++) {
				this.objectForm.pop();
			}
		}

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

	addTenant() {
		this.resetPristine();
		this.headerText = this.translation.translate('Label.Add tenant');
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
		this.ngAfterViewInit();
	}

	editTenant(id: string) {
		if (this.utilsService.checkOnlineStatus()) {
			this.headerText = this.translation.translate('Label.Edit tenant');
			this.tenantService.getTenant(id).subscribe(response => {
				this.tenant = response.json();
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
		document.querySelector('rmp-tenant-add .drawer-content').scrollTop = 0;
	}

	closeDrawer() {
		this.clearFields();
		this.properties.isDrawerOpen = false;
		this.utilsService.closeSnackBar();
	}

	trimFields() {
		Object.keys(this.tenant).forEach(key => {
			if (key !== 'IsActive' && key !== 'Users') {
				if (key === 'Location' || key === 'TSAUser') {
					Object.keys(this.tenant[key]).forEach(k => {
						this.tenant[key][k] = this.tenant[key][k].trim();
					});
				} else {
					this.tenant[key] = this.tenant[key].trim();
				}
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.tenant)) {
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

	resetPristine() {
		this.pristineObject = JSON.stringify(this.tenant);
	}

	formatPhoneNumber($event) {
		$event.target.value = this.phonePipe.transform($event.target.value);
	}

	states() {
		return this.utilsService.states;
	}

	selectState(stateName) {
		this.tenant.Location.State = stateName;
	}

	counties() {
		if (this.tenant.Location.State === '') {
			return [];
		} else {
			return this.utilsService.counties[this.tenant.Location.State];
		}
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			if (this.saveForm()) {
				this.addAnother = addAnother;
				if (this.tenant.Id === '') {
					this.tenantService.createTenant(JSON.stringify(this.tenant)).subscribe(response => {
						this.saveOnComplete(response);
					}, error => {
						if (error.status === 401) {
							this.utilsService.handle401(error);
						} else if (error.status === 409) {
							this.userService.usernameExists = true; this.saveForm(); return;
						} else { this.utilsService.showError(`Error: ${error}`); }
					});
				} else {
					this.tenantService.updateTenant(this.tenant.Name, JSON.stringify(this.tenant)).subscribe(response => { this.saveOnComplete(response); }, error => {
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
			if (this.addAnother) {
				this.onSave.emit(true);
				this.utilsService.openSnackBar(this.translation.translate('Label.Tenant added'));
			}
			if (!this.addAnother) {
				if (this.tenant.Id === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(this.translation.translate('Label.Tenant added'));
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(this.translation.translate('Label.Tenant saved'));
				}
			}
			this.clearFields();
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Tenant')} ${this.tenant.Name} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	resetExists() {
		this.userService.usernameExists = false;
	}


	clearFields() {
		this.utilsService.removeListeners([], false);
		this.resetAdd();
		this.tenant = {
			Email: '',
			Id: '',
			IsActive: true,
			Name: '',
			PhoneNumber: '',
			Website: '',
			SubDomain: '',
			Location: {
				AddressLine1: '',
				AddressLine2: '',
				City: '',
				Country: 'USA',
				County: '',
				PostalCode: '',
				State: ''
			},
			TSAUser: {
				FirstName: '',
				LastName: '',
				Email: '',
				PhoneNumber: '',
				Username: ''
			}
		};
		this.resetPristine();
	}

	setUser(username) {
		this.userService.getUser(username).subscribe(response => {
			const user = response.json();
			this.tenant.TSAUser.FirstName = user.FirstName;
			this.tenant.TSAUser.LastName = user.LastName;
			this.tenant.TSAUser.Email = user.Email;
			this.tenant.TSAUser.PhoneNumber = user.PhoneNumber;
			this.tenant.TSAUser.Username = username;
		});
	}
}
