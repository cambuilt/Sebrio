import { Component, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { ProviderService } from '../services/provider.service';
import { PhonePipe } from '../phone.pipe';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { DeactivateRecordPopupComponent } from '../deactivate-record-popup/deactivate-record-popup.component';
import { CollectionListService } from '../services/collection-list.service';
import { ActiveEntitiesService } from '../services/active-entities.service';

@Component({
	selector: 'app-provider-add',
	templateUrl: './provider-add.component.html',
	styleUrls: ['./provider-add.component.css']
})

export class ProviderAddComponent implements AfterViewInit {
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
	addAnother: boolean;
	headerText: string;
	labs = [];
	titles = ['AH', 'ANP', 'APN', 'APNP', 'APRN', 'ARNP', 'BS', 'CA', 'CH', 'CM', 'CMN', 'CMW', 'CNM', 'CNP', 'CNS', 'CPM LM', 'CPNP', 'CPNP, IBCLC', 'CRNA', 'CRNP', 'DC', 'DD', 'DDM', 'DDS', 'DMD', 'DO', 'DP', 'DPM', 'DPT', 'DR', 'FAAP', 'FNP', 'FNPC', 'GNP', 'IN', 'LCSW', 'MA', 'MBBS', 'MD', 'MD, PhD', 'MS', 'MSN', 'MSN, FNP-BC', 'ND', 'NNP', 'NP', 'NPC', 'OD', 'OT', 'PA', 'PA-C', 'PAC', 'PC', 'PHD', 'PT', 'RD', 'RN', 'RN, ANP'];
	specialities = ['Adolescent Medicine', 'Allergy & Immunology', 'Anesthesiology', 'Cardiovascular Disease', 'Cytopathology', 'Dermatology', 'Dermatopathology', 'Emergency Medicine', 'Endocrinology', 'Family Practice', 'Gastroenterology', 'General Surgery', 'Geriatric Medicine', 'Hematology', 'Hematology & Oncology', 'Infectious Disease', 'Internal Medicine', 'Nephrology', 'Neurology', 'Nuclear Medicine', 'Obstetrics & Gynecology', 'Oncology', 'Ophthalmology', 'Orthopaedic Surgery', 'Otolaryngology', 'Pain Medicine', 'Pathology', 'Pediatrics', 'Plastic Surgery', 'Preventative Medicine', 'Psychiatry', 'Pulmonary Disease', 'Radiation Oncology', 'Radiology', 'Rheumatology', 'Sleep Medicine', 'Thoracic Surgery', 'Transfusion Medicine', 'Transplant', 'Urology', 'Vascular & Interventional Radiology', 'Vascular Surgery'];
	pristineObject: any;
	provider: any = {
		CellPhone: '',
		Code: '',
		Comments: '',
		CompanyName: '',
		Email: '',
		Extension1: '',
		Extension2: '',
		Fax: '',
		FirstName: '',
		Id: '',
		IsActive: true,
		// Laboratories: [],
		Laboratory: {
			Id: ''
		},
		LastName: '',
		License: '',
		MiddleName: '',
		NPI: '',
		Phone1: '',
		Phone2: '',
		ProviderType: '',
		SourceSystemId: '',
		Speciality: '',
		Suffix: '',
		Title: '',
		UPIN: '',
		Location: {
			StreetAddress1: '',
			StreetAddress2: '',
			City: '',
			State: '',
			County: '',
			Country: 'USA',
			PostalCode: ''
		}
	};
	isAssociated = false;
	wasInactive = false;
	objectForm = [];
	labOptions = [];
	@ViewChild('code') code: NgModel;
	@ViewChild('companyName') companyName: NgModel;
	@ViewChild('title') title: NgModel;
	@ViewChild('firstName') firstName: NgModel;
	@ViewChild('lastName') lastName: NgModel;
	@ViewChild('specialty') specialty: NgModel;

	@ViewChild('ssid') ssid: NgModel;
	@ViewChild('license') license: NgModel;
	@ViewChild('upin') upin: NgModel;
	@ViewChild('npi') npi: NgModel;

	@ViewChild('streetAddress1') streetAddress1: NgModel;
	@ViewChild('city') city: NgModel;
	@ViewChild('state') state: NgModel;
	@ViewChild('postalCode') postalCode: NgModel;
	@ViewChild('fax') fax: NgModel;
	@ViewChild('cell') cell: NgModel;
	@ViewChild('phone1') phone1: NgModel;
	@ViewChild('phone2') phone2: NgModel;
	@ViewChild('email') email: NgModel;
	@ViewChild('lab') lab: NgModel;

	constructor(private activeEntitiesService: ActiveEntitiesService, private collectionService: CollectionListService, public utilsService: UtilsService, private providerService: ProviderService, private unsavedChangesAlert: MatDialog, private phonePipe: PhonePipe, private http: HttpClient, public translation: TranslationService) {
		this.getLabs();
	 }

	ngAfterViewInit() {
		this.objectForm.push(this.lab);
		this.objectForm.push(this.code);
		this.objectForm.push(this.fax);
		this.objectForm.push(this.phone2);
		this.objectForm.push(this.cell);
		this.objectForm.push(this.email);

	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	saveForm() {
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

	getLabs() {
		if (this.utilsService.checkOnlineStatus()) {
			this.labOptions = [];
			this.activeEntitiesService.getActiveLabs().subscribe(response => {
				console.log('labs: ', response.json());
				response.json().forEach(lab => {
					this.labOptions.push(lab);
				});
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
		}
	}


	addProvider() {
		this.headerText = this.translation.translate('Label.Add provider');
		this.show();
		setTimeout(() => {
			const firstField: HTMLInputElement = document.querySelector('#firstField');
			firstField.focus();
		}, 0);
		this.utilsService.disabledSelect([document.querySelector('#countryField')], true, true);
	}

	editProvider(id: string) {
		if (this.utilsService.checkOnlineStatus()) {
			this.headerText = this.translation.translate('Label.Edit provider');
			this.providerService.getProvider(id).subscribe(response => {
				this.provider = response.json();
				this.properties.rowID = id;
				this.checkAssociation();
				if (this.provider.IsActive === false) { this.wasInactive = true; }
				this.resetPristine();
				this.utilsService.disabledSelect([document.querySelector('#firstFormField'), document.querySelector('#countryField')], true, true);
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
			this.show();
		}
	}

	show() {
		this.properties.isDrawerOpen = true;
		this.properties.hideOverlay = false;
		this.properties.showOverlay = true;
		this.clearFields();
		this.goToTop();
	}

	goToTop() {
		document.querySelector('app-provider-add .drawer-content').scrollTop = 0;
	}

	trimFields() {
		Object.keys(this.provider).forEach(key => {
			if (key !== 'IsActive' && key !== 'Laboratory') {
				if (key === 'Location') {
					Object.keys(this.provider[key]).forEach(k => {
						this.provider[key][k] = this.provider[key][k].trim();
					});
				} else {
					if (this.provider[key] === null) {
						console.log(`Key: ${key} of provider is null`);
					} else {
						this.provider[key] = this.provider[key].trim();
					}

				}
			}
		});
	}

	clickOverlay() {
		this.trimFields();
		if (this.pristineObject !== JSON.stringify(this.provider)) {
			const dialogRef = this.unsavedChangesAlert.open(UnsavedChangesDialogComponent, {
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
				} else { this.utilsService.closeDrawer(this.properties); }

			});
		} else {
			this.utilsService.closeDrawer(this.properties);
		}
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.provider);
	}

	states() {
		return this.utilsService.states;
	}

	counties() {
		if (this.provider.Location.State === '') {
			return [];
		} else {
			return this.utilsService.counties[this.provider.Location.State];
		}
	}

	save(addAnother) {
		if (this.utilsService.checkOnlineStatus()) {
			this.trimFields();
			this.addAnother = addAnother;
			if (this.provider.Id === '') {
				this.providerService.createProvider(JSON.stringify(this.provider)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else if (error.status === 409) {
						this.providerService.providerExists = true; this.goToTop(); this.saveForm();
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.providerService.updateProvider(this.properties.rowID, JSON.stringify(this.provider)).subscribe(response => { this.saveOnComplete(response); }, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			}
		}
	}

	resetExists() {
		this.providerService.providerExists = false;
	}

	saveOnComplete(response) {
		if (response.status === 200) {
			this.clearFields();
			if (this.addAnother) {
				this.onSave.emit(true);
				this.utilsService.openSnackBar(this.translation.translate('Label.Provider added'));
			}
			if (!this.addAnother) {
				if (this.properties.rowID === '') {
					this.onSave.emit(true);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(this.translation.translate('Label.Provider added'));
				} else {
					this.onSave.emit(false);
					this.utilsService.closeDrawer(this.properties);
					this.utilsService.openPwdSnackBar(this.translation.translate('Label.Provider saved'));
				}
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('MainMenu.Provider')} ${this.provider.Code} ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	removeLab(lab) {
		this.provider.Laboratories.splice(this.provider.Laboratories.indexOf(lab), 1);
	}

	clearFields() {
		this.utilsService.removeListeners([document.querySelector('#firstFormField'), document.querySelector('#countryField')], true);
		this.resetAdd();
		this.provider = {
			CellPhone: '',
			Code: '',
			Comments: '',
			CompanyName: '',
			Email: '',
			Extension1: '',
			Extension2: '',
			Fax: '',
			FirstName: '',
			Id: '',
			IsActive: true,
			// Laboratories: [],
			LastName: '',
			License: '',
			MiddleName: '',
			NPI: '',
			Phone1: '',
			Phone2: '',
			ProviderType: '',
			SourceSystemId: '',
			Speciality: '',
			Suffix: '',
			Title: '',
			UPIN: '',
			Location: {
				StreetAddress1: '',
				StreetAddress2: '',
				City: '',
				State: '',
				County: '',
				Country: 'USA',
				PostalCode: ''
			},
			Laboratory: {
				Id: ''
			},
		};
		this.isAssociated = false;
		this.wasInactive = false;
		this.resetPristine();
	}

	checkDeactivate(addAnother) { // if not a new entry and the record was not inactive
		if (this.wasInactive === false && this.provider.IsActive === false && this.properties.rowID !== '') { // check if theres anything associated
			if (this.isAssociated === true) { // if so allow user to know
				const dialogRef = this.unsavedChangesAlert.open(DeactivateRecordPopupComponent, {
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
						this.provider.IsActive = 1;
						if (this.pristineObject !== JSON.stringify(this.provider)) {
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

	checkAssociation() {
		this.isAssociated = false;
		if (this.utilsService.checkOnlineStatus()) {
			this.collectionService.getCollectionLists().subscribe(response => {
				response.json().forEach(c => {
					if (c.IsActive == true) {
						this.collectionService.getCollectionList(c.Code).subscribe(res => {
							const list = res.json();
							list.AssociatedProviders.forEach(p => {
								if (p.Id === this.provider.Code) { this.isAssociated = true; return; }
							});
						});
					}
				});
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
		}
	}

	checkForm(addAnother) { // check all fields are complete
		if (this.saveForm()) {
			this.checkDeactivate(addAnother);
		} else {
			this.goToTop();
		}
	}

	blurPhone(fieldName: string) {
		this.provider[fieldName] = this.phonePipe.transform(this.provider[fieldName]);
	}

	processLabSelect(newLabData: any) {
		this.provider.Laboratories = newLabData;
	}

	fullClose(save) {
		if (save) {
			this.save(false);
		} else {
			this.utilsService.closeDrawer(this.properties);
		}
	}
}
