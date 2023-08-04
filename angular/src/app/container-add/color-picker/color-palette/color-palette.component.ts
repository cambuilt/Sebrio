import { Component, ViewChild, ElementRef, AfterViewInit, Input, Output, SimpleChanges, OnChanges, EventEmitter, HostListener } from '@angular/core';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
	selector: 'app-color-palette',
	templateUrl: './color-palette.component.html',
	styleUrls: ['./color-palette.component.css']
})
export class ColorPaletteComponent implements AfterViewInit, OnChanges {

	@Input()
	hue: string;

	@Output()
	color: EventEmitter<string> = new EventEmitter(true);

	@ViewChild('canvas')
	canvas: ElementRef<HTMLCanvasElement>;

	private ctx: CanvasRenderingContext2D;

	private mousedown = false;

	public selectedPosition: { x: number; y: number };

	public colors: any;

	ngAfterViewInit() {
		this.draw();
	}

	draw() {
		if (!this.ctx) {
			this.ctx = this.canvas.nativeElement.getContext('2d');
		}
		const width = this.canvas.nativeElement.width;
		const height = this.canvas.nativeElement.height;

		this.ctx.fillStyle = this.hue || 'rgba(255,255,255,1)';
		this.ctx.fillRect(0, 0, width, height);

		const whiteGrad = this.ctx.createLinearGradient(0, 0, width, 0);
		whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
		whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');

		this.ctx.fillStyle = whiteGrad;
		this.ctx.fillRect(0, 0, width, height);

		const blackGrad = this.ctx.createLinearGradient(0, 0, 0, height);
		blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
		blackGrad.addColorStop(1, 'rgba(0,0,0,1)');

		this.ctx.fillStyle = blackGrad;
		this.ctx.fillRect(0, 0, width, height);

		if (this.selectedPosition) {
			this.ctx.strokeStyle = 'white';
			this.ctx.fillStyle = 'white';
			this.ctx.beginPath();
			this.ctx.arc(this.selectedPosition.x, this.selectedPosition.y, 5, 0, 2 * Math.PI);
			this.ctx.lineWidth = 2;
			this.ctx.stroke();
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['hue']) {
			this.draw();
			const pos = this.selectedPosition;
			if (pos) {
				this.color.emit(this.getHexColorAtPosition(pos.x, pos.y));
			}
		}
	}

	updateHue(hue, color) {
		this.hue = hue;
		this.draw();
		this.setColorHex(color);
	}

	@HostListener('window:mouseup', ['$event']) onMouseUp(evt: MouseEvent) {
		this.mousedown = false;
	}

	setColorHex(hex) {
		const rgb = this.getRGBFromHex(hex);
		const range = 5;
		const closest = {
			x: 0,
			y: 0,
			rgb: {
				r: 0,
				g: 0,
				b: 0
			}
		};
		for (let x = 0; x < 230; x++) {
			for (let y = 0; y < 170; y++) {
				const imageData = this.ctx.getImageData(x, y, 1, 1).data;
				if (imageData[0] > rgb.r - range && imageData[0] < rgb.r + range) {
					if (imageData[1] > rgb.g - range && imageData[1] < rgb.g + range) {
						if (imageData[2] > rgb.b - range && imageData[2] < rgb.b + range) {
							if (rgb.r === imageData[0] && rgb.g === imageData[1] && rgb.b === imageData[1]) {
								this.selectedPosition = { x: x, y: y };
								this.draw();
								return;
							} else {
								if (this.difference(imageData, rgb) < this.difference([closest.rgb.r, closest.rgb.g, closest.rgb.b], rgb)) {
									closest.x = x;
									closest.y = y;
									closest.rgb.r = imageData[0], closest.rgb.g = imageData[1], closest.rgb.b = imageData[2];
								}
							}
						}
					}
				}
			}
		}
		this.selectedPosition = { x: closest.x, y: closest.y };
		this.draw();
	}

	difference(imageData, rgb) {
		const r = Math.abs(imageData[0] - rgb.r);
		const g = Math.abs(imageData[1] - rgb.g);
		const b = Math.abs(imageData[2] - rgb.b);
		return r + g + b;
	}

