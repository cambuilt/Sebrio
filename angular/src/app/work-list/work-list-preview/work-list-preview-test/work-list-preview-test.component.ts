import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import * as moment from 'moment-timezone';

@Component({
	selector: 'app-work-list-preview-test',
	templateUrl: './work-list-preview-test.component.html',
	styleUrls: ['./work-list-preview-test.component.css']
})
export class WorkListPreviewTestComponent implements OnInit, AfterViewInit {
	@Input() test: any;
	@Input() collection: any;
	@Input() testDisabled: any;
	@ViewChild('testInformation') testInformation: ElementRef;
	@ViewChild('testCode') testCode: ElementRef;
	@ViewChild('testVolume') testVolume: ElementRef;
	@ViewChild('firstRow') firstRow: ElementRef;

	platform;
	userAgentCategory;

	ScheduledTime;
	ScheduledDate;
	colorTextColor;
	actions = [];

	constructor() {
		this.platform = window.navigator.platform;
		if (navigator.userAgent.match(/Android/)) {
			this.userAgentCategory = 'Android';
		} else if (navigator.userAgent.match(/iPhone|iPad|iPod/)) {
			this.userAgentCategory = 'iOS';
		} else if (navigator.platform.match(/Mac/i)) {
			this.userAgentCategory = 'Mac';
		} else if (navigator.platform.match(/Win/i)) {
			this.userAgentCategory = 'Windows';
		}
	}

	ngOnInit() {
		this.getColorTextColor();
		this.getActions();
		this.makeInstructionsArray();
	}

	ngAfterViewInit(): void {
		this.wrapTest();
	}

	getActions() {
		this.collection.OrderedTests.forEach(test => {
			test.actions = [];
			if (test.IsCancelled) {
				test.actions.push({ IsCancelled: true, time: moment(test.CancelTime) });
			}
			if (test.IsRescheduled) {
				test.actions.push({ IsRescheduled: true, time: moment(test.RescheduleTime) });
			}
			if (test.IsProblem) {
				test.actions.push({ IsProblem: true, time: moment(test.ProblemTime) });
			}
			if (test.IsTransferred) {
				test.actions.push({ IsTransferred: true, time: moment(test.TransferTime) });
			}
			if (test.IsCollected) {
				test.actions.push({ IsCollected: true, time: moment(test.CompleteTime) });
			}
			test.actions.sort((a, b) => {
				if (a.time.isBefore(b.time)) {
					return -1;
				}
				if (b.time.isBefore(a.time)) {
					return 1;
				}
				return 0;
			});
		});
	}

	makeInstructionsArray() {
		this.test.InstructionsArray = this.test.Instructions.split(' - ');
	}

	getColorTextColor() {
		if (this.test.Container.TopColor === '') {
			this.colorTextColor = 'black';
		} else {
			this.colorTextColor = (this.perceivedBrightness(this.test.Container.TopColor) > .6) ? ('black') : ('white');
		}
	}

	perceivedBrightness(hex) {
		const rgb = this.hexToRgb(hex);
		if (rgb !== null) {
			return (0.2126 * (rgb.r / 255) + 0.7152 * (rgb.g) / 255 + 0.0722 * (rgb.b / 255));
		} else {
			return 0;
		}
	}

	hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	wrapTest() {
		if (this.getComputedWidth(this.testInformation.nativeElement) < (this.getComputedWidth(this.testCode.nativeElement) + this.getComputedWidth(this.testVolume.nativeElement) + 8)) {
			this.testCode.nativeElement.style.width = `${this.getComputedWidth(this.testInformation.nativeElement) - (this.getComputedWidth(this.testVolume.nativeElement) + 8)}px`;
		}
	}

	getComputedWidth(element) {
		return parseInt(((getComputedStyle(element).width).split('px').join('')), 10);
	}

	@HostListener('window:resize') onResize() {
		if (window.innerWidth <= 790) {
			this.wrapTest();
		}
	}
}
