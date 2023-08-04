import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[volume]'
})
export class VolumeDirective {
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
		} else if (this.checkDecimals(event) && event.key === '.') {
			event.preventDefault();
		}
	}

	checkDecimals(evt) {
		return (evt.target.value.includes('.')) ? true : false;
	}

	@HostListener('change', ['$event']) onChange(event) {
		this.volumeChange(event);
	}

	@HostListener('keyup', ['$event']) onKeyUp(event) {
		this.volumeChange(event);
	}

	@HostListener('blur', ['$event']) onBlur(event) {
		this.fixBadDecimal(event);
	}

	fixBadDecimal(evt) {
		if (this.checkDecimals(evt)) {
			const decimalPos = evt.target.value.split('m').join('').split('l').join('').search(/\./);
			const valueLength = evt.target.value.split('m').join('').split('l').join('').length;
			if (valueLength === 1 && decimalPos === 0) {
				evt.target.value = '';
			} else if (valueLength && (decimalPos === valueLength - 1)) {
				evt.target.value = evt.target.value.split('m').join('').split('l').join('').split(/\./).join('') + 'ml';
			} else if (valueLength && (decimalPos === 0)) {
				evt.target.value = '0' + evt.target.value.split('m').join('').split('l').join('') + 'ml';
			}
		}
	}

	volumeChange(event) {
		event.target.value = event.target.value.split('m').join('').split('l').join('').replace(/\.\D/g, '') + 'ml';
		if (event.target.value.length < 3) {
			event.target.value = '';
			this.ngModelChange.emit('');
		} else if (event.target.setSelectionRange) {
			if (event.target.selectionStart > (event.target.value.length - 2)) {
				event.target.setSelectionRange(event.target.value.length - 2, event.target.value.length - 2);
			}
		}
		this.model.valueAccessor.writeValue(event.target.value);
		this.ngModelChange.emit(event.target.value);
	}

}
