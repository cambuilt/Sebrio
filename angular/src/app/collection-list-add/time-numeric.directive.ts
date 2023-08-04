import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[timeNumeric]'
})
export class TimeNumericDirective {
	private specialKeys: Array<string> = ['Tab', 'End', 'Home', 'ArrowRight', 'ArrowLeft'];
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
