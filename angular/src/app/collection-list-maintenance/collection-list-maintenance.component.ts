import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { CollectionListAddComponent } from '../collection-list-add/collection-list-add.component';
import { CollectionListService } from '../services/collection-list.service';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-collection-list-maintenance',
	templateUrl: './collection-list-maintenance.component.html',
	styleUrls: ['./collection-list-maintenance.component.css']
})
export class CollectionListMaintenanceComponent implements OnInit, AfterViewInit {
	columns = {
		table: [
			{ id: 1, name: 'Code', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'Description', dropdown: false, array: [], model: 'Description', dateTime: false, checked: true },
			{ id: 3, name: 'LabId', dropdown: true, array: [], model: 'Lab', dateTime: false, checked: true },
			{ id: 4, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], dateTime: false, model: 'Active', checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'COLLECTION_LIST_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';

	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('collectionListAdd') collectionListAdd: CollectionListAddComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private utilsService: UtilsService, private collectionListService: CollectionListService, private errorAlert: MatDialog, public dialog: MatDialog, public translation: TranslationService) {
		this.utilsService.readTableColumns(this.columns, this.columnStorageName);
		this.utilsService.setTableColumns(this.columns);
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
		this.loadData();
	}

	notifyBroadcast(message) {
		if (message && message.IsBroadcast === true) {
			this.notificationMessage.show(message);
		}
	}

	paginatorChange(evt) {
		if (evt.previousPageIndex !== evt.pageIndex) {
			this.selectedRowId = '';
		}
	}

	loadData() {
		if (this.utilsService.checkOnlineStatus()) {
			this.collectionListService.getCollectionLists().subscribe(response => {
				this.loadDataComplete(response);
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error getting collection list data: ${error.statusText}, error ${error.status}`);
				}
			});
		}
	}

	loadDataComplete(response) {
		this.selectedRowId = '';
		const responseData = response.json();
		this.getUniqueLabs(response.json());
		responseData.forEach(element => {
			element.LabId = element.Laboratory.Id;
		});
		this.dataSource = new MatTableDataSource<any>(responseData);
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a collection list to edit'));
		} else {
			this.collectionListAdd.editCollectionList(this.selectedRowId);
		}
	}

	getUniqueLabs(obj) {
		const uniqueLabs = [];
		obj.map(lab => lab.Laboratory.Code).forEach(lab => {
			if (lab !== '') {
				if (uniqueLabs.indexOf(lab) === -1) {
					uniqueLabs.push(lab);
				}
			}
		});
		uniqueLabs.sort().splice(0, 0, 'All');
		this.columns.filter[2].array = uniqueLabs;
	}

	collectionListOnSave(n) {
		if (n === true) {
			this.filterComponent.resetForm(false);
		} else {
			this.filterComponent.save(true);
		}
	}

	tableColumnsOnSave($event) {
		this.columns.table = $event.columns;
		localStorage.setItem(this.columnStorageName, JSON.stringify(this.columns.table));
		this.utilsService.setTableColumns(this.columns);
	}

	receiveFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			this.collectionListService.getCollectionLists().subscribe(response => {
				let toReturn = response.json();
				Object.keys(filter).forEach(key => {
					if (filter[key] !== '') {
						console.log('filterKey: ', key);
						const dropdown = this.columns.table.filter(obj => obj.name === key)[0].dropdown;
						if (dropdown === true) {
							if (key === 'IsActive') {
								if (filter[key] === 'Active') {
									toReturn = toReturn.filter(row => (row[key] === true));
								} else {
									toReturn = toReturn.filter(row => (row[key] === false));
								}
							} else if (key === 'LabId') {
								if (filter[key] !== 'All') {
									toReturn = toReturn.filter(row => (row['Laboratory'].Id === filter[key]));
								}
							} else {
								toReturn = toReturn.filter(row => (row[key] === filter[key]));
							}
						} else {
							toReturn = toReturn.filter(row => (row[key].toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						}
					}
				});
				toReturn.forEach(element => {
					element.LabId = element.Laboratory.Id;
				}, error => { this.utilsService.handle401(error); });
				this.selectedRowId = '';
				this.getUniqueLabs(response.json());
				this.dataSource = new MatTableDataSource<any>(toReturn);
				this.dataSource.paginator = this.tablePaginator;
				this.utilsService.fixPagination(this.dataSource);
				this.dataSource.sort = this.sort;
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
		}
	}
}
