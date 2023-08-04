import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { WorkloadService } from '../services/workload.service';
import { WorkloadAddComponent } from '../workload-add/workload-add.component';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';

@Component({
	selector: 'app-workload',
	templateUrl: './workload.component.html',
	styleUrls: ['./workload.component.css']
})
export class WorkloadComponent implements OnInit, AfterViewInit {
	columns = {
		table: [
			{ id: 1, name: 'Code', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'Description', dropdown: false, array: [], model: 'Description', dateTime: false, checked: true },
			{ id: 3, name: 'LaboratoryId', dropdown: true, array: [], model: 'Lab', dateTime: false, checked: true },
			{ id: 4, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], dateTime: false, model: 'Active', checked: true }
		], display: [], filter: []
	};

	columnStorageName = 'WORKLOAD_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';
	Code: any;

	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('workloadAdd') workloadAdd: WorkloadAddComponent;
	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(public translation: TranslationService, private workloadService: WorkloadService, public utilsService: UtilsService) {
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
			this.workloadService.getWorkloads().subscribe(response => {
				this.loadDataComplete(response);
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error getting workload data: ${error.statusText}, error ${error.status}`);
				}
			});
		}
	}

	loadDataComplete(response) {
		this.selectedRowId = '';
		console.log('all workloads: ', response.json());
		this.getUniqueLabs(response.json());
		this.dataSource = new MatTableDataSource<any>(response.json());
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
	}

	getUniqueLabs(obj) {
		const uniqueLabs = [];
		obj.map(lab => lab.LaboratoryId).forEach(lab => {
			if (lab !== '') {
				if (uniqueLabs.indexOf(lab) === -1) {
					uniqueLabs.push(lab);
				}
			}
		});
		uniqueLabs.sort().splice(0, 0, 'All');
		this.columns.filter[2].array = uniqueLabs;
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a workload to edit'));
		} else {
			this.workloadAdd.editWorkload(this.selectedRowId);
		}
	}

	workloadOnSave(n) {
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
			this.workloadService.getWorkloads().subscribe(response => {
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
							} else if (key === 'LaboratoryId') {
								if (filter[key] !== 'All') {
									toReturn = toReturn.filter(row => (row['LaboratoryId'] === filter[key]));
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
