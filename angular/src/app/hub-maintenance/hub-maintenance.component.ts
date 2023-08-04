import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { HubService } from '../services/hub.service';
import { HubAddComponent } from '../hub-add/hub-add.component';
import { UserChipComponent } from '../user-chip/user-chip.component';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-hub-maintenance',
	templateUrl: './hub-maintenance.component.html',
	styleUrls: ['./hub-maintenance.component.css', './../../chips.scss']
})

export class HubMaintenanceComponent implements OnInit, AfterViewInit {

	columns = {
		table: [
			{ id: 1, name: 'Name', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'Description', dropdown: false, array: [], model: 'Description', dateTime: false, checked: true },
			{ id: 3, name: 'Address', dropdown: false, array: [], model: 'Address', dateTime: false, checked: true },
			{ id: 4, name: 'Users', dropdown: true, array: [], model: 'Users', dateTime: false, checked: true },
			{ id: 5, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], model: 'Active', dateTime: false, checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'HUB_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';

	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('hubAdd') hubAdd: HubAddComponent;
	@ViewChild('hubChip') hubChip: UserChipComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private hubService: HubService, public changePasswordDialog: MatDialog, public utilsService: UtilsService, public translation: TranslationService) {
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

	getUniqueUsers(obj) {
		const uniqueUsers = [];
		obj.map(role => role.Users).forEach(array => {
			if (array.length) { array.forEach(user => { if (uniqueUsers.indexOf(user.Username) === -1) { uniqueUsers.push(user.Username); } }); }
		});
		uniqueUsers.sort().splice(0, 0, 'All');
		this.columns.table.find(col => col.name === 'Users').array = uniqueUsers;
		this.utilsService.setTableColumns(this.columns);
	}

	makeAddress(address: any): string {
		console.log('address: ', address);
		if (address.StreetAddress1 !== '') {
			if (address.StreetAddress2 !== '') {
				return (address.StreetAddress1 + ', ' + address.StreetAddress2 + ', ' + address.City + ' ' + address.State + ' ' + address.PostalCode);
			} else {
				return (address.StreetAddress1 + ', ' + address.City + ' ' + address.State + ' ' + address.PostalCode);
			}
		}
	}

	chipSave(newRow) {
		this.hubService.updateHub(newRow.Id, JSON.stringify(newRow)).subscribe(response => { console.log(response); });
	}

	paginatorChange(evt) {
		if (evt.previousPageIndex !== evt.pageIndex) {
			this.selectedRowId = '';
		}
	}

	loadData() {
		if (this.utilsService.checkOnlineStatus()) {
			this.hubService.getHubs().subscribe(response => {
				const hubs = response.json();
				console.log('hubs from loadData: ', hubs);
				this.getUniqueUsers(hubs);
				this.loadDataComplete(hubs);
			}, error => {
				if (error.status === 401) {
					this.utilsService.showError(`Error: ${error.status}`);
				} else {
					this.utilsService.showError(`Error getting hub data: ${error.statusText}, error ${error.status}`);
				}
			});
		}
	}

	loadDataComplete(hubs) {
		this.selectedRowId = '';
		hubs.forEach(hub => {
			hub.Address = this.makeAddress(hub);
		});
		console.log('all hubs: ', hubs);
		this.dataSource = new MatTableDataSource<any>(hubs);
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a hub to edit'));
		} else {
			this.hubAdd.editHub(this.selectedRowId);
		}
	}

	hubOnSave(n) {
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

	getFilterAddress(location) {
		if (location.StreetAddress2 === '') {
			return location.StreetAddress1 + ', ' + location.City + ' ' + location.State + ' ' + location.PostalCode;
		} else {
			return location.StreetAddress1 + ', ' + location.StreetAddress2 + ', ' + location.City + ' ' + location.State + ' ' + location.PostalCode;
		}
	}

	receiveFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			this.hubService.getHubs().subscribe(response => {
				const hubs = response.json();
				this.getUniqueUsers(hubs);
				let toReturn = hubs;
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
							} else if (key === 'Users') {
								const returnThis = [];
								if (filter[key] === 'All') {
									toReturn = toReturn.filter(row => row.Users.length);
								} else {
									toReturn.filter(row => row.Users.length).forEach(row => {
										if (row.Users.find(user => user.Username === filter[key])) {
											returnThis.push(row);
										}
									});
									toReturn = returnThis;
								}
								/* toReturn = toReturn.filter(row => (row[key].length > 0 ? row[key].forEach(element => { const fullName = element.FirstName + ' ' + element.LastName; if (element.FirstName.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || element.LastName.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || element.Email.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || element.Username.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || fullName.toLowerCase().indexOf(filter[key].toLowerCase()) > -1) { returnThis.push(row); } }) : '')); */
							} else {
								toReturn = toReturn.filter(row => (row[key] === filter[key]));
							}
						} else if (key === 'Address') {
							const key2 = 'Location';
							toReturn = toReturn.filter(row => (row.StreetAddress1.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || this.getFilterAddress(row).toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row.City.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row.State.toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row.PostalCode.toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
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
