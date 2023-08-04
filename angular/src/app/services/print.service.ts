import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Http, Headers } from '@angular/http';
import { UtilsService } from './utils.service';
import { MatDialog } from '@angular/material';
import { AuthService } from './auth.service';
import * as CryptoJS from 'crypto-js';
import { LabelService } from './label.service';
import { BehaviorSubject } from 'rxjs';
import { TranslationService } from 'angular-l10n';
import { CollectionLabelPrintComponent } from '../work-list/work-list-collect/menu-items/collection-label-print/collection-label-print.component';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';

const SERVER_URL = 'http://localhost:8080';

@Injectable({
	providedIn: 'root'
})
// this printService subscribes to the api provided by RhodesLabelPrintingService app
export class PrintService implements OnDestroy, OnInit {

	public socket;
	public _isLoading = false;
	public loadingSubject = new BehaviorSubject(this._isLoading);
	loadingStatus = this.loadingSubject.asObservable();
	printingContainerLabel = false;
	private printed = 0;
	private printSubject = new BehaviorSubject(this.printed);
	printStatus = this.printSubject.asObservable();
	connectionSubscription = undefined;
	fakePrinters: any = [
		{ name: 'Zebra 12348383', address: 'abcdefghijklmnop', class: 1664 },
		{ name: 'Other Zebra 29292', address: '18282829292282982', class: 1664 },
		{ name: 'Third Zebra', address: '28292000002282', class: 1664 },
		{ name: 'Fourth Zebra', address: '9928282727277', class: 1664 },
	];

	constructor(private translation: TranslationService, private http: Http, private authService: AuthService, private labelService: LabelService, private utilsService: UtilsService, private dialog: MatDialog) {
	}


	ngOnDestroy(): void {
		if ((<any>window).deviceReady === true) {
			this.unsubscribe();
			this.findPrinters();
		}
	}

	ngOnInit(): void {
		if ((<any>window).deviceReady === true) {
			this.unsubscribe();
			this.findPrinters();
		}
	}

	unsubscribe() {
		if (this.connectionSubscription !== undefined) {
			this.connectionSubscription.unsubscribe();
			this.connectionSubscription = undefined;
		}
	}

	findPrinters() {
		this.authService.bluetoothSerial.list().then(success => {
			this.disconnectPrinters(JSON.stringify(success));
		}, error => {
			this.utilsService.showError(`Error.Error: ${JSON.stringify(error)}`);
		});
	}

	disconnectPrinters(items) {
		items.forEach(item => {
			if (item.class === 1664) {
				this.authService.bluetoothSerial.disconnect();
			}
		});
	}

	addContainerLabelsToPrint(number) {
		this.printed = this.printed + number;
		this.printingContainerLabel = true;
	}

	addLabelsToPrint(number: number) {
		this.printed = this.printed + number;
		this.printingContainerLabel = false;
	}

	sendContentApi(data) {
		const url = `http://localhost:8080/api/labels`;
		return this.http.post(url, data);
	}

	getPrinters() {
		const url = `http://localhost:8080/api/labels`;
		return this.http.get(url);
	}

	getLocalPrinters(file) { // must be running printingService app for this to work!
		if (this.authService.lastKnownPrinter !== '') {
			this.printLocal(this.authService.lastKnownPrinter, file);
		} else {
			this._isLoading = true;
			this.loadingSubject.next(this._isLoading);
			this.getPrinters().subscribe(res => {
				const printers = res.json();
				printers.forEach(printer => {
					// if (printer.name.search('zebra|Zebra') >= 0) {
					printer.address = printer.name;
					printer.class = 1664;
					// }
				});
				this.openSelectPrinter(printers, file);
			}, error => {
				this.printed = 0;
				this._isLoading = false;
				this.loadingSubject.next(this._isLoading);
				this.utilsService.showError(`${this.translation.translate(`Error.We were not able to locate any printers on your network Please make sure you have the eMLC printing service running If the error persists please contact customer support`)}`);
			});
		}
	}

	openSelectPrinter(printerOptions, file) {
		this._isLoading = false;
		this.loadingSubject.next(this._isLoading);
		const printDialog = this.dialog.open(CollectionLabelPrintComponent, {
			panelClass: 'printDialog',
			backdropClass: 'errorOverlay',
			data: printerOptions,
			disableClose: true
		});
		printDialog.beforeClose().subscribe(data => {
			const selectedPrinter = printDialog.componentInstance.selectedPrinter;
			// check to make sure they selected a printer
			if (selectedPrinter !== '' && selectedPrinter !== undefined && selectedPrinter !== null) {
				if ((<any>window).deviceReady === true) { // for cordova app...
					this.connectBluetooth(selectedPrinter, file);
				} else { // desktop ...
					this.printLocal(selectedPrinter, file);
				}
			} else {
				return;
			}
		});
	}

