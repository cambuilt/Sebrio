import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Collection } from 'src/app/models/collection.model';
import * as moment from 'moment';
import { AuthService } from 'src/app/services/auth.service';
import { PrintService } from 'src/app/services/print.service';

@Component({
	selector: 'app-work-list-print-patient',
	templateUrl: './work-list-print-patient.component.html',
	styleUrls: ['./work-list-print-patient.component.css']
})
export class WorkListPrintPatientComponent implements OnDestroy {
	@Output() printPatient = new EventEmitter();
	showPrintPatient = false;

	collection = new Collection();

	quantity = '1';
	quantities = ['1', '2', '3', '4', '5'];

	objectForm = [];

	printedSubscription;

	@ViewChild('labelQuantity') labelQuantity: NgModel;

	constructor(private authService: AuthService, private printService: PrintService) {
		this.printedSubscription = this.printService.printStatus.subscribe(response => {
			if (response !== 0 && this.showPrintPatient) {
				this.printPatient.emit(response);
			}
		});
	}

	ngOnDestroy(): void {
		if (this.printedSubscription) {
			this.printedSubscription.unsubscribe();
		}
	}

	refillObjectForm() {
		this.objectForm = [];
		if (this.showPrintPatient) {
			this.objectForm.push(this.labelQuantity);
		}
	}

	resetAdd() {
		this.refillObjectForm();
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	saveForm() {
		this.refillObjectForm();
		let formValid = true;
		this.objectForm.forEach(c => {
			if (!c.disabled) {
				c.control.markAsDirty();
				c.control.markAsTouched();
				c.control.updateValueAndValidity();
				if (!c.valid) {
					formValid = false;
				}
			}
		});
		return formValid;
	}

	show() {
		this.showPrintPatient = true;
	}

	close() {
		this.showPrintPatient = false;
		this.reset();
	}

	load(collection) {
		this.collection = collection;
	}

	print() {
		if (this.saveForm()) {
			this.printService.addLabelsToPrint(Number(this.quantity));
			this.formatLabel();
		}
	}

	reset() {
		this.resetAdd();
		this.showPrintPatient = false;

		this.collection = new Collection();

		this.quantity = '1';
		this.quantities = [];
	}

	formatLabel() {
		const patientName = `${this.collection.Patient.LastName}, ${this.collection.Patient.FirstName}`;
		const MRN = this.collection.Patient.MRN;
		const DOB = this.collection.Patient.DateOfBirth;
		const gender = this.collection.Patient.Gender;
		let bed = this.collection.Bed;
		if (bed === null || bed === '') {
			bed = this.collection.CollectedLocation.Code;
		}
		const now = moment().format('MM/DD/YYYY HH:mm:ss');
		const patientInfoValues = [patientName, MRN, `${DOB} ${gender}`, bed, now];

		const tapeWidth = 384;

		const leftGutter = 15;
		const smallGutter = 5;
		const smallGutterRight = (tapeWidth / 2) + smallGutter + 25;

		const fontHeight = 30;
		const smallFontHeight = 18;

		const bigHeights = [];
		const smallHeights = [];
		for (let index = 0; index < 5; index++) {
			bigHeights.push(index * fontHeight + 30);
			smallHeights.push(index * smallFontHeight + 300);
		}

		const heights = [bigHeights, smallHeights, smallHeights];
		const gutters = [leftGutter, smallGutter, smallGutterRight];
		const fonts = [fontHeight, smallFontHeight, smallFontHeight];

		let patientInfo = `
		#FORMAT:PATIENTLABEL
        ^XA
		^PQ${this.quantity}
		^LH0,0`;
		for (let i = 0; i < 3; i++) {
			for (let index = 0; index < 5; index++) {
				patientInfo = patientInfo + `
				^FO${gutters[i]},${heights[i][index]}
				^A0,${fonts[i]}
				^FD${patientInfoValues[index]}
				^FS`;
			}
		}
		patientInfo = patientInfo + `^XZ
		#ENDFORMAT#`;
		console.log(patientInfo);
		this.send(patientInfo);
	}

	send(file) {
		if ((<any>window).deviceReady === true) { // if on cordova app...
			if (this.authService.lastKnownPrinter === '') { // if no lastKnownPrinter
				this.printService.scanUnPairedDevices(file); // look for devices
			} else { // otherwise check to see if we are connected to lastKnownPrinter
				this.printService.scanPairedDevices(file);
			}
		} else { // if on desktop we call this... get rid of this to not support printing on desktop
			this.printService.getLocalPrinters(file);
		}
	}

}
