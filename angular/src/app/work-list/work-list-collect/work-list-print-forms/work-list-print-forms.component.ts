import { Component } from '@angular/core';
import { FinancialResponsibilityFormComponent } from '../../../financial-responsibility-form/financial-responsibility-form.component';
import { MatDialog } from '@angular/material';
import { Collection } from 'src/app/models/collection.model';
import { WorkListService } from 'src/app/services/work-list.service';
import { ActiveEntitiesService } from 'src/app/services/active-entities.service';
import { RequisitionFormComponent } from '../../../requisition-form/requisition-form.component';
import { AbnFormComponent } from 'src/app/abn-form/abn-form.component';

@Component({
	selector: 'app-work-list-print-forms',
	templateUrl: './work-list-print-forms.component.html',
	styleUrls: ['./work-list-print-forms.component.css']
})
export class WorkListPrintFormsComponent {
	showPrintForms = false;
	collection = new Collection();
	forms = {
		ABN: '',
		FinancialResponsibility: '',
		Requisition: '',
		Comments: ''
	};

	requiredFormABN = true;
	requiredFormFinancialResponsibility = true;
	requiredFormRequisition = true;
	labInfo: any;

	constructor(private workListService: WorkListService, private activeEntitiesService: ActiveEntitiesService, private dialog: MatDialog) { }

	show() {
		this.showPrintForms = true;
		this.getLabData();
	}

	close() {
		this.showPrintForms = false;
	}

	loadData(collection) {
		this.collection = collection;
		this.getLabData();
	}

	getLabData() {
		this.activeEntitiesService.getActiveLabs().subscribe(response => {
			response.json().forEach(lab => {
				if (lab.Code === this.workListService.collectionListLab) {
					this.labInfo = lab;
					console.log('labInfo: ', this.labInfo);
				}
			});
		});
	}

	reset() {
		this.showPrintForms = false;
		this.forms = {
			ABN: '',
			FinancialResponsibility: '',
			Requisition: '',
			Comments: ''
		};
	}

	showFinancial() {
		const collectionID = this.collection['DecodedId'].split('||')[0];
		const tests = [];
		console.log('collection: ', this.collection);
		console.log('orderedTests: ', this.collection.OrderedTests);
		this.collection.OrderedTests.forEach(test => {
			tests.push({ Code: test.Id.replace(`${collectionID}_`, ''), Charge: test.ChargeAmount });
			if (test.OtherTests) {
				test.OtherTests.forEach(otherTest => {
					tests.push({ Code: otherTest.Code, Charge: otherTest.ChargeAmount });
				});
			}
		});
		const dataObject = {
			Patient: {
				Name: `${this.collection.Patient.LastName},${this.collection.Patient.FirstName}`,
				MRN: this.collection.Patient.MRN
			},
			Lab: {
				Code: this.labInfo.Code,
				Description: this.labInfo.Description,
				Address: `${this.labInfo.Location.StreetAddress1}, ${this.labInfo.Location.City} ${this.labInfo.Location.State} ${this.labInfo.Location.PostalCode}`,
				Phone: this.labInfo.Phone
			},
			Tests: tests
		};
		const newDialog = this.dialog.open(FinancialResponsibilityFormComponent, {
			data: dataObject,
			panelClass: 'worklistForm',
			backdropClass: 'fullPageOverlay',
		});
	}

	showRequisition() {
		const collectionID = this.collection['DecodedId'].split('||')[0];
		const tests = [];
		let id = 1;
		this.collection.OrderedTests.forEach(test => {
			const rootTest = { id: id, Code: test.Code, Description: test.Description, ContainerCode: test.Container.Code, Priority: test.Priority.Code, Accession: test.LaboratoryAccessionId };
			tests.push(rootTest);
			id++;
			if (test.OtherTests) {
				test.OtherTests.forEach(otherTest => {
					console.log('otherTest: ', otherTest);
					// otherTest
					const newTest = { id: id, Code: otherTest.Code, Description: otherTest.Description, ContainerCode: test.Container.Code, Priority: test.Priority.Code, Accession: test.LaboratoryAccessionId };
					tests.push(newTest);
					id++;
				});
			}
		});
		const dataObject = {
			Collection: this.collection,
			Lab: {
				Code: this.labInfo.Code,
				Description: this.labInfo.Description,
				Address: `${this.labInfo.Location.StreetAddress1}, ${this.labInfo.Location.City} ${this.labInfo.Location.State} ${this.labInfo.Location.PostalCode}`,
				Phone: this.labInfo.Phone
			},
			Tests: tests
		};
		const newDialog = this.dialog.open(RequisitionFormComponent, {
			data: dataObject,
			panelClass: 'worklistForm',
			backdropClass: 'fullPageOverlay',
		});
	}

	showABN(lang) {
		const tests = [];
		let id = 1;
		this.collection.OrderedTests.forEach(test => {
			const rootTest = { id: id, Code: test.Code, Description: test.Description, ContainerCode: test.Container.Code, Priority: test.Priority.Code, Accession: test.LaboratoryAccessionId, ChargeAmount: test.ChargeAmount };
			tests.push(rootTest);
			id++;
			if (test.OtherTests) {
				test.OtherTests.forEach(otherTest => {
					console.log('otherTest: ', otherTest);
					// otherTest
					const newTest = { id: id, Code: otherTest.Code, Description: otherTest.Description, ContainerCode: test.Container.Code, Priority: test.Priority.Code, Accession: test.LaboratoryAccessionId, ChargeAmount: test.ChargeAmount };
					tests.push(newTest);
					id++;
				});
			}
		});
		const dataObject = {
			Collection: this.collection,
			Lab: {
				Code: this.labInfo.Code,
				Description: this.labInfo.Description,
				Address: `${this.labInfo.Location.StreetAddress1}, ${this.labInfo.Location.City} ${this.labInfo.Location.State} ${this.labInfo.Location.PostalCode}`,
				Phone: this.labInfo.Phone
			},
			Tests: tests,
			Language: lang
		};
		const newDialog = this.dialog.open(AbnFormComponent, {
			data: dataObject,
			// height: '500px',
			// width: '760px'
			panelClass: 'worklistForm',
			backdropClass: 'fullPageOverlay',
		});
	}


}
