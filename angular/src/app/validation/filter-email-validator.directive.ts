import { Directive, HostListener, Input } from '@angular/core';
import { Validator, NG_VALIDATORS, FormControl, ValidationErrors } from '../../../node_modules/@angular/forms';
import { ErrorGenerateDirective } from './error-generate.directive';
import { TranslationService } from 'angular-l10n';
import { AuthService } from '../services/auth.service';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[filterEmailValidator]',
	providers: [{ provide: NG_VALIDATORS, useExisting: FilterEmailValidatorDirective, multi: true }]
})
export class FilterEmailValidatorDirective implements Validator {
	@Input() isRequired: boolean;
	isValid: boolean;
	message: any;
	form: FormControl;
	value: any;

	constructor(public translation: TranslationService, private authService: AuthService) { }

	validate(c: FormControl): ValidationErrors {
		if (this.form === undefined) {
			this.form = c;
		}
		if (c.dirty) {
			this.evaluateValidity();
		}
		if (this.isValid === false && (c.value === '' || c.value === null)) {
			this.isValid = true;
		}
		return this.isValid ? null : this.message;
	}

	evaluateValidity() {
		if (this.value) {
			if (this.value.length === 0 || this.value === null) {
				this.isValid = true;
			} else {
				let pieces = this.value.split('@');
				if (pieces.length !== 2) {
					this.isValid = false;
					this.message = {
						'message': this.translation.translate('Label.Email address is invalid')
					};
				} else {
					pieces = pieces.join('').split('.');
					if (pieces.length < 2) {
						this.isValid = false;
						this.message = {
							'message': this.translation.translate('Label.Email address is invalid')
						};
					} else {
						this.isValid = true;
					}
				}
			}
		} else {
			this.isValid = true;
		}
	}

	@HostListener('keyup', ['$event']) onInputChange(event) {
		if (this.form !== undefined) {
			this.value = event.target.value;
			this.updateForm();
		}
	}

	@HostListener('blur', ['$event']) onBlur(event) {
		if (this.form !== undefined) {
			this.value = event.target.value;
			this.updateForm();
		}
	}

	updateForm() {
		this.form.updateValueAndValidity();
	}

}
