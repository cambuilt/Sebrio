import { Directive, HostListener } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { AuthService } from '../services/auth.service';
import { TranslationService } from 'angular-l10n';
import { UserService } from '../services/user.service';

@Directive({
	selector: '[appUsernameValidation]',
	providers: [{ provide: NG_VALIDATORS, useExisting: UsernameDirective, multi: true }]
})
export class UsernameDirective implements Validator {
	isValid = true;
	message: any;
	username: any;
	form: FormControl;
	subscription: any;
	validateTimer: any;

	constructor(private userService: UserService, private translation: TranslationService, private authService: AuthService) { }

	validate(c: FormControl): ValidationErrors {
		this.form = c;
		this.username = c.value;
		if (c.dirty) {
			if (!this.username) {
				this.message = {
					'message': this.translation.translate('Label.Username is required')
				};
				this.isValid = false;
			} else if (this.userService.usernameExists === true) {
				this.message = {
					'message': this.translation.translate('Label.This username already exists')
				};
				this.isValid = false;
			} else {
				this.isValid = true;
			}
		} else {
			this.isValid = true;
		}
		return this.isValid ? null : this.message;
	}

	@HostListener('blur', ['$event']) onInputChange(event) {
		// const currentPage = location.href.split('/')[3];
		// this.checkUser();
	}

	activateForm() {
		if (this.username) {
			this.form.markAsDirty();
			this.form.markAsTouched();
			this.form.updateValueAndValidity();
		}
	}

	processUserResponse(response, username) {
		if (this.username !== '' && this.username !== undefined && this.username !== null) {
			let res = (response.map(row => row.Username.toLowerCase()));
			res = res.filter(row => (row === this.username.toLowerCase()));
			if (res.length === 1) {
				this.message = {
					'message': this.translation.translate('Label.This username already exists')
				};
				this.isValid = false;
				this.activateForm();
			} else {
				this.isValid = true;
				this.activateForm();
			}
		}
	}

	checkUser() {
		this.userService.getUsers();
		this.userService.users.subscribe(response => {
			this.processUserResponse(response, true);
		});
	}

}
