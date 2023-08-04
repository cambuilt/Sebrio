import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[numeric]'
})
export class NumericDirective {
	private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowRight', 'ArrowLeft'];
	private reg = new RegExp('^[0-9]$');

	constructor(private element: ElementRef) { }
	@HostListener('keydown', ['$event'])
	onKeyDown(event: KeyboardEvent) {
		if (this.specialKeys.indexOf(event.key) !== -1) {
			return;
		}
		if (!(event.key).match(this.reg)) {
			event.preventDefault();
		}
	}

}
