import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { FilterComponent } from '../filter/filter.component';
import { TranslationService } from 'angular-l10n';
import { NotificationMessageComponent } from '../notification-message/notification-message.component';
import { CollectionListService } from '../services/collection-list.service';
import { WorkListService } from '../services/work-list.service';
import { AuthService } from '../services/auth.service';
import * as moment from 'moment';
import { CollectionTransferDrawerComponent } from '../collection-transfer-drawer/collection-transfer-drawer.component';
import { CollectionDurationService } from '../services/collection-duration.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-collection-maintenance',
	templateUrl: './collection-maintenance.component.html',
	styleUrls: ['./collection-maintenance.component.css']
})

export class CollectionMaintenanceComponent implements OnInit, AfterViewInit {
	columns = {
		table: [
			{ id: 1, name: 'TsuRequest', dropdown: false, array: [], model: 'TsuRequest', dateTime: false, checked: true },
			{ id: 2, name: 'Name', dropdown: false, array: [], model: 'Name', dateTime: false, checked: true },
			{ id: 3, name: 'DOB', dropdown: false, array: [], model: 'Date of Birth', dateTime: false, checked: true },
			{ id: 4, name: 'Gender', dropdown: true, array: ['Male', 'Female'], dateTime: false, model: 'Gender', checked: true },
			{ id: 5, name: 'MRN', dropdown: false, array: [], dateTime: false, model: 'MRN', checked: true },
			{ id: 6, name: 'Location', dropdown: false, array: [], dateTime: false, model: 'Location', checked: true },
			{ id: 7, name: 'Priority', dropdown: false, array: [], dateTime: false, model: 'Priority', checked: true },
			{ id: 8, name: 'Time', dropdown: true, array: [], dateTime: false, model: 'Collection List', checked: true },
			{ id: 9, name: 'Bed', dropdown: true, array: [], dateTime: false, model: 'Hub', checked: true },
			{ id: 10, name: 'ProblemList', dropdown: false, array: [], dateTime: false, model: 'Problem List', checked: true },
			{ id: 11, name: 'Reserved', dropdown: true, array: ['Complete', 'Available', 'Reserved', 'Locked'], dateTime: false, model: 'Reserved', checked: true },
		], display: [], filter: []
	};

	columnStorageName = 'COLLECTION_MAINTENANCE';
	dataSource = new MatTableDataSource<any>([]);
	selectedRowId = '';
	showFilter = false;
	filterValue = '';
	Code: any;
	controlData: any;

	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('transferDrawer') transferDrawer: CollectionTransferDrawerComponent;
	@ViewChild('filterComponent') filterComponent: FilterComponent;
	@ViewChild('notificationMessage') notificationMessage: NotificationMessageComponent;
	@ViewChild(MatSort) sort: MatSort;

	constructor(private authService: AuthService, private collectionListService: CollectionListService, private collectionService: CollectionDurationService, private workListService: WorkListService, public utilsService: UtilsService, public translation: TranslationService) {
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
		this.load();
	}

	notifyBroadcast(message) {
		if (message && message.IsBroadcast === true) {
			this.notificationMessage.show(message);
		}
	}

	getRandomProblem() {
		const problems = ['', 'Patient uncooperative', '', `He wasn't there at the time`, '', `Earl stole my taco`, `Patient was unconscious`, ''];
		const i = Math.floor(Math.random() * 7);
		return problems[i];
	}

	getRandomTime() {
		const a = Math.floor(Math.random() * 300) + 1;
		const b = Math.floor(Math.random() * 2) + 1;
		const time = moment().subtract(a, 'minutes').format('HH:mm');
		const time2 = moment().add(a, 'minutes').format('HH:mm');
		if (b === 1) {
			return time;
		} else {
			return time2;
		}
	}

	calcAge(dateString) {
		const birthday = +new Date(dateString);
		// tslint:disable-next-line:no-bitwise
		return ~~((Date.now() - birthday) / (31557600000));
	}

	randomlyRequest() {
		const a = Math.floor(Math.random() * 9) + 1;
		let wasRequested = false;
		if (a === 3 || a === 6 || a === 9) {
			wasRequested = true;
		}
		return wasRequested;
	}

	paginatorChange(evt) {
		if (evt.previousPageIndex !== evt.pageIndex) {
			this.selectedRowId = '';
		}
	}

	makeFilter(collectionListId) {
		const filter = {
			DateFrom: moment().startOf('day'),
			DateTo: moment().endOf('day'),
			CollectionList: {
				Id: collectionListId
			},
			Hub: {
				Id: ''
			},
			AgeMax: 100,
			AgeMin: 0,
			CollectionLocation: {
				Id: ''
			},
			Patient: {
				Gender: ''
			},
			Priority: {
				Id: ''
			},
			ProblemList: '',
			Status: ''
		};
	}

