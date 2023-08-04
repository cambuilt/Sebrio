import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { TranslationService } from 'angular-l10n';
import { NgModel } from '@angular/forms';
import { Collection } from 'src/app/models/collection.model';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { UtilsService } from 'src/app/services/utils.service';
import { WorkListService } from 'src/app/services/work-list.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-work-list-identify',
	templateUrl: './work-list-identify.component.html',
	styleUrls: ['./work-list-identify.component.css']
})
export class WorkListIdentifyComponent {
	verificationOptions = ['Verbal', 'Visual', 'Caregiver'];
	@Output() verified = new EventEmitter();
	showIdentify = false;

	@ViewChild('caregiverNameForm') caregiverNameForm: NgModel;
	formVerified = false;
	formError = false;
	scanVerified = false;
	scanError = false;
	scanErrorIcon = false;

	collection = new Collection();

	option1Confirm;
	option2Confirm;
	caregiverName;

	minimumPatientIdentifiersRequired = 0;

	animation = true;

	patientScanWristband = true;
	patientWristbandCount = 2;
	patientWristband1 = '';
	patientWristband2 = '';

	patientManualId = true;
	patientIdDocCount = 2;
	patientIDDoc1 = '';
	patientIDDoc2 = '';

	padScanValue = '';
	scanInterval = undefined;
	scanTimer = 30;
	scanReceived = false;
	constructor(private router: Router, private workListService: WorkListService, private utilsService: UtilsService, private barcodeScanner: BarcodeScanner, public translation: TranslationService) { }

	show() {
		this.showIdentify = true;
		const wb1 = this.collection.Patient[this.patientWristband1];
		console.log('wb1: ', wb1);
	}

	close() {
		if (this.scanInterval !== undefined) { // if interval for honeywell was set
			clearInterval(this.scanInterval);
			this.scanInterval = undefined;
			this.scanTimer = 30;
		}
		this.showIdentify = false;
	}

	resetAdd() {
		if (this.caregiverNameForm) {
			this.caregiverNameForm.reset();
		}
	}

	saveForm() {
		let formValid = true;
		if (this.caregiverNameForm) {
			this.caregiverNameForm.control.markAsDirty();
			this.caregiverNameForm.control.markAsTouched();
			this.caregiverNameForm.control.updateValueAndValidity();
			if (!this.caregiverNameForm.valid) {
				formValid = false;
			}
		}
		return formValid;
	}

	loadData(collection) {
		this.collection = collection;
	}

	verify() {
		if (this.saveForm() === true) {
			this.changeFormVerified(true);
			this.checkNext();
		} else {
			console.log(`Caregiver name invalid...`);
		}
	}

	checkNext() {
		if (this.patientManualId === false || this.patientScanWristband === false || (this.formVerified === true && this.scanVerified === true)) {
			this.sendVerified();
		}
	}

	sendVerified() {
		const verificationObject = {
			ConfirmOption1: this.option1Confirm ? this.verificationOptions[this.option1Confirm - 1] : null,
			ConfirmOption2: this.option2Confirm ? this.verificationOptions[this.option2Confirm - 1] : null,
			CaregiverName: this.caregiverName
		};
		this.verified.emit(verificationObject);
	}

	preventSelect(event) {
		event.preventDefault();
	}

	dummyScan() {
		const num = Math.floor(Math.random() * 3);
		this.changeScanVerified(false);
		this.changeScanError(false);
		if (num) {
			window.requestAnimationFrame(() => {
				this.changeScanVerified(false);
				window.requestAnimationFrame(() => {
					this.changeScanVerified(true);
					this.checkNext();
				});
			});
		} else {
			window.requestAnimationFrame(() => {
				this.changeScanError(false);
				window.requestAnimationFrame(() => {
					this.changeScanError(true);
					setTimeout(() => this.scanErrorIcon = true, 1000);
				});
			});
		}
	}

	desktopScan() {
		const collectionList = this.workListService.getCollectionList();
		const wristbandID1 = collectionList.PatientWristband1;
		const wristbandID2 = collectionList.PatientWristband2; // May be '', MRN, Driver's License, Account Number, or Account Number/Driver's License/MRN
		const patientWristbandIDs = collectionList.PatientWristbandCount; // How many identifiers (1 or 2 or null/0)
		console.log('wb1: ', wristbandID1, ' wb2: ', wristbandID2, ' wbIDS: ', patientWristbandIDs, ' collectionList: ', collectionList);
		// this.builtInScan();
		this.dummyScan();
	}

	scanWristband() {
		if ((<any>window).deviceReady === true) { // on cordova app...
			// if on a honeywell use honeywell scanner...
			if ((<any>window).device.manufacturer.toLowerCase().search('honeywell') > -1) {
				this.honeywellScan(); // on PAD device...
			} else if ((<any>window).device.manufacturer.toLowerCase().search('pad') > -1) {
				this.builtInScan(); // use built in scanner
			} else { // no built in scanner? use camera
				this.scanFromCamera();
			}
		} else { // on desktop
			this.desktopScan();
		}
	}

	honeywellScan() {
		this.scanTimer = 30;
		this.beginTimer();
		(<any>window).plugins.honeywell.listenForScans((data) => {
			if (data !== '' && data !== undefined && data !== null) {
				this.scanReceived = true;
				this.compareScanResult(data);
			} else { this.utilsService.showError(`Error scanning barcode, no value returned.`); }
		});
	}

