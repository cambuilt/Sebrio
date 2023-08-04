import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../node_modules/@angular/material';
import { UtilsService } from '../services/utils.service';

@Component({
	selector: 'app-unsaved-changes-dialog',
	templateUrl: './unsaved-changes-dialog.component.html',
	styleUrls: ['./unsaved-changes-dialog.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class UnsavedChangesDialogComponent implements OnInit, OnDestroy {
	addOverlay: any;

	constructor(public dialogRef: MatDialogRef<UnsavedChangesDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any, private utilsService: UtilsService
	) { }

	ngOnInit() {
		this.addOverlay = document.createElement('div');
		this.addOverlay.className = 'add-overlay show';
		document.body.appendChild(this.addOverlay);
		setInterval(() => this.checkForLogout(), 6000);
	}

	ngOnDestroy() {
	}

	yesClick() {
		this.data.choice = 'Yes';
		this.dialogRef.close();

	}

	noClick() {
		this.data.choice = 'No';
		this.dialogRef.close();
	}

	checkForLogout() {
		console.log('online status is', this.utilsService.checkOnlineStatus());
		if (!this.utilsService.checkOnlineStatus()) {
			this.yesClick();
		}
	}

}
