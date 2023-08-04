import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ColorSliderComponent } from './color-slider/color-slider.component';
import { ColorPaletteComponent } from './color-palette/color-palette.component';
import { attachEmbeddedView } from '@angular/core/src/view';
import { NgModel } from '@angular/forms';

@Component({
	selector: 'app-color-picker',
	templateUrl: './color-picker.component.html',
	styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent implements OnInit {
	@Output() saveColorPicker = new EventEmitter();

	public hue: string;
	public color: string;
	public show: boolean;

	@ViewChild('slider') slider: ColorSliderComponent;
	@ViewChild('palette') palette: ColorPaletteComponent;
	@ViewChild('code') code: NgModel;

	constructor() { }

	resetAdd() {
		this.code.reset();
	}

	saveForm() {
		this.code.control.markAsDirty();
		this.code.control.markAsTouched();
		this.code.control.updateValueAndValidity();
		if (!this.code.valid) {
			console.log(this.code.valid);
			return false;
		} else {
			return true;
		}
	}

	ngOnInit() {
		this.show = false;
	}

	propagateInput() {
		if (this.color) {
			if (this.color.split('#').length === 1) {
				this.updateChildren(`#${this.color}`);
			} else if (this.color.split('#').length === 2) {
				this.updateChildren(`${this.color}`);
			}
		}
	}

	updateChildren(colorString) {
		if (colorString.length === 4) {
			colorString = `#${colorString[1]}${colorString[1]}${colorString[2]}${colorString[2]}${colorString[3]}${colorString[3]}`;
		}
		if (this.getHue(`${colorString}`) !== null && this.getHue(`${colorString}`) !== undefined) {
			this.slider.setColor(this.hslToHex(this.getHue(`${colorString}`), 100, 50), this.getHue(`${colorString}`));
			/* this.slider.color.emit(this.hslToHex(this.getHue(colorString), 100, 50)); */
			this.palette.updateHue(this.hslToHex(this.getHue(`${colorString}`), 100, 50), `${colorString}`);
		}
	}

	hexCodeChange(event) {
		this.propagateInput();
		event.target.value = '#' + event.target.value.split('#').join('');
	}

	hexCodeClick(event) {
		if (event.target.value.length === 0) {
			event.target.value = '#';
		}
	}

	colorUpdate(color) {
		this.color = '#' + color.split('#').join('');
	}

	close() {
		this.show = false;
		this.resetAdd();
	}

	open() {
		this.resetAdd();
		this.show = true;
	}

	reset() {
		this.hue = undefined;
		this.color = undefined;
		this.show = false;
	}

	setColor(hex) {
		if (hex.split('#').length === 1) {
			this.color = `#${hex}`;
		} else if (hex.split('#').length === 2) {
			this.color = `${hex}`;
		}
		this.propagateInput();
	}

	save() {
		console.log('save');
		if (this.saveForm()) {
			console.log('past save form');
			if (this.color !== undefined && this.color !== null) {
				if (this.color.split('#').length === 1) {
					if (this.color.length === 3) {
						this.saveColorPicker.emit(`#${this.color[0]}${this.color[0]}${this.color[1]}${this.color[1]}${this.color[2]}${this.color[2]}`);
					} else {
						this.saveColorPicker.emit(`#${this.color}`);
					}
				} else if (this.color.split('#').length === 2) {
					if (this.color.length === 4) {
						this.saveColorPicker.emit(`#${this.color[1]}${this.color[1]}${this.color[2]}${this.color[2]}${this.color[3]}${this.color[3]}`);
					} else {
						this.saveColorPicker.emit(`${this.color}`);
					}
				}
			} else {
				this.saveColorPicker.emit(``);
			}
			this.close();
		}
	}

	getHue(hex) {
		const rgb = this.getRGBFromHex(hex);
		if (rgb !== null) {
			rgb.r /= 255, rgb.g /= 255, rgb.b /= 255;
			const max = Math.max(rgb.r, rgb.g, rgb.b);
			const min = Math.min(rgb.r, rgb.g, rgb.b);
			let hue;
			if (rgb.r === max) {
				hue = (rgb.g - rgb.b) / (max - min);
			} else if (max === rgb.g) {
				hue = 2 + (rgb.b - rgb.r) / (max - min);
			} else if (rgb.b === max) {
				hue = 4 + (rgb.r - rgb.g) / (max - min);
			}

			hue *= 60;
			if (hue > 0) {
				return Math.floor(hue);
			} else {
				return Math.floor(360 - hue);
			}
		}
	}

	getRGBFromHex(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	hslToHex(h, s, l) {
		h /= 360;
		s /= 100;
		l /= 100;
		let r, g, b;
		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			// tslint:disable-next-line:no-shadowed-variable
			const hue2rgb = (p, q, t) => {
				if (t < 0) { t += 1; }
				if (t > 1) { t -= 1; }
				if (t < 1 / 6) { return p + (q - p) * 6 * t; }
				if (t < 1 / 2) { return q; }
				if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
				return p;
			};
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		const toHex = x => {
			const hex = Math.round(x * 255).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	}

}