	openTransferDrawer(dataSource, selectedRowId) {
		this.transferDrawer.openCollection(dataSource, selectedRowId);
	}

	load() {
		if (this.utilsService.checkOnlineStatus()) {
			this.collectionService.getCollectionsForTenant().subscribe(response => {
				let tempCollections = response.json();
				this.processCollections(tempCollections);
				this.hideOtherDays(tempCollections);
				this.loadDataComplete(tempCollections);
			});
		}
	}

	processCollections(collections) {
		console.log(collections);
		collections.forEach(collection => {
			this.interpretProblem(collection);
			this.makeAge(collection);
			this.makeTableTimeAndPriority(collection);
		});
	}

	interpretProblem(collection) {
		collection.IsProblem = collection.OrderedTests.filter(test => test.IsProblem).length ? true : false;
	}

	makeAge(collection) {
		collection.Patient.Age = this.calcAge(collection.Patient.DateOfBirth);
	}

	makeTableTimeAndPriority(collection) {
		let tablePriority;
		let tableTime;
		collection.OrderedTests.forEach(test => {
			let mom;
			if (test.RescheduleDateTime) {
				mom = moment.utc(test.RescheduleDateTime, 'YYYY-MM-DD HH:mm:ss').local();
			} else {
				mom = moment.utc(test.DateTimeObserved, 'YYYY-MM-DD HH:mm:ss').local();
			}
			test.ScheduledDate = mom.format('MM/DD/YY');
			test.ScheduledTime = mom.format('HH:mm');
			test.DateObserved = mom.format('MM-DD-YY');
			if (tablePriority === undefined || tableTime === undefined) {
				tableTime = mom;
				tablePriority = test.Priority;
			} else if (!test.IsDisabled && ((tablePriority.ShowColor === false && test.Priority.ShowColor === true) || (mom.isBefore(tableTime)))) {
				tableTime = mom;
				tablePriority = test.Priority;
			}
		});
		if (tableTime !== undefined) {
			collection.ScheduledTime = tableTime.format('HH:mm');
		} else {
			collection.ScheduledTime = '';
		}
		if (tablePriority !== undefined) {
			collection.Priority = tablePriority;
		} else {
			collection.Priority = { Description: '', ShowColor: false };
		}
	}

	hideOtherDays(collections) {
		const removeIds = [];

	}

	loadData() {
		if (this.utilsService.checkOnlineStatus()) {
			// tslint:disable-next-line:prefer-const
			let allData = [];
			let listsToProcess;
			// tslint:disable-next-line:prefer-const
			let hubs = [];
			// tslint:disable-next-line:prefer-const
			let collectionLists = [];
			// need to get all collection lists
			this.collectionListService.getCollectionLists().subscribe(res => {
				const lists = res.json();
				listsToProcess = lists.length;
				lists.forEach(list => {
					// build filter object for each list
					this.collectionListService.getCollectionList(list.Id).subscribe(res2 => {
						let collectionListPriorities = [];
						this.workListService.getPrioritiesForCollectionList(list.Id).subscribe(priorityRes => {
							collectionListPriorities = priorityRes.json();
						});
						if (hubs.indexOf(res2.json().Hub.Id) < 0) {
							hubs.push(res2.json().Hub.Id);
						}
						const formattedFilter = {
							DateFrom: '2018-10-11T04:00:00.000Z',
							DateTo: '2018-12-11T05:00:00.000Z',
							CollectionList: {
								Id: list.Id
							},
							Hub: {
								Id: res2.json().Hub.Id
							},
							AgeMax: 100,
							AgeMin: 0,
							CollectionLocation: {
								Id: ''
							},
							Patient: {
								Gender: ''
							},
							Priority: {
								Id: ''
							},
							ProblemList: '',
							Status: ''
						};
						this.workListService.getCollections(formattedFilter).subscribe(response => {
							response.json().forEach(item => {
								if (response.json().length > 0 && collectionLists.indexOf(list.Id) < 0) {
									collectionLists.push(list.Id);
								}
								item.ProblemList = this.getRandomProblem();
								item.ScheduledDateTime = this.getRandomTime();
								// item.ScheduledDateTime = moment(item.ScheduledDateTime).format('HH:mm');
								const selectedPriority = collectionListPriorities.find(prio => prio.Id === item.Priority.Description);
								if (selectedPriority !== undefined) {
									item.Priority.ShowColor = selectedPriority.ShowColor;
								} else {
									item.Priority.ShowColor = false;
								}
								item.Patient.Age = this.calcAge(item.Patient.DateOfBirth);
								item.CollectionList = list.Id;
								item.HubId = res2.json().Hub.Id;
								if (item.Status === 'Reserved' || item.Status === 'Locked') {
									item.TsuRequest = this.randomlyRequest();
								} else {
									item.TsuRequest = '';
								}
								allData.push(item);
							});
							listsToProcess--;
							if (listsToProcess === 0) {
								this.loadDataComplete(allData);
								this.controlData = allData;
								console.log('allData: ', allData);
								this.columns.filter[7].array = collectionLists;
								this.columns.filter[8].array = hubs;
							}
						}, error => { this.utilsService.handle401(error); });
					});
				});
			}, error => { this.utilsService.handle401(error); });
		}
	}


