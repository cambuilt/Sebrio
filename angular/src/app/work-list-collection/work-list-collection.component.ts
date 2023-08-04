import { Component, EventEmitter, Output, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatIconRegistry, MatExpansionPanel } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { AuthService } from '../services/auth.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { WorkListService } from '../services/work-list.service';
import { Observable } from 'rxjs';
import { CancellationService } from '../services/cancellation.service';
import { HubService } from '../services/hub.service';
import { TranslationService } from 'angular-l10n';

@Component({
	selector: 'app-work-list-collection',
	templateUrl: './work-list-collection.component.html',
	styleUrls: ['./work-list-collection.component.css']
})
export class WorkListCollectionComponent implements OnInit {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onComplete = new EventEmitter();
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onProblemList = new EventEmitter();
	@ViewChild('transferOrder') transferOrder: MatExpansionPanel;
	@ViewChild('cancelOrder') cancelOrder: MatExpansionPanel;
	isDrawerOpen = false;
	headerText = 'Collection';
	search: boolean;
	problemList: Observable<boolean>;
	rowID: any;
	cancellations: any;
	cancelReason: any;
	transferUser: any;
	notes: any;
	MRN: any;
	DOB: any;
	accountNumber: any;
	hubUsers: any;
	constructor(public translation: TranslationService, private hubService: HubService, private cancellationService: CancellationService, private workListService: WorkListService, public utilsService: UtilsService, private errorAlert: MatDialog, public authService: AuthService) { }

	ngOnInit() {
		this.getProblemListFlag();
		this.loadCancellations();
		/* const previousButton: HTMLButtonElement = document.querySelector('.mat-paginator-navigation-previous');
		previousButton.title = this.translation.translate('Label.Previous');
		const nextButton: HTMLButtonElement = document.querySelector('.mat-paginator-navigation-next');
		nextButton.title = this.translation.translate('Label.Next'); */
	}

	getInfo() {
		const id = this.workListService.getHub();
		this.hubService.getHub(id).subscribe(response => {
			const hub = response.json();
			this.hubUsers = hub.Users;
			console.log('hubUsers: ', this.hubUsers);
		}, error => {
			this.utilsService.handle401(error);
		});
	}

	getProblemListFlag() {
		this.problemList = this.workListService.getProblemListFlag();
	}

	editCollection(id) {
		this.workListService.resetCleanTime();
		console.log(id);
		this.rowID = id;
		this.show();
	}

	loadCancellations() {
		this.cancellationService.getCancellations().subscribe(response => {
			this.cancellations = response.json();
		}, error => {
			this.utilsService.handle401(error);
			console.log('there was an error loading cancellations');
		});
	}

	completeCollection() {
		this.closeDrawer();
		this.onComplete.emit(this.rowID);
	}

	scrollDown(duration) {
		setTimeout(() => document.querySelector('app-work-list-collection .drawer-content').scrollTop = document.querySelector('app-work-list-collection .drawer-content').scrollHeight, duration);
	}


	moveToProblemList() {
		this.closeDrawer();
		this.onProblemList.emit(this.rowID);
	}

	show() {
		this.getInfo();
		this.isDrawerOpen = true;
		this.clearFields();
		document.querySelector('app-work-list-collection .drawer-content').scrollTop = 0;
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.utilsService.closeSnackBar();
		this.search = false;
		this.transferUser = '';
		this.cancelOrder.close();
		this.transferOrder.close();
	}

	clickOverlay() {
		this.closeDrawer();
	}

	clearFields() {

	}

}
