import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as moment from 'moment';

@Component({
	selector: 'app-requisition-form',
	templateUrl: './requisition-form.component.html',
	styleUrls: ['./requisition-form.component.css']
})
export class RequisitionFormComponent implements OnInit {

	displayedColumns: string[] = ['Code', 'ABN', 'DX', 'CNT', 'PRI', 'LabACC', 'Comments'];
	dataSource = new MatTableDataSource<any>([]);
	ssn = '';
	age = '';
	DOB = '';
	collectionDate = '';
	recdTime = '';
	tripTotal = '';
	totalPatients = '';
	totalStops = '';
	totalMiles = '';

	constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog, public dialogRef: MatDialogRef<RequisitionFormComponent>) { }

	ngOnInit() {
		console.log('data passed to requistion form: ', this.data);
		this.randomSSN();
		this.getValues();
	}

	randomSSN() {
		let d = '';
		const x = '1234567890';
		for (let i = 0; i < 4; i++) {
			const b = Math.floor(Math.random() * 9);
			const c = x[b];
			d += c;
		}
		this.ssn = d;
	}

	isOdd(num) {
		return num % 2;
	}

	getValues() {
		this.dataSource = this.data.Tests;
		this.DOB = this.data.Collection.Patient.DateOfBirth.split('(')[0];
		const a = this.data.Collection.Patient.DateOfBirth.split('(').pop();
		this.age = a.split(')')[0];
		this.collectionDate = moment(new Date()).format('MM/DD/YYYY HH:mm');
		this.recdTime =  moment(this.data.Collection.ScheduledDateTime).format('MM/DD/YYYY HH:mm');
	}

	download() {
		const data = document.querySelector('#reqForm');
		html2canvas(data).then(canvas => {
			let imgWidth = 210;
			const imgHeight = canvas.height * imgWidth / canvas.width;
			const contentDataURL = canvas.toDataURL('image/png');
			let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
			pdf.setFontSize(10);
			pdf.text(3, 293, `Laboratory Requisition Generated: ${this.getDate()}`);
			pdf.text(198, 293, `1 of 1`);
			let position = 0;
			pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
			setTimeout(() => { pdf.save(`Lab Requisition Form`); this.dialogRef.close(); }, 1000); // Generated PDF
			// let blob = pdf.output('blob');
		});
	}

	getDate() {
		let date = new Date();
		return moment(date).format('MM/DD/YYYY HH:mm');
	}

}
