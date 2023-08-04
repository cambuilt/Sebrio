import { Component, OnInit, ViewChild, AfterViewInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { MatDialog } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { NgModel } from '@angular/forms';
import { TranslationService } from 'angular-l10n';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.css']
})

export class ChangePasswordComponent implements OnInit, AfterViewInit {
	isDrawerOpen = false;
	newPassword: string;
	confirmPassword: string;
	username: string;
	oldPassword: string;
	recentlyUsed: any = {
		value: false
	};
	objectForm = [];
	@ViewChild('oldPasswordForm') oldPasswordForm: NgModel;
	@ViewChild('newPasswordForm') newPasswordForm: NgModel;
	@ViewChild('confirmPasswordForm') confirmPasswordForm: NgModel;

	constructor(public authService: AuthService, private utilsService: UtilsService, public changePwdError: MatDialog,
		public dialogRef: MatDialogRef<ChangePasswordComponent>, public translation: TranslationService, @Inject(MAT_DIALOG_DATA) public data: any) { }

	ngAfterViewInit() {
		this.objectForm.push(this.oldPasswordForm);
		this.objectForm.push(this.newPasswordForm);
		this.objectForm.push(this.confirmPasswordForm);
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	@HostListener('window:keyup', ['$event'])
	keyEvent(event: KeyboardEvent) {
		console.log(event);
		if (event.keyCode === 13) {
			this.onChangePassword();
		}
	}

	saveForm() {
		let formValid = true;
		this.objectForm.forEach(c => {
			c.control.markAsDirty();
			c.control.markAsTouched();
			c.control.updateValueAndValidity();
			if (!c.valid) {
				formValid = false;
			}
		});
		return formValid;
	}

	ngOnInit() {
		this.username = this.data.username;
	}

	clearFields() {
		this.resetAdd();
		this.oldPassword = '';
		this.newPassword = '';
		this.confirmPassword = '';
	}

	onChangePassword() {
		if (this.saveForm()) {
			const info = { Username: this.username.trim(), OldPassword: this.oldPassword.trim(), NewPassword: this.confirmPassword.trim() };
			if (this.utilsService.invalidPassword(this.newPassword.trim())) {
				this.utilsService.showError(this.translation.translate('Label.The new password must contain at least 1 upper case letter, 1 number, 1 symbol, and must be of at least 8 characters in length'));
				return;
			}
			if (this.newPassword.trim() !== this.confirmPassword.trim()) {
				this.utilsService.showError(this.translation.translate('Label.The passwords do not match, please correct this'));
				return;
			} else {
				this.authService.changePassword(JSON.stringify(info)).subscribe(response => {
					if (response.status === 200) {
						this.data.password = this.confirmPassword;
						this.utilsService.openPwdSnackBar(this.translation.translate('Label.Password changed successfully'));
						this.dialogRef.close();
						this.clearFields();
					} else {
						this.utilsService.showError(this.translation.translate('Label.Error changing password Try again'));
					}
				}, error => {
					if (error.status === 401) {
						this.utilsService.showError(this.translation.translate('Label.Old password is incorrect'));
					} else if (error.status === 400) {
						this.recentlyUsed.value = true;
						this.confirmPasswordForm.control.markAsDirty();
						this.confirmPasswordForm.control.updateValueAndValidity();
					}
				});
			}
		}
	}

	updateRecentlyUsed() {
		if (this.recentlyUsed.value === true) {
			this.recentlyUsed.value = false;
		}
	}

	updateConfirmPassword() {
		if (this.newPasswordForm.control.value !== null && this.confirmPasswordForm.control.value !== null) {
			this.newPasswordForm.control.updateValueAndValidity();
			this.confirmPasswordForm.control.updateValueAndValidity();
		}
	}
}
