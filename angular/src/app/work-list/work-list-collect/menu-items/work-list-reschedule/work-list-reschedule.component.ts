import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Collection } from 'src/app/models/collection.model';
import * as moment from 'moment-timezone';

@Component({
	selector: 'app-work-list-reschedule',
	templateUrl: './work-list-reschedule.component.html',
	styleUrls: ['./work-list-reschedule.component.css']
})
export class WorkListRescheduleComponent implements OnInit {
	@Output() submitReschedule = new EventEmitter();
	showReschedule = false;

	collection = new Collection();

	date: any;
	time: any;
	reason: '';

	today;

	objectForm = [];
	@ViewChild('rescheduleDate') rescheduleDate: NgModel;
	@ViewChild('rescheduleTime') rescheduleTime: any;
	@ViewChild('rescheduleReason') rescheduleReason: NgModel;

	constructor() { }

	ngOnInit() {
		this.today = moment();
	}

	refillObjectForm() {
		this.objectForm = [];
		if (this.showReschedule) {
			this.objectForm.push(this.rescheduleDate);
			this.objectForm.push(this.rescheduleTime);
			this.objectForm.push(this.rescheduleReason);
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
		this.showReschedule = true;
	}

	close() {
		this.showReschedule = false;
		this.reset();
	}

	load(collection) {
		this.collection = collection;
	}

	reset() {
		this.resetAdd();
		this.showReschedule = false;
		this.date = undefined;

		this.collection = new Collection();

		this.time = undefined;
		this.reason = '';
	}

	updateTime() {
		const previousTime = this.rescheduleTime._rawValidators.find(validator => validator.name === 'PreviousTimeDirective');
		previousTime.date = this.date;
		previousTime.outsideCheckDate();
		const timeModel = this.rescheduleTime.value;
		if (timeModel !== null && timeModel !== undefined) {
			this.rescheduleTime.control.markAsDirty();
			this.rescheduleTime.control.markAsTouched();
			this.rescheduleTime.control.updateValueAndValidity();
		}
	}

	makeReturnObject() {
		const date = this.date.format('YYYY-MM-DD') + ' ' + this.time + ':00';
		const localMoment = moment(date, 'YYYY-MM-DD HH:mm:ss');
		return { RescheduleDateTime: localMoment.utc().format('YYYY-MM-DD HH:mm:ss'), RescheduleReason: this.reason };
	}

	reschedule() {
		this.updateTime();
		if (this.saveForm()) {
			if (this.collection.OrderedTests.filter(test => test['checked'] && !test.IsDisabled).length) {
				this.collection.OrderedTests.filter(test => test['checked'] && !test.IsDisabled).forEach(test => {
					test['ScheduledTime'] = this.time;
					test['ScheduledDate'] = moment(this.date).format('MM/DD/YY');
					test['rescheduled'] = true;
					test['checked'] = false;
				});
				this.submitReschedule.emit(this.makeReturnObject());
			} else {
				this.collection.OrderedTests.filter(test => !test.IsDisabled).forEach(test => {
					test['ScheduledTime'] = this.time;
					test['ScheduledDate'] = moment(this.date).format('MM/DD/YY');
					test['rescheduled'] = true;
					test['checked'] = false;
				});
				this.submitReschedule.emit(this.makeReturnObject());
			}
		}
	}

}
