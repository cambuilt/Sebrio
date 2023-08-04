import { Directive } from '@angular/core';
import { Validator, NG_VALIDATORS, FormControl, ValidationErrors } from '@angular/forms';
import { TranslationService } from 'angular-l10n';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[searchTime]',
	providers: [{ provide: NG_VALIDATORS, useExisting: SearchTimeDirective, multi: true }]
})
export class SearchTimeDirective implements Validator {
	isValid = true;
	message: any;
	form;
	name = 'SearchTimeDirective';

	constructor(public translation: TranslationService) { }

	validate(c: FormControl): ValidationErrors {
		this.form = c;
		return this.isValid ? null : this.message;
	}

	displayError(slug) {
		this.isValid = false;
		if (slug === 'tooEarly') {
			this.message = {
				'message': 'End time must be after Start time.'
			};
		}
		this.activateForm();
	}

	clearError() {
		this.isValid = true;
		this.activateForm();
	}

	activateForm() {
		if (this.form) {
			this.form.markAsDirty();
			this.form.markAsTouched();
			this.form.updateValueAndValidity();
		}
	}

}
