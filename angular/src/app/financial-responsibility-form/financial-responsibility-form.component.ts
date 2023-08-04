import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as moment from 'moment';

@Component({
	selector: 'app-financial-responsibility-form',
	templateUrl: './financial-responsibility-form.component.html',
	styleUrls: ['./financial-responsibility-form.component.css']
})
export class FinancialResponsibilityFormComponent implements OnInit {

	_printIframe: any;
	signature = '';
	patient = { Name: 'Bill Flarity', IdentificationNumber: '232342342' };
	// tests = [
	// 	{ Name: 'Puncture', Charge: 10.60 },
	// 	{ Name: 'CK', Charge: 28.86 },
	// 	{ Name: 'CBC + Differential', Charge: 27.24 },
	// 	{ Name: 'Hepatic Function Pnl', Charge: 31.36 },
	// ];
	tests = [];

	constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog, public dialogRef: MatDialogRef<FinancialResponsibilityFormComponent>) {
		console.log('data in constructor of financial form: ', data);
		this.patient.Name = data.Patient.Name;
		this.patient.IdentificationNumber = data.Patient.MRN;
		const charges = [10.60, 28.86, 27.24, 31.36];
		this.tests = [];
		data.Tests.forEach(test => {
			this.tests.push({ Name: test.Code, Charge: test.Charge === '' ? charges[Math.floor(Math.random() * 3) + 1] : test.Charge });
		});
	}

	ngOnInit() {
	}

	openSignaturePad() {
		const newDialog = this.dialog.open(SignaturePadComponent, {
			data: '',
			height: '400px',
			width: '700px'
		});
		newDialog.beforeClose().subscribe(result => {
			this.signature = newDialog.componentInstance.signatureURL;
		});
	}

	download() {
		const data = document.querySelector('#formContent');
		html2canvas(data).then(canvas => {
			let imgWidth = 209;
			const imgHeight = canvas.height * imgWidth / canvas.width;
			const contentDataURL = canvas.toDataURL('image/png');
			let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
			let position = 0;
			pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
			setTimeout(() => { pdf.save(`Patient financial form`); this.dialogRef.close(); }, 1000); // Generated PDF
			// let blob = pdf.output('blob');
		});
	}

	getTotal() {
		let total = 0;
		this.tests.forEach(test => {
			// tslint:disable-next-line:radix
			total += parseFloat(test.Charge.toString());
		});
		return parseFloat(total.toString()).toFixed(2);
	}

	getDate() {
		let date = new Date();
		return moment(date).format('MM/DD/YYYY');
	}

}
