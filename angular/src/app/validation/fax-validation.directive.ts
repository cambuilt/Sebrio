import { Directive, HostListener, Input } from '@angular/core';
import { FormControl, ValidationErrors, NG_VALIDATORS, Validator } from '../../../node_modules/@angular/forms';
import { ErrorGenerateDirective } from './error-generate.directive';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[faxValidator]',
	providers: [{ provide: NG_VALIDATORS, useExisting: FaxValidationDirective, multi: true }]
})
export class FaxValidationDirective extends ErrorGenerateDirective implements Validator {
	@Input() required: boolean;

	validate(c: FormControl): ValidationErrors {
		let message: any;
		const phone = c.value;
		let isValid = false;

		if (c.dirty) {
			if (phone !== null) {
				if (phone.length > 13) {
					isValid = true;
				} else {
					message = {
						'message': this.translation.translate('Label.Fax number must be 10 digits')
					};
					isValid = false;
				}
			} else if (this.required) {
				message = {
					'message': this.translation.translate('Label.Fax number is required')
				};
				isValid = false;
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