	openBluetoothSettingsDialog() {
		const dialogRef = this.dialog.open(UnsavedChangesDialogComponent, {
			width: '300px',
			backdropClass: 'unsavedOverlay',
			data: { message: 'Bluetooth off turn on' },
			autoFocus: false
		});
		dialogRef.beforeClose().subscribe(result => {
			if (document.body.querySelector('.add-overlay')) {
				document.body.removeChild(document.body.querySelector('.add-overlay'));
			}
			if (result) {
				this.authService.bluetoothSerial.showBluetoothSettings();
			}
		});
	}

	scanUnPairedDevices(file) { // this discovers unpaired bluetooth devices
		this.authService.bluetoothSerial.isEnabled().then(res => {
			this._isLoading = true;
			this.loadingSubject.next(this._isLoading);
			this.authService.bluetoothSerial.discoverUnpaired().then(success => {
				this.openSelectPrinter(success, file); // then passes them to selectPrinter
			}, error => {
				this._isLoading = false;
				this.loadingSubject.next(this._isLoading);
				this.utilsService.showError(`${this.translation.translate(`Error.Error`)} occured in scanUnPairedDevices() ${JSON.stringify(error)}`);
				this.printed = 0;
			});
		}, error => {
			this.openBluetoothSettingsDialog();
		});
	}

	scanPairedDevices(file) { // this checks for any paired bluetooth devices
		this.authService.bluetoothSerial.isEnabled().then(res => {
			this._isLoading = true;
			this.loadingSubject.next(this._isLoading);
			this.authService.bluetoothSerial.list().then(success => {
				this.checkReturnedPrinters(success, file); // and passes them to checkReturnedPrinters
			}, error => {
				this._isLoading = false;
				this.loadingSubject.next(this._isLoading);
				this.utilsService.showError(`${this.translation.translate(`Error.Error`)} occured in scanPairedDevices ${JSON.stringify(error)}`);
				this.authService.lastKnownPrinter = '';
				this.unsubscribe();
				setTimeout(() => this.scanUnPairedDevices(file), 500);
				this.printed = 0;
			});
		}, error => {
			this.openBluetoothSettingsDialog();
		});
	}

	checkReturnedPrinters(data, file) { // this is looking to see if any returned devices
		const lastPrinter = data.find(item => item.address === this.authService.lastKnownPrinter); // match the last known printer that user
		if (lastPrinter !== undefined && lastPrinter !== '' && lastPrinter !== null) {
			this.connectBluetooth(lastPrinter.address, file); // if it was, it sends to print
		} else { // otherwise it looks for any devices it can connect to
			this.scanUnPairedDevices(file);
		}
	}

	connectBluetooth(address, file) { // connect to the address passed in from print dialog
		if (this.connectionSubscription !== undefined) {
			this.sendDataBluetooth(address, file);
		} else {
			this.connectionSubscription = this.authService.bluetoothSerial.connect(address).subscribe(res => {
				this.sendDataBluetooth(address, file); // send data to that address
				// this.utilsService.showError(`res from connectBluetooth(); ${res}`);
			}, error => {
				this._isLoading = false;
				this.loadingSubject.next(this._isLoading);
				this.utilsService.showError(`${this.translation.translate(`Error.Error`)} occured in connectBluetooth() ${JSON.stringify(error)}`);
				this.findPrinters();
				this.unsubscribe();
				this.authService.lastKnownPrinter = '';
				setTimeout(() => this.scanUnPairedDevices(file), 500);
				this.printed = 0;
			});
		}
	}

	sendDataBluetooth(address, file) {
		this.authService.bluetoothSerial.write(file).then(success => {
			this.authService.lastKnownPrinter = address; // set this printer as the last known printer
			this._isLoading = false;
			this.loadingSubject.next(this._isLoading);
			this.printSubject.next(this.printed);
			this.printed = 0;
		}, error => {
			// if (this.connectionSubscription !== undefined) {
			// 	this.connectionSubscription.unsubscribe();
			// }
			this.unsubscribe();
			this.authService.lastKnownPrinter = ''; // if we can't print to it, disconnect it
			this.utilsService.showError(`error sending data over bluetooth: ${error}`);
			this.scanUnPairedDevices(file); // and look for others
		});
	}

	printLocal(name, file) { // get encryption key first
		this.labelService.getKey().subscribe(res => {
			const ciphertext = CryptoJS.AES.encrypt(file, res.json().Value.toString());
			const data = { printerText: ciphertext.toString(), printerName: name };
			this.sendContentApi(data).subscribe(res2 => {
				console.log('print success');
				this.authService.lastKnownPrinter = name;
				this.printSubject.next(this.printed);
				this.printed = 0;
			}, error => {
				console.log(`Error from sendContentAPI`);
				this.printed = 0;
			});
		}, error => {
			this._isLoading = false;
			this.loadingSubject.next(this._isLoading);
			this.printed = 0;
		});
	}
}
