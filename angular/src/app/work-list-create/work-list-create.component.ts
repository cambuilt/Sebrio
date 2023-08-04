import { Component, EventEmitter, Output, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { AuthService } from '../services/auth.service';
import { WorkListService } from '../services/work-list.service';
import { SliderType } from 'igniteui-angular';
import { Observable } from 'rxjs';
import { NgModel } from '@angular/forms';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { TranslationService } from 'angular-l10n';
import * as moment from 'moment-timezone';
import { ActiveEntitiesService } from '../services/active-entities.service';

@Component({
	selector: 'app-work-list-create',
	templateUrl: './work-list-create.component.html',
	styleUrls: ['./work-list-create.component.css']
})
export class WorkListCreateComponent implements OnInit, AfterViewInit, OnDestroy {
	@Output() saveListOutput = new EventEmitter();

	properties = {
		clearFields: () => this.clearFields(),
		isDrawerOpen: false,
		manualDescriptionInput: false,
		showOverlay: false,
		hideOverlay: false,
		rowID: ''
	};
	headerText = 'Create Work List';
	search: boolean;
	sliderType = SliderType;
	oldPatientsToDisplay = {
		patients: [],
		reset: false
	};
	pristineObject = {};

	workList = {
		Hub: '',
		CollectionList: '',
		Filter: {
			AgeRange: {
				lower: 0,
				upper: 100
			},
			AgeMin: 0,
			AgeMax: 100,
			Gender: '',
			GenderSet: false,
			Priority: '',
			PrioritySet: false,
			ProblemList: '',
			ProblemListSet: false,
			Location: '',
			LocationSet: false,
			Reserved: '',
			ReservedSet: false,
			DateFrom: moment().startOf('day'),
			DateTo: moment().endOf('day'),
			TimeFrom: moment().startOf('day').format('HH:mm'),
			TimeTo: moment().endOf('day').format('HH:mm'),
			DateSet: false,
			Reset: false,
			Now: false,
			From: ''
		}
	};
	genders = [
		{ value: this.translation.translate('Label.Male') },
		{ value: this.translation.translate('Label.Female') }
	];
	yesNo = [
		{ value: this.translation.translate('Label.Yes') },
		{ value: this.translation.translate('Label.No') }
	];
	hubs = [];
	collectionLists = [];
	associatedCollectionLists = [];
	associatedLocations = [];
	priorities = [];
	locations = [];
	reservations = [this.translation.translate('Label.Available'), this.translation.translate('Label.Reserved'), this.translation.translate('Label.Locked'), this.translation.translate('Label.Other Reserved'), this.translation.translate('Label.Other Locked'), this.translation.translate('Label.Complete'), this.translation.translate('Label.Cancelled')];
	canClearSearch: Observable<boolean>;
	disableFilter: any;
	fromClickOverlay = false;

	collectPeriodSettings: any;

	dateRange: any = {
		dateFrom: {
			maxDate: '',
			minDate: ''
		},
		dateTo: {
			maxDate: '',
			minDate: ''
		}
	};

	cleaningSubscription: any;

	selectedCollectionList: any;

	canClickOverlay = true;

	tempCleared = false;

	objectForm = [];
	@ViewChild('hubForm') hubForm: NgModel;
	@ViewChild('collectionListForm') collectionListForm: NgModel;
	@ViewChild('pickerDateTo') pickerDateTo: any;
	@ViewChild('pickerDateFrom') pickerDateFrom: any;
	@ViewChild('timeFrom') timeFrom: any;
	@ViewChild('timeTo') timeTo: any;

	constructor(private activeEntitiesService: ActiveEntitiesService, public translation: TranslationService, private workListService: WorkListService, public utilsService: UtilsService, private errorAlert: MatDialog, public authService: AuthService) {
		this.canClearSearch = this.workListService.fncanClearSearch();
		this.workListService.setSearchFilter(undefined);
	}

	ngAfterViewInit() {
		this.objectForm.push(this.hubForm);
		this.objectForm.push(this.collectionListForm);
	}

	ngOnDestroy(): void {
		this.canClearSearch = undefined;
		if (this.cleaningSubscription) {
			this.cleaningSubscription.unsubscribe();
		}
		this.removeListeners();
	}

	getCleanWorkList() {
		if (this.cleaningSubscription) {
			this.cleaningSubscription.unsubscribe();
		}
		this.cleaningSubscription = this.authService.getWorkListClean().subscribe(response => {
			if (response === true) {
				console.log(`Clearing Work List Create...`);
				this.clearFields();
				this.resetDrawer();
			}
		});
	}

	disabledSelect() {
		const inputs = [document.querySelector('#formField1'), document.querySelector('#formField2'), document.querySelector('#formField3'), document.querySelector('#formField4'), document.querySelector('#formField5'), document.querySelector('#formField6')];
		this.utilsService.disabledSelect(inputs, true, true);
	}

	removeListeners() {
		const inputs = [document.querySelector('#formField1'), document.querySelector('#formField2'), document.querySelector('#formField3'), document.querySelector('#formField4'), document.querySelector('#formField5'), document.querySelector('#formField6')];
		this.utilsService.removeListeners(inputs, true);
	}


	resetDrawer() {
		this.removeListeners();
		this.search = undefined;
		this.pristineObject = {};
		this.hubs = [];
		this.collectionLists = [];
		this.associatedCollectionLists = [];
		this.associatedLocations = [];
		this.priorities = [];
		this.locations = [];
		this.dateRange = {
			dateFrom: {
				maxDate: '',
				minDate: ''
			},
			dateTo: {
				maxDate: '',
				minDate: ''
			}
		};
	}

	renewObjectForm() {
		this.objectForm = [];
		this.objectForm.push(this.hubForm);
		this.objectForm.push(this.collectionListForm);
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	saveForm() {
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

	ngOnInit() {
		this.getHubs();
	}

	getHubs() {
		this.hubs = [];
		this.workListService.getHubs().subscribe(response => {
			this.hubs = response.json();
		}, error => {
			this.utilsService.handle401(error);
		});
	}

	getAssociatedCollectionLists() {
		this.workList.CollectionList = '';
		this.associatedCollectionLists = [];
		this.workListService.getCollectionLists(this.workList.Hub).subscribe(response => {
			this.associatedCollectionLists = response.json();
		}, error => {
			this.utilsService.handle401(error);
		});
	}

	getSavedCollectionList(search) {
		this.workListService.getCollectionLists(this.workList.Hub).subscribe(response => {
			this.associatedCollectionLists = response.json();
			this.selectedCollectionList = this.associatedCollectionLists.find(list => list.Id === this.workList.CollectionList);
			this.getAssociatedLocations();
			this.getAssociatedPriorities();
			this.getDateRange(search, true);
		}, error => {
			this.utilsService.handle401(error);
		});
	}

	changeCollectionList(search) {
		this.selectedCollectionList = this.associatedCollectionLists.find(list => list.Id === this.workList.CollectionList);
		this.getAssociatedLocations();
		this.getAssociatedPriorities();
		this.getDateRange(search, false);
		this.removeListeners();
	}

	getAssociatedLocations() {
		this.associatedLocations = this.selectedCollectionList.AssociatedCollectionLocations.filter(record => record.IsActive);
	}

	getAssociatedPriorities() {
		this.priorities = this.selectedCollectionList.AssociatedPriorities.filter(record => record.IsActive);
	}

	getDateRange(search, storage) {
		const collectionList = this.workList.CollectionList;
		const hub = this.workList.Hub;
		if (collectionList !== undefined && hub !== undefined) {
			const currentCollectionList = this.selectedCollectionList;
			const collectPeriod = {
				start: 0,
				end: 0,
			};
			collectPeriod.start = parseInt((currentCollectionList.CollectionPeriodStartSelect) + (((currentCollectionList.CollectionPeriodStartDays !== '') ? (currentCollectionList.CollectionPeriodStartDays) : (0))), 10);
			collectPeriod.end = parseInt((currentCollectionList.CollectionPeriodEndSelect) + (((currentCollectionList.CollectionPeriodEndDays !== '') ? (currentCollectionList.CollectionPeriodEndDays) : (0))), 10);
			this.collectPeriodSettings = {
				StartDate: moment().startOf('day').add(collectPeriod.start, 'days'),
				EndDate: moment().endOf('day').add(collectPeriod.end, 'days'),
				StartTime: currentCollectionList.CollectionPeriodStartTime,
				EndTime: currentCollectionList.CollectionPeriodEndTime
			};

			console.log(`Opening dateRange from storage: ${storage}`);
			if (!search) {
				this.dateRange.dateFrom.maxDate = moment().endOf('day').add(collectPeriod.end, 'days');
				this.dateRange.dateTo.maxDate = moment().endOf('day').add(collectPeriod.end, 'days');
				this.dateRange.dateFrom.minDate = moment().startOf('day').add(collectPeriod.start, 'days');
				this.dateRange.dateTo.minDate = moment().startOf('day').add(collectPeriod.start, 'days');
				if (storage) {
					if (this.workList.Filter.Now) {
						this.workList.Filter.TimeTo = '';
					}
				} else {
					if (this.collectPeriodSettings.EndTime !== 'Now') {
						if (!storage) {
							this.workList.Filter.Now = false;
							this.workList.Filter.TimeTo = this.collectPeriodSettings.EndTime;
						}
					} else {
						if (!storage) {
							this.workList.Filter.Now = true;
							this.workList.Filter.TimeTo = '';
						}
					}
					if (this.tempCleared === true || (this.tempCleared === false && !storage) || this.workListService.getFilter() === undefined) {
						this.workList.Filter.DateFrom = moment().startOf('day').add(collectPeriod.start, 'days');
						this.workList.Filter.DateTo = moment().endOf('day').add(collectPeriod.end, 'days');

						this.workList.Filter.TimeFrom = this.collectPeriodSettings.StartTime;
						this.timeFrom.control.updateValueAndValidity();
						if (this.collectPeriodSettings.EndTime !== 'Now') {
							this.workList.Filter.Now = false;
							this.workList.Filter.TimeTo = this.collectPeriodSettings.EndTime;
						} else {
							this.workList.Filter.TimeTo = '';
							this.workList.Filter.Now = true;
						}
					} else if (this.workListService.getFilter() !== undefined) {
						this.dateRange.dateFrom.maxDate = moment(this.workList.Filter.DateTo).endOf('day');
						this.dateRange.dateTo.minDate = moment(this.workList.Filter.DateFrom).startOf('day');
					}
				}

			}
		}
	}

	checkTimes() {
		const searchTime = this.timeTo._rawValidators.find(validator => validator.name === 'SearchTimeDirective');
		if (this.workList.Filter.Now) {
			if (moment().format('HH:mm') < this.workList.Filter.TimeFrom) {
				searchTime.displayError('tooEarly');
			} else {
				searchTime.clearError();
			}
		} else {
			console.log(`TimeFrom: ${this.workList.Filter.TimeFrom}, TimeTo: ${this.workList.Filter.TimeTo}`);
			if (this.workList.Filter.TimeTo < this.workList.Filter.TimeFrom) {
				searchTime.displayError('tooEarly');
			} else {
				searchTime.clearError();
			}
		}
	}

	changeTimes() {
		console.log(`Change times.`);
		const searchTime = this.timeTo._rawValidators.find(validator => validator.name === 'SearchTimeDirective');
		if (!searchTime.isValid) {
			if (this.workList.Filter.Now) {
				if (!(moment().format('HH:mm') < this.workList.Filter.TimeFrom)) {
					searchTime.clearError();
				}
			} else {
				if (!(this.workList.Filter.TimeTo < this.workList.Filter.TimeFrom)) {
					searchTime.clearError();
				}
			}
		}
	}

	changeNow(event) {
		this.workList.Filter.Now = !this.workList.Filter.Now;
		if (this.workList.Filter.Now) {
			this.workList.Filter.TimeTo = '';
		} else {
			this.workList.Filter.TimeTo = moment().format('HH:mm');
		}
		this.checkTimes();
	}

	show() {
		this.properties.hideOverlay = false;
		this.properties.showOverlay = true;
		this.properties.isDrawerOpen = true;
		this.canClickOverlay = true;
		this.goToTop();
	}

	goToTop() {
		document.querySelector('app-work-list-create .drawer-content').scrollTop = 0;
	}

	openMode(search) {
		this.disableFilter = false;
		this.tempCleared = false;
		this.resetAdd();
		const storedFilter = this.workListService.getFilter();
		const searchFilter = this.workListService.getSearchFilter();
		const hubObject = this.workListService.getHub();
		this.disabledSelect();
		if (hubObject !== undefined) {
			this.workList.Hub = hubObject;
			this.getAssociatedCollectionLists();
		}
		const collectionListObject = this.workListService.getCollectionList();
		if (collectionListObject !== undefined) {
			this.workList.CollectionList = collectionListObject.Id;
			this.getSavedCollectionList(search);
		}
		if (search) {
			this.search = true;
			this.headerText = this.translation.translate('Label.Filter');
			if (searchFilter !== undefined || storedFilter !== undefined) {
				this.removeListeners();
				let tempFilter = storedFilter;
				if (typeof (tempFilter) === 'string') {
					tempFilter = JSON.parse(tempFilter);
				}
				let tempSearchFilter = searchFilter;
				if (typeof (tempSearchFilter) === 'string') {
					tempSearchFilter = JSON.parse(tempSearchFilter);
				}
				tempFilter.Filter.AgeMax = tempFilter.Filter.AgeRange.upper;
				tempFilter.Filter.AgeMin = tempFilter.Filter.AgeRange.lower;
				this.setDateRange(tempFilter);
				if (tempSearchFilter !== undefined) {
					this.workList = tempSearchFilter;
				} else {
					this.workList = tempFilter;
				}
				this.workListService.setSearchFilter(this.workList);
			} else {
				this.disableFilter = true;
			}
		} else {
			this.search = false;
			this.headerText = this.translation.translate('Label.Search');
			if (storedFilter !== undefined) {
				const filter = typeof (this.workListService.getFilter()) === 'string' ? JSON.parse(this.workListService.getFilter()) : this.workListService.getFilter();
				console.log(`The filter is:`);
				console.log(filter);
				this.workList = typeof (this.workListService.getFilter()) === 'string' ? JSON.parse(this.workListService.getFilter()) : this.workListService.getFilter();
				this.interpretDateTime();
			} else {
				this.workList.Filter.DateFrom = moment().startOf('day');
				this.workList.Filter.DateTo = moment().endOf('day');
			}
		}

		this.show();
	}

	interpretDateTime() {
		this.timeFrom.control.updateValueAndValidity();
		this.timeTo.control.updateValueAndValidity();
	}

	setDateRange(tempFilter) {
		tempFilter.Filter.DateFrom = moment(tempFilter.Filter.DateFrom);
		tempFilter.Filter.DateTo = moment(tempFilter.Filter.DateTo);
		this.dateRange.dateFrom.maxDate = tempFilter.Filter.DateTo;
		this.dateRange.dateFrom.minDate = tempFilter.Filter.DateFrom;
		this.dateRange.dateTo.maxDate = tempFilter.Filter.DateTo;
		this.dateRange.dateTo.minDate = tempFilter.Filter.DateFrom;
	}

	makeDateString(date) {
		return date.getDate() + date.getMonth() + date.getYear();
	}

	disabledFilter() {
		return this.workListService.patients.length === 0;
	}

	checkWorkList(wL, filter) {
		let noChanges = true;
		if (wL.Hub !== filter.Hub) {
			noChanges = false;
		}
		if (wL.CollectionList !== filter.CollectionList) {
			noChanges = false;
		}
		if (JSON.stringify(wL.Filter.AgeRange) !== JSON.stringify(filter.Filter.AgeRange)) {
			noChanges = false;
		}
		if (wL.Filter.Gender !== filter.Filter.Gender) {
			noChanges = false;
		}
		if (wL.Filter.Priority !== filter.Filter.Priority) {
			noChanges = false;
		}
		if (wL.Filter.ProblemList !== filter.Filter.ProblemList) {
			noChanges = false;
		}
		if (wL.Filter.Location !== filter.Filter.Location) {
			noChanges = false;
		}
		if (wL.Filter.Reserved !== filter.Filter.Reserved) {
			noChanges = false;
		}
		if (this.makeDateString(new Date(wL.Filter.DateFrom)) !== this.makeDateString(new Date(filter.Filter.DateFrom))) {
			noChanges = false;
		}
		if (this.makeDateString(new Date(wL.Filter.DateTo)) !== this.makeDateString(new Date(filter.Filter.DateTo))) {
			noChanges = false;
		}
		if (wL.Filter.TimeFrom !== filter.Filter.TimeFrom) {
			noChanges = false;
		}
		if (!wL.Filter.Now) {
			if (wL.Filter.TimeTo !== filter.Filter.TimeTo) {
				noChanges = false;
			}
		}
		return noChanges;
	}

	clickOverlay() {
		if (!this.search) {
			// Search slideout
			if (this.canClickOverlay) {
				if (this.workListService.getFilter() !== undefined) {
					const filter = typeof (this.workListService.getFilter()) === 'string' ? JSON.parse(this.workListService.getFilter()) : this.workListService.getFilter();
					if (this.checkWorkList(this.workList, filter) === false) {
						this.openUnsavedChangesDialog();
					} else {
						this.close();
						this.workList.Hub = '';
						this.workList.CollectionList = '';
					}
				} else if (this.workList.Hub || this.workList.CollectionList) {
					this.openUnsavedChangesDialog();
				} else {
					this.close();
					this.workList.Hub = '';
					this.workList.CollectionList = '';
				}
			}
		} else {
			// Filter slideout
			if (this.canClickOverlay) {
				if (this.workListService.getSearchFilter() !== undefined) {
					const searchFilter = typeof (this.workListService.getSearchFilter()) === 'string' ? JSON.parse(this.workListService.getSearchFilter()) : this.workListService.getSearchFilter();
					if (this.checkWorkList(JSON.parse(JSON.stringify(this.workList)), searchFilter) === false) {
						this.openUnsavedChangesDialog();
					} else {
						this.close();
						this.workList.Hub = '';
						this.workList.CollectionList = '';
					}
				} else {
					this.close();
					this.workList.Hub = '';
					this.workList.CollectionList = '';
				}
			}
		}
	}

	close() {
		this.canClickOverlay = false;
		this.utilsService.closeDrawer(this.properties);
	}

	openUnsavedChangesDialog() {
		let dialogRef: any;
		if (!this.search) {
			dialogRef = this.errorAlert.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				data: { message: 'Changes made Would you like to save and perform the search' },
				autoFocus: false
			});
		} else {
			dialogRef = this.errorAlert.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				data: { message: 'Changes made Would you like to save and perform the filter' },
				autoFocus: false
			});
		}

		dialogRef.beforeClose().subscribe(result => {
			if (document.body.querySelector('.add-overlay')) {
				document.body.removeChild(document.body.querySelector('.add-overlay'));
			}
			if (result) {
				this.fromClickOverlay = true;
				this.saveList(!this.search);
			} else {
				if (this.oldPatientsToDisplay.reset) {
					this.workListService.patientsToDisplay = this.oldPatientsToDisplay.patients;
					this.oldPatientsToDisplay.reset = false;
				}
				this.close();
				this.workList.Hub = '';
				this.workList.CollectionList = '';
			}
		});
	}

	saveList(reset) {
		this.workListService.resetTables();
		this.workListService.resetCleanTime();
		if (reset) {
			// Saving from Search screen
			this.renewObjectForm();
			if (this.fromClickOverlay === true) {
				if (this.workList.Hub === '') {
					this.workListService.emptyFilter();
					this.workListService.filterReset();
					this.clearFields();
					this.fromClickOverlay = false;
					this.close();
					this.workList.Hub = '';
					this.workList.CollectionList = '';
					this.workListService.clearSearch().subscribe(response => {
						if (response.status === 200) {
							console.log(`Deleted saved WLB Search...`);
						}
					});
					return;
				}
			}

			if (this.saveForm()) {
				this.workList.Filter.Reset = reset;
				this.workListService.setCollectionList(this.associatedCollectionLists.filter(list => list.Id === this.workList.CollectionList)[0]);
				this.workListService.setHub(this.workList.Hub);
				this.workList.Filter.GenderSet = this.workList.Filter.Gender !== '' ? true : false;
				this.workList.Filter.PrioritySet = this.workList.Filter.Priority !== '' ? true : false;
				this.workList.Filter.ProblemListSet = this.workList.Filter.ProblemList !== '' && this.workList.Filter.ProblemList !== undefined ? true : false;
				this.workList.Filter.LocationSet = this.workList.Filter.Location !== '' ? true : false;
				this.workList.Filter.ReservedSet = this.workList.Filter.Reserved !== '' && this.workList.Filter.Reserved !== undefined ? true : false;
				this.workListService.setCollectionListEndTimeNow(this.workList.Filter.Now);
				this.compileDateTime();
				this.workListService.setFilter(JSON.stringify(this.workList));
				this.workListService.setSearchFilter(undefined);
				this.workList.Filter.From = 'Search';
				this.saveListOutput.emit(this.workList);
				this.close();
				this.workList.Hub = '';
				this.workList.CollectionList = '';
			} else {
				this.goToTop();
			}
		} else {
			// Saving from Filter screen
			this.workList.Filter.Reset = reset;
			this.workListService.setSearchFilter(JSON.stringify(this.workList));
			this.workList.Filter.From = 'Filter';
			this.saveListOutput.emit(this.workList);
			this.close();
			this.workList.Hub = '';
			this.workList.CollectionList = '';
		}
	}

	compileDateTime() {
		if (moment(this.workList.Filter.DateFrom).startOf('day').format() === this.collectPeriodSettings.StartDate.format()) {
			const newerDateFrom = moment(`${moment(this.workList.Filter.DateFrom).startOf('day').format('YYYY-MM-DD')} ${this.collectPeriodSettings.StartTime}`, 'YYYY-MM-DD HH:mm');
			this.workList.Filter.DateFrom = newerDateFrom.utc().format();
		} else {
			this.workList.Filter.DateFrom = moment(this.workList.Filter.DateFrom).startOf('day').utc().format();
		}
		if (moment(this.workList.Filter.DateTo).endOf('day').format() === this.collectPeriodSettings.EndDate.format()) {
			if (this.workList.Filter.Now) {
				const newerDateTo = moment(`${moment(this.workList.Filter.DateTo).endOf('day').format('YYYY-MM-DD')} ${moment().format('HH:mm')}`, 'YYYY-MM-DD HH:mm');
				this.workList.Filter.DateTo = newerDateTo.utc().format();
			} else {
				const newerDateTo = moment(`${moment(this.workList.Filter.DateTo).endOf('day').format('YYYY-MM-DD')} ${this.collectPeriodSettings.EndTime}`, 'YYYY-MM-DD HH:mm');
				this.workList.Filter.DateTo = newerDateTo.utc().format();
			}
		} else {
			this.workList.Filter.DateTo = moment(this.workList.Filter.DateTo).endOf('day').utc().format();
		}
		if (this.workList.Filter.Now) {
			this.workList.Filter.TimeTo = moment().format('HH:mm');
		}
		console.log(this.workList.Filter);
	}

	clearFields() {
		this.disabledSelect();
		this.workList = {
			Hub: '',
			CollectionList: '',
			Filter: {
				AgeRange: {
					lower: 0,
					upper: 100
				},
				AgeMin: 0,
				AgeMax: 100,
				Gender: '',
				GenderSet: false,
				Priority: '',
				PrioritySet: false,
				ProblemList: '',
				ProblemListSet: false,
				Location: '',
				LocationSet: false,
				Reserved: '',
				ReservedSet: false,
				DateFrom: moment().startOf('day'),
				DateTo: moment().endOf('day'),
				TimeFrom: moment().startOf('day').format('HH:mm'),
				TimeTo: moment().endOf('day').format('HH:mm'),
				DateSet: false,
				Reset: false,
				Now: false,
				From: ''
			}
		};
	}

	updateLower() {
		this.workList.Filter.AgeRange = {
			lower: parseInt(this.workList.Filter.AgeRange.lower.toString(), 10),
			upper: this.workList.Filter.AgeRange.upper
		};
	}

	updateUpper() {
		this.workList.Filter.AgeRange = {
			upper: parseInt(this.workList.Filter.AgeRange.upper.toString(), 10),
			lower: this.workList.Filter.AgeRange.lower
		};
	}

	clearFilter(search, close) {
		this.workListService.resetCleanTime();
		if (search) { // Search
			this.resetAdd();
			this.clearFields();
			this.tempCleared = true;
		} else { // Filter
			this.oldPatientsToDisplay.patients = this.workListService.patientsToDisplay;
			this.oldPatientsToDisplay.reset = true;
			this.workListService.resetToShow();
			this.workList.Filter.AgeRange = {
				lower: this.workList.Filter.AgeMin,
				upper: this.workList.Filter.AgeMax
			};
			this.workList.Filter.DateFrom = this.dateRange.dateFrom.minDate;
			this.workList.Filter.DateTo = this.dateRange.dateTo.maxDate;
			if (!this.workList.Filter.GenderSet) {
				this.workList.Filter.Gender = '';
			}
			if (!this.workList.Filter.PrioritySet) {
				this.workList.Filter.Priority = '';
			}
			if (!this.workList.Filter.ProblemListSet) {
				this.workList.Filter.ProblemList = '';
			}
			if (!this.workList.Filter.LocationSet) {
				this.workList.Filter.Location = '';
			}
			if (!this.workList.Filter.ReservedSet) {
				this.workList.Filter.Reserved = '';
			}
			this.workList.Filter.Reset = false;
			this.workListService.setSearchFilter(JSON.stringify(this.workList));
			this.saveListOutput.emit(this.workList);
			if (close) {
				this.close();
				this.workList.Hub = '';
				this.workList.CollectionList = '';
			}
		}
	}

	clickDatepickerTo(event) {
		event.preventDefault();
		this.pickerDateTo.open();
	}

	clickDatepickerFrom(event) {
		event.preventDefault();
		this.pickerDateFrom.open();
	}

	updateDateFrom(event) {
		this.dateRange.dateFrom.maxDate = event.value;
	}

	updateDateTo(event) {
		this.dateRange.dateTo.minDate = event.value;
	}
}
