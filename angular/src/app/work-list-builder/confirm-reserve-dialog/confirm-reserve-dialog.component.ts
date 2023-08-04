import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-confirm-reserve-dialog',
	templateUrl: './confirm-reserve-dialog.component.html',
	styleUrls: ['./confirm-reserve-dialog.component.css']
})
export class ConfirmReserveDialogComponent implements OnInit {

	constructor(public dialogRef: MatDialogRef<ConfirmReserveDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {
	}

}
