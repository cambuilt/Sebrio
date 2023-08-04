import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

@Component({
	selector: 'app-pdf-viewer',
	templateUrl: './pdf-viewer.component.html',
	styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements OnInit {

	pdfSrc: any;
	showPad = false;
	signaturePadOptions: Object = {
		'minWidth': 5,
		'canvasWidth': 800,
		'canvasHeight': 250
	  };

	@ViewChild(SignaturePad) signaturePad: SignaturePad;

	constructor(public dialogRef: MatDialogRef<PdfViewerComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

	ngOnInit() {
		this.pdfSrc = this.data;
		const screen: HTMLDivElement = document.querySelector('.viewerContent');
		setTimeout(() => screen.hidden = !screen.hidden, 400);
		this.goToTop();
	}

	goToTop() {
		const bottom = document.querySelector('.scrollHere');
		setTimeout(() => bottom.scrollIntoView(false), 300);
	}

	goToBottom() {
		const bottom = document.querySelector('.signaturePad');
		setTimeout(() => bottom.scrollIntoView(false), 100);
	}

	drawComplete() {
		// will be notified of szimek/signature_pad's onEnd event
		console.log(this.signaturePad.toDataURL());
	  }

	  drawStart() {
		// will be notified of szimek/signature_pad's onBegin event
		console.log('begin drawing');
	  }

	  sign() {
		  this.showPad = true;
		  this.goToBottom();
	  }

	  clearPad() {
		this.signaturePad.clear();
	  }

}
