import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { DeviceService } from '../services/device.service';
import { DeviceAddComponent } from '../device-add/device-add.component';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';

@Component({
	selector: 'app-device-maintenance',
	templateUrl: './device-maintenance.component.html',
	styleUrls: ['./device-maintenance.component.css']
})

export class DeviceMaintenanceComponent implements OnInit, AfterViewInit {
	columns = {
		table: [
			{ id: 1, name: 'Code', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'Description', dropdown: false, array: [], model: 'Description', dateTime: false, checked: true },
			{ id: 3, name: 'Manufacturer', dropdown: false, array: [], model: 'Manufacturer', dateTime: false, checked: true },
			{ id: 4, name: 'SecretNumber', dropdown: false, array: [], model: 'Secret', dateTime: false, checked: true },
			{ id: 5, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], dateTime: false, model: 'Active', checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'DEVICE_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	show = false;
	Value = '';

	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('deviceAdd') deviceAdd: DeviceAddComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private utilsService: UtilsService, private deviceService: DeviceService, public translation: TranslationService) {
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
			this.deviceService.getDevices().subscribe(response => {
				this.loadDataComplete(response.json());
			}, error => {
				setTimeout(() => null, 2000);
				this.deviceService.getDevices().subscribe(response => {
					this.loadDataComplete(response.json());
				}, error2 => {
					if (error.status === 401) {
						this.utilsService.showError(`Error: ${error}`);
					} else {
						this.utilsService.showError(`Error getting device data: ${error2.statusText}, error ${error2.status}`);
					}
				});
			});
		}
	}

	loadDataComplete(response) {
		this.selectedRowId = '';
		this.dataSource = new MatTableDataSource<any>(response);
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a device to edit'));
		} else {
			this.deviceAdd.editDevice(this.selectedRowId);
		}
	}

	deviceOnSave() {
		this.filterComponent.save(true);
	}

	tableColumnsOnSave($event) {
		this.columns.table = $event.columns;
		localStorage.setItem(this.columnStorageName, JSON.stringify(this.columns.table));
		this.utilsService.setTableColumns(this.columns);
	}

	receiveFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			this.deviceService.getDevices().subscribe(response => {
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
