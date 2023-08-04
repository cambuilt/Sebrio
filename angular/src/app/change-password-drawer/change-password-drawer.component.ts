import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { MatDialog } from '@angular/material';
import { NgModel } from '@angular/forms';
import { TranslationService } from 'angular-l10n';

@Component({
	selector: 'app-change-password-drawer',
	templateUrl: './change-password-drawer.component.html',
	styleUrls: ['./change-password-drawer.component.css']
})

export class ChangePasswordDrawerComponent implements OnInit, AfterViewInit {
	private visible = 'visible';
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
		public translation: TranslationService) { }

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
		this.username = this.authService.currentUser.username;
	}

	show() {
		this.isDrawerOpen = true;
		this.clearFields();
		this.goToTop();
		const fisrtField: HTMLInputElement = document.querySelector('#oldPassword');
		fisrtField.focus();
	}

	goToTop() {
		document.querySelector('app-change-password-drawer .drawer-content').scrollTop = 0;
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.utilsService.closeSnackBar();
	}

	clearFields() {
		this.resetAdd();
		this.oldPassword = '';
		this.newPassword = '';
		this.confirmPassword = '';
	}

	onChangePassword() {
		if (this.utilsService.checkOnlineStatus()) {
			if (this.saveForm()) {
				const info = { Username: this.username, OldPassword: this.oldPassword, NewPassword: this.confirmPassword };
				if (this.utilsService.invalidPassword(this.newPassword)) {
					this.utilsService.showError(this.translation.translate('Label.The new password must contain at least 1 upper case letter, 1 number, 1 symbol, and must be of at least 8 characters in length'));
					return;
				}
				if (this.newPassword !== this.confirmPassword) {
					this.utilsService.showError(this.translation.translate('Label.The passwords do not match, please correct this'));
					return;
				} else {
					this.authService.changePassword(JSON.stringify(info)).subscribe(response => {
						if (response.status === 200) {
							this.utilsService.openPwdSnackBar(this.translation.translate('Label.Password changed successfully'));
							this.closeDrawer();
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
