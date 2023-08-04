import { Directive, HostListener, Input } from '@angular/core';
import { Validator, NG_VALIDATORS, FormControl, ValidationErrors } from '../../../node_modules/@angular/forms';
import { ErrorGenerateDirective } from './error-generate.directive';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[phoneValidator]',
	providers: [{ provide: NG_VALIDATORS, useExisting: PhoneValidationDirective, multi: true }]
})
export class PhoneValidationDirective extends ErrorGenerateDirective implements Validator {
	@Input() isRequired: boolean;
	control: FormControl;

	validate(c: FormControl): ValidationErrors {
		let message: any;
		const phone = c.value;
		let isValid = false;
		if (this.control === undefined) {
			this.control = c;
		}

		if (c.dirty) {
			if (phone !== null && phone !== '') {
				if (phone.length > 13) {
					isValid = true;
				} else {
					if (phone.length === 0 && this.isRequired === false) {
						isValid = true;
					} else {
						message = {
							'message': this.translation.translate('Label.Phone number must be 10 digits')
						};
						isValid = false;
					}
				}
			} else if (this.isRequired) {
				message = {
					'message': this.translation.translate('Label.Phone number is required')
				};
				isValid = false;
			} else {
				isValid = true;
			}
		} else {
			isValid = true;
		}

		return isValid ? null : message;
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
	}

}
