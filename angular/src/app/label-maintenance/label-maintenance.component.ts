import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { LabelService } from '../services/label.service';
import { LabelAddComponent } from '../label-add/label-add.component';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { PrintService } from '../services/print.service';

@Component({
	selector: 'app-label-maintenance',
	templateUrl: './label-maintenance.component.html',
	styleUrls: ['./label-maintenance.component.css']
})

export class LabelMaintenanceComponent implements OnInit, AfterViewInit {

	columns = {
		table: [
			{ id: 1, name: 'Code', dropdown: false, array: [], model: 'Code', dateTime: false, checked: true },
			{ id: 2, name: 'Description', dropdown: false, array: [], model: 'Description', dateTime: false, checked: true },
			{ id: 3, name: 'LabId', dropdown: true, array: [], model: 'Lab', dateTime: false, checked: true },
			{ id: 4, name: 'IsActive', dropdown: true, array: ['Active', 'Inactive'], model: 'Active', dateTime: false, checked: true },
		], display: [], filter: []
	};

	columnStorageName = 'LABEL_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';
	broadCastNotify = false;
	isLoading = true;

	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('labelAdd') labelAdd: LabelAddComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(public printService: PrintService, public authService: AuthService, private utilsService: UtilsService, private labelService: LabelService, public translation: TranslationService) {
		this.utilsService.readTableColumns(this.columns, this.columnStorageName);
		this.utilsService.setTableColumns(this.columns);
		this.printService.loadingStatus.subscribe(res => {
			this.isLoading = res;
		});
	}

	ngOnInit() {
		this.authService.setCurrentPage('label');
		const previousButton: HTMLButtonElement = document.querySelector('.mat-paginator-navigation-previous');
		previousButton.title = this.translation.translate('Label.Previous');
		const nextButton: HTMLButtonElement = document.querySelector('.mat-paginator-navigation-next');
		nextButton.title = this.translation.translate('Label.Next');
		const poweredBy = document.querySelector('.poweredBy2');
		poweredBy.innerHTML = document.querySelector('.poweredBy').innerHTML;
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
		this.columns.filter[2].array = uniqueLabs;
	}

	ngAfterViewInit() {
		const screen: HTMLDivElement = document.querySelector('.maintenance-page');
		setTimeout(() => screen.hidden = !screen.hidden, 300);
		// this.loadData();
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

	searchData() {
		if (this.utilsService.checkOnlineStatus()) {
			this.labelService.getLabels().subscribe(response => {
				this.searchDataComplete(response.json());
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error getting label data: ${error.statusText}, error ${error.status}`);
				}
			});
		}
	}

	searchDataComplete(response) {
		this.getUniqueLabs(response);
		this.selectedRowId = '';
		this.dataSource = new MatTableDataSource<any>(response);
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sort = this.sort;
	}

	editClick() {
		if (this.selectedRowId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a label to edit'));
		} else {
			this.labelAdd.editLabel(this.selectedRowId);
		}
	}

	labelOnSave(n) {
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
		if (row.Label.StreetAddress2 === '') {
			return row.Label.StreetAddress1 + ', ' + row.Label.City + ' ' + row.Label.State + ' ' + row.Label.PostalCode;
		} else {
			return row.Label.StreetAddress1 + ', ' + row.Label.StreetAddress2 + ', ' + row.Label.City + ' ' + row.Label.State + ' ' + row.Label.PostalCode;
		}
	}

	getFilterAddress(label) {
		if (label.StreetAddress2 === '') {
			return label.StreetAddress1 + ', ' + label.City + ' ' + label.State + ' ' + label.PostalCode;
		} else {
			return label.StreetAddress1 + ', ' + label.StreetAddress2 + ', ' + label.City + ' ' + label.State + ' ' + label.PostalCode;
		}
	}


	receiveFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			this.labelService.getLabels().subscribe(response => {
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
							} else if (key === 'LabId') {
								if (filter[key] !== 'All') {
									toReturn = toReturn.filter(row => (row['Laboratory'].Id === filter[key]));
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
