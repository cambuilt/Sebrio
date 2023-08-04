import { Directive, Input, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '@angular/forms';
import { TranslationService } from 'angular-l10n';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[timeRangeValidator]',
	providers: [{ provide: NG_VALIDATORS, useExisting: TimeRangeValidatorDirective, multi: true }]
})
export class TimeRangeValidatorDirective implements Validator {
	@Output() ngModelChange: EventEmitter<any> = new EventEmitter();
	private numbers = new RegExp('^[0-9]$');
	@Input() timeType: any;
	@Input() otherTime: any;
	isValid = true;
	message: any;
	form: any;

	constructor(private el: ElementRef, public translation: TranslationService) { }

	validate(c: FormControl): ValidationErrors {
		if (this.form === undefined) {
			this.form = c;
		}
		if ((c.value !== '' && c.value !== null) && this.otherTime !== '') {
			if (this.timeStringToNumber(c.value) < this.timeStringToNumber(this.otherTime)) {
				this.isValid = false;
				this.message = {
					'message': 'Time to must be after Time from'
				};
			} else {
				this.isValid = true;
			}
		} else {
			if (this.message) {
				if (this.message.message === 'Time to must be after Time from') {
					this.isValid = true;
				}
			}

		}
		return this.isValid ? null : this.message;
	}

	timeStringToNumber(timeString) {
		if (timeString !== null) {
			const pieces = timeString.split(':');
			return (parseInt(pieces[0], 10) * 60 + parseInt(pieces[0], 10));
		} else { return 0; }
	}

	@HostListener('keydown', ['$event']) onInputChange(event) {
		this.isValid = true;
		if ((event.key).match(this.numbers)) {
			let newString = event.target.value.split(':').join('');
			newString = newString.substring(1, 4) + event.key; // drop first char, add key at end
			newString = newString.substring(0, 2) + ':' + newString.substring(2, 4); // join halves on colon
			this.ngModelChange.emit(newString);
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
		this.form.updateValueAndValidity();
		this.ngModelChange.emit(digits.join(':'));
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
