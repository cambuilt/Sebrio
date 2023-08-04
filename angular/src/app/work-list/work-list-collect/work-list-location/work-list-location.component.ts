import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { TranslationService } from 'angular-l10n';
import { NgModel } from '@angular/forms';
import { WorkListService } from 'src/app/services/work-list.service';

@Component({
	selector: 'app-work-list-location',
	templateUrl: './work-list-location.component.html',
	styleUrls: ['./work-list-location.component.css']
})
export class WorkListLocationComponent implements OnInit {
	@Output() submitLocation = new EventEmitter();
	showLocation = false;

	collectionLocation = {
		CollectionSite: '',
		Quantity: '',
		Workload: '',
		Comments: ''
	};

	collectionSites = [];
	workloads = [];

	canIdentifyCollectionSite = true;
	canWorkloadCodeEntry = true;


	objectForm = [];
	@ViewChild('collectionSite') collectionSite: NgModel;
	@ViewChild('collectionQuantity') collectionQuantity: NgModel;
	@ViewChild('collectionWorkload') collectionWorkload: NgModel;

	constructor(private workListService: WorkListService, public translation: TranslationService) { }

	ngOnInit() {
		this.refillObjectForm();
	}

	refillObjectForm() {
		this.objectForm = [];
		if (this.showLocation) {
			if (this.canIdentifyCollectionSite) {
				this.objectForm.push(this.collectionSite);
			}
			if (this.canWorkloadCodeEntry) {
				this.objectForm.push(this.collectionQuantity);
				this.objectForm.push(this.collectionWorkload);
			}
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
		if (formValid) {
			this.submitLocation.emit(this.collectionLocation);
		}
		return formValid;
	}

	show() {
		this.getCollectionSites();
		this.getWorkloads();
		this.showLocation = true;
	}

	close() {
		this.showLocation = false;
	}

	reset() {
		this.resetAdd();
		this.showLocation = false;

		this.collectionLocation = {
			CollectionSite: '',
			Quantity: '',
			Workload: '',
			Comments: ''
		};

		this.collectionSites = [];
		this.workloads = [];
	}

	getCollectionSites() {
		if (this.workListService.collectionSites.length) {
			this.collectionSites = JSON.parse(JSON.stringify(this.workListService.collectionSites));
		} else {
			if (this.workListService.collectionListLab === undefined) {
				this.workListService.getCollectionSites()
					.then(success => {
						this.collectionSites = JSON.parse(JSON.stringify(this.workListService.collectionSites));
					})
					.catch(error => {
						console.log(`Error loading collection sites: ${error}`);
					});
			} else {
				this.workListService.getCollectionSitesForLab(this.workListService.collectionListLab)
				.then(success => {
					this.collectionSites = JSON.parse(JSON.stringify(this.workListService.collectionSites));
				})
				.catch(error => {
					console.log(`Error loading collection sites: ${error}`);
				});
			}

		}
		console.log(this.collectionSites);
	}

	getWorkloads() {
		if (this.workListService.workloads.length) {
			this.workloads = JSON.parse(JSON.stringify(this.workListService.workloads));
		} else {
			if (this.workListService.collectionListLab === undefined) {
				this.workListService.getWorkloads()
					.then(success => {
						this.workloads = JSON.parse(JSON.stringify(this.workListService.workloads));
					})
					.catch(error => {
						console.log(`Error getting workloads: ${error}`);
					});
			} else {
				this.workListService.getWorkloadsForLab(this.workListService.collectionListLab)
					.then(success => {
						this.workloads = JSON.parse(JSON.stringify(this.workListService.workloads));
					})
					.catch(error => {
						console.log(`Error getting workloads: ${error}`);
					});
			}

		}
		console.log(this.workloads);
	}

	updateStorage(storedString, value) {
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			parsedStorage[storedString] = value;
			localStorage.setItem('workListCollecting', JSON.stringify(parsedStorage));
		}
	}

	updateCollectionSite() {
		this.updateStorage('CollectionSite', this.collectionLocation.CollectionSite);
	}

	updateWorkload() {
		this.updateStorage('Workload', this.collectionLocation.Workload);
	}

	updateQuantity() {
		this.updateStorage('WorkloadQuantity', this.collectionLocation.Quantity);
	}

	updateComments() {
		this.updateStorage('CollectionComments', this.collectionLocation.Comments);
	}

	complete() {
		this.updateStorage('CollectionLocationComplete', true);
	}

}
