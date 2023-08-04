import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { ProviderService } from '../services/provider.service';
import { ProviderAddComponent } from '../provider-add/provider-add.component';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'app-provider-maintenance',
	templateUrl: './provider-maintenance.component.html',
	styleUrls: ['./provider-maintenance.component.css']
})

export class ProviderMaintenanceComponent implements OnInit, AfterViewInit {

	columns = {
		table: [
			{ id: 1, name: 'Code', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'CompanyName', dropdown: false, array: [], model: 'Company name', dateTime: false, checked: true },
			{ id: 3, name: 'FirstName', dropdown: false, array: [], model: 'Full name', dateTime: false, checked: true },
			{ id: 4, name: 'Address', dropdown: false, array: [], model: 'Address', dateTime: false, checked: true },
			{ id: 5, name: 'Phone1', dropdown: false, array: [], model: 'Phone', dateTime: false, checked: true },
			{ id: 6, name: 'CellPhone', dropdown: false, array: [], model: 'Cell phone', dateTime: false, checked: true },
			{ id: 7, name: 'Email', dropdown: false, array: [], model: 'Email', dateTime: false, checked: true },
			{ id: 8, name: 'Laboratory', dropdown: true, array: [], model: 'Lab', dateTime: false, checked: true },
			{ id: 9, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], model: 'Active', dateTime: false, checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'PROVIDER_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';

	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('providerAdd') providerAdd: ProviderAddComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private utilsService: UtilsService, private providerService: ProviderService, public translation: TranslationService) {
		this.utilsService.readTableColumns(this.columns, this.columnStorageName);
		this.utilsService.setTableColumns(this.columns);
	}

	ngOnInit() {
		this.loadData();
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
			this.providerService.getProviders().subscribe(response => {
				this.loadDataComplete(response.json());
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error getting provider data: ${error.statusText}, error ${error.status}`);
				}
			});
		}
	}

	loadDataComplete(response) {
		this.selectedRowId = '';
		response.forEach(provider => {
			provider.Address = this.getAddress(provider);
			provider.FullName = this.getFullName(provider);
		});
		this.getUniqueLabs(response);
		console.log('all providers: ', response);
		this.dataSource = new MatTableDataSource<any>(response);
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a provider to edit'));
		} else {
			this.providerAdd.editProvider(this.selectedRowId);
		}
	}

	getFullName(provider) {
		return `${provider.FirstName} ${provider.LastName}`;
	}

	getAddress(provider) {
		if (provider.Location.StreetAddress1 !== '') {
			let address = provider.Location.StreetAddress1;
			if (provider.Location.StreetAddress2 !== '') { address = `${address}, ${provider.Location.StreetAddress2}`; }
			return `${address}, ${provider.Location.City}, ${provider.Location.State} ${provider.Location.PostalCode}`;
		} else { return ''; }
	}

	providerOnSave(n) {
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

	getProviderAddress(row) {
		if (row.Location.AddressLine2 === '') {
			return row.Location.AddressLine1;
		} else {
			return row.Location.AddressLine1 + ', ' + row.Location.AddressLine2;
		}
	}

	getFilterAddress(location) {
		if (location.StreetAddress2 === '') {
			return location.StreetAddress1 + ', ' + location.City + ' ' + location.State + ' ' + location.PostalCode;
		} else {
			return location.StreetAddress1 + ', ' + location.StreetAddress2 + ', ' + location.City + ' ' + location.State + ' ' + location.PostalCode;
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
		this.columns.filter[7].array = uniqueLabs;
	}

	receiveFilter(filter) {
		console.log('receiveFilter() was executed');
		if (this.utilsService.checkOnlineStatus()) {
			this.providerService.getProviders().subscribe(response => {
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
						} else if (key === 'Address') {
							const key2 = 'Location';
							toReturn = toReturn.filter(row => (row[key2].StreetAddress1.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || this.getFilterAddress(row[key2]).toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row[key2].City.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row[key2].State.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row[key2].PostalCode.toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						} else if (key === 'FirstName') {
							toReturn = toReturn.filter(row => (row[key].toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row['LastName'].toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || this.getFullName(row).toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						} else {
							toReturn = toReturn.filter(row => (row[key].toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						}
					}
				}, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
				this.loadDataComplete(toReturn);
			});
		}
	}
}
