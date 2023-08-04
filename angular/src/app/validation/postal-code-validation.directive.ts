import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { ErrorGenerateDirective } from './error-generate.directive';
import { TranslationService } from 'angular-l10n';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[postalCodeValidator]',
	providers: [{ provide: NG_VALIDATORS, useExisting: PostalCodeValidationDirective, multi: true }]
})
export class PostalCodeValidationDirective extends ErrorGenerateDirective implements Validator {
	private specialKeys: Array<string> = ['Backspace', 'Delete', 'Tab', 'End', 'Home', 'ArrowRight', 'ArrowLeft'];

	validate(c: FormControl): ValidationErrors {
		let message: any;
		const postalCode = c.value;
		let isValid = false;

		if (c.dirty) {
			if (postalCode !== null) {
				if (postalCode.length !== 5) {
					message = {
						'message': this.translation.translate('Label.Postal code must be 5 digits')
					};
					isValid = false;
				} else {
					isValid = true;
				}
			} else {
				message = {
					'message': this.translation.translate('Label.Postal code is required')
				};
				isValid = false;
			}
		} else {
			isValid = true;
		}

		return isValid ? null : message;
	}

}
