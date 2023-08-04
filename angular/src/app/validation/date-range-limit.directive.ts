import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '@angular/forms';
import { TranslationService } from 'angular-l10n';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[dateRangeLimit]',
	providers: [{ provide: NG_VALIDATORS, useExisting: DateRangeLimitDirective, multi: true }]
})
export class DateRangeLimitDirective implements Validator {
	@Input() otherDate: any;

	constructor(public translation: TranslationService) { }

	validate(c: FormControl): ValidationErrors {
		let message = {
			'message': ''
		};
		let isValid = false;

		if (c.dirty) {
			if ((c.value === null || c.value === '') && (this.otherDate === null || this.otherDate === '')) {
				isValid = true;
			} else if (c.value === null || c.value === '' || this.otherDate === null || this.otherDate === '') {
				message = {
					'message': this.translation.translate('Error.Both dates are required')
				};
				isValid = false;
			} else {
				const fromDate: any = new Date(c.value);
				const toDate: any = new Date(this.otherDate);
				if (Math.abs(toDate - fromDate) > 604800000) {
					message = {
						'message': this.translation.translate('Error.Time span cannot exceed one week')
					};
					isValid = false;
				} else {
					isValid = true;
				}
			}

			return isValid ? null : message;
		}
	}
}
