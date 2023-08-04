import { Component, OnInit, ViewChild } from '@angular/core';
import { WorkListService } from '../../services/work-list.service';
import { TranslationService } from 'angular-l10n';
import { MatDialog } from '@angular/material';
import { SliderType } from 'igniteui-angular';
import { UnsavedChangesDialogComponent } from '../../unsaved-changes-dialog/unsaved-changes-dialog.component';
import * as moment from 'moment-timezone';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
	selector: 'app-work-list-filter',
	templateUrl: './work-list-filter.component.html',
	styleUrls: ['./work-list-filter.component.css']
})
export class WorkListFilterComponent implements OnInit {
	sliderType = SliderType;
	pristineObject: any;
	isDrawerOpen = false;
	columns: any;
	genders: any;
	priorities: any;
	locations: any;
	reserved: any;
	yesNo = [
		this.translation.translate('Label.Yes'),
		this.translation.translate('Label.No')
	];

	filterObject: any = {
		DateFrom: moment(),
		DateTo: moment()
	};

	searchObject;

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

	@ViewChild('pickerDateTo') pickerDateTo: any;
	@ViewChild('pickerDateFrom') pickerDateFrom: any;

	constructor(private workListService: WorkListService, public translation: TranslationService, private utilsService: UtilsService, private dialog: MatDialog) { }

