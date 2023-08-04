import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import { NgModel } from '@angular/forms';
import { WorkListService } from 'src/app/services/work-list.service';

@Component({
	selector: 'app-work-list-cancel',
	templateUrl: './work-list-cancel.component.html',
	styleUrls: ['./work-list-cancel.component.css']
})
export class WorkListCancelComponent {
	@Output() cancelSubmit = new EventEmitter();
	showCancel = false;

	collection = new Collection();

	reason = '';
	comments = '';

	cancelReasons = [];

	objectForm = [];
	@ViewChild('cancelReasonForm') cancelReasonForm: NgModel;
	@ViewChild('cancelCommentsForm') cancelCommentsForm: NgModel;

	constructor(private workListService: WorkListService) { }

	refillObjectForm() {
		this.objectForm = [];
		if (this.showCancel) {
			this.objectForm.push(this.cancelReasonForm);
			this.objectForm.push(this.cancelCommentsForm);
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
		this.loadCancelReasons();
		this.showCancel = true;
	}

	close() {
		this.showCancel = false;
		this.reset();
	}

	load(collection) {
		this.collection = collection;
	}

	reset() {
		this.resetAdd();
		this.showCancel = false;

		this.collection = new Collection();

		this.reason = '';
		this.comments = '';
	}

	loadCancelReasons() {
		if (this.workListService.cancelReasons.length) {
			this.cancelReasons = JSON.parse(JSON.stringify(this.workListService.cancelReasons));
		} else {
			if (this.workListService.collectionListLab === undefined) {
				this.workListService.getCancellationReasons()
					.then(success => {
						this.cancelReasons = JSON.parse(JSON.stringify(this.workListService.cancelReasons));
					})
					.catch(error => {
						console.log(`Error getting cancel reasons: ${error}`);
					});
			} else {
				this.workListService.getCancellationReasonsForLab(this.workListService.collectionListLab)
					.then(success => {
						this.cancelReasons = JSON.parse(JSON.stringify(this.workListService.cancelReasons));
					})
					.catch(error => {
						console.log(`Error getting cancel reasons: ${error}`);
					});
			}
		}
	}

	cancel() {
		if (this.saveForm()) {
			if (this.collection.OrderedTests.filter(test => test['checked'] && !test.IsDisabled).length) {
				const testsToSend = this.collection.OrderedTests.filter(test => test['checked'] && !test.IsDisabled).map(test => test.Id);
				this.collection.OrderedTests.filter(test => test['checked'] && !test.IsDisabled).forEach(test => {
					test['cancelled'] = true;
					test['checked'] = false;
				});
				this.cancelSubmit.emit({ reason: this.reason, comments: this.comments, tests: testsToSend });
			} else {
				this.collection.OrderedTests.filter(test => !test.IsDisabled).forEach(test => {
					test['cancelled'] = true;
					test['checked'] = false;
				});
				this.cancelSubmit.emit({ reason: this.reason, comments: this.comments, tests: this.collection.OrderedTests });
			}
		}
	}

}
