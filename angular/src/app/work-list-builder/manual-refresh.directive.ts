import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { timer } from 'rxjs';
import { WorkListService } from '../services/work-list.service';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[manualRefresh]'
})
export class ManualRefreshDirective {
	@Input() refreshTime: any;
	subscription: any;
	refreshTimer: any;
	refreshDisabled: any;

	constructor(private el: ElementRef, private workListService: WorkListService) { }

	@HostListener('click', ['$event']) onClick(event) {
		this.workListService.startManualRefresh();
	}

}
