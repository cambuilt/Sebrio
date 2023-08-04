import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { AuditingService } from '../services/auditing.service';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { FilterComponent } from '../filter/filter.component';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { TranslationService } from 'angular-l10n';
import * as moment from 'moment-timezone';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { AuthService } from '../services/auth.service';

@Component({
	selector: 'app-auditing',
	templateUrl: './auditing.component.html',
	styleUrls: ['./auditing.component.css']
})

export class AuditingComponent implements OnInit, AfterViewInit {
	columns = {
		table: [
			{ id: 1, name: 'Users', sortOn: 'User', display: this.translation.translate('Label.User'), dropdown: true, array: [], model: 'Users', dateTime: false, checked: true },
			{ id: 2, name: 'Action', sortOn: 'Action', display: this.translation.translate('Label.Action'), dropdown: true, array: ['Logged in', 'Logged out', 'Added', 'Updated', 'Viewed', 'All'], model: 'Action', dateTime: false, checked: true },
			{ id: 3, name: 'UTCTimeStamp', sortOn: 'UTCTimeStamp', display: this.translation.translate('Label.Time'), dropdown: false, array: [], dateTime: true, model: 'UTCTimeStamp', checked: true }
		], filter: []
	};

	columnStorageName = 'AUDITING_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	grid = {
		sort: {
			column: '',
			sortOn: '',
			order: ''
		}
	};

	paginatorOptions = [5, 10, 20, 50, 100];
	paginatorSelected = 5;
	pageIndex = 0;
	paginationStart = 0;
	paginationEnd = 0;
	paginationTotal = 0;
	paginatorRange: any;

	toGroupDates = true;
	groupDates = [];
	dateActions = [];
	pinnedDate;

	showFilter = false;
	filterValue = '';
	databaseFilter: any;
	lastRunFilter: any;
	pdfData: any;
	noFilter = true;
	filteredRange = '';
	_printIframe;
	isLoading = false;
	fileUrl = '';
	isCordova = false;
	pdfObtained = false;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private authService: AuthService, private iab: InAppBrowser, private document: DocumentViewer, private utilsService: UtilsService, private activeEntitiesService: ActiveEntitiesService, private auditingService: AuditingService, public dialog: MatDialog, public translation: TranslationService) {
		this.readAndSetTableColumns();
	}

	ngOnInit() {
		/* const previousButton: HTMLButtonElement = document.querySelector('.mat-paginator-navigation-previous');
		previousButton.title = this.translation.translate('Label.Previous');
		const nextButton: HTMLButtonElement = document.querySelector('.mat-paginator-navigation-next');
		nextButton.title = this.translation.translate('Label.Next'); */
		const poweredBy = document.querySelector('.poweredBy2');
		poweredBy.innerHTML = document.querySelector('.poweredBy').innerHTML;
		// this.isLoading = true;
		this.checkCordova();
	}

	getTimezoneAbbr() {
		const zone_name = moment.tz.guess();
		const timezone = moment.tz(zone_name).zoneAbbr();
		return timezone;
	}

	checkCordova() {
		if ((<any>window).deviceReady === true) {
			this.isCordova = true;
		}
	}

	print() {
		console.log(this.groupDates);
		if (this.pdfObtained === true) {
			if (this.noFilter === false) {
				if (this.isCordova === true) {
					this.viewPdf();
				} else {
					this._printIframe.contentWindow.print();
				}
			}
		} else {
			if (this.noFilter === false) {
				if (this.isCordova === true) {
					this.viewPdf();
				} else {
					this.desktopPrint();
				}
			}
		}
	}

	viewPdf() {
		if (this.pdfObtained === false) {
			if (this.utilsService.checkOnlineStatus()) {
				this.isLoading = true;
				const dbFilter = { ...this.databaseFilter };
				dbFilter.DateFrom = moment(dbFilter.DateTimeFrom, 'MM/DD/YY - HH:mm').format('MM/DD/YY');
				dbFilter.DateTo = moment(dbFilter.DateTimeTo, 'MM/DD/YY - HH:mm').format('MM/DD/YY');
				delete dbFilter.DateTimeFrom;
				delete dbFilter.DateTimeTo;
				if (this.filteredRange === 'Yesterday' || this.filteredRange === 'Today') {
					dbFilter.ExpandedDates = this.groupDates.map(date => date.date);
				} else {
					const expandedDates = this.groupDates.filter(date => date.expanded);
					if (expandedDates.length) {
						dbFilter.ExpandedDates = expandedDates.map(date => date.date);
					} else {
						dbFilter.ExpandedDates = [];
					}
				}
				dbFilter.TimeZoneOffsetMinutes = moment().utcOffset();
				dbFilter.TimeZone = this.getTimezoneAbbr();
				this.auditingService.printAuditing(dbFilter).subscribe(response => {
					const file = new Blob([response], { type: 'application/pdf' }); // read blob and create url
					const fileUrl = URL.createObjectURL(file);
					this.fileUrl = fileUrl;
					this.pdfObtained = true;
					const pdfDialog = this.dialog.open(PdfViewerComponent, {
						panelClass: 'pdf-dialog',
						backdropClass: 'errorOverlay',
						data: fileUrl,
						disableClose: false
					});
					this.isLoading = false;
				}, error => {
					this.isLoading = false;
					this.utilsService.showError(`${this.translation.translate(`Error.Error retrieving PDF ${error}`)}`);
					this.utilsService.handle401(error);
				});
			}
		} else {
			const pdfDialog = this.dialog.open(PdfViewerComponent, {
				panelClass: 'pdf-dialog',
				backdropClass: 'errorOverlay',
				data: this.fileUrl,
				disableClose: false
			});
			this.isLoading = false;
		}
	}

	// cordovaPrint() {
	// 	this.isLoading = true;
	// 	this.auditingService.printAuditing(this.databaseFilter).subscribe(response => {
	// 		const file = new Blob([response], { type: 'application/pdf' }); // read blob and create url
	// 		const fileUrl = URL.createObjectURL(file);  // we will use url for iframe src
	// 		const newUrl = fileUrl.replace('blob:', '');
	// 		this.utilsService.showError(`fileURL is ... ${newUrl}`);
	// 		const options: DocumentViewerOptions = {
	// 			title: `Auditing Report ${this.databaseFilter.DateTimeFrom} - ${this.databaseFilter.DateTimeTo}`,
	// 			print: { enabled: true }
	// 		};
	// 		const reader = new FileReader();
	// 		reader.onload = () => {
	// 			const text = reader.result.toString();
	// 			const browser = this.iab.create(text);
	// 			browser.show();
	// 			// this.document.viewDocument(text, 'application/pdf', options);
	// 		};
	// 		reader.readAsDataURL(file);
	// 		// this.document.viewDocument(newUrl, 'application/pdf', options);
	// 		this.isLoading = false;
	// 		this.pdfObtained = true;
	// 		// const browser = this.iab.create(fileUrl);
	// 		// browser.show();
	// 	}, error => {
	// 		this.isLoading = false;
	// 		this.utilsService.showError('Error retrieving PDF');
	// 	});
	// }

	desktopPrint() {
		if (this.utilsService.checkOnlineStatus()) {
			const dbFilter = { ...this.databaseFilter };
			dbFilter.DateFrom = moment(dbFilter.DateTimeFrom, 'MM/DD/YY - HH:mm').format('MM/DD/YY');
			dbFilter.DateTo = moment(dbFilter.DateTimeTo, 'MM/DD/YY - HH:mm').format('MM/DD/YY');
			delete dbFilter.DateTimeFrom;
			delete dbFilter.DateTimeTo;
			if (this.filteredRange === 'Yesterday' || this.filteredRange === 'Today') {
				dbFilter.ExpandedDates = this.groupDates.map(date => date.date);
			} else {
				dbFilter.ExpandedDates = this.groupDates.filter(date => date.expanded).map(date => date.date);
			}
			dbFilter.TimeZoneOffsetMinutes = moment().utcOffset();
			dbFilter.TimeZone = this.getTimezoneAbbr();
			this.isLoading = true; // isLoading controls the progress spinner
			this.auditingService.printAuditing(dbFilter).subscribe(response => {
				const file = new Blob([response], { type: 'application/pdf' }); // read blob and create url
				const fileUrl = URL.createObjectURL(file);  // we will use url for iframe src
				let iframe = this._printIframe;
				if (!this._printIframe) {
					iframe = this._printIframe = document.createElement('iframe');
					document.body.appendChild(iframe);
					iframe.style.display = 'none';
					iframe.onload = function () {
						setTimeout(() => {
							iframe.focus(); // print contents of iframe window
							iframe.contentWindow.print();
							this.isLoading = false;
						}, 1);
					};
				}
				iframe.src = fileUrl;
				this.isLoading = false;
				this.pdfObtained = true;
			}, error => {
				this.isLoading = false;
				this.utilsService.showError(`${this.translation.translate(`Error.Error retrieving PDF ${error}`)}`);
				this.utilsService.handle401(error);
			});
		}
	}

	ngAfterViewInit() {
		const screen: HTMLDivElement = document.querySelector('.maintenance-page');
		setTimeout(() => screen.hidden = !screen.hidden, 300);
		this.utilsService.setTableColumns(this.columns);
		this.loadDataComplete();
	}

	notifyBroadcast(message) {
		if (message && message.IsBroadcast === true) {
			this.notificationMessage.show(message);
		}
	}

	readAndSetTableColumns() {
		this.utilsService.readTableColumns(this.columns, this.columnStorageName);
		this.columns.table[0].array = [];

		this.activeEntitiesService.userSubject.value.forEach(user => {
			if (user['Username'] !== '') {
				this.columns.table[0].array.push(user['Username']);
			}
		});

		this.utilsService.setTableColumns(this.columns);
	}

	loadDataComplete() {
		this.dataSource = new MatTableDataSource<any>();
		this.dataSource.paginator = this.tablePaginator;
		this.dataSource.sort = this.sort;
		this.pdfObtained = false;
	}

	getFormattedDate(date: Date) {
		const year = date.getFullYear();
		let month = (1 + date.getMonth()).toString();
		month = month.length > 1 ? month : '0' + month;
		let day = date.getDate().toString();
		day = day.length > 1 ? day : '0' + day;
		return month + '/' + day + '/' + year.toString().substring(2, 4);
	}

	openFilter() {
		this.filterComponent.show(this.columns.filter);
	}

	tableColumnsOnSave($event) {
		this.columns.table = $event.columns;
		localStorage.setItem(this.columnStorageName, JSON.stringify(this.columns.table));
		this.utilsService.setTableColumns(this.columns);
	}

	receiveFilter(filter) {
		this.noFilter = true;
		const dateRange = filter.UTCTimeStamp;
		const dateTimeFrom = `${dateRange.dateFrom === '' ? moment().format('MM/DD/YY') : dateRange.dateFrom} - ${dateRange.timeFrom === '' ? '00:00' : dateRange.timeFrom}`;
		const dateTimeTo = `${dateRange.dateTo === '' ? moment().format('MM/DD/YY') : dateRange.dateTo} - ${dateRange.timeTo === '' ? '23:59' : dateRange.timeTo}`;
		this.databaseFilter = {
			Users: filter.Users === 'All' ? '' : filter.Users, Action: filter.Action === 'All' ? '' : filter.Action, DateTimeFrom: dateTimeFrom,
			DateTimeTo: dateTimeTo
		};
		this.checkFields(filter);
		this.runFilter(filter);
	}

	setFilteredRange(filter) {
		if (filter.UTCTimeStamp.dateFrom === filter.UTCTimeStamp.dateTo) {
			if (filter.UTCTimeStamp.dateFrom === moment().subtract(1, 'd').format('MM/DD/YY')) {
				this.filteredRange = 'Yesterday';
			} else {
				this.filteredRange = 'Today';
			}
		} else {
			this.filteredRange = filter.UTCTimeStamp.dateFrom + ' - ' + filter.UTCTimeStamp.dateTo;
		}
	}

	numberRows() {
		let count = 0;
		this.groupDates.forEach(date => {
			date.count = count;
			count++;
			if (date.expanded) {
				let firstAction = true;
				date.actions.forEach(action => {
					if (firstAction) {
						count--;
						firstAction = false;
					}
					action.count = count;
					count++;
				});
			}
		});
		if (this.groupDates.filter(groupDate => groupDate.expanded).length) {
			this.paginationTotal = count;
		} else {
			this.paginationTotal = this.groupDates.length;
		}
	}

	clickDate(date) {
		date.expanded = !date.expanded;
		const dateFilter = {
			Action: this.databaseFilter.Action,
			EventDate: date.date,
			Users: { ... this.databaseFilter.Users },
			TimeZoneOffsetMinutes: moment().utcOffset()
		};
		if (!date.actions.length) {
			this.auditingService.searchAuditing(JSON.stringify(dateFilter)).subscribe(response => {
				date.actions = response.json();
				if (this.toGroupDates) {
					date.actions.forEach(action => {
						action.UTCTimeStamp = moment.utc(action.UTCTimeStamp, 'MM/DD/YY - HH:mm').local().format('HH:mm');
					});
				} else {
					date.actions.forEach(action => {
						action.UTCTimeStamp = moment.utc(action.UTCTimeStamp, 'MM/DD/YY - HH:mm').local().format('MM/DD/YY - HH:mm');
					});
				}
				this.pdfObtained = false;
				this.fileUrl = '';
				this.numberRows();
				this.getActionsToDisplay();
				this.sortOnRefresh();
			});
		} else {
			this.numberRows();
			this.getActionsToDisplay();
			this.sortOnRefresh();
		}

		/* this.auditingService.searchAuditing(this.databaseFilter).subscribe(response => {
			this.dataSource = new MatTableDataSource<any>(response.json());
			this.dataSource.paginator = this.tablePaginator;
			this.utilsService.fixPagination(this.dataSource);
			this.dataSource.sort = this.sort;
			this.pdfObtained = false;
			this.fileUrl = '';
			if (this.dataSource.data.length === 0) {
				this.noFilter = true;
			}

		}); */
	}

	getActionsToDisplay() {
		if (this.groupDates.length) {
			if ((this.pageIndex * this.paginatorSelected) > this.paginationTotal) {
				this.pageIndex = 0;
			}
			this.paginationStart = (this.pageIndex * this.paginatorSelected);
			this.paginationEnd = Math.min((this.pageIndex * this.paginatorSelected + this.paginatorSelected), this.paginationTotal);
		} else {
			this.paginationTotal = this.paginationStart = this.paginationEnd = 0;
		}
		this.updatePaginatorRange();
	}

	updatePaginatorRange() {
		if (this.paginationTotal !== 0) {
			this.paginatorRange = `${this.paginationStart + 1} - ${this.paginationEnd} of ${this.paginationTotal}`;
			if (this.groupDates.filter(groupDate => groupDate.expanded).length) {
				const pastDates = this.groupDates.filter(groupDate =>
					groupDate.count <= this.paginationEnd &&
					groupDate.expanded &&
					groupDate.actions.length &&
					groupDate.actions[groupDate.actions.length - 1].count >= this.paginationStart).map(groupDate => ({ last: groupDate.actions[groupDate.actions.length - 1].count, count: groupDate.count }));
				if (pastDates.length) {
					this.pinnedDate = pastDates.find(d => d.last === Math.min(...pastDates.map(date => date.last))).count;
				} else {
					this.pinnedDate = -1;
				}
			} else {
				this.pinnedDate = -1;
			}
		} else {
			this.paginatorRange = `0 of 0`;
		}
	}

	changePageIndex(mod) {
		if (mod > 0 && this.pageIndex > -1) {
			this.pageIndex = this.pageIndex + mod;
		} else if (mod < 0) {
			this.pageIndex = this.pageIndex + mod;
		}
		this.getActionsToDisplay();
	}

	updatePaginatorNumber() {
		this.pageIndex = 0;
		this.getActionsToDisplay();
	}

	getActionsPerDate() {
		const dateFilter = {
			Action: this.databaseFilter.Action,
			DateFrom: moment(this.databaseFilter.DateTimeFrom, 'MM/DD/YY - HH:mm').format('MM/DD/YY'),
			DateTo: moment(this.databaseFilter.DateTimeTo, 'MM/DD/YY - HH:mm').format('MM/DD/YY'),
			Users: { ... this.databaseFilter.Users },
			TimeZoneOffsetMinutes: moment().utcOffset()
		};
		this.auditingService.getDateCount(JSON.stringify(dateFilter)).subscribe(response => {
			response.json().forEach(dateCount => {
				this.groupDates.find(gdate => gdate.date === dateCount.EventDate).actionCount = dateCount.TotalEvents;
			});
		});
	}

	runFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			if (this.noFilter === false) {
				this.setFilteredRange(filter);
				if (this.filteredRange === 'Yesterday' || this.filteredRange === 'Today') {
					this.toGroupDates = false;
					this.columns.table.find(col => col.name === 'UTCTimeStamp').display = this.translation.translate('Label.Date & Time');
				} else {
					this.toGroupDates = true;
					this.columns.table.find(col => col.name === 'UTCTimeStamp').display = this.translation.translate('Label.Time');
				}
				this.groupDates = [];
				if (this.filteredRange === 'Today') {
					this.groupDates.push({ date: moment().format('MM/DD/YY'), expanded: false, actions: [], count: 1 });
				} else if (this.filteredRange === 'Yesterday') {
					this.groupDates.push({ date: moment().subtract(1, 'day').format('MM/DD/YY'), expanded: false, actions: [], count: 1 });
				} else {
					let startDate = moment(this.databaseFilter.DateTimeFrom, 'MM/DD/YY - HH:mm');
					const endDate = moment(this.databaseFilter.DateTimeTo, 'MM/DD/YY - HH:mm');

					let count = 1;
					while (!startDate.isAfter(endDate, 'day')) {
						this.groupDates.push({ date: startDate.format('MM/DD/YY'), expanded: false, actions: [], count: count });
						startDate.add(1, 'days');
						count++;
					}
				}
				this.numberRows();
				this.getActionsToDisplay();
				if (this.filteredRange === 'Yesterday' || this.filteredRange === 'Today') {
					this.clickDate(this.groupDates[0]);
				} else {
					this.getActionsPerDate();
				}

				/* this.auditingService.searchAuditing(this.databaseFilter).subscribe(response => {
					this.dataSource = new MatTableDataSource<any>(response.json());
					this.dataSource.paginator = this.tablePaginator;
					this.utilsService.fixPagination(this.dataSource);
					this.dataSource.sort = this.sort;
					this.pdfObtained = false;
					this.fileUrl = '';
					if (this.dataSource.data.length === 0) {
						this.noFilter = true;
					}

				}, error => {
					this.utilsService.handle401(error);
				}); */
			} else {
				this.filteredRange = '';
				this.loadDataComplete();
			}
		}
	}

	checkFields(filter) {
		Object.keys(filter).forEach(key => {
			if (key === 'UTCTimeStamp') {
				Object.keys(filter[key]).forEach(k => {
					if (k !== 'dateTo' && k !== 'dateFrom') {
						if (filter[key][k] !== '') {
							this.noFilter = false;
						}
					}
				});
			} else {
				if (filter[key] !== '') {
					this.noFilter = false;
				}
			}
		});
	}

	dateRangeFilter(filter, key) {
		// filter is passed by reference, so make a copy so that original is not altered.
		const dateRange = { ...filter[key] };
		dateRange.dateFrom = moment(dateRange.dateFrom).format('MM/DD/YY');
		dateRange.dateTo = moment(dateRange.dateTo).format('MM/DD/YY');
		dateRange.timeFrom = dateRange.timeFrom === '' ? '00:00' : dateRange.timeFrom;
		dateRange.timeTo = dateRange.timeTo === '' ? '23:59' : dateRange.timeTo;
		if (dateRange.dateFrom !== '' && dateRange.dateTo === '') {
			return row => (row[key] >= `${dateRange.dateFrom} - ${dateRange.timeFrom}`);
		} else if (dateRange.dateFrom !== '' && dateRange.dateTo !== '') {
			return row => (row[key] >= `${dateRange.dateFrom} - ${dateRange.timeFrom}` && row[key] <= `${dateRange.dateTo} - ${dateRange.timeTo}`);
		} else {
			return row => (row[key] <= `${dateRange.dateTo} - ${dateRange.timeTo}`);
		}
	}

	sortOnRefresh() {
		if (this.grid.sort.column !== '') {
			let multiplier = 1;
			if (this.grid.sort.order === 'asc') {
				multiplier = -1;
			}
			this.groupDates.forEach(groupDate => {
				if (groupDate.actions.length) {
					groupDate.actions.sort((a, b) => {
						const newA = (this.grid.sort.sortOn).split('.').reduce((c, d) => c[d], a);
						const newB = (this.grid.sort.sortOn).split('.').reduce((c, d) => c[d], b);
						if (newA > newB) {
							return (1 * multiplier);
						}
						if (newA < newB) {
							return (-1 * multiplier);
						}
						return 0;
					});
				}
			});
		}
		this.numberRows();
		this.getActionsToDisplay();
	}

	sortColumn(col) {
		const storedCol = col.name;
		let multiplier = 1;
		let reset = false;
		if (this.grid.sort.column === storedCol) {
			if (this.grid.sort.order === 'desc') {
				multiplier = -1;
				this.grid.sort.order = 'asc';
			} else if (this.grid.sort.order === 'asc') {
				multiplier = 1;
				this.grid.sort.column = '';
				this.grid.sort.sortOn = '';
				this.grid.sort.order = '';
				reset = true;
			}
		} else {
			this.grid.sort.column = storedCol;
			this.grid.sort.sortOn = col.sortOn;
			this.grid.sort.order = 'desc';
		}
		if (reset) {
			this.groupDates.forEach(groupDate => {
				if (groupDate.actions.length) {
					groupDate.actions.sort((a, b) => {
						if (a.UTCTimeStamp > b.UTCTimeStamp) {
							return (1);
						}
						if (a.UTCTimeStamp < b.UTCTimeStamp) {
							return (-1);
						}
						return 0;
					});
				}
			});

		} else {
			this.groupDates.forEach(groupDate => {
				if (groupDate.actions.length) {
					groupDate.actions.sort((a, b) => {
						const newA = (col.sortOn).split('.').reduce((c, d) => c[d], a);
						const newB = (col.sortOn).split('.').reduce((c, d) => c[d], b);
						if (newA > newB) {
							return (1 * multiplier);
						}
						if (newA < newB) {
							return (-1 * multiplier);
						}
						return 0;
					});
				}
			});
		}
		this.numberRows();
		this.getActionsToDisplay();
	}

}
