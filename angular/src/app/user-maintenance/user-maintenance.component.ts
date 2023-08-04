import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { UserService } from '../services/user.service';
import { UserAddComponent } from '../user-add/user-add.component';
import { PhonePipe } from '../phone.pipe';
import { FilterComponent } from '../filter/filter.component';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';

@Component({
	selector: 'app-user-maintenance',
	templateUrl: './user-maintenance.component.html',
	styleUrls: ['./user-maintenance.component.css']
})

export class UserMaintenanceComponent implements OnInit, AfterViewInit {
	columns = { table: [], display: [], filter: [] };
	columnStorageName = 'USER_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';
	users = [];
	roles = [];

	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('userAdd') userAdd: UserAddComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(public translation: TranslationService, private activeEntitiesService: ActiveEntitiesService, public authService: AuthService, private userService: UserService, public dialog: MatDialog, private phonePipe: PhonePipe, private utilsService: UtilsService) {
		/* this.getRoles(); */
		this.setColumnStorageName();
		this.selectTableColumns();
		this.utilsService.readTableColumns(this.columns, this.columnStorageName);
		this.utilsService.setTableColumns(this.columns);
	}

	ngOnInit() {
		this.authService.setCurrentPage('users');
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

	setColumnStorageName() {
		this.columnStorageName += this.authService.currentUser.role;
	}

	selectTableColumns() {
		if (this.authService.currentUser.role === 'RMP_RSA') {
			this.columns.table = [
				{ id: 1, name: 'Initials', dropdown: false, array: [], model: 'Initials', checked: true, dateTime: false },
				{ id: 2, name: 'FirstName', dropdown: false, array: [], model: 'First name', checked: true, dateTime: false },
				{ id: 3, name: 'LastName', dropdown: false, array: [], model: 'Last name', checked: true, dateTime: false },
				{ id: 4, name: 'Phone', dropdown: false, array: [], model: 'Phone', checked: true, dateTime: false },
				{ id: 5, name: 'Email', dropdown: false, array: [], model: 'Email', checked: true, dateTime: false },
				{ id: 6, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], model: 'Active', checked: true, dateTime: false }
			];
		} else if (this.authService.currentUser.role === 'RMP_TSA') {
			this.columns.table = [
				{ id: 1, name: 'Initials', dropdown: false, array: [], model: 'Initials', checked: true, dateTime: false },
				{ id: 2, name: 'Code', dropdown: false, array: [], model: 'Code', checked: true, dateTime: false },
				{ id: 3, name: 'FirstName', dropdown: false, array: [], model: 'First name', checked: true, dateTime: false },
				{ id: 4, name: 'LastName', dropdown: false, array: [], model: 'Last name', checked: true, dateTime: false },
				{ id: 5, name: 'Phone', dropdown: false, array: [], model: 'Phone', checked: true, dateTime: false },
				{ id: 6, name: 'Email', dropdown: false, array: [], model: 'Email', checked: true, dateTime: false },
				{ id: 7, name: 'Role', dropdown: true, array: this.roles, model: 'Role', checked: true, dateTime: false },
				{ id: 8, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], model: 'Active', checked: true, dateTime: false }
			];
		}
	}

	getRoles() {
		if (this.utilsService.checkOnlineStatus()) {
			if (this.authService.currentUser.role.indexOf('TSA') > -1) {
				this.activeEntitiesService.getActiveRoles().subscribe(response => {
					const allRoles = response.json();
					allRoles.forEach(role => {
						this.roles.push(role.Name);
					});
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

	getUniqueRoles() {
		if (this.utilsService.checkOnlineStatus()) {
			if (this.authService.currentUser.role === 'RMP_TSA') {
				const uniqueRoles = this.userService.getUniqueRoles();
				if (this.columns.filter[6]) {
					this.columns.filter[6].array = uniqueRoles;
				} else {
					this.roles = uniqueRoles;
				}
			}
		}
	}

	blur(phone) {
		return this.phonePipe.transform(phone);
	}

	paginatorChange(evt) {
		if (evt.previousPageIndex !== evt.pageIndex) {
			this.selectedRowId = '';
		}
	}

	loadData() {
		if (this.utilsService.checkOnlineStatus()) {
			this.userService.getUsers();
			this.userService.users.subscribe(response => {
				this.users = response as any[];
				console.log('users from maintenance: ', this.users);
				this.loadDataComplete();
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`${this.translation.translate('Error.Error getting data')} ${error.statusText}, ${this.translation.translate('Label.error')} ${error.status}`);
				}
			});
		}
	}

	loadDataComplete() {
		this.selectedRowId = '';
		this.getUniqueRoles();
		this.dataSource = new MatTableDataSource<any>(this.users);
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a user to edit'));
		} else {
			this.userAdd.editUser(this.selectedRowId);
		}
	}

	userOnSave(n) {
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
		if (row.Location.StreetAddress2 === '') {
			return row.Location.StreetAddress1 + ', ' + row.Location.City + ' ' + row.Location.State + ' ' + row.Location.PostalCode;
		} else {
			return row.Location.StreetAddress1 + ', ' + row.Location.StreetAddress2 + ', ' + row.Location.City + ' ' + row.Location.State + ' ' + row.Location.PostalCode;
		}
	}

	receiveFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			this.users = this.userService.filterUsers(filter, this.columns.table);
			this.loadDataComplete();
			this.selectedRowId = '';
			this.utilsService.fixPagination(this.dataSource);
		}
	}
}
