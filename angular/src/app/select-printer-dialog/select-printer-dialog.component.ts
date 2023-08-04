import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-select-printer-dialog',
	templateUrl: './select-printer-dialog.component.html',
	styleUrls: ['./select-printer-dialog.component.css']
})
export class SelectPrinterDialogComponent implements OnInit {
	cordova = false;
	printers = [];
	selectedPrinter: string;
	constructor(public dialogRef: MatDialogRef<SelectPrinterDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

	ngOnInit() {
		setTimeout(() => this.locatePrinters(), 100);
		if ((<any>window).deviceReady === true) {
			this.cordova = true;
		}
	}

	locatePrinters() {
		this.data.forEach(item => {
			if (item.class === 1664) {
				this.printers.push({name: item.name, address: item.address});
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

}