	ngOnInit(): void {
		this.getLocations();
		this.getPriorities();
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.filterObject);
	}

	clickOverlay() {
		if (this.pristineObject !== JSON.stringify(this.filterObject)) {
			const dialogRef = this.dialog.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				data: { message: 'Changes made Would you like to save and perform the filter' },
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (document.body.querySelector('.add-overlay')) {
					document.body.removeChild(document.body.querySelector('.add-overlay'));
				}
				(result) ? this.save() : this.closeDrawer();
			});
		} else {
			this.closeDrawer();
		}
	}

	makeDateString(mo) {
		return mo.month() + mo.day() + mo.year();
	}

	show(columns) {
		if (this.workListService.getFilter() !== undefined) {
			this.searchObject = typeof (this.workListService.getFilter()) === 'string' ? JSON.parse(this.workListService.getFilter()) : this.workListService.getFilter();
		}
		if (JSON.stringify(this.columns) !== JSON.stringify(columns)) {
			this.columns = [];
			this.filterObject = {};
			columns.forEach(col => {
				if (col.name === 'DOB') {
					const bObj = this.workListService.builderObj;
					if (this.workListService.builderObj) {
						this.filterObject[col.name] = { AgeRange: { lower: bObj.AgeMin, upper: bObj.AgeMax }, AgeMax: bObj.AgeMax, AgeMin: bObj.AgeMin };
					} else {
						this.filterObject[col.name] = { AgeRange: { lower: 0, upper: 100 }, AgeMax: 100, AgeMin: 0 };
					}

				} else {
					if (this.searchObject !== undefined && this.searchObject.Filter[col.name]) {
						this.filterObject[col.name] = this.searchObject.Filter[col.name];
					} else if (col.name === 'Problem list') {
						if (this.searchObject !== undefined && this.searchObject.Filter.ProblemList) {
							this.filterObject[col.name] = this.searchObject.Filter.ProblemList;
						} else {
							this.filterObject[col.name] = '';
						}
					} else {
						this.filterObject[col.name] = '';
					}
				}
			});

			this.getDateRange();
			this.columns = columns;
		}
		this.resetPristine();
		this.isDrawerOpen = true;
		document.querySelector('app-work-list-filter .drawer-content').scrollTop = 0;
	}

	closeDrawer() {
		if (this.pristineObject !== undefined) {
			this.filterObject = JSON.parse(this.pristineObject);
		}
		this.isDrawerOpen = false;
	}

	save() {
		this.workListService.setWorkListFilter(this.filterObject);
		this.workListService.workListFilterPeriodText(this.filterObject);
		this.workListService.broadcastWorkListFilterUpdate();
		this.resetPristine();
		this.closeDrawer();
	}

	clear(close) {
		Object.keys(this.filterObject).forEach(key => {
			if (key === 'DOB') {
				const bObj = this.workListService.builderObj;
				this.filterObject[key] = { AgeRange: { lower: bObj.AgeMin, upper: bObj.AgeMax }, AgeMax: bObj.AgeMax, AgeMin: bObj.AgeMin };
			} else {
				this.filterObject[key] = '';
			}
		});
		this.getDateRange();

		this.workListService.setWorkListFilter(this.filterObject);
		this.workListService.broadcastWorkListFilterUpdate();
		this.resetPristine();
		if (close) {
			this.closeDrawer();
		}
	}

	getOptions(colName) {
		switch (colName) {
			case 'Gender': return this.getGenders();
			case 'Priority': return this.getPriorities();
			case 'Location': return this.getLocations();
			case 'Reserved': return this.getReserved();
			case 'Problem list': return this.getProblemList();
		}
	}

	getProblemList() {
		return this.yesNo;
	}

	getGenders() {
		if (this.genders === undefined) {
			this.genders = [this.translation.translate('Label.Male'), this.translation.translate('Label.Female')];
			return this.genders;
		} else {
			return this.genders;
		}
	}

	getPriorities() {
		if (this.priorities === undefined) {
			if (this.workListService.getCollectionList() && this.workListService.checkOnlineStatus()) {
				this.priorities = this.workListService.collectionListPriorities;
				return this.priorities;
			} else {
				return undefined;
			}
		} else {
			return this.priorities;
		}
	}

	getLocations() {
		if (this.locations === undefined) {
			if (this.workListService.getCollectionList() && this.workListService.checkOnlineStatus()) {
				this.workListService.getCollectionLocations(this.workListService.getCollectionList().Id).subscribe(response => {
					this.locations = response.json().map(location => location = location.Code);
					return this.locations;
				}, error => {
					this.utilsService.handle401(error);
					this.locations = [];
					return this.locations;
				});
			} else {
				return undefined;
			}
		} else {
			return this.locations;
		}
	}

	getReserved() {
		if (this.reserved === undefined) {
			this.reserved = [this.translation.translate('Label.Reserved'), this.translation.translate('Label.Locked')];
			return this.reserved;
		} else {
			return this.reserved;
		}
	}

	isLastInput(col) {
		return (this.columns) ? ((this.columns[this.columns.length - 1].name === col.name) ? (true) : (false)) : (false);
	}

	isFirstInput(col) {
		return (this.columns) ? ((this.columns[0].name === col.name) ? (true) : (false)) : (false);
	}

	workListBuilt() {
		return (this.workListService.getHub() === undefined) ? false : true;
	}

	disableFilter() {
		return this.workListService.patients.length === 0;
	}

	updateLower() {
		this.filterObject['DOB'].AgeRange = {
			lower: parseInt(this.filterObject['DOB'].AgeRange.lower.toString(), 10),
			upper: this.filterObject['DOB'].AgeRange.upper
		};
	}

	updateUpper() {
		this.filterObject['DOB'].AgeRange = {
			upper: parseInt(this.filterObject['DOB'].AgeRange.upper.toString(), 10),
			lower: this.filterObject['DOB'].AgeRange.lower
		};
	}

	getDateRange() {
		if (this.workListService.builderObj !== undefined) {
			const bObj = this.workListService.formatDateRange(this.workListService.builderObj);
			bObj.DateFrom = moment(`${bObj.DateFrom.month() + 1}/${bObj.DateFrom.date()}/${bObj.DateFrom.year()}`, 'MM-DD-YYYY');
			bObj.DateTo = moment(`${bObj.DateTo.month() + 1}/${bObj.DateTo.date()}/${bObj.DateTo.year()}`, 'MM-DD-YYYY');
			if (bObj) {
				this.dateRange.dateFrom.maxDate = bObj.DateTo;
				this.dateRange.dateFrom.minDate = bObj.DateFrom;
				this.dateRange.dateTo.maxDate = bObj.DateTo;
				this.dateRange.dateTo.minDate = bObj.DateFrom;
				this.filterObject.DateFrom = this.dateRange.dateFrom.minDate;
				this.filterObject.DateTo = this.dateRange.dateTo.maxDate;
			}
			this.workListService.workListFilterPeriodText(this.filterObject);
		} else {
			this.filterObject.DateFrom = moment();
			this.filterObject.DateTo = moment();
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
