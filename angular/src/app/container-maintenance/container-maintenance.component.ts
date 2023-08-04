import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { ContainerService } from '../services/container.service';
import { ContainerAddComponent } from '../container-add/container-add.component';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { NotificationService } from '../services/notification.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-container-maintenance',
	templateUrl: './container-maintenance.component.html',
	styleUrls: ['./container-maintenance.component.css']
})
export class ContainerMaintenanceComponent implements OnInit, AfterViewInit, OnDestroy {
	columns = {
		table: [
			{ id: 1, name: 'Code', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'Name', dropdown: false, array: [], model: 'Name', dateTime: false, checked: true },
			{ id: 3, name: 'Description', dropdown: false, array: [], model: 'Description', dateTime: false, checked: true },
			{ id: 4, name: 'Volume', dropdown: false, array: [], model: 'Volume', dateTime: false, checked: true },
			{ id: 5, name: 'ContainerType', dropdown: false, array: [], model: 'Container type', dateTime: false, checked: true },
			{ id: 6, name: 'ContainerRank', dropdown: true, array: ['A', 'P'], model: 'Container rank', dateTime: false, checked: true },
			{ id: 7, name: 'SpecimenCode', dropdown: false, array: [], model: 'Specimen code', dateTime: false, checked: true },
			{ id: 8, name: 'DrawOrder', dropdown: false, array: [], model: 'Draw order', dateTime: false, checked: true },
			{ id: 9, name: 'StorageCode', dropdown: false, array: [], model: 'Storage code', dateTime: false, checked: true },
			{ id: 10, name: 'Laboratory', dropdown: true, array: [], model: 'Lab', dateTime: false, checked: true },
			{ id: 11, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], model: 'Active', dateTime: false, checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'CONTAINER_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';

	transferSubscription: any;

	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('containerAdd') containerAdd: ContainerAddComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private containerService: ContainerService, public utilsService: UtilsService, private notificationService: NotificationService, public translation: TranslationService) {
		this.utilsService.readTableColumns(this.columns, this.columnStorageName);
		this.utilsService.setTableColumns(this.columns);
	}

	ngOnInit() {
		// this.loadData();
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

	ngOnDestroy(): void {
		if (this.transferSubscription) {
			this.transferSubscription.unsubscribe();
		}
	}

	autoTransfer() {
		if (this.transferSubscription) {
			this.transferSubscription.unsubscribe();
		}
		this.transferSubscription = this.notificationService.getNewRecordTransferID().subscribe(response => {
			if (response !== undefined) {
				setTimeout(() => this.containerAdd.editContainer(response.EntityId), 1000);
			}
		});
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
			this.containerService.getContainers().subscribe(response => {
				this.loadDataComplete(response.json());
				console.log('container get all: ', response.json());
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error getting container data: ${error.statusText}, error ${error.status}`);
				}
			});
		}
	}

	loadDataComplete(response) {
		console.log('all containers: ', response);
		this.selectedRowId = '';
		this.getUniqueLabs(response);
		this.dataSource = new MatTableDataSource<any>(response);
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
		this.dataSource.sortingDataAccessor = (data, header) => data[header];
		this.autoTransfer();
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
		this.columns.filter[9].array = uniqueLabs;
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a container to edit'));
		} else {
			this.containerAdd.editContainer(this.selectedRowId);
		}
	}

	containerOnSave(n) {
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
			this.containerService.getContainers().subscribe(response => {
				let toReturn = response.json();
				Object.keys(filter).forEach(key => {
					if (filter[key] !== '') {
						const dropdown = this.columns.table.filter(obj => obj.name === key)[0].dropdown;
						if (dropdown === true) {
							if (key === 'IsActive') {
								if (filter[key] === 'Active') {
									toReturn = toReturn.filter(row => (row[key] === true));
								} else {
									toReturn = toReturn.filter(row => (row[key] === false));
								}
							} else if (key === 'Laboratory') {
								if (filter[key] !== 'All') {
									toReturn = toReturn.filter(row => (row['Laboratory'].Code === filter[key]));
								}
							} else {
								toReturn = toReturn.filter(row => (row[key] === filter[key]));
							}
						} else {
							toReturn = toReturn.filter(row => (row[key].toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						}
					}
				});
				this.loadDataComplete(toReturn);
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

