import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { TestService } from '../services/test.service';
import { TestAddComponent } from '../test-add/test-add.component';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { NotificationService } from '../services/notification.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-test-maintenance',
	templateUrl: './test-maintenance.component.html',
	styleUrls: ['./test-maintenance.component.css']
})

export class TestMaintenanceComponent implements OnInit, AfterViewInit, OnDestroy {
	columns = {
		table: [
			{ id: 1, name: 'Code', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'Description', dropdown: false, array: [], model: 'Description', dateTime: false, checked: true },
			{ id: 3, name: 'HandlingInstructions', dropdown: false, array: [], model: 'Handling instructions', dateTime: false, checked: true },
			{ id: 4, name: 'Lab', dropdown: true, array: [], model: 'Lab', dateTime: false, checked: true },
			{ id: 5, name: 'LabDepartment', dropdown: false, array: [], model: 'Lab department', dateTime: false, checked: true },
			{ id: 6, name: 'DefaultContainer', dropdown: true, array: [], model: 'Default container', dateTime: false, checked: true },
			{ id: 7, name: 'Volume', dropdown: false, array: [], model: 'Volume', dateTime: false, checked: true },
			{ id: 8, name: 'Destination', dropdown: false, array: [], model: 'Destination', dateTime: false, checked: true },
			{ id: 9, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], model: 'Active', dateTime: false, checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'TEST_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';

	transferSubscription: any;

	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('testAdd') testAdd: TestAddComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private testService: TestService, public utilsService: UtilsService, private notificationService: NotificationService, public translation: TranslationService) {
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
				setTimeout(() => this.testAdd.editTest(response.EntityId), 1000);
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
			this.testService.getTests().subscribe(response => {
				this.loadDataComplete(response);
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error getting test data: ${error.statusText}, error ${error.status}`);
				}
			});
		}
	}

	loadDataComplete(response) {
		console.log('all tests: ', response.json());
		this.selectedRowId = '';
		this.getUniqueLabs(response.json());
		this.getUniqueContainers(response.json());
		this.dataSource = new MatTableDataSource<any>(response.json());
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
		this.autoTransfer();
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a test to edit'));
		} else {
			this.testAdd.editTest(this.selectedRowId);
		}
	}

	testOnSave(n) {
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

	getUniqueLabs(obj) {
		const uniqueLabs = [];
		obj.map(lab => lab.Lab).forEach(lab => {
			if (lab !== '') {
				if (uniqueLabs.indexOf(lab) === -1) {
					uniqueLabs.push(lab);
				}
			}
		});
		uniqueLabs.sort().splice(0, 0, 'All');
		this.columns.filter[3].array = uniqueLabs;
	}

	getUniqueContainers(obj) {
		const uniqueContainers = [];
		obj.map(test => test.DefaultContainer).forEach(container => {
			if (container !== '') {
				if (uniqueContainers.indexOf(container) === -1) {
					uniqueContainers.push(container);
				}
			}
		});
		uniqueContainers.sort().splice(0, 0, 'All');
		this.columns.filter[5].array = uniqueContainers;
	}

	receiveFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			this.testService.getTests().subscribe(response => {
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
								if (filter[key] !== 'All') {
									toReturn = toReturn.filter(row => (row[key] === filter[key]));
								}
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
				this.getUniqueLabs(response.json());
				this.getUniqueContainers(response.json());
				this.dataSource = new MatTableDataSource<any>(toReturn);
				this.dataSource.paginator = this.tablePaginator;
				this.utilsService.fixPagination(this.dataSource);
				this.dataSource.sort = this.sort;
			});
		}
	}
}

