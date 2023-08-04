import { Directive, Input, HostListener, OnInit } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[restrictByWidth]',
	providers: [{ provide: NG_VALIDATORS, useExisting: RestrictByWidthDirective, multi: true }]
})
export class RestrictByWidthDirective implements Validator, OnInit {

	private specialKeys: Array<string> = ['Backspace', 'Delete', 'Tab', 'End', 'Home', 'ArrowRight', 'ArrowLeft'];
	@Input() width: number;
	currentWidth = 0;
	lowercase = [{ keys: [], width: 1 }, { keys: [], width: 2 }, { keys: ['i', 'j', 'l', '\''], width: 3 }, { keys: ['f', 't', '[', ']', '/', '\\'], width: 4 }, { keys: ['s', 'r', '`', ' ', '"', '(', ')', '{', '}'], width: 5 },
	{ keys: ['k', 'v', '*'], width: 6 }, { keys: ['c', 'x', 'y', 'z', '^'], width: 7 }, { keys: ['<', '>', 'a', 'b', 'd', 'e', 'g', 'h', 'n', 'o', 'p', 'q', 'u', 'J'], width: 8 },
	{ keys: ['&'], width: 9 }, { keys: ['C', 'D', 'H', 'N', 'R', 'U'], width: 10 }, { keys: ['w', 'G', 'O', 'Q'], width: 11 },
	{ keys: ['m', 'M'], width: 11.5 }, { keys: ['%', 'W'], width: 13 }, { keys: ['@'], width: 15 }];
	uppercase = 'ABEFKLPSTVXYZ';
	uppercaseCharsWidth = 9;
	numbers = '0123456789';
	numbersWidth = 8;
	smallSymbols = 'I,.|!:;';
	smallSymbolsWidth = 3.75;
	otherSymbols = '~#$_+-=?';
	otherSymbolsWidth = 8;
	chars = [];
	otherCharWidth = 15;

	constructor() { }

	ngOnInit(): void {
		this.chars = this.chars.concat(this.lowercase);
		const uppercaseChars = [];
		this.uppercase.split('').forEach(char => {
			uppercaseChars.push(char);
		});
		const numbers = [];
		this.numbers.split('').forEach(char => {
			numbers.push(char);
		});
		const smallSymbols = [];
		this.smallSymbols.split('').forEach(char => {
			smallSymbols.push(char);
		});
		const otherSymbols = [];
		this.otherSymbols.split('').forEach(char => {
			otherSymbols.push(char);
		});
		this.chars = this.chars.concat([{ keys: uppercaseChars, width: this.uppercaseCharsWidth }]);
		this.chars = this.chars.concat([{ keys: numbers, width: this.numbersWidth }]);
		this.chars = this.chars.concat([{ keys: smallSymbols, width: this.smallSymbolsWidth }]);
		this.chars = this.chars.concat([{ keys: otherSymbols, width: this.otherSymbolsWidth }]);
	}

	validate(c: FormControl): ValidationErrors {
		this.calculateWidth(c.value);
		return true ? null : null;
	}

	calculateWidth(string) {
		this.currentWidth = 0;
		if (string !== null) {
			console.log(string.split(''));
			string.split('').forEach(char => {
				const charVal = this.chars.filter(c => c.keys.indexOf(char) !== -1)[0];
				if (charVal) {
					this.currentWidth = this.currentWidth + charVal.width;
				} else {
					this.currentWidth = this.currentWidth + this.otherCharWidth;
				}
			});
		}
	}

	@HostListener('keydown', ['$event'])
	onKeyDown(event: KeyboardEvent) {
		if (this.specialKeys.indexOf(event.key) !== -1) {
			return;
		}
		const charVal = this.chars.filter(c => c.keys.indexOf(event.key) !== -1)[0];
		if (charVal) {
			if (!((this.currentWidth + charVal.width) < this.width)) {
				event.preventDefault();
			}
		} else {
			if (!((this.currentWidth + this.otherCharWidth) < this.width)) {
				event.preventDefault();
			}
		}
	}
}
