import { Directive, Input, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { ErrorGenerateDirective } from './error-generate.directive';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[genericRequired]',
	providers: [{ provide: NG_VALIDATORS, useExisting: GenericRequiredValidationDirective, multi: true }]
})
export class GenericRequiredValidationDirective extends ErrorGenerateDirective implements Validator {
	@Input() forcedName: any;
	private elementName: string;

	validate(c: FormControl): ValidationErrors {
		let validObject;
		if (this.forcedName !== null && this.forcedName !== undefined) {
			validObject = this.genericValidate(c, this.forcedName);
		} else {
			validObject = this.genericValidate(c, this.getElementPlaceholder());
		}
		return validObject.isValid ? null : validObject.message;
	}

	genericValidate(c: FormControl, name: string) {
		const returnObject = {
			message: {
				'message': ''
			},
			isValid: false
		};
		const field = c.value;
		if (c.dirty) {
			if (field !== null && field !== undefined && field !== '') {
				if (field.length === 0) {
					returnObject.message = {
						'message': name + ' ' + this.translation.translate('Label.is required')
					};
					returnObject.isValid = false;
				} else {
					returnObject.isValid = true;
				}
			} else {
				returnObject.message = {
					'message': name + ' ' + this.translation.translate('Label.is required')
				};
				returnObject.isValid = false;
			}
		} else {
			returnObject.isValid = true;
		}
		return returnObject;
	}

}
