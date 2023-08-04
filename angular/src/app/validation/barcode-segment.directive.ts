import { Directive, ElementRef, HostListener } from '@angular/core';
import { Validator, NG_VALIDATORS, FormControl, ValidationErrors } from '@angular/forms';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[barcodeSegment]'
})
export class BarcodeSegmentDirective {
	private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowRight', 'ArrowLeft'];
	private reg = new RegExp('^[0-9]$');

	constructor(private element: ElementRef) { }

	@HostListener('keydown', ['$event'])
	onKeyDown(event) {
		if (this.specialKeys.indexOf(event.key) !== -1) {
			return;
		}
		if (!(event.key).match(this.reg)) {
			if ((event.key) !== '*') {
				event.preventDefault();
			} else if (event.target.value.length && !(event.target.selectionStart === 0 && event.target.selectionEnd === event.target.value.length)) {
				event.preventDefault();
			}
		} else {
			if (event.target.value === '*' && !(event.target.selectionStart === 0 && event.target.selectionEnd === event.target.value.length)) {
				event.preventDefault();
			}
		}
	}
}
