import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { Validator, FormControl, ValidationErrors, NG_VALIDATORS, NgModel } from '@angular/forms';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[sessionExpire]',
	providers: [{ provide: NG_VALIDATORS, useExisting: SessionExpireDirective, multi: true }]
})
export class SessionExpireDirective implements Validator {
	isValid = true;
	message: any;
	form: any;

	constructor() { }

	validate(c: FormControl): ValidationErrors {
		return this.isValid ? null : this.message;
	}

	public setError() {
		this.isValid = false;
		this.message = {
			'message': `Session Expired`
		};
		this.updateValidity();
	}

	public removeError() {
		this.isValid = true;
		this.updateValidity();
	}

	public loadForm(c) {
		this.form = c;
	}

	updateValidity() {
		if (this.form !== undefined) {
			this.form.control.updateValueAndValidity();
		}
	}
}
