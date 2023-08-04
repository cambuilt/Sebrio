import { Component, OnInit, ViewChild, Output, EventEmitter, OnDestroy, ComponentFactoryResolver } from '@angular/core';
import { WorkListIdentifyComponent } from './work-list-identify/work-list-identify.component';
import { TranslationService } from 'angular-l10n';
import { WorkListMenuComponent } from './work-list-menu/work-list-menu.component';
import { WorkListPatientComponent } from './work-list-patient/work-list-patient.component';
import { WorkListSelectComponent } from './work-list-select/work-list-select.component';
import { Collection } from 'src/app/models/collection.model';
import { WorkListLocationComponent } from './work-list-location/work-list-location.component';
import { WorkListCentralLineComponent } from './work-list-central-line/work-list-central-line.component';
import { WorkListPrintFormsComponent } from './work-list-print-forms/work-list-print-forms.component';
import { WorkListProblemListComponent } from './menu-items/work-list-problem-list/work-list-problem-list.component';
import { WorkListCancelComponent } from './menu-items/work-list-cancel/work-list-cancel.component';
import { WorkListPrintCommComponent } from './menu-items/work-list-print-comm/work-list-print-comm.component';
import { WorkListPrintPatientComponent } from './menu-items/work-list-print-patient/work-list-print-patient.component';
import { WorkListRescheduleComponent } from './menu-items/work-list-reschedule/work-list-reschedule.component';
import { WorkListTransferComponent } from './menu-items/work-list-transfer/work-list-transfer.component';
import * as moment from 'moment-timezone';
import { WorkListService } from 'src/app/services/work-list.service';
import { SlideoutDirective } from './work-list-menu-slideout/slideout.directive';
import { WorkListMenuSlideoutComponent } from './work-list-menu-slideout/work-list-menu-slideout.component';
import { AuthService } from 'src/app/services/auth.service';
import { PrintService } from 'src/app/services/print.service';
import { MatDialog } from '@angular/material';
import { UnsavedChangesDialogComponent } from 'src/app/unsaved-changes-dialog/unsaved-changes-dialog.component';
import { UtilsService } from 'src/app/services/utils.service';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-work-list-collect',
	templateUrl: './work-list-collect.component.html',
	styleUrls: ['./work-list-collect.component.css']
})
export class WorkListCollectComponent implements OnInit, OnDestroy {
	@Output() completeCollection = new EventEmitter();
	@Output() cancel = new EventEmitter();
	@Output() reschedule = new EventEmitter();
	@Output() transfer = new EventEmitter();
	@Output() problemList = new EventEmitter();
	@Output() commLabels = new EventEmitter();
	@Output() containerLabels = new EventEmitter();
	@Output() patientLabels = new EventEmitter();
	@Output() clickedOverlay = new EventEmitter();
	@Output() closePreview = new EventEmitter();

	@ViewChild(SlideoutDirective) slideoutHost: SlideoutDirective;

	@ViewChild('workListIdentify') workListIdentify: WorkListIdentifyComponent;
	@ViewChild('workListMenu') workListMenu: WorkListMenuComponent;
	@ViewChild('workListCollection') workListCollection: WorkListPatientComponent;
	@ViewChild('workListSelect') workListSelect: WorkListSelectComponent;
	@ViewChild('workListLocation') workListLocation: WorkListLocationComponent;
	@ViewChild('workListCentralLine') workListCentralLine: WorkListCentralLineComponent;
	@ViewChild('workListPrintForms') workListPrintForms: WorkListPrintFormsComponent;

	@ViewChild('workListProblemList') workListProblemList: WorkListProblemListComponent;
	@ViewChild('workListCancel') workListCancel: WorkListCancelComponent;
	@ViewChild('workListPrintComm') workListPrintComm: WorkListPrintCommComponent;
	@ViewChild('workListPrintPatient') workListPrintPatient: WorkListPrintPatientComponent;
	@ViewChild('workListReschedule') workListReschedule: WorkListRescheduleComponent;
	@ViewChild('workListTransfer') workListTransfer: WorkListTransferComponent;

	showDrawer = false;
	showOverlay = true;
	hideShadow = false;

	showPatientInfo = false;
	showMenu = false;
	showingMenuOption = false;

	showIdentify = false;
	showSelect = false;
	showLocation = false;
	showCentralLine = false;
	showPrintForms = false;

	showCancel = false;
	showPrintComm = false;
	showPrintPatient = false;
	showProblemList = false;
	showReschedule = false;
	showTransfer = false;

	previouslyOpen;

	nextDisabled = true;
	showComplete = false;
	completeDisabled = false;
	printDisabled = true;
	collection = new Collection();

	commLabelsPrinted = 0;

	collectionTime: any = {
		StartTime: null,
		EndTime: null,
		Elapsed: null
	};

	openSlideouts = [];
	openSlideoutSubscriptions = [];

	collectionListSubscription;

	collectionList;

	isLoading: Observable<boolean>;

	printedSubscription: any;

	constructor(public translation: TranslationService, private authService: AuthService, private utilsService: UtilsService, private dialog: MatDialog, private printService: PrintService, private workListService: WorkListService, private componentFactoryResolver: ComponentFactoryResolver) {
		this.printedSubscription = this.printService.printStatus.subscribe(response => {
			if (response !== 0 && this.showSelect && this.printService.printingContainerLabel) {
				this.containerLabels.emit(response);
			}
		});
		this.isLoading = this.printService.loadingStatus;
	}

	ngOnInit() {
		this.collectionListSubscription = this.workListService.getCollectionListChangeFlag().subscribe(response => {
			if (this.workListService.getCollectionList() !== undefined) {
				this.collectionList = this.workListService.getCollectionList();
			}
		});
	}

