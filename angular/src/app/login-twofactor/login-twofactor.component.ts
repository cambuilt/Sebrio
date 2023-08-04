import { Component, OnInit, ViewChild, AfterViewInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { MatDialog } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { NgModel } from '@angular/forms';
import { TranslationService } from 'angular-l10n';
import * as moment from 'moment';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'app-login-twofactor',
  	templateUrl: './login-twofactor.component.html',
  	styleUrls: ['./login-twofactor.component.css']
})

export class LoginTwofactorComponent implements OnInit, AfterViewInit {
	objectForm = [];
	code = '';
	username = '';
	password = '';
	urlRole = '';
	token = '';
	@ViewChild('securityCode') securityCode: NgModel;
	@ViewChild('securityCodeForm') securityCodeForm: NgModel;
	invalidSecurityCode: any = { value: false };

	constructor(public authService: AuthService, private utilsService: UtilsService, public securityCodeFormError: MatDialog,
		public dialogRef: MatDialogRef<LoginTwofactorComponent>, public translation: TranslationService, @Inject(MAT_DIALOG_DATA) public data: any) { }

	ngAfterViewInit() {
		this.username = this.data.username;
		this.password = this.data.password;
		this.code = this.data.code;
		this.urlRole = this.data.urlRole;
		this.token = this.data.token;
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	ngOnInit() {
	}

	onSignIn() {
		const date = this.code === 'dateTechCode' ?  moment().format('MMDDYYYY') : '';
		const auth = `${date}${this.securityCode}`;

		this.authService.login(this.urlRole, this.username, this.password, this.token, auth).subscribe(response => {
			const json = response.json();
			if (response.status === 200) {
				this.data = this.securityCode;
				this.dialogRef.close();
			} else {
				this.invalidSecurityCode.value = true;
				this.securityCodeForm.control.markAsDirty();
				this.securityCodeForm.control.updateValueAndValidity();
				this.securityCodeForm.control.markAsTouched();
			}
		}, error => {
			this.invalidSecurityCode.value = true;
			this.securityCodeForm.control.markAsDirty();
			this.securityCodeForm.control.updateValueAndValidity();
			this.securityCodeForm.control.markAsTouched();
		});
		return;
	}

	handleEnter(event) {
		if (event.code === 'Enter' || event.code === 'NumpadEnter') {
			this.onSignIn();
		}
	}

	updateRecentlyUsed() {

	}
}
