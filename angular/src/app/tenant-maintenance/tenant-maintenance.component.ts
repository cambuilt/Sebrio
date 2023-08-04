import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { TenantService } from '../services/tenant.service';
import { TenantAddComponent } from '../tenant-add/tenant-add.component';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-tenant-maintenance',
	templateUrl: './tenant-maintenance.component.html',
	styleUrls: ['./tenant-maintenance.component.css']
})

export class TenantMaintenanceComponent implements OnInit, AfterViewInit {
	columns = {
		table: [
			{ id: 1, name: 'Name', dropdown: false, array: [], model: 'Name', dateTime: false, checked: true },
			{ id: 2, name: 'Address', dropdown: false, array: [], model: 'Address', dateTime: false, checked: true },
			{ id: 3, name: 'Website', dropdown: false, array: [], model: 'Website', dateTime: false, checked: true },
			{ id: 4, name: 'Phone', dropdown: false, array: [], model: 'Phone', dateTime: false, checked: true },
			{ id: 5, name: 'Email', dropdown: false, array: [], model: 'Email', dateTime: false, checked: true },
			{ id: 6, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], model: 'Active', dateTime: false, checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'TENANT_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';

	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('tenantAdd') tenantAdd: TenantAddComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private utilsService: UtilsService, private tenantService: TenantService, public translation: TranslationService) {
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
	loadData() {
		if (this.utilsService.checkOnlineStatus()) {
			this.tenantService.getTenants().subscribe(response => {
				this.loadDataComplete(response);
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error getting tenant data: ${error.statusText}, error ${error.status}`);
				}
			});
		}
	}

	loadDataComplete(response) {
		this.selectedRowId = '';
		this.dataSource = new MatTableDataSource<any>(response.json());
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a tenant to edit'));
		} else {
			this.tenantAdd.editTenant(this.selectedRowId);
		}
	}

	tenantOnSave(n) {
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

	getTenantAddress(row) {
		let addressLine = row.Location.AddressLine1;

		if (row.Location.AddressLine2 !== '') {
			addressLine += ', ' + row.Location.AddressLine2;
		}

		if (row.Location.City !== '') {
			addressLine += ', ' + row.Location.City;
		}

		if (row.Location.State !== '') {
			addressLine += ' ' + row.Location.State;
		}

		if (row.Location.PostalCode !== '') {
			addressLine += ' ' + row.Location.PostalCode;
		}

		return addressLine;
	}

	getFilterAddress(location) {
		if (location.AddressLine2 === '') {
			return location.AddressLine1 + ', ' + location.City + ' ' + location.State + ' ' + location.PostalCode;
		} else {
			return location.AddressLine1 + ', ' + location.AddressLine2 + ', ' + location.City + ' ' + location.State + ' ' + location.PostalCode;
		}
	}

	receiveFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			this.tenantService.getTenants().subscribe(response => {
				let toReturn = response.json();
				Object.keys(filter).forEach(key => {
					if (filter[key] !== '') {
						const dropdown = this.columns.table.filter(obj => obj.name === key)[0].dropdown;
						if (dropdown === true) {
							if (key === 'IsActive') {
								if (filter[key] === 'Active') {
									toReturn = toReturn.filter(row => (row[key] === 1));
								} else {
									toReturn = toReturn.filter(row => (row[key] === 0));
								}
							} else {
								toReturn = toReturn.filter(row => (row[key] === filter[key]));
							}
						} else if (key === 'Address') {
							const key2 = 'Location';
							toReturn = toReturn.filter(row => (row[key2].AddressLine1.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || this.getFilterAddress(row[key2]).toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row[key2].City.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row[key2].State.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row[key2].PostalCode.toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						} else if (key === 'Phone') {
							const key2 = 'PhoneNumber';
							toReturn = toReturn.filter(row => (row[key2].toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
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
				this.selectedRowId = '';
				this.dataSource = new MatTableDataSource<any>(toReturn);
				this.dataSource.paginator = this.tablePaginator;
				this.dataSource.sort = this.sort;
			});
		}
	}
}