	ngOnDestroy(): void {
		if (this.collectionListSubscription) {
			this.collectionListSubscription.unsubscribe();
		}
	}

	show(collection) {
		this.collection = { ...collection };
		this.updateChildren();
		this.showDrawer = true;
		this.workListIdentify.animation = true;
		this.checkStorage();
		/* this.openIdentify(); */
		const startTime = moment();
		this.workListService.workListAction({ action: 'startCollect', collection: collection, time: startTime });
		this.collectionTime.StartTime = startTime;
	}

	checkStorage() {
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			if ((parsedStorage.ManualIdentifyConfirmed || parsedStorage.ScanIdentifyConfirmed) && parsedStorage.IdentifyComplete === true) {
				this.recordIdentify(parsedStorage);
				this.parseSelectFromStorage(parsedStorage);
				if (parsedStorage.CentralLineComplete) {
					parsedStorage.CollectionLocationComplete = true;
				}
				if (parsedStorage.SelectComplete === true) {
					if (parsedStorage.CollectionLocationComplete) {
						this.loadLocationFromStorage(parsedStorage);
						this.recordLocation(this.workListLocation.collectionLocation);
					}

					if (parsedStorage.CentralLineComplete) {
						this.loadCentralLineFromStorage(parsedStorage);
						this.recordCentralLine(parsedStorage);
					}

					if (!parsedStorage.CollectionLocationComplete && !parsedStorage.CentralLineComplete && (this.collectionList.CanIdentifyCollectionSite || this.collectionList.CanWorkloadCodeEntry)) {
						this.openLocationFromStorage(parsedStorage);
					} else if (!parsedStorage.CentralLineComplete) {
						this.openCentralLineFromStorage(parsedStorage);
					} else {
						this.openPrintForms();
						this.showComplete = true;
					}
				} else {
					this.openSelect();
					this.checkTests();
				}
			} else {
				this.openIdentifyFromStorage(parsedStorage);
			}
		} else {
			this.openIdentify();
		}
	}

	parseSelectFromStorage(parsedStorage) {
		if (parsedStorage.OrderedTests) {
			parsedStorage.OrderedTests.forEach(test => {
				const thisTest = this.collection.OrderedTests.find(otest => otest.Id === test.Id);
				thisTest.IsDisabled = test.IsDisabled;
				thisTest.checked = test.checked;
				thisTest.printed = test.printed;
			});
			if (this.collection.OrderedTests.filter(test => test.checked && !test.IsDisabled).length) {
				this.printDisabled = false;
			}
		}
	}

	loadLocationFromStorage(parsedStorage) {
		if (parsedStorage.Workload) {
			this.workListLocation.collectionLocation.Workload = parsedStorage.Workload;
		}
		if (parsedStorage.CollectionSite) {
			this.workListLocation.collectionLocation.CollectionSite = parsedStorage.CollectionSite;
		}
		if (parsedStorage.WorkloadQuantity) {
			this.workListLocation.collectionLocation.Quantity = parsedStorage.WorkloadQuantity;
		}
		if (parsedStorage.CollectionComments) {
			this.workListLocation.collectionLocation.Comments = parsedStorage.CollectionComments;
		}
	}

	openLocationFromStorage(parsedStorage) {
		this.loadLocationFromStorage(parsedStorage);
		if (parsedStorage.CollectionLocationComplete === true) {
			this.recordLocation(this.workListLocation.collectionLocation);
			if ((this.collectionList.CanUpdateCentralLineStatus || this.collectionList.CanAddCollectionNote) && parsedStorage.CentralLineComplete !== true) {
				this.openCentralLineFromStorage(parsedStorage);
			} else if (this.collectionList.RequiredFormABN || this.collectionList.RequiredFormFinancialResponsibility || this.collectionList.RequiredFormRequisition) {
				this.openPrintForms();
				this.showComplete = true;
			}
		} else {
			if (this.collectionList.CanIdentifyCollectionSite || this.collectionList.CanWorkloadCodeEntry) {
				this.openLocation();
			}
		}
	}

	openOnlyLocationFromStorage(parsedStorage) {
		this.loadLocationFromStorage(parsedStorage);
		this.openLocation();

	}

	loadCentralLineFromStorage(parsedStorage) {
		if (parsedStorage.CentralLine) {
			this.workListCentralLine.centralLine.IsActive = parsedStorage.CentralLine;
		}
		if (parsedStorage.CollectionNote) {
			this.workListCentralLine.CollectionNote = parsedStorage.CollectionNote;
		}
		if (parsedStorage.FastingStatus) {
			this.workListCentralLine.FastingStatus = parsedStorage.FastingStatus;
		}
	}

	openCentralLineFromStorage(parsedStorage) {
		this.loadCentralLineFromStorage(parsedStorage);
		this.openCentralLine();
	}

	openIdentifyFromStorage(parsedStorage) {
		if (parsedStorage.IdentifyOption1) {
			this.workListIdentify.option1Confirm = parsedStorage.IdentifyOption1;
		}
		if (parsedStorage.IdentifyOption2) {
			this.workListIdentify.option2Confirm = parsedStorage.IdentifyOption2;
		}
		if (parsedStorage.CaregiverName) {
			this.workListIdentify.caregiverName = parsedStorage.CaregiverName;
		}
		if (parsedStorage.IdentifyScanVerified) {
			this.workListIdentify.scanVerified = parsedStorage.IdentifyScanVerified;
		}
		if (parsedStorage.IdentifyFormVerified) {
			this.workListIdentify.formVerified = parsedStorage.IdentifyFormVerified;
		}
		this.openIdentify();
		this.workListIdentify.checkNext();
	}

	saveTestCheck(total, checked, printed) {
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			localStorage.removeItem('workListCollecting');
			parsedStorage.AllPrinted = (total === printed);
			parsedStorage.AllChecked = (total === checked);
			localStorage.setItem('workListCollecting', JSON.stringify(parsedStorage));
		}
	}

	identifyVerified(evt) {
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			localStorage.removeItem('workListCollecting');
			parsedStorage.CaregiverName = evt.CaregiverName;
			parsedStorage.ConfirmOption1 = evt.ConfirmOption1;
			parsedStorage.ConfirmOption2 = evt.ConfirmOption2;
			parsedStorage.ManualIdentifyConfirmed = true;
			parsedStorage.ScanIdentifyConfirmed = true;
			this.recordIdentify(evt);
			localStorage.setItem('workListCollecting', JSON.stringify(parsedStorage));
		}
		this.nextDisabled = false;
	}

	checkCollectionInformation() {
		if (this.collection.CollectionInformation === undefined) {
			this.collection.CollectionInformation = {
				IDDoc1ConfirmType: '',
				IDDoc2ConfirmType: '',
				CaregiverName: '',
				ManualIdentifyConfirmed: false,
				ScanIdentifyConfirmed: false,
				CollectionSite: '',
				Workload: '',
				WorkloadQuantity: 0,
				CollectionComments: '',
				CentralLineStatus: false,
				FastingStatus: '',
				CollectionNote: '',
				PrintComments: '',
				CollectionStartTime: '',
				CollectionEndTime: ''
			};
		}
	}

	recordIdentify(evt) {
		this.checkCollectionInformation();
		this.collection.CollectionInformation.CaregiverName = (evt.CaregiverName !== null && evt.CaregiverName !== undefined ? evt.CaregiverName : '');
		this.collection.CollectionInformation.IDDoc1ConfirmType = (evt.ConfirmOption1 !== null ? evt.ConfirmOption1 : '');
		this.collection.CollectionInformation.IDDoc2ConfirmType = (evt.ConfirmOption2 !== null ? evt.ConfirmOption2 : '');
		this.collection.CollectionInformation.ManualIdentifyConfirmed = true;
		this.collection.CollectionInformation.ScanIdentifyConfirmed = true;
	}

	recordLocation(evt) {
		this.checkCollectionInformation();
		this.collection.CollectionInformation.CollectionSite = evt.CollectionSite;
		this.collection.CollectionInformation.Workload = evt.Workload;
		this.collection.CollectionInformation.WorkloadQuantity = evt.Quantity;
		if (typeof (this.collection.CollectionInformation.WorkloadQuantity) === 'string') {
			this.collection.CollectionInformation.WorkloadQuantity = parseInt(this.collection.CollectionInformation.WorkloadQuantity, 10);
		}
		this.collection.CollectionInformation.CollectionComments = evt.Comments;
	}

	recordCentralLine(evt) {
		this.checkCollectionInformation();
		this.collection.CollectionInformation.CentralLineStatus = evt.CentralLine;
		this.collection.CollectionInformation.CollectionNote = (evt.CollectionNote !== null ? evt.CollectionNote : '');
		this.collection.CollectionInformation.FastingStatus = evt.FastingStatus;
	}

	selectUpdate(event) {
		this.printDisabled = !event;
		this.storeTestStatus();
		this.checkTests();
	}

	storeTestStatus() {
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			const testStatuses = [];
			this.collection.OrderedTests.forEach(test => {
				testStatuses.push({ Id: test.Id, IsDisabled: test.IsDisabled, checked: test.checked, printed: test.printed });
			});
			parsedStorage.OrderedTests = testStatuses;
			localStorage.setItem('workListCollecting', JSON.stringify(parsedStorage));
		}
	}

	checkActioned(test) {
		return (test.disabled || test.transferred || test.cancelled || test.rescheduled || test.problemListed || test.IsDisabled);
	}

	checkTests() {
		let printed = 0;
		let actioned = 0;
		let total = 0;
		let checked = 0;
		this.collection.OrderedTests.forEach(test => {
			total++;
			if (this.checkActioned(test)) {
				actioned++;
			} else {
				if (test['printed'] && test['printed'] > 0) {
					printed++;
				}
				if (test['checked']) {
					checked++;
				}
			}
		});
		const checkedOrActioned = (actioned + checked);
		const printedOrActioned = (actioned + printed);
		if (this.workListService.collectionStaff === 'Both') {
			if (this.collection.OrderedTests.filter(test => test.checked && test.printed).length) {
				this.nextDisabled = false;
			} else {
				this.nextDisabled = true;
			}
		} else if (total === checkedOrActioned && total === printedOrActioned) {
			this.nextDisabled = false;
			if (this.showComplete) {
				this.completeDisabled = false;
			}
		} else {
			this.nextDisabled = true;
			if (this.showComplete) {
				this.completeDisabled = true;
			}
		}
		this.saveTestCheck(total, checkedOrActioned, printedOrActioned);
	}

	checkAllSelected() {
		const checked = this.collection.OrderedTests.filter(test => test['checked']).length;
		const actioned = this.collection.OrderedTests.filter(test => this.checkActioned(test)).length;
		const total = this.collection.OrderedTests.filter(test => test['show']).length;
		const checkedOrActioned = (actioned + checked);
		if (checkedOrActioned === total || checkedOrActioned === 0) {
			return true;
		} else {
			return false;
		}
	}

	markAsActioned() {
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			localStorage.removeItem('workListCollecting');
			parsedStorage.canAbandon = false;
			localStorage.setItem('workListCollecting', JSON.stringify(parsedStorage));
		}
	}

	canAbandon() {
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			return parsedStorage.canAbandon;
		} else {
			return true;
		}
	}

	cancelSubmit(object) {
		if (this.checkAllSelected()) {
			this.cancel.emit({ collection: this.collection, cancellationObject: object });
			this.close();
		} else {
			this.cancel.emit({ collection: this.collection, cancellationObject: object });
			this.markAsActioned();
			this.showCancel = false;
			this.showingMenuOption = false;
			this.workListCancel.close();
			this.showSelect = true;
			this.workListSelect.show();
		}
	}

	printComm(evt) {
		this.commLabelsPrinted += evt;
		this.commLabels.emit(evt);
		console.log(`Printed ${evt} communication labels...`);
	}

	printPatient(evt) {
		this.patientLabels.emit(evt);
		console.log(`Printed ${evt} patient labels...`);
	}

	submitTransfer(object) {
		if (this.checkAllSelected()) {
			this.transfer.emit({ collection: this.collection, object: object });
			this.close();
		} else {
			this.transfer.emit({ collection: this.collection, object: object });
			this.markAsActioned();
			this.showTransfer = false;
			this.showingMenuOption = false;
			this.workListTransfer.close();
			this.showSelect = true;
			this.workListSelect.show();
		}
	}

	submitReschedule(object) {
		if (this.checkAllSelected()) {
			this.reschedule.emit({ collection: this.collection, object: object });
			this.close();
		} else {
			this.reschedule.emit({ collection: this.collection, object: object });
			this.markAsActioned();
			this.showReschedule = false;
			this.showingMenuOption = false;
			this.workListReschedule.close();
			this.showSelect = true;
			this.workListSelect.show();
		}
	}

	sendToProblemList(reason) {
		if (this.checkAllSelected()) {
			this.problemList.emit({ collection: this.collection, reason: reason });
			this.close();
		} else {
			this.problemList.emit({ collection: this.collection, reason: reason });
			this.markAsActioned();
			this.showProblemList = false;
			this.showingMenuOption = false;
			this.workListProblemList.close();
			this.showSelect = true;
			this.workListSelect.show();
		}
	}

	openPreviouslyOpened() {
		if (this.previouslyOpen === 'identify') {
			this.showIdentify = true;
			this.workListIdentify.show();
		} else if (this.previouslyOpen === 'select') {
			this.showSelect = true;
			this.workListSelect.show();
		} else if (this.previouslyOpen === 'location') {
			this.showLocation = true;
			this.workListLocation.show();
		} else if (this.previouslyOpen === 'centralLine') {
			this.showCentralLine = true;
			this.workListCentralLine.show();
		} else if (this.previouslyOpen === 'forms') {
			this.showPrintForms = true;
			this.workListPrintForms.show();
		}
	}

	close() {
		this.closeActiveSlideouts();
		this.closePreview.emit();
		this.resetAll();
		this.showDrawer = false;
	}

	closeButton() {
		this.resetMenu();
		this.openPreviouslyOpened();
	}

	resetMenu() {
		this.showingMenuOption = false;

		this.showCancel = false;
		this.showPrintComm = false;
		this.showPrintPatient = false;
		this.showProblemList = false;
		this.showReschedule = false;
		this.showTransfer = false;

		this.workListCancel.reset();
		this.workListPrintComm.reset();
		this.workListPrintPatient.reset();
		this.workListProblemList.reset();
		this.workListReschedule.reset();
		this.workListTransfer.reset();
	}

	resetAll() {
		this.showOverlay = true;
		this.hideShadow = false;
		this.collection.OrderedTests.forEach(test => {
			delete test['printed'];
		});

		this.workListIdentify.reset();
		this.workListSelect.reset();
		this.workListLocation.reset();
		this.workListCentralLine.reset();
		this.workListPrintForms.reset();

		this.workListCollection.close();
		this.showPatientInfo = false;
		this.showMenu = false;
		this.workListMenu.close();
		this.showMenu = false;
		this.resetMenu();

		this.showIdentify = false;
		this.showSelect = false;
		this.showLocation = false;
		this.showCentralLine = false;
		this.showPrintForms = false;

		this.nextDisabled = true;
		this.showComplete = false;
		this.completeDisabled = false;
		this.printDisabled = true;
		this.collection = new Collection();
		this.commLabelsPrinted = 0;

		this.collectionTime = {
			StartTime: null,
			EndTime: null,
			Elapsed: null
		};
	}

	clickOverlay() {
		if (this.canAbandon()) {
			const dialogRef = this.dialog.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				data: { message: 'Are you sure you want to undo the collection' },
				autoFocus: false
			});

			dialogRef.beforeClose().subscribe(result => {
				if (document.body.querySelector('.add-overlay')) {
					document.body.removeChild(document.body.querySelector('.add-overlay'));
				}
				if (result) {
					this.emptySelect();
					this.emptyCollectionInformation();
					this.clickedOverlay.emit(this.collection.Id);
					this.workListService.clearCollectingStorage(this.collection.Id);
					this.resetAll();
				}
			});
		} else {
			this.utilsService.showError(`${this.translation.translate(`Error.This collection is already in progress`)}`);
		}
	}

	emptySelect() {
		this.collection.OrderedTests.forEach(test => {
			test.checked = false;
			test.printed = 0;
		});
	}

	emptyCollectionInformation() {
		this.collection.CollectionInformation = {
			IDDoc1ConfirmType: '',
			IDDoc2ConfirmType: '',
			CaregiverName: '',
			ManualIdentifyConfirmed: false,
			ScanIdentifyConfirmed: false,
			CollectionSite: '',
			Workload: '',
			WorkloadQuantity: 0,
			CollectionComments: '',
			CentralLineStatus: false,
			FastingStatus: '',
			CollectionNote: '',
			PrintComments: '',
			CollectionStartTime: '',
			CollectionEndTime: ''
		};
	}

	back() {
		this.workListService.resetCleanTime();
		const storedCollection = localStorage.getItem('workListCollecting');
		const parsedStorage = storedCollection !== null ? JSON.parse(storedCollection) : null;
		if (this.showSelect === true) {
			this.showSelect = false;
			this.workListSelect.close();
			this.workListIdentify.animation = false;
			this.openIdentifyFromStorage(parsedStorage);
		} else if (this.showLocation === true) {
			this.showLocation = false;
			this.workListLocation.close();
			this.openSelectFromStorage(parsedStorage);
		} else if (this.showCentralLine === true) {
			this.showCentralLine = false;
			this.workListCentralLine.close();
			if (this.collectionList.CanIdentifyCollectionSite || this.collectionList.CanWorkloadCodeEntry) {
				this.openOnlyLocationFromStorage(parsedStorage);
			} else {
				this.openSelectFromStorage(parsedStorage);
			}
		} else if (this.showPrintForms === true) {
			this.showPrintForms = false;
			this.workListPrintForms.close();
			if (this.collectionList.CanUpdateCentralLineStatus || this.collectionList.CanAddCollectionNote) {
				this.openCentralLineFromStorage(parsedStorage);
			} else if (this.collectionList.CanIdentifyCollectionSite || this.collectionList.CanWorkloadCodeEntry) {
				this.openOnlyLocationFromStorage(parsedStorage);
			} else {
				this.openSelectFromStorage(parsedStorage);
			}
		}
	}

	openSelectFromStorage(parsedStorage) {
		this.parseSelectFromStorage(parsedStorage);
		this.openSelect();
		this.checkTests();
	}

	handleSkipContainers() {
		const dialogRef = this.dialog.open(UnsavedChangesDialogComponent, {
			width: '300px',
			backdropClass: 'unsavedOverlay',
			data: { message: 'Some containers have not been actioned Are you sure you want to skip them' },
			autoFocus: false
		});

		dialogRef.beforeClose().subscribe(result => {
			if (document.body.querySelector('.add-overlay')) {
				document.body.removeChild(document.body.querySelector('.add-overlay'));
			}
			if (result) {
				const checkedAndPrinted = this.collection.OrderedTests.filter(test => test.checked && test.printed).length;
				const disabled = this.collection.OrderedTests.filter(test => test.IsDisabled).length;
				const all = this.collection.OrderedTests.length;
				this.collection.OrderedTests.forEach(test => {
					if (!test.IsDisabled && !(test.checked && test.printed)) {
						test['skipped'] = true;
					} else {
						if (test['skipped']) {
							test['skipped'] = false;
						}
					}
				});
				this.selectNext();
			}
		});
	}

	selectNext() {
		this.workListSelect.complete();
		this.showSelect = false;
		this.workListSelect.close();
		if (this.collectionList.CanIdentifyCollectionSite || this.collectionList.CanWorkloadCodeEntry) {
			this.openLocation();
		} else {
			this.openCentralLine();
			if (!(this.collectionList.RequiredFormABN || this.collectionList.RequiredFormFinancialResponsibility || this.collectionList.RequiredFormRequisition)) {
				this.showComplete = true;
			} else {
				this.showComplete = false;
			}
		}
	}

	next() {
		this.workListService.resetCleanTime();
		if (this.showIdentify === true) {
			this.workListIdentify.complete();
			this.showIdentify = false;
			this.workListIdentify.close();
			this.openSelect();
			this.checkTests();

		} else if (this.showSelect === true) {
			const checkedAndPrinted = this.collection.OrderedTests.filter(test => test.checked && test.printed).length;
			const disabled = this.collection.OrderedTests.filter(test => test.IsDisabled).length;
			const all = this.collection.OrderedTests.length;
			if (this.workListService.collectionStaff === 'Both' && (checkedAndPrinted + disabled !== all)) {
				this.handleSkipContainers();
			} else {
				this.selectNext();
			}
		} else if (this.showLocation === true) {
			if (this.workListLocation.saveForm()) {
				this.workListLocation.complete();
				this.showLocation = false;
				this.workListLocation.close();
				this.openCentralLine();
			}
		} else if (this.showCentralLine === true) {
			this.workListCentralLine.submit();
			this.workListCentralLine.complete();
			this.showCentralLine = false;
			this.workListCentralLine.close();
			this.openPrintForms();
			this.showComplete = true;
		}
	}

	complete() {
		this.collection.Status = 'Complete';
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			this.collection.CollectionInformation.CollectionStartTime = parsedStorage.time;
		}
		this.collection.CollectionInformation.CollectionEndTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
		this.completeCollection.emit(this.collection);
		this.close();
	}

	selectPrint() {
		let allLabels = '';
		this.collection.OrderedTests.filter(test => test['checked'] && !test.IsDisabled).forEach(test => {
			if (!test['printed']) {
				test['printed'] = 1;
			} else {
				test['printed']++;
			}
			const labelToPrint = this.makeContainerLabel(test);
			allLabels = allLabels + labelToPrint;
		});
		this.storeTestStatus();
		if (allLabels.length) {
			this.printService.addContainerLabelsToPrint(1);
			this.send(allLabels);
		}
		this.checkTests();
	}

	send(file) {
		if ((<any>window).deviceReady === true) { // if on cordova app...
			if (this.authService.lastKnownPrinter === '') { // if no lastKnownPrinter
				this.printService.scanUnPairedDevices(file); // look for devices
			} else { // otherwise check to see if we are connected to lastKnownPrinter
				this.printService.scanPairedDevices(file);
			}
		} else { // if on desktop we call this... get rid of this to not support printing on desktop
			this.printService.getLocalPrinters(file);
		}
	}

	makeContainerLabel(test) {
		/* const labelRef = this.workListService.label.data;
		if (labelRef === undefined || labelRef === null || labelRef === '') {
			this.utilsService.showError(`Failed to load label data.`);
		} */
		let labelString = this.workListService.label.data;
		const pairs = this.workListService.label.pairs;
		pairs.forEach(pair => {
			if (pair.ColumnReference.includes('Lab.Code')) {
				labelString = this.replaceAll(labelString, `#${pair.LabelVariable}#`, this.workListService.collectionListLab);
			} else if (pair.ColumnReference.includes('OrderedTest')) {
				let testProperty = pair.ColumnReference.replace('OrderedTest.', '');
				if (testProperty === 'Code') {
					testProperty = 'TestCode';
				}
				const collectionElement = testProperty.split('.').reduce((c, d) => c[d], test);
				if (collectionElement !== undefined) {
					if (testProperty === 'TestCode' && pair.LabelVariable === 'TESTCODELINE1') {
						labelString = this.replaceAll(labelString, `#${pair.LabelVariable}#`, this.getTestCodeLine(1, collectionElement));
					} else if (testProperty === 'TestCode' && pair.LabelVariable === 'TESTCODELINE2') {
						labelString = this.replaceAll(labelString, `#${pair.LabelVariable}#`, this.getTestCodeLine(2, collectionElement));
					} else if (testProperty === 'Destination') {
						const destinations = [];
						destinations.push(collectionElement);
						if (test.OtherTests) {
							test.OtherTests.forEach(otherTest => {
								if (otherTest.Destination !== '') {
									destinations.push(otherTest.Destination);
								}
							});
						}
						labelString = this.replaceAll(labelString, `#${pair.LabelVariable}#`, this.getTruncatedLine(destinations));
					} else if (testProperty === 'LabDepartment') {
						const labDepartments = [];
						labDepartments.push(collectionElement);
						if (test.OtherTests) {
							test.OtherTests.forEach(otherTest => {
								if (otherTest.LabDepartment !== '') {
									labDepartments.push(otherTest.LabDepartment);
								}
							});
						}
						labelString = this.replaceAll(labelString, `#${pair.LabelVariable}#`, this.getTruncatedLine(labDepartments));
					} else {
						labelString = this.replaceAll(labelString, `#${pair.LabelVariable}#`, collectionElement);
					}
				} else {
					labelString = this.replaceAll(labelString, `#${pair.LabelVariable}#`, '');
				}
			} else {
				let collectionProperty = pair.ColumnReference.replace('Collection.', '');
				if (pair.ColumnReference === 'Patient.FullName20') {
					collectionProperty = 'Patient.FullName';
				}
				const collectionElement = collectionProperty.split('.').reduce((c, d) => c[d], this.collection);
				if (collectionElement !== undefined) {
					if (pair.ColumnReference === 'Patient.FullName20') {
						labelString = this.replaceAll(labelString, `#${pair.LabelVariable}#`, collectionElement.substring(0, 20));
					} else {
						labelString = this.replaceAll(labelString, `#${pair.LabelVariable}#`, collectionElement);
					}
				} else if (pair.LabelVariable === 'SPOTCODE') {
					labelString = this.replaceAll(labelString, `#${pair.LabelVariable}#`, '');
				} else {
					labelString = this.replaceAll(labelString, `#${pair.LabelVariable}#`, '');
				}
			}
		});
		console.log(labelString);
		return labelString;
	}

	getTruncatedLine(array) {
		const uniqueElements = Array.from(new Set(array));
		let str = '';
		const length = 15;
		uniqueElements.forEach(element => {
			if (!str.length) {
				str += element;
			} else if (str.length < length) {
				str += ` - ${element}`;
			}
			if (str.length > length) {
				str = str.substring(0, length - 1) + '+';
			}
		});
		return str;
	}

	getTestCodeLine(line, codes) {
		const maxLength = this.workListService.label.testLineLength ? parseInt(this.workListService.label.testLineLength, 10) : 15;
		const pieces = codes.split(',');
		const trimmedPieces = [];
		pieces.forEach(code => {
			console.log(code.trim());
			trimmedPieces.push(code.trim());
		});
		console.log(trimmedPieces);
		let line1 = '';
		let line1Done = false;
		let line2 = '';
		let line2Done = false;
		trimmedPieces.forEach(code => {
			if (!line1Done) {
				if (line1.length === 0) {
					line1 += `${code}`;
				} else if (2 + code.length + line1.length < maxLength) {
					line1 += `, ${code}`;
				} else {
					line1Done = true;
					line2 += `${code}`;
				}
			} else if (!line2Done) {
				if (2 + code.length + line2.length < maxLength) {
					line2 += `, ${code}`;
				} else {
					line2Done = true;
					line2 += `+`;
				}
			}
		});
		if (line === 1) {
			console.log(line1);
			return line1;
		} else {
			console.log(line2);
			return line2;
		}
	}

	replaceAll(string, find, replace) {
		return string.replace(new RegExp(find, 'g'), replace);
	}

	toggleMenu() {
		this.workListService.resetCleanTime();
		if (this.workListMenu.showMenu === true) {
			this.workListMenu.close();
			this.showMenu = false;
		} else {
			this.workListMenu.show();
			this.showMenu = true;
		}
	}

	menuClosed() {
		this.showMenu = false;
	}

	clickInfo() {
		this.workListService.resetCleanTime();
		this.showPatientInfo = !this.showPatientInfo;
		this.workListCollection.collection = this.collection;
		this.updatePatient(this);
		this.workListCollection.toggle();
	}

	openIdentify() {
		this.showingMenuOption = false;
		this.nextDisabled = true;
		this.showIdentify = true;
		this.workListIdentify.loadData(this.collection);
		this.workListIdentify.show();
	}

	openSelect() {
		this.showingMenuOption = false;
		this.nextDisabled = true;
		this.showSelect = true;
		this.workListSelect.collection = this.collection;
		this.workListSelect.show();
		this.showComplete = false;
	}

	openLocation() {
		this.showingMenuOption = false;
		this.nextDisabled = false;
		this.showLocation = true;
		this.workListLocation.show();
		this.showComplete = false;
	}

	openCentralLine() {
		this.showingMenuOption = false;
		this.nextDisabled = false;
		this.showCentralLine = true;
		this.workListCentralLine.show();
		if (!(this.collectionList.RequiredFormABN || this.collectionList.RequiredFormFinancialResponsibility || this.collectionList.RequiredFormRequisition)) {
			this.showComplete = true;
		} else {
			this.showComplete = false;
		}
	}

	openPrintForms() {
		this.showingMenuOption = false;
		this.nextDisabled = false;
		this.showPrintForms = true;
		this.workListPrintForms.loadData(this.collection);
		this.workListPrintForms.show();
	}

	closeNonMenu() {
		if (this.showIdentify === true) {
			this.previouslyOpen = 'identify';
		} else if (this.showSelect === true) {
			this.previouslyOpen = 'select';
		} else if (this.showLocation === true) {
			this.previouslyOpen = 'location';
		} else if (this.showCentralLine === true) {
			this.previouslyOpen = 'centralLine';
		} else if (this.showPrintForms === true) {
			this.previouslyOpen = 'forms';
		}
		this.workListIdentify.close();
		this.workListSelect.close();
		this.workListLocation.close();
		this.workListCentralLine.close();
		this.workListPrintForms.close();

		this.workListCancel.close();
		this.workListPrintComm.close();
		this.workListPrintPatient.close();
		this.workListProblemList.close();
		this.workListTransfer.close();
		this.workListReschedule.close();

		this.workListMenu.close();
		this.showMenu = false;
		this.showingMenuOption = true;
	}

	closeMenu() {
		this.workListService.resetCleanTime();
		this.workListMenu.close();
		this.showMenu = false;
		this.showingMenuOption = true;
	}

	closeActiveSlideouts() {
		this.openSlideouts.forEach(slideout => {
			(<WorkListMenuSlideoutComponent>slideout.instance).close();
			setTimeout(() => this.slideoutHost.viewContainerRef.remove(this.slideoutHost.viewContainerRef.indexOf(slideout)), 250);
		});
		this.openSlideouts = [];
		this.openSlideoutSubscriptions.forEach(subscription => {
			subscription.unsubscribe();
		});
		this.openSlideoutSubscriptions = [];
	}

	makeSlideout() {
		const slideout = this.slideoutHost.viewContainerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(WorkListMenuSlideoutComponent));
		this.openSlideouts.push(slideout);
		return slideout;
	}

	updateSlideout(component) {
		this.updateWorkListMenu(component);
		this.updatePatient(component);
		this.updatePrintComm(component);
	}

	subscribeToMenu(slideoutInstance: WorkListMenuSlideoutComponent) {
		const cancelSub = slideoutInstance.menuCancel.subscribe(evt => this.openCancel());
		this.openSlideoutSubscriptions.push(cancelSub);
		const printCommSub = slideoutInstance.menuPrintComm.subscribe(evt => this.openPrintComm());
		this.openSlideoutSubscriptions.push(printCommSub);
		const printPatientSub = slideoutInstance.menuPrintPatient.subscribe(evt => this.openPrintPatient());
		this.openSlideoutSubscriptions.push(printPatientSub);
		const problemListSub = slideoutInstance.menuProblemList.subscribe(evt => this.openProblemList());
		this.openSlideoutSubscriptions.push(problemListSub);
		const rescheduleSub = slideoutInstance.menuReschedule.subscribe(evt => this.openReschedule());
		this.openSlideoutSubscriptions.push(rescheduleSub);
		const transferSub = slideoutInstance.menuTransfer.subscribe(evt => this.openTransfer());
		this.openSlideoutSubscriptions.push(transferSub);
		const closeSub = slideoutInstance.closeSlideout.subscribe(evt => this.closeActiveSlideouts());
		this.openSlideoutSubscriptions.push(closeSub);
		const overlaySub = slideoutInstance.overlayClick.subscribe(evt => this.clickOverlay());
		this.openSlideoutSubscriptions.push(overlaySub);
		const patientInfoSub = slideoutInstance.clickInformation.subscribe(evt => this.updatePatient(slideoutInstance));
		this.openSlideoutSubscriptions.push(patientInfoSub);
	}

	processSlideout() {
		const slideout = this.makeSlideout();
		const slideoutInstance = (<WorkListMenuSlideoutComponent>slideout.instance);
		this.subscribeToMenu(slideoutInstance);
		this.updateSlideout(slideoutInstance);
		return slideoutInstance;
	}

	openCancel() {
		this.closeMenu();
		const slideoutInstance = this.processSlideout();
		slideoutInstance.closeSlideout.subscribe(evt => this.closeActiveSlideouts());
		slideoutInstance.cancel.subscribe(evt => this.cancelSubmit(evt));
		setTimeout(() => {
			slideoutInstance.show(this.collection);
			slideoutInstance.activateCancel();
		}, 0);
	}

	openPrintComm() {
		this.closeMenu();
		const slideoutInstance = this.processSlideout();
		slideoutInstance.printComm.subscribe(evt => this.printComm(evt));
		slideoutInstance.workListPrintComm.labelNumberDefault = this.collectionList.LabelNumberDefault;
		slideoutInstance.workListPrintComm.labelNumberMaximum = this.collectionList.LabelNumberMaximum;
		slideoutInstance.workListPrintComm.labelsPrinted = this.commLabelsPrinted;
		slideoutInstance.workListPrintComm.generateLabelRange();
		setTimeout(() => {
			slideoutInstance.show(this.collection);
			slideoutInstance.activatePrintComm();
		}, 0);
	}

	openPrintPatient() {
		this.closeMenu();
		const slideoutInstance = this.processSlideout();
		slideoutInstance.printPatient.subscribe(evt => this.printPatient(evt));
		setTimeout(() => {
			slideoutInstance.show(this.collection);
			slideoutInstance.activatePatientComm();
		}, 0);
	}

	openProblemList() {
		this.closeMenu();
		const slideoutInstance = this.processSlideout();
		slideoutInstance.problemList.subscribe(evt => this.sendToProblemList(evt));
		setTimeout(() => {
			slideoutInstance.show(this.collection);
			slideoutInstance.activateProblemList();
		}, 0);
	}

	openReschedule() {
		this.closeMenu();
		const slideoutInstance = this.processSlideout();
		slideoutInstance.reschedule.subscribe(evt => this.submitReschedule(evt));
		setTimeout(() => {
			slideoutInstance.show(this.collection);
			slideoutInstance.activateReschedule();
		}, 0);
	}

	openTransfer() {
		this.closeMenu();
		const slideoutInstance = this.processSlideout();
		slideoutInstance.transfer.subscribe(evt => this.submitTransfer(evt));
		setTimeout(() => {
			slideoutInstance.show(this.collection);
			slideoutInstance.activateTransfer();
		}, 0);
	}

	updateShowPatientInfo(event) {
		this.showPatientInfo = event;
	}

	updateChildren() {
		this.updateIdentify(this);
		this.updateLocation(this);
		this.updateCentralLine(this);
		this.updatePrintForms(this);
		this.updateWorkListMenu(this);
		this.updatePatient(this);
		this.updatePrintComm(this);
	}

	updateIdentify(component) {
		component.workListIdentify.patientManualId = this.collectionList.PatientManualId;
		component.workListIdentify.patientIdDocCount = this.collectionList.PatientIdDocCount;
		component.workListIdentify.patientIDDoc1 = this.collectionList.PatientIdDoc1;
		component.workListIdentify.patientIDDoc2 = this.collectionList.PatientIdDoc2;

		component.workListIdentify.patientScanWristband = this.collectionList.PatientScanWristband;
		component.workListIdentify.patientWristbandCount = this.collectionList.PatientWristbandCount;
		component.workListIdentify.patientWristband1 = this.collectionList.PatientWristband1;
		component.workListIdentify.patientWristband2 = this.collectionList.PatientWristband2;
	}

	updateLocation(component) {
		component.workListLocation.canIdentifyCollectionSite = this.collectionList.CanIdentifyCollectionSite;
		component.workListLocation.canWorkloadCodeEntry = this.collectionList.CanWorkloadCodeEntry;
	}

	updateCentralLine(component) {
		component.workListCentralLine.canUpdateCentralLineStatus = this.collectionList.CanUpdateCentralLineStatus;
		component.workListCentralLine.canAddCollectionNote = this.collectionList.CanAddCollectionNote;
	}

	updatePrintForms(component) {
		component.workListPrintForms.requiredFormABN = this.collectionList.RequiredFormABN;
		component.workListPrintForms.requiredFormFinancialResponsibility = this.collectionList.RequiredFormFinancialResponsibility;
		component.workListPrintForms.requiredFormRequisition = this.collectionList.RequiredFormRequisition;
	}

	updateWorkListMenu(component) {
		component.workListMenu.canCancelOrder = this.collectionList.CanCancelOrder;
		component.workListMenu.canGenerateCommunicationLabel = this.collectionList.CanGenerateCommunicationLabel;
		component.workListMenu.canRescheduleOrder = this.collectionList.CanRescheduleOrder;
		component.workListMenu.canTransferToProblemList = this.collectionList.CanTransferToProblemList;
	}

	updatePatient(component) {
		const comp = component.workListCollection;
		if (this.workListService.clients.length) {
			if (this.collectionList.AssociatedClients.length) {
				const selectedClient = this.workListService.clients.find(client => this.collectionList.AssociatedClients[0].Code === client.Code);
				this.updatePatientClient(component, selectedClient);
			} else {
				comp.clientInfo.Address = '';
				comp.clientInfo.Contact = 'Alucard Ford';
				comp.clientInfo.Phone = '(832) 598-2502';
			}
		} else {
			this.workListService.getClients()
				.then(success => {
					if (this.collectionList.AssociatedClients.length) {
						const selectedClient = this.workListService.clients.find(client => this.collectionList.AssociatedClients[0].Code === client.Code);
						this.updatePatientClient(component, selectedClient);
					} else {
						comp.clientInfo.Address = '';
						comp.clientInfo.Contact = 'Alucard Ford';
						comp.clientInfo.Phone = '(832) 598-2502';
					}
				}).catch(error => {
					console.log(`Error getting clients: ${error}`);
				});
		}
		comp.displayPatientAddressAndPhone = this.collectionList.DisplayPatientAddressAndPhone;
		comp.displayPatientRoomBed = this.collectionList.DisplayPatientRoomBed;
		comp.displayHomeDrawAddress = this.collectionList.DisplayHomeDrawAddress;
		comp.displayCollectionLocation = this.collectionList.DisplayCollectionLocation;
		comp.displayClient = this.collectionList.DisplayClient;
		comp.displayClientAddressAndPhone = this.collectionList.DisplayClientAddressAndPhone;
		comp.notes = this.collectionList.Note;
	}

	updatePatientClient(component, selectedClient) {
		const comp = component.workListCollection;
		comp.clientInfo.Address = comp.makeAddress(selectedClient.Location);
		comp.clientInfo.Contact = 'Alucard Ford';
		comp.clientInfo.Phone = selectedClient.Phone;
	}

	updatePrintComm(component) {
		component.workListPrintComm.labelNumberDefault = this.collectionList.LabelNumberDefault;
		component.workListPrintComm.labelNumberMaximum = this.collectionList.LabelNumberMaximum;
		component.workListPrintComm.generateLabelRange();
	}

}
