import { Directive, HostListener } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[ngModel][subdomainForm]',
	providers: [{ provide: NG_VALIDATORS, useExisting: SubdomainFormDirective, multi: true }]
})
export class SubdomainFormDirective implements Validator {
	isValid = true;
	message: any;
	subdomain: any;
	form: FormControl;
	subscription: any;
	validateTimer: any;
	private specialCharacters = new RegExp(/[\s`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi);

	constructor() { }

	validate(c: FormControl): ValidationErrors {
		return this.isValid ? null : this.message;
	}

	@HostListener('keydown', ['$event']) onInputChange(event) {
		this.isValid = true;
		if ((event.key).match(this.specialCharacters)) {
			event.preventDefault();
		} else if (event.key === 'Space') {
			event.preventDefault();
		}
	}
}
