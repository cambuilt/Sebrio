import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Collection } from 'src/app/models/collection.model';

@Component({
	selector: 'app-work-list-problem-list',
	templateUrl: './work-list-problem-list.component.html',
	styleUrls: ['./work-list-problem-list.component.css']
})
export class WorkListProblemListComponent {
	@Output() problemList = new EventEmitter();
	showProblemList = false;

	collection = new Collection();

	reason = '';

	objectForm = [];
	@ViewChild('problemListReason') problemListReason: NgModel;

	constructor() { }

	refillObjectForm() {
		this.objectForm = [];
		if (this.showProblemList) {
			this.objectForm.push(this.problemListReason);
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
		this.showProblemList = true;
	}

	close() {
		this.showProblemList = false;
		this.reset();
	}

	load(collection) {
		this.collection = collection;
	}

	reset() {
		this.resetAdd();
		this.showProblemList = false;

		this.collection = new Collection();

		this.reason = '';
	}

	move() {
		if (this.saveForm()) {
			if (this.collection.OrderedTests.filter(test => test['checked'] && !test.IsDisabled).length) {
				this.collection.OrderedTests.filter(test => test['checked'] && !test.IsDisabled).forEach(test => {
					test['problemListed'] = true;
					test['checked'] = false;
				});
				this.problemList.emit(this.reason);
			} else {
				this.collection.OrderedTests.filter(test => !test.IsDisabled).forEach(test => {
					test['problemListed'] = true;
					test['checked'] = false;
				});
				this.problemList.emit(this.reason);
			}
		}
	}

}