	onPointerDown(event: PointerEvent) {
		this.selectedPosition = { x: event.offsetX, y: event.offsetY };
		this.draw();
		this.emitColor(event.offsetX, event.offsetY);
		this.canvas.nativeElement.setPointerCapture(event.pointerId);
	}

	onPointerUp(event: PointerEvent) {
		this.canvas.nativeElement.releasePointerCapture(event.pointerId);
	}

	onPointerMove(event) {
		const height = 170;
		const width = 229;
		if (this.mousedown === true) {
			if (event.offsetX < 0 && event.offsetY < 0) {
				this.selectedPosition = { x: 0, y: 0 };
			} else if (event.offsetX < 0 && event.offsetY > height) {
				this.selectedPosition = { x: 0, y: height };
			} else if (event.offsetX > width && event.offsetY > height) {
				this.selectedPosition = { x: width, y: height };
			} else if (event.offsetX > width && event.offsetY < 0) {
				this.selectedPosition = { x: width, y: 0 };
			} else if (event.offsetX < 0) {
				this.selectedPosition = { x: 0, y: event.offsetY };
			} else if (event.offsetX > width) {
				this.selectedPosition = { x: width, y: event.offsetY };
			} else if (event.offsetY < 0) {
				this.selectedPosition = { x: event.offsetX, y: 0 };
			} else if (event.offsetY > height) {
				this.selectedPosition = { x: event.offsetX, y: height };
			} else {
				this.selectedPosition = { x: event.offsetX, y: event.offsetY };
			}
			this.draw();
			this.emitColor(this.selectedPosition.x, this.selectedPosition.y);
		}
	}

	onMouseDown(evt: MouseEvent) {
		this.mousedown = true;
		/* this.selectedPosition = { x: evt.offsetX, y: evt.offsetY };
		this.draw();
		this.emitColor(evt.offsetX, evt.offsetY); */
	}

	onMouseMove(evt: MouseEvent) {
		if (this.mousedown) {
			/* this.selectedPosition = { x: evt.offsetX, y: evt.offsetY };
			this.draw();
			this.emitColor(evt.offsetX, evt.offsetY); */
		}
	}

	emitColor(x: number, y: number) {
		/* const rgbaColor = this.getColorAtPosition(x, y);
		this.color.emit(rgbaColor); */
		/* console.log(this.getHSLFromHex(this.getHexColorAtPosition(x, y))); */
		const hexColor = this.getHexColorAtPosition(x, y);
		this.color.emit(hexColor);
	}

	getHexColorAtPosition(x: number, y: number) {
		const imageData = this.ctx.getImageData(x, y, 1, 1).data;
		return this.rgbToHexString(imageData);
	}

	rgbToHexString(imageData) {
		return '#' + this.rgbToHex(imageData[0]) + this.rgbToHex(imageData[1]) + this.rgbToHex(imageData[2]);
	}

	rgbToHex(rgb) {
		const hex = Number(rgb).toString(16);
		return (hex.length < 2) ? `0${hex}` : hex;
	}

	/* getColorAtPosition(x: number, y: number) {
		const imageData = this.ctx.getImageData(x, y, 1, 1).data;
		console.log(imageData);
		return 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
	} */

	getRGBFromHex(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	getHSLFromHex(hex) {
		const rgb = this.getRGBFromHex(hex);
		const r = rgb.r / 255;
		const g = rgb.g / 255;
		const b = rgb.b / 255;
		const min = Math.min(r, g, b);
		const max = Math.max(r, g, b);
		let lum = (min + max) / 2;
		let sat = (max - min) / (2 - max - min);
		if (lum > .5) {
			sat = (max - min) / (max + min);
		}
		let hue = 0;
		if (r >= b && r >= g) {
			hue = (g - b) / (max - min);
		} else if (b >= b && b >= g) {
			hue = 4.0 + (r - g) / (max - min);
		} else {
			hue = 2.0 + (b - r) / (max - min);
		}
		hue *= 60;
		if (hue < 0) { hue += 360; }
		hue = (hue / 360);
		lum = Math.min(1, Math.max(0, lum));
		sat = Math.min(1, Math.max(0, sat));
		hue = Math.min(1, Math.max(0, hue));
		return {
			h: hue,
			s: sat,
			l: lum
		};
	}

}
