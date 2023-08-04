import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../node_modules/@angular/material';

@Component({
	selector: 'app-messaging-list-add-dialog',
	templateUrl: './messaging-list-add-dialog.component.html',
	styleUrls: ['./messaging-list-add-dialog.component.css']
})
export class MessagingListAddDialogComponent implements OnInit {

	constructor(public dialogRef: MatDialogRef<MessagingListAddDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {
	}

}