	beginScanTimer() {
		this.scanTimer--;
		if (this.scanTimer <= 0) { // if no response from honeywell scanner after 30 seconds
			if ((<any>window).deviceReady === true && this.router.routerState.snapshot.url === '/work-list') {
				if (this.scanVerified === false) {
					this.utilsService.showError(`Error scanning barcode, switching to camera mode now.`);
					this.scanFromCamera();
				}
				clearInterval(this.scanInterval); // clear interval and scanFromCamera() instead
				this.scanInterval = undefined;
				this.scanTimer = 30;
			} else {
				if (this.scanVerified === false) {
					this.utilsService.showError(`Error scanning barcode, timed out.`);
				}
				clearInterval(this.scanInterval); // clear interval
				this.scanInterval = undefined;
				this.scanTimer = 30;
			}
		}
	}

	builtInScan() {
		const padScan: HTMLInputElement = document.querySelector('#hiddenPadField');
		padScan.focus();
		if ((<any>window).deviceReady === true) {
			setTimeout(() => (<any>window).Keyboard.hide(), 20);
		}
		this.scanTimer = 30;
		this.beginTimer();
	}

	beginTimer() {
		if (this.scanInterval !== undefined) {
			clearInterval(this.scanInterval);
		}
		this.scanInterval = setInterval(() => {
			this.scanTimer--;
			if (this.showIdentify !== true) {
				console.log(`Show identify not true, clearing interval...`);
				console.log(this.scanInterval);
				clearInterval(this.scanInterval);
				this.scanInterval = undefined;
				this.scanTimer = 30;
				console.log(this.scanInterval);
			} else if (this.scanTimer <= 0 || this.scanReceived === true) { // if no response from honeywell scanner after 30 seconds
				if ((<any>window).deviceReady === true && this.router.routerState.snapshot.url === '/work-list') {
					if (this.scanVerified === false && this.scanReceived === false) {
						this.utilsService.showError(`Error scanning barcode, switching to camera mode now.`);
						this.scanFromCamera();
					}
					clearInterval(this.scanInterval); // clear interval and scanFromCamera() instead
					this.scanInterval = undefined;
					this.scanTimer = 30;
				} else {
					if (this.scanVerified === false) {
						this.utilsService.showError(`Error scanning barcode, timed out.`);
					}
					console.log(`Clearing interval...`);
					console.log(this.scanInterval);
					clearInterval(this.scanInterval); // clear interval
					console.log(this.scanInterval);
					this.scanInterval = undefined;
					this.scanTimer = 30;
				}
			}
		}, 1000);
	}

	scanFromCamera() {
		this.barcodeScanner.scan().then(data => {
			if (data.text !== '' && data.text !== undefined && data.text !== null) {
				this.scanReceived = true;
				this.compareScanResult(data.text);
			} else { this.utilsService.showError(`Error scanning barcode, no value returned.`); }
		}).catch(err => {
			this.utilsService.showError(`Error scanning barcode`);
		});
	}

	changeCompareScanResult() {
		this.scanReceived = true;
		this.compareScanResult(this.padScanValue);
	}

	compareScanResult(data) {
		if (this.scanInterval !== undefined) { // if interval was set
			clearInterval(this.scanInterval);
			this.scanInterval = undefined;
			this.scanTimer = 30;
		} // compare result to these values, wb2 only if defined
		const wb1 = this.collection.Patient[this.patientWristband1];
		const wb2 = this.collection.Patient[this.patientWristband2]; // scan passed...
		this.changeScanVerified(false);
		this.changeScanError(false);
		if (wb1.indexOf(data) > -1 || (wb2 !== null && wb2 !== undefined && wb2 !== '' && wb2.indexOf(data) > -1)) {
			window.requestAnimationFrame(() => { // set animation to opposite of desired result
				this.changeScanVerified(false);
				window.requestAnimationFrame(() => { // now set to desired result
					this.changeScanVerified(true);
					this.checkNext();
				});
			});
		} else { // scan failed...
			window.requestAnimationFrame(() => {
				this.changeScanError(false);
				window.requestAnimationFrame(() => {
					this.changeScanError(true);
					setTimeout(() => this.scanErrorIcon = true, 1000);
				});
			});
		} // force keyboard down to prevent random popup, this is important!
		if ((<any>window).deviceReady === true) {
			setTimeout(() => (<any>window).Keyboard.hide(), 20);
		}
		setTimeout(() => {
			this.padScanValue = '';
			this.scanReceived = false;
		}, 3000);
	}

	changeScanVerified(value) {
		this.scanVerified = value;
		this.updateScanVerified();
	}

	changeScanError(value) {
		this.scanError = value;
	}

	changeFormVerified(value) {
		this.formVerified = value;
		this.updateFormVerified();
	}

	reset() {
		this.showIdentify = false;
		this.formVerified = false;
		this.formError = false;
		this.scanVerified = false;
		this.scanError = false;
		this.scanErrorIcon = false;
		this.collection = new Collection();
		this.option1Confirm = undefined;
		this.option2Confirm = undefined;
		this.caregiverName = undefined;
	}

	updateStorage(storedString, value) {
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			parsedStorage[storedString] = value;
			localStorage.setItem('workListCollecting', JSON.stringify(parsedStorage));
		}
	}

	updateScanVerified() {
		this.updateStorage('IdentifyScanVerified', this.scanVerified);
	}

	updateFormVerified() {
		this.updateStorage('IdentifyFormVerified', this.formVerified);
	}

	option1Change() {
		this.updateStorage('IdentifyOption1', this.option1Confirm);
	}

	option2Change() {
		this.updateStorage('IdentifyOption2', this.option2Confirm);
	}

	caregiverChange() {
		this.updateStorage('CaregiverName', this.caregiverName);
	}

	complete() {
		this.updateStorage('IdentifyComplete', true);
	}

}
