import { Directive, Input, HostListener } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { ErrorGenerateDirective } from './error-generate.directive';
import { AuthService } from '../services/auth.service';
import { timer } from 'rxjs';
import { TranslationService } from 'angular-l10n';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[checkPassword]',
	providers: [{ provide: NG_VALIDATORS, useExisting: CurrentPasswordDirective, multi: true }]
})
export class CurrentPasswordDirective implements Validator {
	@Input() username: any;
	@Input() submitted: any;
	isValid: boolean;
	message: any;
	password: any;
	form: FormControl;
	subscription: any;
	validateTimer: any;

	constructor(public translation: TranslationService, private authService: AuthService) { }

	validate(c: FormControl): ValidationErrors {
		this.form = c;
		this.password = c.value;
		if (c.dirty) {
			if (!this.password) {
				this.message = {
					'message': this.translation.translate('Label.Old password is required')
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

	startTimer() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
		this.validateTimer = timer(500);
		this.subscription = this.validateTimer.subscribe(n => {
			this.timerComplete(n);
		});
	}

	resetTimer() {
		this.startTimer();
	}

	timerComplete(n: any) {
		this.authService.getUserAccountStatus(this.username, this.password.trim()).subscribe(response => {
			if (response.status === 200) {
				this.isValid = true;
				this.activateForm();
			}
		}, error => {
			if (error.status === 401) {
				this.message = {
					'message': this.translation.translate('Label.Password is incorrect')
				};
				this.isValid = false;
				this.activateForm();
			}
		});
	}

	@HostListener('blur', ['$event']) onInputChange(event) {
		this.resetTimer();
	}

	activateForm() {
		if (this.password) {
			this.form.markAsDirty();
			this.form.markAsTouched();
			this.form.updateValueAndValidity();
		}
	}

}
