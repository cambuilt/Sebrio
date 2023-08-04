import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '@angular/forms';
import { TranslationService } from 'angular-l10n';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[securityCodeValidation]',
	providers: [{ provide: NG_VALIDATORS, useExisting: SecurityCodeValidationDirective, multi: true }]
})
export class SecurityCodeValidationDirective implements Validator {
	@Input() invalidSecurityCode: any;

	constructor(public translation: TranslationService) { }

	validate(c: FormControl): ValidationErrors {
		let message = {
			'message': ''
		};
		let isValid = false;

		if (c.dirty) {
			if (this.invalidSecurityCode.value === true) {
				message = {
					'message': this.translation.translate('Label.Incorrect security code')
				};
				isValid = false;
			} else {
				isValid = true;
			}

			return isValid ? null : message;
		}
	}

}
