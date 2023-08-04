import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { ErrorGenerateDirective } from './error-generate.directive';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[emailValidator]',
	providers: [{ provide: NG_VALIDATORS, useExisting: EmailValidationDirective, multi: true }]
})
export class EmailValidationDirective extends ErrorGenerateDirective implements Validator {
	@Input() isRequired: boolean;

	validate(c: FormControl): ValidationErrors {
		let message: any;
		let isValid = false;
		const email = c.value;
		let pieces: any;
		if (c.dirty) {
			if (email !== null) {
				pieces = email.split('@');
			}
			if (email === null && this.isRequired) {
				message = {
					'message': this.translation.translate('Label.Email is required')
				};
			} else if (email === null && !this.isRequired) {
				isValid = true;
			} else if (email !== null && pieces.length !== 2) {
				message = {
					'message': this.translation.translate('Label.Email address is invalid')
				};
			} else if (email !== null) {
				pieces = pieces.join('').split('.');
				if (pieces.length < 2) {
					message = {
						'message': this.translation.translate('Label.Email address is invalid')
					};
				} else {
					isValid = true;
				}
			}
		} else {
			isValid = true;
		}

		return isValid ? null : message;
	}

}
