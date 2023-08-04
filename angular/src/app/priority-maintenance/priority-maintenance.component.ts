import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { PriorityService } from '../services/priority.service';
import { PriorityAddComponent } from '../priority-add/priority-add.component';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { NotificationService } from '../services/notification.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-priority-maintenance',
	templateUrl: './priority-maintenance.component.html',
	styleUrls: ['./priority-maintenance.component.css']
})

export class PriorityMaintenanceComponent implements OnInit, AfterViewInit, OnDestroy {
	columns = {
		table: [
			{ id: 1, name: 'Code', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'Description', dropdown: false, array: [], model: 'Description', dateTime: false, checked: true },
			{ id: 3, name: 'Priority', dropdown: true, array: ['Stat', 'Routine', 'Fasting', 'ASAP', 'Future'], model: 'Priority', dateTime: false, checked: true },
			{ id: 4, name: 'Laboratory', dropdown: true, array: [], model: 'Lab', dateTime: false, checked: true },
			{ id: 5, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], model: 'Active', dateTime: false, checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'PRIORITY_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';

	transferSubscription: any;

	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('priorityAdd') priorityAdd: PriorityAddComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private priorityService: PriorityService, public utilsService: UtilsService, private notificationService: NotificationService, public translation: TranslationService) {
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
				setTimeout(() => this.priorityAdd.editPriority(response.EntityId), 1000);
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
			this.priorityService.getPriorities().subscribe(response => {
				this.loadDataComplete(response);
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error getting priority data: ${error.statusText}, error ${error.status}`);
				}
			});
		}
	}

	loadDataComplete(response) {
		console.log('all priorities: ', response.json());
		this.selectedRowId = '';
		this.getUniqueLabs(response.json());
		this.dataSource = new MatTableDataSource<any>(response.json());
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
		this.autoTransfer();
	}

	getUniqueLabs(obj) {
		const uniqueLabs = [];
		obj.map(lab => lab.Laboratory.Code).forEach(lab => {
			if (lab !== '' && lab !== undefined) {
				if (uniqueLabs.indexOf(lab) === -1) {
					uniqueLabs.push(lab);
				}
			}
		});
		uniqueLabs.sort().splice(0, 0, 'All');
		this.columns.filter[3].array = uniqueLabs;
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a priority to edit'));
		} else {
			this.priorityAdd.editPriority(this.selectedRowId);
		}
	}

	priorityOnSave(n) {
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
			this.priorityService.getPriorities().subscribe(response => {
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
				}, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
				this.selectedRowId = '';
				this.getUniqueLabs(toReturn);
				this.dataSource = new MatTableDataSource<any>(toReturn);
				this.dataSource.paginator = this.tablePaginator;
				this.utilsService.fixPagination(this.dataSource);
				this.dataSource.sort = this.sort;
			});
		}
	}
}
