import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../node_modules/@angular/material';
import { WorkListService } from '../services/work-list.service';
import { timer } from 'rxjs';
import { NgModel } from '@angular/forms';
import { TranslationService } from 'angular-l10n';
import * as moment from 'moment-timezone';
import { UtilsService } from '../services/utils.service';

@Component({
	selector: 'app-work-list-request-dialog',
	templateUrl: './work-list-request-dialog.component.html',
	styleUrls: ['./work-list-request-dialog.component.css']
})
export class WorkListRequestDialogComponent implements OnInit, OnDestroy {
	secondsRemaining: any;
	timerSub: any;
	timer: any;
	timeRemaining = '20:00';
	timerActive: boolean;
	contactTSA: boolean;
	activeRequest: any;

	objectForm = [];
	reasonText = '';
	dataSubscription: any;
	closeSubscription: any;
	@ViewChild('reason') reason: NgModel;

	constructor(public translation: TranslationService, private workListService: WorkListService, private utilsService: UtilsService, public dialogRef: MatDialogRef<WorkListRequestDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	readyReason() {
		this.reason.control.markAsDirty();
		this.reason.control.markAsTouched();
		this.reason.control.updateValueAndValidity();
	}

	ngOnInit() {
		this.readyReason();
		this.watchToClose();
		this.contactTSA = false;
		this.timerActive = false;
		console.log(this.data.row);
		if (this.data.row.Requestees.length) {
			this.timerActive = this.checkRequestees(this.data.row.Requestees);
			if (this.timerActive === true) {
				this.timerComplete();
			}
		}
	}

	watchToClose() {
		if (this.closeSubscription) {
			this.closeSubscription.unsubscribe();
		}
		this.closeSubscription = this.workListService.getPatients().subscribe(response => {
			if (response.find(patient => patient.Id === this.data.row.Id).Status !== this.data.row.Status) {
				this.dialogRef.close();
			}
		}, error => {
			this.utilsService.handle401(error);
		});
	}

	checkRequestees(array) { // returns true if there is an active request from currentUser
		const myRequests = array.filter(row => row.RequestedBy === this.workListService.currentPhleb.username);
		let activeReq: any;
		myRequests.forEach(req => {
			if (!this.hasPastMoment(moment.utc(req.RequestDelayDateTime).tz(moment.tz.guess()).format())) {
				activeReq = req;
				this.reasonText = req.RequestReason;
			} else {
				if (this.hasPastMoment(moment.utc(req.InitialRequestDelayDateTime).tz(moment.tz.guess()).format())) {
					this.contactTSA = true;
				}
			}
		});
		this.activeRequest = activeReq;
		if (this.activeRequest !== undefined) {
		}
		return (activeReq !== undefined);
	}

	request() {
		this.workListService.requestCollection(this.data.row.Id, this.reasonText).subscribe(response => {
			console.log(response);
			if (this.dataSubscription) {
				this.dataSubscription.unsubscribe();
			}
			const dataSub = this.workListService.dataSubject.asObservable();
			let count = 0;
			this.dataSubscription = dataSub.subscribe(n => {
				console.log(`n inside dataSubject subscription:`, n);
				if (count !== 0) {
					this.timerActive = this.checkRequestees(n.filter(patient => patient.Id === this.data.row.Id)[0].Requestees);
					this.timerComplete();
					this.dialogRef.close();
				}
				count++;
			});
			this.workListService.getCollectionsByFilter(this.workListService.searchObj);
		}, error => {
			this.utilsService.handle401(error);
		});
	}

	requestFromTSA() {
		this.workListService.requestCollectionFromTSA(this.data.row.Id, this.reasonText).subscribe(response => {
			console.log(response);
		});
		console.log('Requested collection from TSA');
		this.dialogRef.close();
	}

	/* getFormattedTime() {
		if (this.secondsRemaining.valueOf() > 0) {
			return (this.zeroPad(this.secondsRemaining.getMinutes()) + ':' + this.zeroPad(this.secondsRemaining.getSeconds()));
		} else {
			return '00:00';
		}
	} */

	getFormattedTime() {
		return this.workListService.getRequestTimer(this.data.row);
	}

	zeroPad(number) {
		if (number < 10) {
			return '0' + number;
		} else {
			return number;
		}
	}

	setTimer() {
		if (this.timerSub) {
			this.timerSub.unsubscribe();
		}
		this.timer = timer(250);
		this.timerSub = this.timer.subscribe(n => {
			this.timerComplete();
		});
	}

	timerComplete() {
		if (this.activeRequest) {
			this.secondsRemaining = new Date(this.msDiff(moment.utc(this.activeRequest.RequestDelayDateTime).tz(moment.tz.guess()).format(), moment(this.workListService.now)));
			if (this.secondsRemaining.valueOf() < 0) {
				this.contactTSA = true;
			}
			this.setTimer();
		}
	}

	hasPastMoment(m) {
		return (this.msDiff(m, moment(this.workListService.now)) < 0) ? true : false;
	}

	msDiff(time1, time2) {
		return -1 * moment.duration(time2.diff(time1));
	}

	ngOnDestroy(): void {
		if (this.closeSubscription) {
			this.closeSubscription.unsubscribe();
		}
		if (this.dataSubscription) {
			this.dataSubscription.unsubscribe();
		}
	}

}
