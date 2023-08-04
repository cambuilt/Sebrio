import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { ClientService } from '../services/client.service';
import { ClientAddComponent } from '../client-add/client-add.component';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';

@Component({
	selector: 'app-client-maintenance',
	templateUrl: './client-maintenance.component.html',
	styleUrls: ['./client-maintenance.component.css']
})

export class ClientMaintenanceComponent implements OnInit, AfterViewInit {
	columns = {
		table: [
			{ id: 1, name: 'Code', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'Name', dropdown: false, array: [], model: 'Name', dateTime: false, checked: true },
			{ id: 3, name: 'Address', dropdown: false, array: [], model: 'Address', dateTime: false, checked: true },
			{ id: 4, name: 'Phone', dropdown: false, array: [], model: 'Phone', dateTime: false, checked: true },
			{ id: 5, name: 'Email', dropdown: false, array: [], model: 'Email', dateTime: false, checked: true },
			{ id: 6, name: 'Laboratory', dropdown: true, array: [], model: 'Lab', dateTime: false, checked: true },
			{ id: 7, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], dateTime: false, model: 'Active', checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'CLIENT_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';
	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('clientAdd') clientAdd: ClientAddComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private utilsService: UtilsService, private clientService: ClientService, private errorAlert: MatDialog, public dialog: MatDialog, public translation: TranslationService) {
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
			this.clientService.getClients().subscribe(response => {
				this.loadDataComplete(response.json());
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error getting client data: ${error.statusText}, error ${error.status}`);
				}
			});
		}
	}

	loadDataComplete(response) {
		console.log('allClients: ', response);
		this.selectedRowId = '';
		response.forEach(client => {
			client.Address = this.getAddress(client);
		});
		this.getUniqueLabs(response);
		this.dataSource = new MatTableDataSource<any>(response);
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
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
		this.columns.filter[5].array = uniqueLabs;
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a client to edit'));
		} else {
			this.clientAdd.editClient(this.selectedRowId);
		}
	}

	clientOnSave(n) {
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

	getAddress(row) {
		if (row.Location.StreetAddress1 !== '') {
			if (row.Location.StreetAddress2 === '') {
				return row.Location.StreetAddress1 + ', ' + row.Location.City + ' ' + row.Location.State + ' ' + row.Location.PostalCode;
			} else {
				return row.Location.StreetAddress1 + ', ' + row.Location.StreetAddress2 + ', ' + row.Location.City + ' ' + row.Location.State + ' ' + row.Location.PostalCode;
			}
		} else {
			return '';
		}
	}

	getFilterAddress(location) {
		if (location.StreetAddress2 === '') {
			return location.StreetAddress1 + ', ' + location.City + ' ' + location.State + ' ' + location.PostalCode;
		} else {
			return location.StreetAddress1 + ', ' + location.StreetAddress2 + ', ' + location.City + ' ' + location.State + ' ' + location.PostalCode;
		}
	}

	receiveFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			this.clientService.getClients().subscribe(response => {
				let toReturn = response.json();
				Object.keys(filter).forEach(key => {
					if (filter[key] !== '') {
						const dropdown = this.columns.table.filter(obj => obj.name === key)[0].dropdown;
						if (dropdown === true) {
							if (key === 'IsActive') {
								console.log('key in IsActive: ', key);
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
						} else if (key === 'Address') {
							const key2 = 'Location';
							toReturn = toReturn.filter(row => (row[key2].StreetAddress1.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || this.getFilterAddress(row[key2]).toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row[key2].City.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row[key2].State.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row[key2].PostalCode.toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
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
