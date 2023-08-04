import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { MessagingService } from '../services/messaging.service';
import { RoleService } from '../services/role.service';
import { RoleAddComponent } from '../role-add/role-add.component';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { FinancialResponsibilityFormComponent } from '../financial-responsibility-form/financial-responsibility-form.component';
export class User {
	constructor(public name: string, public avatar: string) { }
}

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-role-maintenance',
	templateUrl: './role-maintenance.component.html',
	styleUrls: ['./role-maintenance.component.css', './../../chips.scss'],
})

export class RoleMaintenanceComponent implements OnInit, AfterViewInit {

	rolesForFilter = [];
	columns = {
		table: [
			{ id: 1, name: 'Name', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'Description', dropdown: false, array: [], model: 'Description', dateTime: false, checked: true },
			{ id: 4, name: 'Users', dropdown: true, array: [], model: 'Users', dateTime: false, checked: true },
			{ id: 5, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], dateTime: false, model: 'Active', checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'ROLE_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';

	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('roleAdd') roleAdd: RoleAddComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private dialog: MatDialog, private roleService: RoleService, private utilsService: UtilsService, public authService: AuthService, public translation: TranslationService, private messagingService: MessagingService) {
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

	showForm() {
		const newDialog = this.dialog.open(FinancialResponsibilityFormComponent, {
			data: '',
			height: '500px',
			width: '800px'
		});
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
		if (this.utilsService.checkOnlineStatus()) {
			const uniqueUsers = [];
			obj.map(role => role.Users).forEach(array => {
				if (array.length) { array.forEach(user => { if (uniqueUsers.indexOf(user.Username) === -1) { uniqueUsers.push(user.Username); } }); }
			});
			uniqueUsers.sort().splice(0, 0, 'All');
			console.log('unique users: ', uniqueUsers);
			this.columns.table.find(col => col.name === 'Users').array = uniqueUsers;
			this.utilsService.setTableColumns(this.columns);
		}
	}

	paginatorChange(evt) {
		if (evt.previousPageIndex !== evt.pageIndex) {
			this.selectedRowId = '';
		}
	}

	loadData() {
		if (this.utilsService.checkOnlineStatus()) {
			this.roleService.getRoles().subscribe(response => {
				const roles = response.json();
				console.log('response for all roles: ', response.json());
				this.getUniqueUsers(roles);
				this.loadDataComplete(roles);
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error getting role data: ${error.statusText}, error ${error.status}`);
				}
			});
		}
	}

	loadDataComplete(roles) {
		this.selectedRowId = '';
		roles.forEach(role => {
			if (role.Users) {
				this.sortByLastName(role.Users);
			}
		});
		this.dataSource = new MatTableDataSource<any>(roles);
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
	}

	sortByLastName(array) {
		if (array.length > 0) {
			array.sort((m, n) => {
				const a = m.LastName.toLowerCase();
				const b = n.LastName.toLowerCase();
				if (a < b) { return -1; }
				if (a > b) { return 1; }
				const c = m.FirstName.toLowerCase();
				const d = n.FirstName.toLowerCase();
				if (c < d) { return -1; }
				if (c > d) { return 1; }
				return 0;
			});
		}
	}

	clearAvatar() {
		const updateBody = { 'AvatarURL': '', 'LandingPage': this.authService.currentUser.landingPage };
		this.authService.updateProfile(JSON.stringify(updateBody)).subscribe((updateReponse) => {
			this.authService.currentUser.avatarURL = '';
		}, (error) => {
			console.log('error: ', error);
		});
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a role to edit'));
		} else {
			this.roleAdd.editRole(this.selectedRowId);
		}
	}

	roleOnSave(n) {
		if (n === true) {
			this.filterComponent.resetForm(false);
		} else {
			this.filterComponent.save(true);
		}
	}

	chipSave(newRow) {
		this.roleService.getRole(newRow.Id).subscribe(response => {
			const roleDetail = response.json();
			const roleUpdate = {
				Name: roleDetail.Name,
				Description: roleDetail.Description,
				IsActive: roleDetail.IsActive,
				Is2FAEnabled: roleDetail.Is2FAEnabled,
				Users: newRow.Users,
				Permissions: roleDetail.Permissions
			};
			this.roleService.updateRole(this.selectedRowId, JSON.stringify(roleUpdate)).subscribe(responseUpdate => {
				this.loadData();
			}, error => {
				this.utilsService.showError(`Error updating user data for role: ${error.statusText}, error ${error.status}`);
			});
		}, error => {
			this.utilsService.showError(`Error getting role detail: ${error.statusText}, error ${error.status}`);
		});
	}

	tableColumnsOnSave($event) {
		this.columns.table = $event.columns;
		localStorage.setItem(this.columnStorageName, JSON.stringify(this.columns.table));
		this.utilsService.setTableColumns(this.columns);
	}

	receiveFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			this.roleService.getRoles().subscribe(response => {
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
							} else {
								toReturn = toReturn.filter(row => (row[key] === filter[key]));
							}
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
