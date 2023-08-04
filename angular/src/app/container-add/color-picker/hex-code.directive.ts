import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl, ValidationErrors } from '@angular/forms';
import { FaxValidationDirective } from 'src/app/validation/fax-validation.directive';
import { TranslationService } from 'angular-l10n';


@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[hexCode]',
	providers: [{ provide: NG_VALIDATORS, useExisting: HexCodeDirective, multi: true }]
})
export class HexCodeDirective implements Validator {

	private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowRight', 'ArrowLeft'];
	private reg = new RegExp('^[A-Fa-f0-9]$');
	form: FormControl;
	value: any;
	isValid: boolean;
	message: any;

	constructor(private element: ElementRef, public translation: TranslationService) { }

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
			if (this.value.split('#').join('').length.length === 0 || this.value.split('#').join('').length === '') {
				this.isValid = true;
			} else {
				if (this.value.split('#').join('').length === 3 || this.value.split('#').join('').length === 6) {
					this.isValid = true;
				} else {
					this.isValid = false;
					this.message = {
						'message': this.translation.translate('Label.Hex must be 3 or 6 characters')
					};
				}
			}
		} else {
			this.isValid = true;
		}
	}


	@HostListener('keydown', ['$event']) onKeyDown(event) {
		if (this.specialKeys.indexOf(event.key) !== -1) {
			return;
		}
		if (!(event.key).match(this.reg)) {
			event.preventDefault();
		}
	}

	@HostListener('keyup', ['$event']) onKeyUp(event) {
		if (this.form !== undefined) {
			this.value = event.target.value;
			this.updateForm();
		}
	}

	updateForm() {
		this.form.updateValueAndValidity();
	}
}
