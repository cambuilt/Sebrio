import { Component, ViewChild, ElementRef, AfterViewInit, Output, HostListener, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-color-slider',
	templateUrl: './color-slider.component.html',
	styleUrls: ['./color-slider.component.css']
})
export class ColorSliderComponent implements AfterViewInit {

	@ViewChild('canvas')
	canvas: ElementRef<HTMLCanvasElement>;

	@Output()
	color: EventEmitter<string> = new EventEmitter();

	private ctx: CanvasRenderingContext2D;
	private mousedown = false;
	private selectedHeight: number;

	ngAfterViewInit() {
		this.draw();
	}

	draw() {
		if (!this.ctx) {
			this.ctx = this.canvas.nativeElement.getContext('2d');
		}
		const width = this.canvas.nativeElement.width;
		const height = this.canvas.nativeElement.height;

		this.ctx.clearRect(0, 0, width, height);

		const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0, '#ff0000');
		gradient.addColorStop(0.17, '#ffff00');
		gradient.addColorStop(0.34, '#00ff00');
		gradient.addColorStop(0.51, '#00ffff');
		gradient.addColorStop(0.68, '#0000ff');
		gradient.addColorStop(0.85, '#ff00ff');
		gradient.addColorStop(1, '#ff0000');

		this.ctx.beginPath();
		this.ctx.rect(0, 0, width, height);

		this.ctx.fillStyle = gradient;
		this.ctx.fill();
		this.ctx.closePath();

		if (this.selectedHeight) {
			this.ctx.beginPath();
			this.ctx.strokeStyle = 'white';
			this.ctx.lineWidth = 2;
			this.ctx.rect(0, this.selectedHeight - 5, width, 10);
			this.ctx.stroke();
			this.ctx.closePath();
		}
	}

	@HostListener('window:mouseup', ['$event']) onMouseUp(evt: MouseEvent) {
		this.mousedown = false;
	}

	onPointerDown(event: PointerEvent) {
		this.selectedHeight = event.offsetY;
		this.draw();
		this.emitColor(event.offsetX, event.offsetY);
		this.canvas.nativeElement.setPointerCapture(event.pointerId);
	}

	onPointerUp(event: PointerEvent) {
		this.canvas.nativeElement.releasePointerCapture(event.pointerId);
	}

	onPointerMove(event) {
		const height = 169;
		if (this.mousedown === true) {
			console.log(event.offsetY);
			if (event.offsetY < 1) {
				this.selectedHeight = 1;
			} else if (event.offsetY >= height) {
				this.selectedHeight = height;
			} else {
				this.selectedHeight = event.offsetY;
			}
			this.draw();
			this.emitColor(1, this.selectedHeight);
		}
	}

	onMouseDown(evt: MouseEvent) {
		this.mousedown = true;
		/* this.selectedHeight = evt.offsetY;
		this.draw();
		this.emitColor(evt.offsetX, evt.offsetY); */
	}

	onMouseMove(evt: MouseEvent) {
		/* if (this.mousedown) {
			this.selectedHeight = evt.offsetY;
			this.draw();
			this.emitColor(evt.offsetX, evt.offsetY);
		} */
	}

	setColor(hex, hue) {
		this.selectedHeight = Math.floor(hue / 360 * 170);
		this.draw();
	}

	rgbToHexString(imageData) {
		return '#' + this.rgbToHex(imageData[0]) + this.rgbToHex(imageData[1]) + this.rgbToHex(imageData[2]);
	}

	emitColor(x: number, y: number) {
		/* const rgbaColor = this.getColorAtPosition(x, y);
		this.color.emit(rgbaColor); */
		const hexColor = this.getHexColorAtPosition(x, y);
		this.color.emit(hexColor);
	}

	getColorAtPosition(x: number, y: number) {
		const imageData = this.ctx.getImageData(x, y, 1, 1).data;
		return 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
	}

	getHexColorAtPosition(x: number, y: number) {
		const imageData = this.ctx.getImageData(x, y, 1, 1).data;
		return '#' + this.rgbToHex(imageData[0]) + this.rgbToHex(imageData[1]) + this.rgbToHex(imageData[2]);
	}

	rgbToHex(rgb) {
		const hex = Number(rgb).toString(16);
		return (hex.length < 2) ? `0${hex}` : hex;
	}

}
