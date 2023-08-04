import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../node_modules/@angular/material';
import { TranslationService } from 'angular-l10n';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DeleteDialogComponent implements OnInit, OnDestroy {
	addOverlay: any;

	constructor(public dialogRef: MatDialogRef<DeleteDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any, public translation: TranslationService) { }

  	ngOnInit() {
	}

	ngOnDestroy() {
	}

	yesClick() {
		this.data.choice = this.translation.translate('Label.Yes');
		this.dialogRef.close();
	}

	noClick() {
		this.data.choice = this.translation.translate('Label.No');
		this.dialogRef.close();
	}

}
