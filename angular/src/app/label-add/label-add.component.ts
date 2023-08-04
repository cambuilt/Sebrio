import { Component, EventEmitter, Output, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { LabelService } from '../services/label.service';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { PrintService } from '../services/print.service';
import { AuthService } from '../services/auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { SelectPrinterDialogComponent } from '../select-printer-dialog/select-printer-dialog.component';
import * as CryptoJS from 'crypto-js';
import { Collection } from '../models/collection.model';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';
import { CollectionListService } from '../services/collection-list.service';


@Component({
	selector: 'app-label-add',
	providers: [PrintService, BluetoothSerial, Collection],
	templateUrl: './label-add.component.html',
	styleUrls: ['./label-add.component.css']
})

export class LabelAddComponent implements OnInit, AfterViewInit {

	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();

	properties = {
		clearFields: () => this.clearFields(),
		isDrawerOpen: false,
		manualDescriptionInput: false,
		showOverlay: false,
		hideOverlay: false,
		rowID: ''
	};
	wasTab = false;
	addAnother: boolean;
	headerText: string;
	labOptions = [];
	pristineObject: any;
	fileName: any;
	fileSelected = false;
	label: any = {
		Code: '',
		Description: '',
		LaboratoryId: '',
		IsActive: true,
		TestLineLength: '',
		TemplateFile: {
			FileName: '',
			Data: ''
		},
		LabelColumnPairs: []
	};
	originalFile: string;
	formatFile: string;
	mapOptions = {};
	objectForm = [];
	displayKeys = [];
	words = [];
	firstRun = true;
	dropdown = [];
	fileRequired = false;
	storeName = '';
	wasInactive = false;
	isLoading = false;
	isAssociated = false;
	collection: Collection;
	@ViewChild('code') code: NgModel;
	@ViewChild('lab') lab: NgModel;
	@ViewChild('file') file: NgModel;

	constructor(private collectionService: CollectionListService, private bluetoothSerial: BluetoothSerial, private authService: AuthService, private printService: PrintService, public utilsService: UtilsService,
		private activeEntitiesService: ActiveEntitiesService, private labelService: LabelService, private dialog: MatDialog, public translation: TranslationService) {
		this.printService.loadingStatus.subscribe(res => {
			this.isLoading = res;
		});
	}

	ngAfterViewInit() {
		this.objectForm.push(this.code);
		this.objectForm.push(this.lab);
	}

	ngOnInit() {
		this.collection = new Collection();
		this.buildOrdersDropdown();
	}

	resetExists() {
		this.labelService.labelExists = false;
	}

	pushProperty(prefix) {
		const actionIgnore = ['IsCancelled', 'IsProblem', 'IsRequested', 'IsRescheduled', 'IsTransferred', 'CancellationReason', 'CancellationComments', 'CancelledBy', 'ProblemReason', 'ReportedBy', 'TransferReason', 'TransferredBy'];
		const ignore = ['CollectedLocation.Id', 'OrderedTest.Container.Id', 'OrderedTest.Container.TopColor', 'OrderedTest.Container.TopColorName', 'OrderedTest.Id', 'OrderedTest.Priority.Id', 'OrderedTest.Priority.Priority', 'OrderedTest.Priority.ShowColor'];
		const collectionElement = prefix.split('.').reduce((c, d) => c[d], this.collection);
		Object.keys(collectionElement).forEach(key => {
			if (!ignore.includes(`${prefix}.${key}`) && !actionIgnore.includes(key)) {
				if (typeof (collectionElement[key]) == 'object') {
					this.pushProperty(`${prefix}.${key}`);
				} else {
					this.dropdown.push(`${prefix}.${key}`);
				}
			}
		});
	}

	buildOrdersDropdown() { // this looks at the Object for a collection used by collection listsperson)
		const actionIgnore = ['IsCancelled', 'IsProblem', 'IsRequested', 'IsRescheduled', 'IsTransferred', 'CancellationReason', 'CancellationComments', 'CancelledBy', 'ProblemReason', 'ReportedBy', 'TransferReason', 'TransferredBy'];
		const ignore = ['Code', 'Priority', 'OrderedTests', 'ScheduledDateTime', 'Status', 'CollectionInformation'];
		Object.keys(this.collection).forEach(key => { // and returns us all possible pairings
			if (!ignore.includes(key) && !actionIgnore.includes(key)) {
				if (typeof (this.collection[key]) == 'object') {
					this.pushProperty(key);
				} else {
					if (key === 'Id') {
						this.dropdown.push(`Collection.${key}`);
					} else {
						this.dropdown.push(`${key}`);
					}
				}
			}
		});
		/* Object.keys(this.collection).forEach(key => { // and returns us all possible pairings
			if (typeof (this.collection[key]) == 'object' && key !== 'OrderedTests') {
				Object.keys(this.collection[key]).forEach(k => {
					const val = key + '.' + k;
					this.dropdown.push(val);
				});
			} else {
				this.dropdown.push(key);
			}
		}); */
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	openFile(event) {
		this.words = [];
		this.mapOptions = {};
		this.displayKeys = [];
		const input = event.target;
		for (let i = 0; i < input.files.length; i++) {
			const reader = new FileReader();
			reader.onload = () => {
				const text = reader.result.toString();
				this.createFormatFile(text);
				this.findIndex(text, 0);
			};
			reader.readAsText(input.files[i]);
		}
		this.fileRequired = false;
		this.storeName = input.files[0].name;

	}

	createFormatFile(text) {
		this.formatFile = '';
		this.originalFile = '';
		for (let i = 0; i < text.length; i++) {
			this.formatFile = this.formatFile + text[i];
			this.originalFile = this.originalFile + text[i];
		}
	}

	findIndex(text, index) {
		const index2 = text.toString().indexOf('^FD', index + 1); // find field declaration
		const index3 = text.toString().indexOf('#', index2); // find where first # is
		if (index3 > index && index3 < text.toString().length) { // make sure its the next one and we aren't finished
			const index4 = text.toString().indexOf('#', index3 + 1);
			const diff = index4 - index3 - 1; // - 1 removes the last hash to print
			let word = ''; // build word from index values
			for (let i = 0; i < diff; i++) {
				const letter = text[index3 + 1 + i];
				word = word + letter;
			}
			this.words.push(word); // add word to array
			this.findMultiples(text, index4); // make sure there are no other tags on this line
			this.findIndex(text, index4); // call function until finished reading document
		} else {
			this.createObject();
		}
	}

	findMultiples(text, index) {
		const index2 = text.toString().indexOf('#', index + 1); // looking for another tag
		const fd = text.toString().indexOf('^FD', index); // looking for next field
		if (index2 > -1 && index2 < fd) { // if we found the &# before the next field
			const index3 = text.toString().indexOf('#', index2 + 1);
			const diff2 = index3 - index2 - 1;
			let word = '';
			for (let i = 0; i < diff2; i++) {
				const letter = text[index2 + 1 + i];
				word = word + letter;
			}
			this.words.push(word);
			this.findMultiples(text, index3);
		}
	}

	createObject() { // create the objects for pairing
		this.displayKeys = [];
		this.words.forEach(word => {
			if (Object.keys(this.mapOptions).length > 0) {
				Object.keys(this.mapOptions).forEach(key => {
					if (key !== word) {
						this.mapOptions[word] = '';
					}
				});
			} else {
				this.mapOptions[word] = '';
			}
		});
		Object.keys(this.mapOptions).forEach(key => {
			this.displayKeys.push(key);
		});
		this.displayKeys.sort();
		this.fileSelected = true;
		this.label.TemplateFile.FileName = this.storeName;
		this.authService.displayKeysLength = this.displayKeys.length;
		this.authService.fileSelected = true;
		this.validateFile();
	}

	convertKeys() { // convert the keys to be saved to meet backend expectations
		let saveArray = [];
		Object.keys(this.mapOptions).forEach(key => {
			const obj = { LabelVariable: key, ColumnReference: this.mapOptions[key] };
			saveArray.push(obj);
		});
		this.label.LabelColumnPairs = saveArray;
	}

	findKeys(key, index) { // this is for test printing to map the format file
		const searchFor = '#' + key + '#'; // to whatever they may have updated the fields to be
		this.formatFile = this.formatFile.replace(searchFor, this.mapOptions[key]);
		const index2 = this.formatFile.indexOf(key, index + 1);
		if (index2 > -1 && index2 < this.formatFile.length) {
			this.formatFile = this.formatFile.replace(searchFor, this.mapOptions[key]);
			this.findKeys(key, index2);
		}
	}


	removeFile() {
		this.mapOptions = {};
		this.displayKeys = [];
		const input: HTMLInputElement = document.querySelector('#uploadFile');
		input.value = '';
		this.fileSelected = false;
		this.label.TemplateFile.FileName = '';
		this.label.TemplateFile.Data = '';
		this.authService.displayKeysLength = 0;
		this.authService.fileSelected = false;
		this.validateFile();
	}

	print(file) {
		if ((<any>window).deviceReady) { // if on cordova app...
			if (this.authService.lastKnownPrinter === '') { // if no lastKnownPrinter
				this.printService.scanUnPairedDevices(file); // look for devices
			} else { // otherwise check to see if we are connected to lastKnownPrinter
				this.printService.scanPairedDevices(file);
			}
		} else { // if on desktop we call this...
			this.printService.getLocalPrinters(file);
		}
	}

	testPrint() {
		this.isLoading = true;
		this.printService._isLoading = true;
		this.printService.loadingSubject.next(this.printService._isLoading);
		this.formatFile = this.originalFile;
		Object.keys(this.mapOptions).forEach(key => {
			this.formatFile = this.formatFile.replace('undefined', '');
			this.findKeys(key, 0);
		});
		setTimeout(() => this.print(this.formatFile), 1100);
	}

	dencodeBase64(file) {
		const dec = window.atob(file);
		this.originalFile = dec;
		this.formatFile = dec;
	}

	encodeBase64(file) {
		const enc = window.btoa(file);
		this.label.TemplateFile.Data = enc;
		this.originalFile = enc;
	}

	saveForm(addAnother) {
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

	validateFile() {
		let formValid = true;
		this.file.control.markAsDirty();
		this.file.control.markAsTouched();
		this.file.control.updateValueAndValidity();
		if (!this.file.valid) {
			formValid = false;
		}
		return formValid;
	}

	addLabel() {
		this.headerText = this.translation.translate('Label.Add label');
		this.clearFields();
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
	}

	setupEdit(res) {
		this.mapOptions = {};
		this.displayKeys = [];
		this.label.LaboratoryId = res.Laboratory.Code;
		this.label.Code = res.Code;
		this.label.Description = res.Description;
		this.label.IsActive = res.IsActive;
		this.label.TestLineLength = res.TestLineLength;
		this.label.TemplateFile.FileName = res.TemplateFile.FileName;
		this.label.TemplateFile.Data = res.TemplateFile.Data;
		this.dencodeBase64(res.TemplateFile.Data);
		this.label.LabelColumnPairs = res.LabelColumnPairs;
		res.LabelColumnPairs.forEach(item => {
			this.displayKeys.push(item.LabelVariable);
			this.mapOptions[item.LabelVariable] = item.ColumnReference;
		});
		this.authService.displayKeysLength = this.displayKeys.length;
		if (res.TemplateFile.FileName !== '') {
			this.fileSelected = true;
		}
		if (this.label.IsActive === false) { this.wasInactive = true; }
		this.resetPristine();
		this.show();
	}

	editLabel(id: string) {
		console.log('id passed to edit', id);
		if (this.utilsService.checkOnlineStatus()) {
			this.headerText = this.translation.translate('Label.Edit label');
			this.properties.rowID = id;
			console.log('properties.rowID: ', this.properties.rowID);
			this.labelService.getLabel(id).subscribe(response => {
				const label = response.json();
				console.log(label);
				this.setupEdit(label);
				this.utilsService.disabledSelect([], false, false);
				if (this.label.IsActive == false) { this.wasInactive = true; }
				this.checkAssociation();
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
			this.displayKeys.sort();
			if (this.label.TemplateFile.FileName !== '') {
				setTimeout(() => this.fileSelected = true, 500);
			}
		}
	}

	show() {
		this.properties.isDrawerOpen = true;
		this.properties.hideOverlay = false;
		this.properties.showOverlay = true;
		this.getLabs();
		this.goToTop();
	}

	goToTop() {
		document.querySelector('app-label-add .drawer-content').scrollTop = 0;
	}

	updateDescription() {
		if (this.properties.manualDescriptionInput !== true) {
			this.label.Description = this.label.Code;
		}
	}

	checkDescriptionChange() {
		if (this.label.Description !== this.label.Code) {
			this.properties.manualDescriptionInput = true;
		}
		if (this.label.Description === '' || this.label.Description === null) {
			this.properties.manualDescriptionInput = false;
		}
	}

	tabEvent() {
		this.wasTab = true;
	}

	blurCode() {
		if (this.wasTab === true) {
			const descriptionField: HTMLInputElement = document.querySelector('#descriptionField');
			descriptionField.focus();
			this.wasTab = false;
		}
	}

	closeDrawer() {
		this.fileRequired = false;
		this.fileSelected = false;
		this.authService.displayKeysLength = 0;
		this.authService.fileSelected = false;
	}

	trimFields() {
		Object.keys(this.label).forEach(key => {
			if (key !== 'IsActive' && key !== 'LabelColumnPairs') {
				if (key === 'TemplateFile') {
					Object.keys(this.label[key]).forEach(k => {
						if (this.label[key][k] === undefined || this.label[key][k] === '' || this.label[key][k] === null) {
							// do nothing
						} else {
							this.label[key][k] = this.label[key][k].trim();
						}
					});
				} else {
					this.label[key] = this.label[key].trim();
				}
			}
		});
	}

	compareOptions() {
		const pris = JSON.parse(this.pristineObject);
		let compareArray = [];
		Object.keys(this.mapOptions).forEach(key => {
			const obj = { ColumnReference: this.mapOptions[key], LabelVariable: key };
			compareArray.push(obj);
		});
		if (JSON.stringify(compareArray) !== JSON.stringify(pris.LabelColumnPairs)) {
			return false;
		} else {
			return true;
		}
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.label) || !this.compareOptions()) {
			const dialogRef = this.dialog.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (document.body.querySelector('.add-overlay')) {
					document.body.removeChild(document.body.querySelector('.add-overlay'));
				}
				if (result) {
					this.checkForm(false);
				} else { this.utilsService.closeDrawer(this.properties); this.closeDrawer(); }

			});
		} else {
			this.utilsService.closeDrawer(this.properties);
			this.closeDrawer();
		}
	}

	checkDeactivate(addAnother) { // if not a new entry and the record was not inactive
		if (this.wasInactive === false && this.label.IsActive === false && this.properties.rowID !== '') { // check if theres anything associated
			if (this.isAssociated === true) { // if so allow user to know
				const dialogRef = this.dialog.open(DeactivateRecordPopupComponent, {
					width: '300px',
					backdropClass: 'unsavedOverlay',
					autoFocus: false
				});
				dialogRef.beforeClose().subscribe(result => {
					if (document.body.querySelector('.add-overlay')) {
						document.body.removeChild(document.body.querySelector('.add-overlay'));
					}
					if (result) { // they want to deactivate anyway
						this.save(false);
					} else {
						this.label.IsActive = true;
						if (this.pristineObject !== JSON.stringify(this.label)) {
							this.save(addAnother);
						} else {
							this.utilsService.closeDrawer(this.properties);
							return;
						}
					}
				});
			} else { // there was no association found so deactivate and save
				this.save(addAnother);
			}
		} else { // they were not deactivating the record so save like normal
			this.save(addAnother);
		}
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.label);
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			if (this.displayKeys.length < 1) {
				this.label.IsActive = false;
			}
			Object.keys(this.mapOptions).forEach(key => {
				this.originalFile = this.originalFile.replace('undefined', '');
			});
			this.encodeBase64(this.originalFile);
			this.convertKeys();
			this.trimFields();
			this.addAnother = addAnother;
			if (this.properties.rowID === '') {
				this.labelService.createLabel(JSON.stringify(this.label)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 409) {
						this.labelService.labelExists = true; this.goToTop(); this.saveForm(addAnother);
					} else if (error.status === 401) {
						this.utilsService.handle401(error);
					}
				});
			} else {
				this.labelService.updateLabel(this.properties.rowID, JSON.stringify(this.label)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			}
		}
	}

	saveOnComplete(response) {
		if (response.status === 200) {
			this.clearFields();
			if (this.addAnother) {
				this.onSave.emit(true);
				this.utilsService.openSnackBar(`${this.translation.translate('Label.Label added')}`);
			}
			if (!this.addAnother) {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.closeDrawer();
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Label added')}`);
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.closeDrawer();
					this.utilsService.openPwdSnackBar(`${this.translation.translate('Label.Label saved')}`);
				}
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Label')} ${this.label.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	getLabs() {
		if (this.utilsService.checkOnlineStatus()) {
			this.labOptions = [];
			this.labelService.getLabels().subscribe(res => {
				const allLabs = res.json().map(row => row.Laboratory.Id);
				this.activeEntitiesService.getActiveLabs().subscribe(response => {
					response.json().forEach(lab => {
						if (!lab.Label.Code) {
							if (allLabs.indexOf(lab.Code) < 0) {
								this.labOptions.push(lab.Code);
							}
						}
						if (lab.Label.Id === this.label.Code) {
							this.labOptions.push(lab.Code);
						}
					});
				});
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
			if (this.label.IsActive === false && this.label.LaboratoryId !== '') {
				this.labOptions.push(this.label.LaboratoryId);
			}
		}
	}

	checkAssociation() {
		this.isAssociated = false;
		this.collectionService.getCollectionLists().subscribe(response => {
			response.json().forEach(c => {
				if (c.IsActive == true) {
					this.collectionService.getCollectionList(c.Id).subscribe(res => {
						const list = res.json();
						if (list.Laboratory.Id === this.label.LaboratoryId && list.IsActive == true) {
							this.isAssociated = true; return;
						}
					});
				}
			});
		});
	}

	checkForm(addAnother) {
		if (this.saveForm(addAnother)) {
			this.checkDeactivate(addAnother);
		} else {
			this.goToTop();
		}
	}

	clearFields() {
		this.utilsService.removeListeners([], false);
		this.resetAdd();
		this.label = {
			Code: '',
			Description: '',
			LaboratoryId: '',
			IsActive: true,
			TestLineLength: '',
			TemplateFile: {
				FileName: '',
				Data: ''
			},
			LabelColumnPairs: []
		};
		this.mapOptions = {};
		this.displayKeys = [];
		const input: HTMLInputElement = document.querySelector('#uploadFile');
		input.value = '';
		this.fileSelected = false;
		this.wasInactive = false;
		this.isAssociated = false;
		this.resetPristine();
	}

}
