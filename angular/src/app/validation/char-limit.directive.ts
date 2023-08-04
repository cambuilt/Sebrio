import { Directive, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[charLimit]'
})
export class CharLimitDirective {
	@Input() maximumLength: number;
	@Output() ngModelChange: EventEmitter<any> = new EventEmitter();

	constructor(private model: NgModel) { }

	@HostListener('keyup', ['$event']) onInputChange(event) {
		this.ngModelChange.emit(this.model.value.substring(0, Math.min(this.maximumLength, this.model.value.length)));
	}
}
