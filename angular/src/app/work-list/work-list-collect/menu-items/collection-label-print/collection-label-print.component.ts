import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-collection-label-print',
	templateUrl: './collection-label-print.component.html',
	styleUrls: ['./collection-label-print.component.css']
})
export class CollectionLabelPrintComponent implements OnInit {

	cordova = false;
	printers = [];
	searching = true;
	printing = false;
	selectedPrinter: string;
	printerRowLength = 320;
	printerSpanLength = 220;
	constructor(public dialogRef: MatDialogRef<CollectionLabelPrintComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

	ngOnInit() {
		if ((<any>window).deviceReady === true) {
			this.cordova = true;
		}
		setTimeout(() => this.evaluateWidth(), 0);
		setTimeout(() => this.locatePrinters(), 100);
	}

	locatePrinters() {
		this.data.forEach(item => {
			if (item.class === 1664) {
				this.printers.push({ name: item.name, address: item.address });
			}
		});
	}

	submitToPrinter() {
		this.dialogRef.close();
	}

	cancel() {
		this.selectedPrinter = undefined;
		this.dialogRef.close();
	}

	@HostListener('window:resize') onResize() {
		this.evaluateWidth();
	}

	evaluateWidth() {
		const dialogContent = document.body.querySelector('app-collection-label-print').querySelector('.printerDialog');
		const dialogWidth = this.getComputedWidth(dialogContent);
		this.printerRowLength = dialogWidth;
		this.printerSpanLength = dialogWidth - 28 - 31;
	}

	getComputedWidth(element) {
		return parseInt(((getComputedStyle(element).width).split('px').join('')), 10);
	}

}
