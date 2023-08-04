import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../node_modules/@angular/material';

@Component({
	selector: 'app-deactivate-record-popup',
	templateUrl: './deactivate-record-popup.component.html',
	styleUrls: ['./deactivate-record-popup.component.css']
})
export class DeactivateRecordPopupComponent implements OnInit {

	addOverlay: any;

	constructor(public dialogRef: MatDialogRef<DeactivateRecordPopupComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {
		this.addOverlay = document.createElement('div');
		this.addOverlay.className = 'add-overlay show';
		document.body.appendChild(this.addOverlay);
	}

	yesClick() {
		this.data.choice = 'Yes';
		this.dialogRef.close();

	}

	noClick() {
		this.data.choice = 'No';
		this.dialogRef.close();
	}

}
