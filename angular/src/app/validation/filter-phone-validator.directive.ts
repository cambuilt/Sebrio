import { Directive, HostListener, Input } from '@angular/core';
import { Validator, NG_VALIDATORS, FormControl, ValidationErrors } from '../../../node_modules/@angular/forms';
import { ErrorGenerateDirective } from './error-generate.directive';
import { TranslationService } from 'angular-l10n';
import { AuthService } from '../services/auth.service';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[filterPhoneValidator]',
	providers: [{ provide: NG_VALIDATORS, useExisting: FilterPhoneValidatorDirective, multi: true }]
})
export class FilterPhoneValidatorDirective implements Validator {
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
				if (this.value.length > 13) {
					this.isValid = true;
				} else {
					this.isValid = false;
					this.message = {
						'message': this.translation.translate('Label.Phone number must be 10 digits')
					};
				}
			}
		} else {
			this.isValid = true;
		}
	}

	@HostListener('keyup', ['$event']) onInputChange(event) {
		const e = event.target;
		let digits = e.value.replace(/\D/g, '');
		digits = digits.substring(0, 10);
		if (digits.length === 0) {
			digits = digits;
		} else if (digits.length < 4) {
			digits = '(' + digits;
		} else if (digits.length < 7) {
			digits = '(' + digits.substring(0, 3) + ') ' + digits.substring(3, digits.length);
		} else {
			digits = '(' + digits.substring(0, 3) + ') ' + digits.substring(3, 6) + '-' + digits.substring(6, digits.length);
		}
		e.value = digits;
		if (this.form !== undefined) {
			this.value = e.value;
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
