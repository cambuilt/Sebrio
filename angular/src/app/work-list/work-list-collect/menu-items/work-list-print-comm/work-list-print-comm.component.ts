import { Component, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Collection } from 'src/app/models/collection.model';
import { AuthService } from 'src/app/services/auth.service';
import * as moment from 'moment';
import { PrintService } from 'src/app/services/print.service';
import { WorkListService } from 'src/app/services/work-list.service';

@Component({
	selector: 'app-work-list-print-comm',
	templateUrl: './work-list-print-comm.component.html',
	styleUrls: ['./work-list-print-comm.component.css']
})
export class WorkListPrintCommComponent implements OnDestroy {
	@Output() printComm = new EventEmitter();
	showPrintComm = false;

	collection = new Collection();

	reason = '';
	quantity;
	comments = '';

	reasons = ['Reason 1'];
	quantities = [1, 2];

	labelNumberDefault = 0;
	labelNumberMaximum = 0;

	labelsPrinted = 0;

	printedSubscription;

	objectForm = [];
	@ViewChild('commReasonForm') commReasonForm: NgModel;
	@ViewChild('commQuantityForm') commQuantityForm: NgModel;
	@ViewChild('commCommentsForm') commCommentsForm: NgModel;

	constructor(private authService: AuthService, private printService: PrintService, private workListService: WorkListService) {
		this.printedSubscription = this.printService.printStatus.subscribe(response => {
			if (response !== 0 && this.showPrintComm) {
				this.printComm.emit(response);
				this.resetAfterPrint();
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
		if (this.showPrintComm) {
			this.objectForm.push(this.commReasonForm);
			this.objectForm.push(this.commQuantityForm);
			this.objectForm.push(this.commCommentsForm);
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
		this.loadCommLabelReasons();
		this.showPrintComm = true;
		this.generateLabelRange();
	}

	close() {
		this.showPrintComm = false;
		this.reset();
	}

	load(collection) {
		this.collection = collection;
	}

	loadCommLabelReasons() {
		if (this.workListService.commLabelReasons.length) {
			this.reasons = JSON.parse(JSON.stringify(this.workListService.commLabelReasons));
		} else {
			this.workListService.getCommLabelReasons()
				.then(success => {
					this.reasons = JSON.parse(JSON.stringify(this.workListService.commLabelReasons));
				})
				.catch(error => {
					console.log(`Error getting cancel reasons: ${error}`);
				});
		}
	}

	generateLabelRange() {
		this.quantities = [];
		if (typeof (this.labelNumberMaximum) === 'string') {
			const max = this.labelNumberDefault - this.labelsPrinted;
			for (let i = 0; i < max + 1; i++) {
				this.quantities.push(i);
			}
			this.quantity = this.labelNumberDefault;
			if (max < this.quantity) {
				this.quantity = max;
			}
		} else {
			const max = this.labelNumberMaximum - this.labelsPrinted;
			for (let i = 0; i < max + 1; i++) {
				this.quantities.push(i);
			}
			this.quantity = this.labelNumberDefault;
			if (max < this.quantity) {
				this.quantity = max;
			}
		}
	}

	reset() {
		this.resetAdd();
		this.showPrintComm = false;

		this.collection = new Collection();

		this.reason = '';
		this.quantity = undefined;
		this.comments = '';
	}

	resetAfterPrint() {
		this.labelsPrinted += this.quantity;
		this.generateLabelRange();
	}

	print() {
		if (this.saveForm()) {
			console.log(JSON.stringify(this.quantity));
			this.printService.addLabelsToPrint(this.quantity);
			// this.formatLabel();
			this.formatBarcode();
		}
	}

	send(file) {
		if ((<any>window).deviceReady === true) { // if on cordova app...
			if (this.authService.lastKnownPrinter === '') { // if no lastKnownPrinter
				this.printService.scanUnPairedDevices(file); // look for devices
			} else { // otherwise check to see if we are connected to lastKnownPrinter
				this.printService.scanPairedDevices(file);
			}
		} else { // if on desktop we call this... get rid of this to not support printing on desktop
			// this.printService.printCollectionLabels(file);
			this.printService.getLocalPrinters(file);
		}
	}


	formatBarcode() {
		const patientName = `${this.collection.Patient.LastName}, ${this.collection.Patient.FirstName}`;
		const MRN = this.collection.Patient.MRN;
		const DOB = this.collection.Patient.DateOfBirth;
		const gender = this.collection.Patient.Gender;
		let bed = this.collection.Bed;
		if (bed === null || bed === '') {
			bed = this.collection.CollectedLocation.Code;
		}
		const now = moment().format('MM/DD/YYYY HH:mm:ss');
		const namePieces = this.authService.currentUser.name.split(' ');
		const phleb = `${namePieces[1]}, ${namePieces[0]}`;

		const patientInfoValues = [patientName, MRN, `${DOB} ${gender}`, bed, now, phleb, this.reason];

		const heights = [30, 60, 90, 120, 150, 210, 235, 260];
		const leftGutter = 10;
		const phlebInfoHeight = 25;
		const fontHeight = 30;
		const labelWidth = 384;

		let label = `
		#FORMAT:PATIENTLABEL
        ^XA
		^PQ${this.quantity}
		^LH0,0`;
		for (let index = 0; index < 7; index++) {
			label = label + `
			^FO${leftGutter},${heights[index]}
			^A0,${index < 5 ? fontHeight : phlebInfoHeight}
			^FD${patientInfoValues[index]}
			^FS`;
		}
		label = label + `
		^FO${leftGutter},${heights[7]}
		^A0,${phlebInfoHeight}
		^FB${labelWidth - leftGutter},9999,0,L,0
		^FD${this.comments}
		^FS
		^XZ
		#ENDFORMAT#`;
		console.log(label);
		this.send(label);
	}


}
