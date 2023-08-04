import { Directive, ElementRef, HostListener, EventEmitter, Output, Input } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import * as moment from 'moment';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[ngModel][previousTime]',
	providers: [{ provide: NG_VALIDATORS, useExisting: PreviousTimeDirective, multi: true }]
})
export class PreviousTimeDirective implements Validator {
	@Output() ngModelChange: EventEmitter<any> = new EventEmitter();
	@Input() date: any;
	private numbers = new RegExp('^[0-9]$');
	isValid = true;
	message: any;
	form;
	name = 'PreviousTimeDirective';

	constructor(private el: ElementRef, public translation: TranslationService) { }

	@HostListener('keydown', ['$event']) onInputChange(event) {
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
		this.checkFormatting(digits);
	}

	checkFormatting(digits) {
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
		if (digits[0] > 24) {
			digits[0] = digits[1] = 0;
			this.displayError('military');
		} else {
			digits[0] = digits[0] % 24;
		}
		digits[0] = digits[0].toString();
		digits[1] = digits[1].toString();
		if (digits[0].length < 2) { // Zero pad upper digits
			digits[0] = '0' + digits[0].toString();
		}
		if (digits[1].length < 2) { // Zero pad lower digits
			digits[1] = '0' + digits[1].toString();
		}
		this.checkDate(digits.join(':'));

		this.ngModelChange.emit(digits.join(':'));
	}

	checkDate(timeString) {
		if (this.date !== undefined) {
			if (moment(`${this.date.format('Y-MM-DD')}:${timeString}`, 'Y-MM-DD:HH:mm').isBefore(moment())) {
				this.displayError('tooEarly');
			}
		}
	}

	outsideCheckDate() {
		if (this.form !== undefined && this.form.value !== undefined) {
			this.isValid = true;
			this.checkDate(this.form.value);
			this.activateForm();
		}
	}

	validate(c: FormControl): ValidationErrors {
		this.form = c;
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
		} else if (slug === 'tooEarly') {
			this.message = {
				'message': 'Later time is required.'
			};
		}
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
