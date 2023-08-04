import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { CollectionDurationService } from '../services/collection-duration.service';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { FilterComponent } from '../filter/filter.component';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { TranslationService } from 'angular-l10n';
import * as moment from 'moment';

@Component({
	selector: 'app-collection-duration',
	templateUrl: './collection-duration.component.html',
	styleUrls: ['./collection-duration.component.css']
})

export class CollectionDurationComponent implements OnInit, AfterViewInit {
	columns = {
		table: [
			{ id: 1, name: 'Code', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'Users', dropdown: false, array: [], model: 'User', dateTime: false, checked: true },
			{ id: 3, name: 'NumberOfCollections', dropdown: false, array: [], model: 'Number of Collections', dateTime: false, checked: true },
			{ id: 4, name: 'AverageDurationMinutes', dropdown: false, array: [], dateTime: true, model: 'Average Duration (Minutes)', checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'COLLECTION_DURATION_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	showFilter = false;
	filterValue = '';
	databaseFilter: any;
	pdfData: any;
	noFilter = true;
	filteredRange = '';
	_printIframe;
	isLoading = false;
	isCordova = false;
	pdfObtained = false;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private utilsService: UtilsService, private activeEntitiesService: ActiveEntitiesService, private collectionDurationService: CollectionDurationService, private errorAlert: MatDialog, public dialog: MatDialog, public translation: TranslationService) {
		this.readAndSetTableColumns();
	}

	ngOnInit() {
		const previousButton: HTMLButtonElement = document.querySelector('.mat-paginator-navigation-previous');
		previousButton.title = this.translation.translate('Label.Previous');
		const nextButton: HTMLButtonElement = document.querySelector('.mat-paginator-navigation-next');
		nextButton.title = this.translation.translate('Label.Next');
		const poweredBy = document.querySelector('.poweredBy2');
		poweredBy.innerHTML = document.querySelector('.poweredBy').innerHTML;
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
		const storedTableColumns = localStorage.getItem(this.columnStorageName);

		if (storedTableColumns != null) {
			this.columns.table = JSON.parse(storedTableColumns);
		}

		this.columns.table[0].array = [];
		this.columns.table[0].array.push('All');

		this.activeEntitiesService.users.forEach(user => {
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
		this.dataSource.sortingDataAccessor = (item, property) => {
			switch (property) {
				case 'Users': return item.User;
				default: return item[property];
			}
		};
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
		this.showFilter = true;
	}

	closeFilter() {
		this.clearFilter();
		this.showFilter = false;
	}

	clearFilter() {
		this.filterValue = '';
		this.applyFilter();
	}

	applyFilter() {
		this.dataSource.filter = this.filterValue.trim().toLowerCase();
	}

	tableColumnsOnSave($event) {
		this.columns.table = $event.columns;
		localStorage.setItem(this.columnStorageName, JSON.stringify(this.columns.table));
		this.utilsService.setTableColumns(this.columns);
	}

	receiveFilter(filter) {
		this.noFilter = true;
		const dateRange = filter.UTCTimeStamp;
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const dateTimeFrom = `${dateRange.dateFrom === '' ? moment(yesterday).format('MM/DD/YY') : dateRange.dateFrom} - ${dateRange.timeFrom === '' ? '00:00' : dateRange.timeFrom}`;
		const dateTimeTo = `${dateRange.dateTo === '' ? moment(Date()).format('MM/DD/YY') : dateRange.dateTo} - ${dateRange.timeTo === '' ? '23:59' : dateRange.timeTo}`;
		this.databaseFilter = {
			Users: filter.Users === 'All' ? '' : filter.Users, DateTimeFrom: dateTimeFrom,
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

	runFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			if (this.noFilter === false) {
				this.setFilteredRange(filter);
				this.collectionDurationService.searchDurations(this.databaseFilter).subscribe(response => {
					this.dataSource = new MatTableDataSource<any>(response.json());
					console.log('res: ', response.json());
					this.dataSource.paginator = this.tablePaginator;
					this.utilsService.fixPagination(this.dataSource);
					this.dataSource.sort = this.sort;
					this.dataSource.sortingDataAccessor = (item, property) => {
						switch (property) {
							case 'Users': return item.User;
							default: return item[property];
						}
					};
					this.pdfObtained = false;
					if (this.dataSource.data.length === 0) {
						this.noFilter = true;
					}
				}, error => { this.utilsService.handle401(error); });
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

	checkCordova() {
		if ((<any>window).deviceReady === true) {
			this.isCordova = true;
		}
	}

	print() {
		if (this.pdfObtained === true) {
			this._printIframe.contentWindow.print();
		} else {
			if (this.noFilter === false) {
				if (this.isCordova === true) {
					return;
				} else {
					this.desktopPrint();
				}
			}
		}
	}

	desktopPrint() {
		if (this.utilsService.checkOnlineStatus()) {
			this.isLoading = true; // isLoading controls the progress spinner
			this.collectionDurationService.printDurations(this.databaseFilter).subscribe(response => {
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

}