	loadDataComplete(response) {
		this.selectedRowId = '';
		this.dataSource = new MatTableDataSource<any>(response);
		this.dataSource.paginator = this.tablePaginator;
		this.utilsService.fixPagination(this.dataSource);
		this.dataSource.sortingDataAccessor = (item, property) => {
			switch (property) {
				case 'Name': return item.Patient.LastName;
				case 'DOB': return item.Patient.DateOfBirth;
				case 'Gender': return item.Patient.Gender;
				case 'MRN': return item.Patient.MRN;
				case 'Location': return item.CollectedLocation.Code;
				case 'Priority': return item.Priority.Description;
				case 'Time': return item.ScheduledDateTime;
				case 'Bed': return item.Bed;
				case 'ProblemList': return item.ProblemList;
				case 'Reserved': return item.Status;
				default: return item[property];
			}
		};
		this.dataSource.sort = this.sort;
	}

	editClick() {
		if (this.selectedRowId === '') { // UPDATE THIS ERROR MESSAGE
			this.utilsService.showError(this.translation.translate('Error.Please select a collection to edit'));
		} else {
			// open the drawer here
		}
	}

	collectionOnSave(n) {
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

	runFilter(filter) {
		if (this.utilsService.checkOnlineStatus()) {
			let toReturn = { ... this.controlData };
			Object.keys(filter).forEach(key => {
				if (filter[key] !== '') {
					const dropdown = this.columns.table.filter(obj => obj.name === key)[0].dropdown;
					if (dropdown === true) {
						if (key === 'Gender') {
							if (filter[key] === 'Male') {
								toReturn = toReturn.filter(row => (row['Patient'][key] === 'M'));
							} else {
								toReturn = toReturn.filter(row => (row['Patient'][key] === 'F'));
							}
						} else if (key === 'Reserved') {
							toReturn = toReturn.filter(row => (row['Status'] === filter[key]));
						} else if (key === 'Time') { // going to use this to search collection lists and the following for hubId
							toReturn = toReturn.filter(row => (row['CollectionList'] === filter[key]));
						} else if (key === 'Bed') { // bc
							toReturn = toReturn.filter(row => (row['HubId'] === filter[key]));
						}
					} else {
						if (key === 'MRN') {
							toReturn = toReturn.filter(row => (row['Patient'][key].toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						} else if (key === 'DOB') {
							toReturn = toReturn.filter(row => (row['Patient']['DateOfBirth'].indexOf(filter[key]) > -1));
						} else if (key === 'Location') {
							toReturn = toReturn.filter(row => (row['CollectedLocation']['Code'].toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						} else if (key === 'Priority') {
							toReturn = toReturn.filter(row => (row['Priority']['Description'].toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						} else if (key === 'Name') {
							toReturn = toReturn.filter(row => (row['Patient']['FirstName'].toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || row['Patient']['LastName'].toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || (`${row['Patient']['FirstName']} ${row['Patient']['LastName']}`).toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || (`${row['Patient']['FirstName']}, ${row['Patient']['LastName']}`).toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || (`${row['Patient']['LastName']} ${row['Patient']['FirstName']}`).toLowerCase().indexOf(filter[key].toLowerCase()) > -1 || (`${row['Patient']['LastName']}, ${row['Patient']['FirstName']}`).toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						} else {
							toReturn = toReturn.filter(row => (row[key].toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
						}
					}
				}
			});
			this.loadDataComplete(toReturn);
		}
	}

	receiveFilter(filter) {
		let emptyFilter = true;
		let keyLength = Object.keys(filter).length;
		Object.keys(filter).forEach(key => {
			if (filter[key] !== '') {
				emptyFilter = false;
				keyLength--;
				if (keyLength === 0) {
					this.runFilter(filter);
				} else {
					this.runFilter(filter);
				}
			} else {
				keyLength--;
				if (emptyFilter === true && keyLength === 0) {
					this.loadData();
				} else {
					this.runFilter(filter);
				}
			}
		});
	}
}
