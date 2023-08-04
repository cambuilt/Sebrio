import { Directive, ElementRef, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[dollarSign]'
})
export class DollarSignDirective {

	@Output() ngModelChange: EventEmitter<any> = new EventEmitter();
	private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowRight', 'ArrowLeft'];
	private reg = new RegExp('^[\.0-9]$');

	constructor(private model: NgModel, private el: ElementRef) {
	}

	@HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
		if (this.specialKeys.indexOf(event.key) !== -1) {
			return;
		}
		if (!(event.key).match(this.reg)) {
			event.preventDefault();
		}
	}

	@HostListener('keyup', ['$event']) onKeyUp(event) {
		this.valueChange(event);
	}

	@HostListener('focus', ['$event']) onFocus(event) {
		this.valueChange(event);
	}

	valueChange(event) {
		if (event.target.selectionStart === 0 && event.target.selectionEnd === event.target.value.length && event.keyCode === 8) {
			this.ngModelChange.emit('');
		} else {
			let newVal = parseFloat(`${event.target.value.replace(/[^0-9]/g, '') / 100}`).toFixed(2);
			if (newVal.length == 0) {
				newVal = '';
			} else {
				newVal = newVal;
			}
			if (newVal.indexOf('$') < 0) {
				newVal = `$${newVal}`;
			}
			this.model.valueAccessor.writeValue(newVal);
			this.ngModelChange.emit(newVal);
		}
	}
}
