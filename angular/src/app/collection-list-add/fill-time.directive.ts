import { Directive, ElementRef, HostListener, EventEmitter, Output, Input } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[ngModel][fillTime]',
	providers: [{ provide: NG_VALIDATORS, useExisting: FillTimeDirective, multi: true }]
})
export class FillTimeDirective implements Validator {
	@Output() ngModelChange: EventEmitter<any> = new EventEmitter();
	private numbers = new RegExp('^[0-9]$');
	@Input() timeType: any;
	isValid = true;
	message: any;

	constructor(private el: ElementRef, public translation: TranslationService) { }

	@HostListener('keydown', ['$event']) onInputChange(event) {
		console.log(event.key, event.keyCode);
		this.isValid = true;
		if ((event.key).match(this.numbers)) {
			if (event.target.value.length === 0) {
				this.ngModelChange.emit(`00:0${event.key}`);
			} else {
				let newString = event.target.value.split(':').join('');
				newString = newString.substring(1, 4) + event.key; // drop first char, add key at end
				newString = newString.substring(0, 2) + ':' + newString.substring(2, 4); // join halves on colon
				this.ngModelChange.emit(newString);
			}
		} else if (event.key === 'Backspace' || event.keyCode === 8) {
			if (event.target.value.split(':').join('').length === 0) {
				this.ngModelChange.emit('');
			} else if (event.target.selectionStart === 0 && event.target.selectionEnd === 5) {
				this.ngModelChange.emit('');
			} else {
				let backString = event.target.value.split(':').join('');
				backString = `0${backString.substring(0, 1)}:${backString.substring(1, 3)}`;
				this.ngModelChange.emit(backString);
			}
		} else if (event.key !== 'Tab') {
			event.preventDefault();
		}
	}

	@HostListener('focus', ['$event']) onfocus(event) {
		if (event.target.value.length === 0) {
			this.ngModelChange.emit('00:00');
			if (event.target.setSelectionRange) {
				setTimeout(function () { event.target.setSelectionRange(5, 5); }, 1);
			} else {
				setTimeout(function () { event.target.value = event.target.value; }, 1);
			}
		}
	}

	@HostListener('blur', ['$event']) onblur(event) {
		const digits = event.target.value.split(':'); // digits[0] upper, digits[1] lower
		if (digits.join('').length === 0) {
			return;
		}
		if (digits[1] > 59) { // lower digits need to be overflowed
			digits[0] = parseInt(digits[0], 10) + Math.floor(parseInt(digits[1], 10) / 60);
			digits[1] = parseInt(digits[1], 10) % 60;
		}
		if (digits[0] === 100) { // Enforce max length 5, send error
			digits[0] = digits[1] = 0;
			this.displayError('overflow');
		}
		if (this.timeType === 'Military') {
			if (digits[0] > 24) {
				digits[0] = digits[1] = 0;
				this.displayError('military');
			} else {
				digits[0] = digits[0] % 24;
			}
		}
		digits[0] = digits[0].toString();
		digits[1] = digits[1].toString();
		if (digits[0].length < 2) { // Zero pad upper digits
			digits[0] = '0' + digits[0].toString();
		}
		if (digits[1].length < 2) { // Zero pad lower digits
			digits[1] = '0' + digits[1].toString();
		}
		this.ngModelChange.emit(digits.join(':'));
	}

	validate(c: FormControl): ValidationErrors {
		return this.isValid ? null : this.message;
	}

	displayError(slug) {
		this.isValid = false;
		if (slug === 'military') {
			this.message = {
				'message': this.translation.translate('Label.Please input a valid 24-hour time')
			};
		} else if (slug === 'overflow') {
			this.message = {
				'message': this.translation.translate('Label.Input too large')
			};
		}
	}
}
