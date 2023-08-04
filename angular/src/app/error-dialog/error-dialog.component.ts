import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { Http } from '@angular/http';

@Component({
	selector: 'app-error-dialog',
	templateUrl: './error-dialog.component.html',
	styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<ErrorDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: any,
		private http: Http,
		private router: Router) { }

	backdropClick() {
		// Close the dialog
		this.dialogRef.close();
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	ngOnInit() {
	}

}
