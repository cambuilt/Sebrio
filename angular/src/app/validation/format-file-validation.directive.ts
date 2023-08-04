import { Directive, HostListener } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { LabelService } from '../services/label.service';
import { AuthService } from '../services/auth.service';

@Directive({
	selector: '[appFormatFileValidation]',
	providers: [{ provide: NG_VALIDATORS, useExisting: FormatFileValidationDirective, multi: true }]
})
export class FormatFileValidationDirective implements Validator {
	isValid = true;
	message: any;
	file: any;
	form: FormControl;
	subscription: any;
	validateTimer: any;

	constructor(private authService: AuthService, public translation: TranslationService, private labelService: LabelService) { }

	validate(c: FormControl): ValidationErrors {
		console.log('authService.displayKeysLength: ', this.authService.displayKeysLength);
		console.log('fileSelelcted: ', this.authService.fileSelected);
		if (this.authService.displayKeysLength < 1 && this.authService.fileSelected === true) {
			this.message = {
				'message': this.translation.translate('Error.Invalid file format')
			};
			this.isValid = false;
		} else {
			this.isValid = true;
		}
		// else {
		// 	this.form = c;
		// 	this.file = c.value;
		// 	console.log('file: ', this.file);
		// 	console.log('c: ', c);
		// 	if (c.dirty) {
		// 		console.log('file: ', this.file);
		// 		if (!this.file) {
		// 			this.message = {
		// 				'message': this.translation.translate('Error.A valid format file is required')
		// 			};
		// 			this.isValid = false;
		// 		} else {
		// 			this.isValid = true;
		// 		}
		// 	} else {
		// 		this.isValid = true;
		// 	}
		// }
		return this.isValid ? null : this.message;
	}

	// @HostListener('change', ['$event']) onInputChange(event) {
	// 	console.log('hostListiner displayKeys: ', this.labelService.displayKeysLength);
	// 	this.checkDisplayKeys();
	// }

	// checkDisplayKeys() {
	// 	console.log('displayKeys: ', this.labelService.displayKeysLength);
	// 		if (this.labelService.displayKeysLength < 1) {
	// 			this.message = {
	// 				'message': this.translation.translate('Error.This is not a valid format file')
	// 			};
	// 			this.isValid = false;
	// 			this.activateForm();
	// 		} else {
	// 			this.isValid = true;
	// 			this.activateForm();
	// 		}
	// }

	activateForm() {
		if (this.file) {
			this.form.markAsDirty();
			this.form.markAsTouched();
			this.form.updateValueAndValidity();
		}
	}


}
