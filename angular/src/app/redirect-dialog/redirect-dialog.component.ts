import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-redirect-dialog',
	templateUrl: './redirect-dialog.component.html',
	styleUrls: ['./redirect-dialog.component.css']
})
export class RedirectDialogComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<RedirectDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: any) { }

	ngOnInit() {
	}

}
