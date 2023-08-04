import { Component, OnInit, ViewChild } from '@angular/core';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { MatDialogRef } from '@angular/material';


@Component({
	selector: 'app-signature-pad',
	templateUrl: './signature-pad.component.html',
	styleUrls: ['./signature-pad.component.css']
})
export class SignaturePadComponent implements OnInit {
	signatureURL = '';
	signaturePadOptions: Object = {
		'minWidth': 5,
		'canvasWidth': 800,
		'canvasHeight': 300
	  };

	  @ViewChild(SignaturePad) signaturePad: SignaturePad;

	constructor(public dialogRef: MatDialogRef<SignaturePadComponent>) { }

	ngOnInit() {
	}

	  drawStart() {
		console.log('begin drawing');
	  }

	  clearPad() {
		this.signaturePad.clear();
	  }

	  finishSigning() {
		this.signatureURL = this.signaturePad.toDataURL();
		this.clearPad();
		this.dialogRef.close();
	  }

}
