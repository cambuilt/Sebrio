import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatSelect, MatDialog } from '@angular/material';
import { TranslationService } from 'angular-l10n';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { UtilsService } from '../services/utils.service';
import { Router } from '@angular/router';

export const MY_FORMATS = {
	parse: {
		dateInput: 'MM/DD/YY',
	},
	display: {
		dateInput: 'MM/DD/YY',
		monthYearLabel: 'MMM YYYY'
	}
};

@Component({
	selector: 'app-filter',
	templateUrl: './filter.component.html',
	styleUrls: ['./filter.component.css'],
	providers: [
		{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})

export class FilterComponent {
	isDrawerOpen = false;
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	@ViewChild('filterUser') filterUser: UserSelectorComponent;
	@ViewChild(MatSelect) matSelect: MatSelect;
	@ViewChild('actionForm') actionForm: NgModel;
	@ViewChild('actionForm2') actionForm2: NgModel;
	@ViewChild('dateToForm') dateToForm: NgModel;
	@ViewChild('phoneForm') phoneForm: NgModel;
	@ViewChild('emailForm') emailForm: NgModel;
	objectForm = [];
	options: any;
	returnColumns = [];
	filterObject: any = {};
	pristineObject: any;
	headerText: string;
	users = [];
	reporting = false;
	userSelected = false;
	collectionData = false;
	filterApplied = false;
	needsUsersInput = false;
	userSelectedReporting = ['Logged in', 'Logged out', 'Added', 'Updated', 'Viewed'];
	datePeriod: any;
	datePeriodOptions = ['Today', 'Yesterday', 'Last week', 'Last month', 'Last 6 months', 'Last year'];
	collectionDate = '';
	pristineUsers: any;
	@ViewChild('pickerDateTo') pickerDateTo: any;
	@ViewChild('pickerDateFrom') pickerDateFrom: any;
	@ViewChild('pickerDate') pickerDate: any;
	@ViewChild('timeFromForm') timeFromForm: any;
	@ViewChild('timeToForm') timeToForm: any;
	constructor(private router: Router, private utilsService: UtilsService, private errorAlert: MatDialog, public translation: TranslationService) { }

	requiredFields() {
		const controlArray = [];
		if (this.actionForm) { controlArray.push(this.actionForm); }
		if (this.phoneForm) { controlArray.push(this.phoneForm); }
		if (this.emailForm) { controlArray.push(this.emailForm); }
		return controlArray;
	}

	clickOverlay() {
		console.log('filterObject: ', JSON.stringify(this.filterObject));
		console.log('pristineObject: ', this.pristineObject);
		Object.keys(this.filterObject).forEach(key => {
			if (key !== 'UTCTimeStamp' && key !== 'User' && key !== 'Users' && key !== 'Action') {
				this.filterObject[key] = this.filterObject[key].trim();
			}
		});
		if (this.pristineObject !== JSON.stringify(this.filterObject)) {
			const dialogRef = this.errorAlert.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				data: { message: 'Changes made Would you like to save and perform the filter' },
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (document.body.querySelector('.add-overlay')) {
					document.body.removeChild(document.body.querySelector('.add-overlay'));
				}
				if (result === true) {
					this.save(false);
				} else {
					this.revertToPristine();
					this.closeDrawer();
				}
			});
		} else {
			this.closeDrawer();
		}
	}

	revertToPristine() {
		let changed = false;
		if (this.pristineObject !== undefined) {
			this.filterObject = JSON.parse(this.pristineObject);
			Object.keys(this.filterObject).forEach(key => {
				if (this.router.routerState.snapshot.url === '/utilization') {
					if (Object.keys(this.filterObject).length < 1 || this.filterObject === undefined || this.filterObject === {}) {
					this.filterObject = { Users: [], UTCTimeStamp: { dateFrom: '', dateTo: '', timeFrom: '', timeTo: '' } };
					} else { this.users = JSON.parse(this.pristineUsers); }
				} else {
					const optionColumn = this.options.find(option => option.name === key);
					if (optionColumn !== undefined && optionColumn.dropdown === true) {
						if (optionColumn.array.find(opt => opt === this.filterObject[key]) === undefined) {
							this.filterObject[key] = '';
							changed = true;
						}
					}
				}
			});
		}
		this.requiredFields().forEach(c => {
			c.control.markAsPristine();
			c.control.markAsUntouched();
			c.control.updateValueAndValidity();
		});
		if (changed) {
			this.onSave.emit(this.filterObject);
		}
	}

	updatePristine() {
		this.pristineObject = JSON.stringify(this.filterObject);
		this.pristineUsers = JSON.stringify(this.users);
		console.log('pristine: ', this.pristineObject);
	}

	show(columns) {
		if (this.utilsService.checkOnlineStatus()) {
			if (this.router.routerState.snapshot.url === '/utilization' || this.router.routerState.snapshot.url === '/collection-duration') { // had to do this bc columns are not search parameters in utilizations
				this.reporting = true;
				this.headerText = this.translation.translate('Label.Search');
				this.isDrawerOpen = true;
				this.goToTop();
					if (Object.keys(this.filterObject).length < 1 || this.filterObject === undefined || this.filterObject === {}) {
				this.filterObject = { Users: [], UTCTimeStamp: { dateFrom: '', dateTo: '', timeFrom: '', timeTo: '' } };
				} else { this.users = JSON.parse(this.pristineUsers); }
				this.updatePristine();
			} else if (this.router.routerState.snapshot.url === '/collection-data') {
				this.collectionData = true;
				this.headerText = this.translation.translate('Label.Search');
				this.isDrawerOpen = true;
				this.goToTop();
				this.filterObject = { Users: [], UTCTimeStamp: { dateFrom: '', dateTo: '', timeFrom: '', timeTo: '' } };
				if (this.pristineUsers !== [] && this.pristineUsers !== undefined) {
					this.users = JSON.parse(this.pristineUsers);
				}
				this.updatePristine();
			} else if (this.router.routerState.snapshot.url === '/auditing') {
				this.reporting = true;
				this.headerText = this.translation.translate('Label.Search');
				this.isDrawerOpen = true;
				this.goToTop();
				this.options = [{ id: 2, name: 'Action', dropdown: true, array: ['Logged in', 'Logged out', 'Added', 'Updated', 'Viewed', 'All'], model: 'Action', dateTime: false, checked: true }];
				if (this.filterObject.Action) {
					const tempAction = JSON.parse(JSON.stringify(this.filterObject.Action));
					this.filterObject = { Action: tempAction, Users: [], UTCTimeStamp: { dateFrom: '', dateTo: '', timeFrom: '', timeTo: '' } };
				} else {
					this.filterObject = { Action: '', Users: [], UTCTimeStamp: { dateFrom: '', dateTo: '', timeFrom: '', timeTo: '' } };
				}
				if (this.pristineUsers !== [] && this.pristineUsers !== undefined) {
				this.users = JSON.parse(this.pristineUsers);
				}
				this.updatePristine();
			} else {
				if (!this.options || this.options.length !== columns.length) {
					this.filterObject = {};
					columns.forEach(element => {
						if (element.dateTime === true) {
							this.filterObject[element.name] = { dateFrom: '', dateTo: '', timeFrom: '', timeTo: '' };
						} else {
							this.filterObject[element.name] = '';
						}
					});
					this.options = columns;
					this.updatePristine();
				}
				this.revertToPristine();
				this.checkReporting();
				this.isDrawerOpen = true;
				this.goToTop();
			}
		}
	}

	checkReporting() {
		this.options.forEach(option => {
			if (option.dateTime === true) {
				this.reporting = true;
				this.headerText = this.translation.translate('Label.Search');
				this.filterObject['Users'] = [];
			} else {
				this.headerText = this.translation.translate('ScreenTitle.Filter');
			}
		});
		this.updatePristine();
	}

	fullClose(save) {
		if (save) {
			this.save(false);
		} else {
			this.closeDrawer();
		}
	}

	processUserSelect(newUserData: any) {
		this.users = newUserData;
		this.notifyUserSelector();
		this.convertUsers();
	}

	notifyUserSelector() {
		this.filterUser.usersInput = this.users;
	}

	goToTop() {
		document.querySelector('app-filter .drawer-content').scrollTop = 0;
	}

	closeDrawer() {
		this.reporting = false;
		this.isDrawerOpen = false;
	}

	removeUser(user: any) {
		this.users.splice(this.users.indexOf(user), 1);
		this.convertUsers();
		this.notifyUserSelector();
	}

	resetForm(close) {
		this.requiredFields().forEach(control => {
			control.reset();
		});
		this.resetObject();
		if (close) {
			this.closeDrawer();
		}
		this.datePeriod = '';
		this.collectionDate = '';
		this.users = [];
		this.pristineUsers = [];
		this.save(true);
	}

	resetObject() {
		Object.keys(this.filterObject).forEach(element => {
			if (element === 'UTCTimeStamp') {
				this.filterObject[element] = { dateFrom: '', dateTo: '', timeFrom: '', timeTo: '' };
			} else {
				this.filterObject[element] = '';
			}
		});
		this.datePeriod = '';
		this.users = [];
		this.pristineUsers = [];
	}

	checkForm() {
		let formValid = true;
		if (this.requiredFields().length) {
			this.requiredFields().forEach(c => {
				if (!c.disabled) {
					c.control.markAsDirty();
					c.control.markAsTouched();
					c.control.updateValueAndValidity();
					if (!c.valid) {
						formValid = false;
					}
				}
			});
		}
		return formValid;
	}

	determineDatePeriod() {
		if (this.datePeriod === 'Today') { // good
			this.filterObject['UTCTimeStamp'] = { dateFrom: moment().format('MM/DD/YY'), dateTo: moment().format('MM/DD/YY'), timeFrom: '', timeTo: '' };
		} else if (this.datePeriod === 'Yesterday') {
			this.filterObject['UTCTimeStamp'] = { dateFrom: moment().subtract(1, 'd').format('MM/DD/YY'), dateTo: moment().subtract(1, 'd').format('MM/DD/YY'), timeFrom: '', timeTo: '' };
		} else if (this.datePeriod === 'Last week') {
			this.filterObject['UTCTimeStamp'] = { dateFrom: moment().subtract(7, 'd').format('MM/DD/YY'), dateTo: moment().subtract(1, 'd').format('MM/DD/YY'), timeFrom: '', timeTo: '' };
		} else if (this.datePeriod === 'Last month') {
			this.filterObject['UTCTimeStamp'] = { dateFrom: moment().subtract(1, 'M').format('MM/DD/YY'), dateTo: moment().subtract(1, 'd').format('MM/DD/YY'), timeFrom: '', timeTo: '' };
		} else if (this.datePeriod === 'Last 6 months') {
			this.filterObject['UTCTimeStamp'] = { dateFrom: moment().subtract(6, 'M').format('MM/DD/YY'), dateTo: moment().subtract(1, 'd').format('MM/DD/YY'), timeFrom: '', timeTo: '' };
		} else if (this.datePeriod === 'Last year') {
			this.filterObject['UTCTimeStamp'] = { dateFrom: moment().subtract(1, 'y').format('MM/DD/YY'), dateTo: moment().subtract(1, 'd').format('MM/DD/YY'), timeFrom: '', timeTo: '' };
		}
	}

	convertUsers() {
		if (this.reporting === true || this.collectionData === true) {
			// tslint:disable-next-line:prefer-const
			let usersToSearch = [];
			this.users.forEach(user => {
				usersToSearch.push(user.Username);
			});
			if (usersToSearch.length > 1 && this.filterObject['Action'] === 'All') {
				this.filterObject['Action'] = '';
				this.checkForm();
			}
			if (usersToSearch.length < 1 && this.filterObject['Action'] === 'All') {
				this.needsUsersInput = true;
			} else {
				this.needsUsersInput = false;
			}
			this.filterObject['Users'] = usersToSearch;
		}
	}

	save(clearClicked) {
		Object.keys(this.filterObject).forEach(key => {
			if (key !== 'UTCTimeStamp' && key !== 'Users' && key !== 'User' && key !== 'Action') {
				this.filterObject[key] = this.filterObject[key].trim();
			}
		});
		if (clearClicked === true) {
			this.onSave.emit(this.filterObject);
			this.updatePristine();
			this.users = [];
			this.filterApplied = false;
			this.needsUsersInput = false;
		} else if (clearClicked === false) {
			if (this.checkForm()) {
				this.convertUsers();
				if (this.needsUsersInput !== true) {
					if (this.reporting === true || this.collectionData === true) {
						this.determineDatePeriod();
					}
					if (this.collectionData === true) {
						this.filterObject['UTCTimeStamp'] = { dateFrom: moment(this.collectionDate).format('MM/DD/YY'), dateTo: moment(this.collectionDate).format('MM/DD/YY'), timeFrom: '00:00', timeTo: '23:59' };
					}
					this.onSave.emit(this.filterObject);
					this.updatePristine();
					this.closeDrawer();
				}
				this.filterApplied = false;
				Object.keys(this.filterObject).forEach(key => {
					if (this.filterObject[key] !== '') {
						this.filterApplied = true;
					}
				});
			} else {
				this.goToTop();
			}
		}
	}

	checkIfToday(event) {
		if (this.filterObject['UTCTimeStamp'].dateFrom.date() + this.filterObject['UTCTimeStamp'].dateFrom.month() + this.filterObject['UTCTimeStamp'].dateFrom.year() === moment().date() + moment().month() + moment().year()) {
			this.filterObject['UTCTimeStamp'].dateTo = moment();
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

	clickDatepicker(event) {
		event.preventDefault();
		this.pickerDate.open();
	}

	getMaxDatePicker() {
		return new Date();
	}

	getMinDate(which) {
		if (which === 'to') {
			if (this.filterObject['UTCTimeStamp'] !== '') {
				return this.filterObject['UTCTimeStamp'].dateFrom;
			}
		} else if (which === 'from') {

		}
	}

	getMaxDate(which) {
		if (which === 'to') {
			return new Date();
		} else if (which === 'from') {
			if (this.filterObject['UTCTimeStamp'].dateTo !== '') {
				return this.filterObject['UTCTimeStamp'].dateTo;
			} else {
				return new Date();
			}
		}
	}
}
