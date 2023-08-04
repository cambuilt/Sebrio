import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import { NgModel } from '@angular/forms';
import { WorkListService } from 'src/app/services/work-list.service';

@Component({
	selector: 'app-work-list-transfer',
	templateUrl: './work-list-transfer.component.html',
	styleUrls: ['./work-list-transfer.component.css']
})
export class WorkListTransferComponent {
	@Output() submitTransfer = new EventEmitter();
	showTransfer = false;
	collection = new Collection();

	user = '';

	users = [];
	comments = '';

	objectForm = [];
	@ViewChild('transferTo') transferTo: NgModel;
	@ViewChild('transferComments') transferComments: NgModel;

	constructor(private workListService: WorkListService) { }

	refillObjectForm() {
		this.objectForm = [];
		if (this.showTransfer) {
			this.objectForm.push(this.transferTo);
			this.objectForm.push(this.transferComments);
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
		this.loadTransferTargets();
		this.showTransfer = true;
	}

	close() {
		this.showTransfer = false;
		this.reset();
	}

	reset() {
		this.resetAdd();
		this.showTransfer = false;
		this.collection = new Collection();
		this.user = '';
		this.users = [];
	}

	load(collection) {
		this.collection = collection;
	}

	loadTransferTargets() {
		if (this.workListService.transferTargets.length) {
			this.users = JSON.parse(JSON.stringify(this.workListService.transferTargets));
		} else {
			this.workListService.getTransferrableUsers()
				.then(success => {
					this.users = JSON.parse(JSON.stringify(this.workListService.transferTargets));
				})
				.catch(error => {
					console.log(`Error getting transfer targets: ${error}`);
				});
		}
	}

	transfer() {
		if (this.saveForm()) {
			if (this.collection.OrderedTests.filter(test => test['checked'] && !test.IsDisabled).length) {
				const testsToSend = this.collection.OrderedTests.filter(test => test['checked'] && !test.IsDisabled).map(test => test.Id);
				this.collection.OrderedTests.filter(test => test['checked'] && !test.IsDisabled).forEach(test => {
					test['transferred'] = true;
					test['checked'] = false;
				});
				this.submitTransfer.emit({ to: this.user, tests: testsToSend, comments: this.comments });
			} else {
				this.collection.OrderedTests.filter(test => !test.IsDisabled).forEach(test => {
					test['transferred'] = true;
					test['checked'] = false;
				});
				this.submitTransfer.emit({ to: this.user, tests: this.collection.OrderedTests.map(test => test.Id), comments: this.comments });
			}
		}
	}

}
