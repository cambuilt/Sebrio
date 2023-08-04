import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FilterComponent } from '../filter/filter.component';
import { UtilsService } from '../services/utils.service';
import { MatDialog, MatTableDataSource, MatSort, MatPaginator, MatSortable } from '@angular/material';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { UserService } from '../services/user.service';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { MessagingService } from '../services/messaging.service';
import { AuthService } from '../services/auth.service';

@Component({
	selector: 'app-user-mode',
	templateUrl: './user-mode.component.html',
	styleUrls: ['./user-mode.component.css']
})
export class UserModeComponent implements OnInit, AfterViewInit {
	columns = {
		table: [
			{ id: 1, name: 'User', dropdown: true, array: [], model: 'User', dateTime: false, checked: true },
			{ id: 2, name: 'Device', dropdown: false, array: [], model: 'Device', dateTime: false, checked: true },
			{ id: 3, name: 'Status', dropdown: true, array: ['Online', 'Offline'], model: 'Status', dateTime: false, checked: true },
		], display: [], filter: []
	};

	columnStorageName = 'USER_MODE';
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;
	selectedRowId: string;
	dataSource = new MatTableDataSource<any>([]);
	ioConnection: any;

	constructor(private authService: AuthService, private messagingService: MessagingService, public translation: TranslationService, private userService: UserService, private utilsService: UtilsService, private errorAlert: MatDialog, public dialog: MatDialog) {
		this.utilsService.readTableColumns(this.columns, this.columnStorageName);
		this.utilsService.setTableColumns(this.columns);
	}

	ngOnInit() {
		const poweredBy = document.querySelector('.poweredBy2');
		poweredBy.innerHTML = document.querySelector('.poweredBy').innerHTML;
	}

	ngAfterViewInit() {
		const screen: HTMLDivElement = document.querySelector('.maintenance-page');
		setTimeout(() => screen.hidden = !screen.hidden, 300);
		setTimeout(() => this.checkSocket(), 300);
	}

	checkSocket() {
		if (this.messagingService.socketConnected === true) {
			console.log('socket connection is: ', this.messagingService.socketConnected);
			this.loadData();
		} else {
			console.log('socket connection is: ', this.messagingService.mysocket, ' trying to checkSocket again');
			setTimeout(() => this.checkSocket(), 300);
		}
	}

	notifyBroadcast(message) {
		if (message && message.IsBroadcast === true) {
			this.notificationMessage.show(message);
		}
	}

	getUniqueUsers(obj) {
		if (this.utilsService.checkOnlineStatus()) {
			const uniqueUsers = [];
			obj.map(user => user.User).forEach(user => {
				if (uniqueUsers.indexOf(user) === -1) { uniqueUsers.push(user); }
			});
			uniqueUsers.sort().splice(0, 0, 'All');
			this.columns.table.find(col => col.name === 'User').array = uniqueUsers;
			this.utilsService.setTableColumns(this.columns);
		}
	}

	loadData() {
		if (this.utilsService.checkOnlineStatus()) {
			this.userService.getUserModes().subscribe(response => {
				this.getUniqueUsers(response.json());
				this.loadDataComplete(response.json());
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`${this.translation.translate('Error.Error getting data')} ${error.statusText}, ${this.translation.translate('Label.error')} ${error.status}`);
				}
			});
		}
	}

	getUpdate() {
		console.log('should be getting update');
		if (this.authService._connectionStatus === true) {
			this.userService.getUserModes().subscribe(response => {
				const newData = response.json();
				newData.forEach(user => {
					this.dataSource.data.forEach(row => {
						if (row['User'] === user.User) {
							row['Status'] = user.Status;
							row['Device'] = user.Device;
						}
					});
				});
				setTimeout(() => this.dataSource.sort = this.sort, 500);
				console.log('dataSource: ', this.dataSource);
			}, error => {
				this.utilsService.showError(`${this.translation.translate('Error.Error getting data')} ${error.statusText}, ${this.translation.translate('Label.error')} ${error.status}`);
			});
		}
	}

	loadDataComplete(response) {
		this.selectedRowId = '';
		this.dataSource = new MatTableDataSource<any>(response);
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.sort.sort(<MatSortable>({ id: 'Status', start: 'desc' }));
		this.dataSource.sort = this.sort;
	}

	tableColumnsOnSave($event) {
		this.columns.table = $event.columns;
		localStorage.setItem(this.columnStorageName, JSON.stringify(this.columns.table));
		this.utilsService.setTableColumns(this.columns);
	}

	receiveFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			this.userService.getUserModes().subscribe(response => {
				let toReturn = response.json();
				this.getUniqueUsers(response.json());
				Object.keys(filter).forEach(key => {
					if (filter[key] !== '') {
						const dropdown = this.columns.table.filter(obj => obj.name === key)[0].dropdown;
						if (dropdown === true) {
							if (key === 'Status') {
								if (filter[key] === 'Offline') {
									toReturn = toReturn.filter(row => (row[key] === 'N/A' ? 'N/A' === 'N/A' : row[key] === filter[key]));
								} else {
									toReturn = toReturn.filter(row => (row[key] === filter[key]));
								}
							} else if (key === 'User') {
								if (filter[key] !== 'All') {
									toReturn = toReturn.filter(row => (row[key] === filter[key]));
								}
							} else {
								toReturn = toReturn.filter(row => (row[key] === filter[key]));
							}
						} else {
							toReturn = toReturn.filter(row => (row[key].toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						}
					}
				}, error => { this.utilsService.handle401(error); });
				this.selectedRowId = '';
				this.dataSource = new MatTableDataSource<any>(toReturn);
				this.dataSource.paginator = this.tablePaginator;
				this.utilsService.fixPagination(this.dataSource);
				this.dataSource.sort = this.sort;
			});
		}
	}
}
