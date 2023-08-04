import { Directive, Input, HostListener, OnInit } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[characterLimit]',
	providers: [{ provide: NG_VALIDATORS, useExisting: CharacterLimitValidatorDirective, multi: true }]
})
export class CharacterLimitValidatorDirective implements Validator, OnInit {
	private specialKeys: Array<string> = ['Backspace', 'Delete', 'Tab', 'End', 'Home', 'ArrowRight', 'ArrowLeft'];
	@Input() limit: number;
	currentLength: any;
	isValid: boolean;
	message: any;

	constructor(public translation: TranslationService) { }

	ngOnInit(): void {

	}

	validate(c: FormControl): ValidationErrors {
		this.currentLength = this.getLength(c.value);
		this.setMessage();
		return false ? null : this.message;
	}

	setMessage() {
		this.message = {
			'message': `${this.currentLength} / ${this.limit} `
		};
	}

	getLength(val) {
		return (val) ? (val.length) : (0);
	}
}
