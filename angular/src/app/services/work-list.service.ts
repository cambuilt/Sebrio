import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import * as moment from 'moment-timezone';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { ActiveEntitiesService } from './active-entities.service';
import { UtilsService } from './utils.service';
import { NotificationService } from './notification.service';

@Injectable({
	providedIn: 'root'
})
export class WorkListService {

	millisecondsInYear = (1000 * 60 * 60 * 24 * 365);

	canManualRefresh = true;
	manualRefreshSubject = new BehaviorSubject(this.canManualRefresh);

	manualRefreshSubscription: any;
	manualRefreshPeriod = 3000;
	manualRefreshTimer: any;

	autoRefreshPeriod = 60000;
	autoRefreshTimer: any;
	autoRefreshTimerSubject = new BehaviorSubject(this.autoRefreshTimer);
	autoRefreshSubject = new BehaviorSubject(this.autoRefreshPeriod);

	problemListFlag: boolean;
	problemListFlagSubject = new BehaviorSubject(this.problemListFlag);

	collectionListObject: any;
	collectionListLab: any;
	hubObject: any;
	supersede: boolean;
	displayLocationAddress: boolean;
	displayLocationAddressSubject = new BehaviorSubject(this.displayLocationAddress);
	displayHomeDrawAddress: boolean;
	displayHomeDrawAddressSubject = new BehaviorSubject(this.displayHomeDrawAddress);
	displayBed: boolean;
	displayBedSubject = new BehaviorSubject(this.displayBed);
	groupByLocation: boolean;
	groupByLocationSubject = new BehaviorSubject(this.groupByLocation);
	collectionListPriorities: any;
	supersedeSubject = new BehaviorSubject(this.supersede);
	canClearSearch = true;
	canClearSearchSubject = new BehaviorSubject(this.canClearSearch);
	autoSubscription: any;
	autoUpdate = 1;
	autoUpdateSubject = new BehaviorSubject(this.autoUpdate);

	collectionListUpdate = 1;
	collectionListUpdateSubject = new BehaviorSubject(this.collectionListUpdate);

	searchObj: any;
	builderObj: any;

	savedSearch: any;

	collectPeriodEndTimeNow: boolean;

	searchFilter: any;

	workListFilter: any;
	workListFilterSubject = new BehaviorSubject(1);

	patients = [];
	patientsToDisplay = [];
	workListCollections = [];
	currentPhleb: any;
	currentPhlebObject: any;
	currentPhlebUsername: any;
	currentPhlebUsernameSubject = new BehaviorSubject(this.currentPhlebUsername);
	filters: any;
	dataSubject = new BehaviorSubject(this.patientsToDisplay);
	allPatientsSubject = new BehaviorSubject(this.patients);

	logoutSubscription: any;

	connectionSubscription: any;
	connectionStatus: boolean;
	destructionSubscription: any;
	destructionStatus: boolean;

	workListResetSubject = new BehaviorSubject(1);

	periodText: string;
	periodTextSubject = new BehaviorSubject(this.periodText);

	showProblemList: boolean;
	showProblemListSubject = new BehaviorSubject(this.showProblemList);

	now: any;

	offlineActions = [];

	recentlyChanged = [];

	collectionStaff: string;
	collectionStaffSubject = new BehaviorSubject(this.collectionStaff);

	cancelReasons = [];
	workloads = [];
	collectionSites = [];
	clients = [];
	transferTargets = [];
	commLabelReasons = [];

	label = {
		pairs: [],
		data: '',
		testLineLength: ''
	};

	lockedTransferTarget = '';
	transferObject = undefined;

	actionQueue = [];

	notificationChanges = [];

	cleaningSubscription: any;

	cleanWorkList = false;

	activeWorkListSubscription: any;

	constructor(private router: Router, private authService: AuthService, private utilsService: UtilsService, private activeEntitiesService: ActiveEntitiesService, private http: Http,
		private notificationService: NotificationService) {
		this.getWorkListActive();
		this.getCurrentPhleb();
		this.getWorkListCleaner();
		this.getLogout();
		this.updateNow();
		this.getConnectionStatus();
	}

	getWorkListActive() {
		this.activeWorkListSubscription = this.authService.activateWorkListSubject.asObservable().subscribe(response => {
			if (response === true) {
				this.autoUpdateSubject.next(this.autoUpdate);
			}
		});
	}

	getCurrentPhleb() {
		this.currentPhleb = this.authService.currentUser;
		this.activeEntitiesService.getActiveUsers().subscribe(response => {
			this.currentPhlebObject = response.json().find(user => user.Username === this.currentPhleb.username);
			this.setCurrentPhleb();
		});
	}

	setCurrentPhleb() {
		this.currentPhlebUsername = this.currentPhlebObject.Username;
		this.currentPhlebUsernameSubject.next(this.currentPhlebUsername);
	}

	fnGetCurrentPhleb() {
		return this.currentPhlebUsernameSubject.asObservable();
	}

	getWorkListCleaner() {
		if (this.cleaningSubscription) {
			this.cleaningSubscription.unsubscribe();
		}
		this.cleaningSubscription = this.authService.getWorkListClean().subscribe(response => {
			this.cleanWorkList = response;
			console.log(`Response from cleanWorkList: ${this.cleanWorkList}`);
			if (this.cleanWorkList === true) {
				console.log(`Clearing work list...`);
				this.resetService();
				console.log(`Work list cleared. Deleting stored filter...`);
				this.clearSearch().subscribe(res => {
					if (res.status === 200) {
						console.log(`Deleted stored filter.`);
						this.resetService();
						this.authService.workListCleaned();
					}
				});
			}
		});
	}

	/**
	 * Subscribes to the connection status updates; syncs data upon coming online.
	 */
	getConnectionStatus() {
		this.connectionSubscription = this.authService.status.subscribe(response => {
			setTimeout(() => {
				this.connectionStatus = response;
				if (response === true) {
					console.log('Online');
					if (this.collectionListLab === undefined) {
						this.getSupportObjects();
					} else {
						this.getSupportObjectsForLab(this.collectionListLab);
					}

					if (this.patients.length) {
						this.allPatientsSubject.next(this.patients);
					}
					this.processOfflineActions();
					// needs to update patients with worklist collections
				} else {
					console.log('Switching to offline data set...');
					this.allPatientsSubject.next(this.workListCollections);
				}
			});
		});
		this.destructionSubscription = this.authService.destroy.subscribe(res => {
			if (res === true) {
				this.resetService();
				this.clearStorage();
			}
		});
	}

	/**
	 * Preloads _cancelReasons, _workloads, _collectionSites, _clients & _transferTargets for offline use.
	 */
	getSupportObjects() {
		if (this.checkOnlineStatus()) {
			if (this.authService.currentUser.role !== 'RMP_RSA') {
				this.getCommLabelReasons().then().catch(error => console.log(`Error loading communication label reasons: ${error}`));
				this.getCancellationReasons().then().catch(error => console.log(`Error loading cancellations: ${error}`));
				this.getWorkloads().then().catch(error => console.log(`Error loading workloads: ${error}`));
				this.getCollectionSites().then().catch(error => console.log(`Error loading collection sites: ${error}`));
				this.getClients().then().catch(error => console.log(`Error loading clients: ${error}`));
				this.getTransferrableUsers().then().catch(error => console.log(`Error loading clients: ${error}`));
			}
		} else {
			this.getSupportObjectsFromStorage();
		}
	}

	clearStoredSupportObjects() {
		const commLabelReasons = localStorage.getItem('commLabelReasons');
		if (commLabelReasons !== null) {
			localStorage.removeItem('commLabelReasons');
		}
		const cancellationReasons = localStorage.getItem('cancellationReasons');
		if (cancellationReasons !== null) {
			localStorage.removeItem('cancellationReasons');
		}
		const workloads = localStorage.getItem('workloads');
		if (workloads !== null) {
			localStorage.removeItem('workloads');
		}
		const collectionSites = localStorage.getItem('collectionSitess');
		if (collectionSites !== null) {
			localStorage.removeItem('collectionSitess');
		}
		const transferTargets = localStorage.getItem('transferTargets');
		if (transferTargets !== null) {
			localStorage.removeItem('transferTargets');
		}
	}

	getSupportObjectsFromStorage() {
		const commLabelReasons = localStorage.getItem('commLabelReasons');
		const cancellationReasons = localStorage.getItem('cancellationReasons');
		const workloads = localStorage.getItem('workloads');
		const collectionSites = localStorage.getItem('collectionSites');
		const transferTargets = localStorage.getItem('transferTargets');
		if (commLabelReasons !== null) {
			this.commLabelReasons = JSON.parse(commLabelReasons);
		}
		if (cancellationReasons !== null) {
			this.cancelReasons = JSON.parse(cancellationReasons);
		}
		if (workloads !== null) {
			this.workloads = JSON.parse(workloads);
		}
		if (collectionSites !== null) {
			this.collectionSites = JSON.parse(collectionSites);
		}
		if (transferTargets !== null) {
			this.transferTargets = JSON.parse(transferTargets);
		}
	}

	storeCommLabelReasons(value) {
		const commLabelReasons = localStorage.getItem('commLabelReasons');
		if (commLabelReasons !== null) {
			localStorage.removeItem('commLabelReasons');
		}
		localStorage.setItem('commLabelReasons', JSON.stringify(value));
	}

	storeCancellationReasons(value) {
		const cancellationReasons = localStorage.getItem('cancellationReasons');
		if (cancellationReasons !== null) {
			localStorage.removeItem('cancellationReasons');
		}
		localStorage.setItem('cancellationReasons', JSON.stringify(value));
	}

	storeWorkloads(value) {
		const workloads = localStorage.getItem('workloads');
		if (workloads !== null) {
			localStorage.removeItem('workloads');
		}
		localStorage.setItem('workloads', JSON.stringify(value));
	}

	storeCollectionSites(value) {
		const collectionSites = localStorage.getItem('collectionSitess');
		if (collectionSites !== null) {
			localStorage.removeItem('collectionSitess');
		}
		localStorage.setItem('collectionSitess', JSON.stringify(value));
	}

	storeTransferTargets(value) {
		const transferTargets = localStorage.getItem('transferTargets');
		if (transferTargets !== null) {
			localStorage.removeItem('transferTargets');
		}
		localStorage.setItem('transferTargets', JSON.stringify(value));
	}

	/**
	 * Returns promise after setting commLabelReasons.
	 */
	getCommLabelReasons(): Promise<any> {
		const promise = new Promise((resolve, reject) => {
			this.getCommunicationLabelReasons().subscribe(response => {
				this.commLabelReasons = response.json();
				this.storeCommLabelReasons(response.json());
				resolve();
			}, error => {
				this.utilsService.handle401(error);
				reject();
			});
		});
		return promise;
	}

	/**
	 * Returns promise after setting _cancelReasons.
	 */
	getCancellationReasons(): Promise<any> {
		const promise = new Promise((resolve, reject) => {
			this.activeEntitiesService.getActiveCancellations().subscribe(response => {
				this.cancelReasons = response.json();
				this.storeCancellationReasons(response.json());
				resolve();
			}, error => {
				this.utilsService.handle401(error);
				reject();
			});
		});
		return promise;
	}

	/**
	 * Returns promise after setting _cancelReasons.
	 */
	getCancellationReasonsForLab(lab): Promise<any> {
		const promise = new Promise((resolve, reject) => {
			this.activeEntitiesService.getActiveCancellations().subscribe(response => {
				this.cancelReasons = response.json().filter(reason => reason.Laboratory.Code === lab);
				this.storeCancellationReasons(response.json().filter(reason => reason.Laboratory.Code === lab));
				resolve();
			}, error => {
				this.utilsService.handle401(error);
				reject();
			});
		});
		return promise;
	}

	/**
	 * Returns promise after setting _workloads.
	 */
	getWorkloads(): Promise<any> {
		const promise = new Promise((resolve, reject) => {
			this.activeEntitiesService.getActiveWorkloads().subscribe(response => {
				this.workloads = response.json();
				this.storeWorkloads(response.json());
				resolve();
			}, error => {
				this.utilsService.handle401(error);
				reject();
			});
		});
		return promise;
	}

	/**
	 * Returns promise after setting _workloads.
	 */
	getWorkloadsForLab(lab): Promise<any> {
		const promise = new Promise((resolve, reject) => {
			this.activeEntitiesService.getActiveWorkloads().subscribe(response => {
				this.workloads = response.json().filter(workload => workload.LaboratoryId === lab);
				this.storeWorkloads(response.json().filter(workload => workload.LaboratoryId === lab));
				resolve();
			}, error => {
				this.utilsService.handle401(error);
				reject();
			});
		});
		return promise;
	}

	/**
	 * Returns promise after setting _collectionSites.
	 */
	getCollectionSites(): Promise<any> {
		const promise = new Promise((resolve, reject) => {
			this.activeEntitiesService.getActiveCollectionSites().subscribe(response => {
				this.collectionSites = response.json();
				this.storeCollectionSites(response.json());
				resolve();
			}, error => {
				this.utilsService.handle401(error);
				reject();
			});
		});
		return promise;
	}

	/**
	 * Returns promise after setting _collectionSites.
	 */
	getCollectionSitesForLab(lab): Promise<any> {
		const promise = new Promise((resolve, reject) => {
			this.activeEntitiesService.getActiveCollectionSites().subscribe(response => {
				this.collectionSites = response.json().filter(site => site.LaboratoryId === lab);
				this.storeCollectionSites(response.json().filter(site => site.LaboratoryId === lab));
				resolve();
			}, error => {
				this.utilsService.handle401(error);
				reject();
			});
		});
		return promise;
	}

	/**
	 * Returns promise after setting _clients.
	 */
	getClients(): Promise<any> {
		const promise = new Promise((resolve, reject) => {
			this.activeEntitiesService.getActiveClients().subscribe(response => {
				this.clients = response.json();
				resolve();
			}, error => {
				this.utilsService.handle401(error);
				reject();
			});
		});
		return promise;
	}

	refreshTransferrableUsers() {
		if (this.lockedTransferTarget !== '') {
			this.transferTargets = [this.lockedTransferTarget];
			this.storeTransferTargets([this.lockedTransferTarget]);
		} else {
			this.getTransferrableUsers().then().catch(error => console.log(`Error refreshing transferrable users: ${error}`));
		}
	}

	/**
	 * Returns promise after setting _transferTargets.
	 */
	getTransferrableUsers(): Promise<any> {
		const promise = new Promise((resolve, reject) => {
			if (this.searchObj !== undefined) {
				this.getTransferTargets(this.searchObj).toPromise()
					.then(response => {
						const usersReturned = response.json();
						if (this.currentPhlebObject !== undefined) {
							this.transferTargets = usersReturned.filter(user => user.Username !== this.currentPhlebObject.Username).map(user => user.Username);
							this.storeTransferTargets(usersReturned.filter(user => user.Username !== this.currentPhlebObject.Username).map(user => user.Username));
						} else {
							this.transferTargets = usersReturned.map(user => user.Username);
							this.storeTransferTargets(usersReturned.map(user => user.Username));
						}
						resolve();
					})
					.catch(error => {
						this.utilsService.handle401(error);
						reject(error);
					});
			} else {
				reject();
			}
		});
		return promise;
	}

	getSupportObjectsForLab(lab) {
		if (this.checkOnlineStatus()) {
			this.activeEntitiesService.getActiveCancellations().subscribe(response => {
				this.cancelReasons = response.json().filter(reason => reason.Laboratory.Code === lab);
				this.storeCancellationReasons(response.json().filter(reason => reason.Laboratory.Code === lab));
			}, error => {
				this.utilsService.handle401(error);
			});
			this.activeEntitiesService.getActiveCollectionSites().subscribe(response => {
				this.collectionSites = response.json().filter(site => site.LaboratoryId === lab);
				this.storeCollectionSites(response.json().filter(site => site.LaboratoryId === lab));
			}, error => {
				this.utilsService.handle401(error);
			});
			this.activeEntitiesService.getActiveWorkloads().subscribe(response => {
				this.workloads = response.json().filter(workload => workload.LaboratoryId === lab);
				this.storeWorkloads(response.json().filter(workload => workload.LaboratoryId === lab));
			}, error => {
				this.utilsService.handle401(error);
			});
		} else {
			this.getSupportObjectsFromStorage();
		}
	}

	/**
	 * Processes actions added to offlineActions while offline.
	 */
	processOfflineActions() {
		if (this.offlineActions.length) {
			// Cycle all collections that were cycled while offline
			const cycleIDs = Array.from(new Set(this.offlineActions.filter(action => action.action === 'cycleReserved' || action.action === 'cycleReservedWL').map(action => action.collection.Id)));
			const serialCycleFeed = [];
			cycleIDs.forEach(id => {
				const col = this.patients.find(collection => collection.Id === id);
				serialCycleFeed.push(col);
			});
			this.serialCycle(serialCycleFeed)
				.then(() => this.syncMenuActions())
				.then(() => this.refreshAllCollections(this.searchObj));
		}
	}

	handleSyncDone(count, len, completeActions) {
		count++;
		if (count === len) {
			console.log(`Menu Actions: END`);
			console.log(completeActions);
			completeActions.forEach(action => {
				console.log(action);
				this.offlineActions = this.offlineActions.filter(act => act.id !== action.id);
			});
			if (this.offlineActions.length) {
				console.log(`Not all offline actions synced...`);
				console.log(this.offlineActions);
			}
			/* this.updateActionQueueStorage(); */
			this.refreshAllCollections(this.searchObj);
		}
	}

	handleSyncObservable(obs, id, name, cid, len, count, completeActions) {
		obs.subscribe(response => {
			if (response.status === 200) {
				console.log(`${cid} ${name} successfully...`);
				completeActions.push({ id: id });
			}
			this.handleSyncDone(count, len, completeActions);
		}, error => {
			this.utilsService.handle401(error);
			this.handleSyncDone(count, len, completeActions);
		});
	}

	/**
	 * Synchronizes offline menu action to server.
	 */
	syncMenuActions() {
		const reasons = ['completeCollect', 'cancelled', 'transferred', 'problemListed', 'rescheduled', 'actionOut'];
		const actionIDs = this.offlineActions.filter(action => reasons.find(reason => reason === action.action) !== undefined);
		if (actionIDs.length) {
			console.log(`Menu Actions: START`);
			let count = 0;
			let len = actionIDs.length;
			const completeActions = [];
			actionIDs.forEach(action => {
				console.log(action);
				if (action.action === 'completeCollect') {
					this.handleSyncObservable(this.completeTests(action.collectionId, action.tests, action.info.changes, action.info.time), action.id, action.action, action.collectionId, len, count, completeActions);
				} else if (action.action === 'transferred') {
					this.handleSyncObservable(this.transferTestsPreformed(action.collectionId, { OrderedTests: JSON.parse(action.object).OrderedTests }), action.id, action.action, action.collectionId, len, count, completeActions);
				} else if (action.action === 'cancelled') {
					this.handleSyncObservable(this.cancelTests(action.collectionId, action.tests, action.info.reason, action.info.comments, action.info.time), action.id, action.action, action.collectionId, len, count, completeActions);
				} else if (action.action === 'rescheduled') {
					this.handleSyncObservable(this.rescheduleTests(action.collectionId, action.tests, action.info.reason, action.info.to, action.info.time), action.id, action.action, action.collectionId, len, count, completeActions);
				} else if (action.action === 'problemListed') {
					this.handleSyncObservable(this.problemListTests(action.collectionId, action.tests, action.info.reason, action.info.time), action.id, action.action, action.collectionId, len, count, completeActions);
				} else if (action.action === 'actionOut') {
					this.handleSyncObservable(this.reserveCollection(action.collectionId, 'Available'), action.id, action.action, action.collectionId, len, count, completeActions);
				}
			});
		}
	}

	/**
	 * Cycles the Collections to their current Status.
	 * @param collections Array of Collection objects.
	 */
	serialCycle(collections) {
		console.log(collections);
		const count = collections.filter(collection => collection !== undefined).length;
		let done = 0;
		console.log(`Serial cycle: START`);
		return new Promise(resolve => {
			if (count === done) {
				console.log(`Serial cycle: DONE`);
				resolve();
			} else {
				collections.forEach(collection => {
					if (collection !== undefined) {
						if (collection.Status !== 'Complete') {
							this.reserveCollection(collection.Id, collection.Status).subscribe(response => {
								done++;
								if (done === count) {
									console.log(`Serial cycle: DONE`);
									resolve();
								}
							}, error => {
								this.utilsService.handle401(error);
							});
						} else {
							done++;
							if (done === count) {
								console.log(`Serial cycle: DONE`);
								resolve();
							}
						}
					}
				});
			}
		});
	}

	/**
	 * Pushes an offline action onto the offlineActions array.
	 * @param 	action 		Object containing information of performed action.
	 */
	workListAction(action) {
		if (!this.connectionStatus) {
			let id = 0;
			if (this.offlineActions.length) {
				id = this.offlineActions[this.offlineActions.length - 1].id + 1;
			}
			action.id = id;
			this.offlineActions.push(action);
		}
	}

	/**
	 * Updates WLS's _now every 250ms.
	 */
	updateNow() {
		if (this.router.routerState.snapshot.url === '/work-list') {
			if (this.patientsToDisplay) {
				const updateTimer = timer(250);
				updateTimer.subscribe(n => {
					this.now = new Date();
					this.updateNow();
				});
			}
		}
	}

	/**
	 * Subscribes to the logout flag.
	 */
	getLogout() {
		if (this.logoutSubscription) {
			this.logoutSubscription.unsubscribe();
		}
		this.logoutSubscription = this.authService.getLogoutFlag().subscribe(response => {
			console.log(response + ' is your logout code.');
			if (response === 0) {
				console.log('Logged out.');
				this.encrypt();
				/* this.resetService(); */
			}
			if (response === 1) {
				console.log('Logged in.');
				this.newLogin();
			}
			if (response === 2) {
				console.log('Loading data from storage...');
				this.loadFromStorage();
			}
		});
	}

	/**
	 * Refreshes the currentPhleb property upon new login.
	 */
	newLogin() {
		this.authService.checkSavedWL();
		/* this.clearStorage(); */
		if (this.currentPhleb.Username !== this.authService.currentUser.username) {
			this.getCurrentPhleb();
		}
		this.loadSavedSearch();
	}

	/**
	 * Resets service by unsetting and emptying service variables. (#reset)
	 */
	resetService() {
		this.workListResetSubject.next(0);
		this.searchObj = this.builderObj = this.searchFilter = this.filters = undefined;
		this.autoRefreshTimer = undefined;
		this.autoRefreshTimerSubject.next(this.autoRefreshTimer);
		this.autoRefreshPeriod = 60000;
		this.autoRefreshSubject.next(this.autoRefreshPeriod);
		this.autoUpdate = 1;
		this.autoUpdateSubject.next(this.autoUpdate);
		if (this.autoSubscription) {
			this.autoSubscription.unsubscribe();
		}
		this.patients = this.patientsToDisplay = this.workListCollections = [];
		this.dataSubject.next(this.patientsToDisplay);
		this.allPatientsSubject.next(this.patients);
		this.manualRefreshPeriod = 3000;
		this.manualRefreshTimer = undefined;
		this.canManualRefresh = true;
		this.manualRefreshSubject.next(this.canManualRefresh);
		this.collectionListLab = '';
		this.problemListFlag = undefined;
		this.problemListFlagSubject.next(this.problemListFlag);
		this.hubObject = this.collectionListObject = undefined;
		this.supersede = undefined;
		this.supersedeSubject.next(this.supersede);
		this.canClearSearch = true;
		this.canClearSearchSubject.next(this.canClearSearch);
		this.workListResetSubject.next(1);
		this.periodText = undefined;
		this.periodTextSubject.next(this.periodText);
		this.recentlyChanged = [];
		this.cancelReasons = [];
		this.workloads = [];
		this.collectionSites = [];
		this.clients = [];
		this.clearStoredSupportObjects();
		this.collectionListLab = undefined;
		this.label = {
			data: '',
			pairs: [],
			testLineLength: ''
		};
		this.lockedTransferTarget = '';
		this.transferObject = undefined;
		this.notificationChanges = [];
	}

	resetTables() {
		this.searchObj = this.builderObj = undefined;
		this.autoRefreshTimer = undefined;
		this.autoRefreshTimerSubject.next(this.autoRefreshTimer);
		this.autoRefreshPeriod = 60000;
		this.autoRefreshSubject.next(this.autoRefreshPeriod);
		this.autoUpdate = 1;
		this.autoUpdateSubject.next(this.autoUpdate);
		if (this.autoSubscription) {
			this.autoSubscription.unsubscribe();
		}
		this.patients = this.patientsToDisplay = this.workListCollections = [];
		this.dataSubject.next(this.patientsToDisplay);
		this.allPatientsSubject.next(this.patients);
	}

	/**
	 * Get Hubs for User.
	 */
	getHubs() {
		const url = `/csp/rmp/tsa/workListMaintenance/hubs`;
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	getCollectedLocationsForLab(laboratoryId) {
		const url = `/csp/rmp/tsa/locationMaintenance/laboratoryLocations/${laboratoryId}`;
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	getPrioritiesForLab(laboratoryId) {
		const url = `/csp/rmp/tsa/priorityMaintenance/laboratoryPriorities/${laboratoryId}`;
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	/**
	 * Returns Priorities associated with Collection List.
	 * @param {string} 	collectionList 	Collection List Id
	 */
	getPrioritiesForCollectionList(collectionList) {
		const url = `/csp/rmp/tsa/workListMaintenance/priorities/${collectionList}`;
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	/**
	 * Returns Collection Lists associated with Hub.
	 * @param {string} 	hub		Hub Id.
	 */
	getCollectionLists(hub): Observable<any> {
		const url = `/csp/rmp/tsa/workListMaintenance/collectionList/${hub}`;
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	/**
	 * Returns Locations associated with Collection List.
	 * @param {string} 	list	Collection List Id.
	 */
	getCollectionLocations(list): Observable<any> {
		if (this.checkOnlineStatus()) {
			const url = `/csp/rmp/tsa/workListMaintenance/collectionLocation/${list}`;
			return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
		}
	}

	getCommunicationLabelReasons() {
		if (this.checkOnlineStatus()) {
			const url = `/csp/rmp/tsa/workListMaintenance/printReasons`;
			return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
		}
	}

	/**
	 * Cancels specified tests of collection.
	 * @param {string} 	collectionId 	Collection List Id.
	 * @param 			tests 			OrderedTests to cancel.
	 * @param {string} 	reason 			Cancellation reason.
	 */
	cancelTests(collectionId, tests, reason, comments, time): Observable<any> {
		if (this.checkOnlineStatus()) {
			const object = { OrderedTests: tests };
			object.OrderedTests.forEach(test => {
				test.IsCancelled = true;
				test.CancellationReason = reason;
				test.CancellationComments = comments;
				test.CancelTime = time;
			});
			const url = `/csp/rmp/tsa/workListMaintenance/complete/${collectionId}`;
			return this.http.put(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, object);
		}
	}

	/**
	 * Cancels specified tests of collection.
	 * @param {string} 	collectionId 	Collection List Id.
	 * @param 			tests 			OrderedTests to transfer.
	 * @param {string} 	reason 			Transfer reason.
	 * @param {string} 	to 				Username to transfer to.
	 */
	transferTests(collectionId: string, tests, comments: string, to: string, time): Observable<any> {
		if (this.checkOnlineStatus()) {
			const object = { OrderedTests: tests };
			object.OrderedTests.forEach(test => {
				test.IsTransferred = true;
				test.TransferComments = comments;
				test.TransferredTo = { Id: to };
				test.TransferTime = time;
			});
			const url = `/csp/rmp/tsa/workListMaintenance/complete/${collectionId}`;
			return this.http.put(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, object);
		}
	}

	transferTestsPreformed(id, object) {
		if (this.checkOnlineStatus()) {
			const url = `/csp/rmp/tsa/workListMaintenance/complete/${id}`;
			return this.http.put(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, object);
		}
	}

	/**
	 * Reschedules specified tests of collection.
	 * @param {string} 	collectionId 	Collection List Id.
	 * @param 			tests 			OrderedTests to reschedule.
	 * @param {string} 	reason 			Reschedule reason.
	 * @param 			date 			Reschedule date in format YYYY-MM-DD HH:mm:ss.
	 */
	rescheduleTests(collectionId: string, tests, reason: string, date, time): Observable<any> {
		if (this.checkOnlineStatus()) {
			const object = { OrderedTests: tests };
			object.OrderedTests.forEach(test => {
				test.IsRescheduled = true;
				test.RescheduleComments = reason;
				test.RescheduleDateTime = date;
				test.RescheduleTime = time;
			});
			console.log(object);
			const url = `/csp/rmp/tsa/workListMaintenance/complete/${collectionId}`;
			return this.http.put(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, object);
		}
	}

	/**
	 * Problem lists specified tests of collection.
	 * @param {string} 	collectionId 	Collection List Id.
	 * @param 			tests 			OrderedTests to problem list.
	 * @param {string} 	reason 			Problem list reason.
	 */
	problemListTests(collectionId, tests, reason, time): Observable<any> {
		if (this.checkOnlineStatus()) {
			const object = { OrderedTests: tests };
			object.OrderedTests.forEach(test => {
				test.IsProblem = true;
				test.ProblemReason = reason;
				test.ProblemTime = time;
			});
			console.log(object);
			const url = `/csp/rmp/tsa/workListMaintenance/complete/${collectionId}`;
			return this.http.put(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, object);
		}
	}

	/**
	 * Updates properties of collection noted duing collection process.
	 * @param	changes 	Object containing collection changes.
	 */
	completeTests(collectionId, tests, collectedInfo, time) {
		if (this.checkOnlineStatus()) {
			const object = collectedInfo;
			object.OrderedTests = tests;
			object.OrderedTests.forEach(test => {
				test.IsCollected = true;
				test.CollectTime = time;
			});
			console.log(object);
			const url = `/csp/rmp/tsa/workListMaintenance/complete/${collectionId}`;
			return this.http.put(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, object);
		}
	}

	/**
	 * Updates Status of Collection.
	 * @param {string}	id 		Collection Id.
	 * @param {string}	status 	String of status to update collection to.
	 */
	reserveCollection(id: string, status: string) {
		if (this.checkOnlineStatus()) {
			const toSend = { Status: status };
			const url = `/csp/rmp/tsa/workListMaintenance/worklist/${id}`;
			return this.http.put(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, toSend);
		}
	}

	/**
	 * Requests collection from holding user.
	 * @param {string}	id 		Collection Id.
	 * @param {string}	reason 	String of reason to request.
	 */
	requestCollection(id, reason) {
		const toSend = { Status: 'Reserved', RequestFromTSA: false, RequestReason: JSON.parse(JSON.stringify(reason)) };
		const url = `/csp/rmp/tsa/workListMaintenance/worklist/${id}`;
		return this.http.put(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, toSend);
	}

	requestCollectionFromTSA(id, reason) {
		const toSend = { Status: 'Reserved', RequestFromTSA: true, RequestReason: JSON.parse(JSON.stringify(reason)) };
		const url = `/csp/rmp/tsa/workListMaintenance/worklist/${id}`;
		return this.http.put(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, toSend);
	}

	/**
	 * Returns the record of the label associated with the lab that is associated with the current collection list.
	 * @param collectionListId Collection List Id
	 */
	getLabelForCollectionList(collectionListId) {
		const url = `/csp/rmp/tsa/labelMaintenance/collectionList/${collectionListId}`;
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	/**
	 * Returns eligible tenant users for collection transfer.
	 * @param obj Filter/Search object
	 */
	getTransferTargets(obj) {
		const url = `/csp/rmp/tsa/workListMaintenance/filterUsers`;
		return this.http.post(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, obj);
	}

	getCollectionListUpdate(collectionListId) {
		const url = `/csp/rmp/tsa/collectionListMaintenance/collectionUsers/${collectionListId}`;
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	/**
 * Returns the last submitted WLB filter.
 */
	getStoredSearch() {
		const url = `/csp/rmp/tsa/workListMaintenance/savedFilters`;
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	saveSearch(obj) {
		const url = `/csp/rmp/tsa/workListMaintenance/save`;
		return this.http.post(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, obj);
	}

	clearSearch() {
		const url = `/csp/rmp/tsa/workListMaintenance/worklist`;
		return this.http.delete(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	/**
	 * Get Collections By Filter(s).
	 * @param 	obj 	Search/Filter object to designate collections.
	 */
	getCollections(obj) {
		const objString = JSON.parse(JSON.stringify(obj));
		const url = `/csp/rmp/tsa/workListMaintenance/worklist`;
		return this.http.post(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, objString);
	}

	offlineAutoRefresh() {
		if (this.authService._workListTimer !== undefined) {
			console.log(`Offline, saving LastAction to localStorage...`);
			this.saveLastAction();
		}
	}

	/**
	 * Get Collections By Filter(s) & make Work List Builder updates. (#GCBF)
	 * @param 	obj 	Search/Filter object to designate collections.
	 */
	getCollectionsByFilter(obj) {
		this.getCollectionsByFilter2(obj);
	}

	getCollectionsByFilter2(obj) {
		if (obj !== undefined && this.cleanWorkList !== true) {
			if (this.savedSearch === undefined) {
				console.log(`The saved search is undefined.`);
			} else {
				const same = JSON.stringify(obj) === JSON.stringify(this.savedSearch);
				if (same === false) {
					console.log(`This search is the same as the stored search: ${same}`);
					console.log(obj);
					console.log(this.savedSearch);
				}
			}
			const getCollectionList = this.getCollectionLists(obj.Hub.Id).toPromise();
			const getPriorities = this.getPrioritiesForCollectionList(obj.CollectionList.Id).toPromise();
			const getLabel = this.getLabelForCollectionList(obj.CollectionList.Id).toPromise();
			Promise.all([getCollectionList]).then(response => {
				const collectionList = response[0].json().find(cl => cl.Id === obj.CollectionList.Id);
				this.simpleExtractCollectionList(collectionList);

				this.reshapeDateRange(obj, collectionList);
				const getCollections = this.getCollections(obj).toPromise();
				if (this.authService.activateWorkListSubject.value === true) {
					Promise.all([getCollections]).then(values => {
						if (this.searchObj !== undefined && this.builderObj !== undefined) {
							this.saveWorkListSearch(this.searchObj);

							let tempWorkListBuilder = values[0].json();
							this.processNewCollections(tempWorkListBuilder);
							tempWorkListBuilder = this.hidePastFinished(tempWorkListBuilder, collectionList);
							tempWorkListBuilder = this.hideWrongCollectionStaff(tempWorkListBuilder, collectionList);
							tempWorkListBuilder = this.hideOutsideTimeRange(tempWorkListBuilder, obj);
							this.patientsToDisplay = tempWorkListBuilder;
							this.dataSubject.next(this.patientsToDisplay);

							let tempWorkList = values[0].json();
							this.processNewCollections(tempWorkList);
							tempWorkList = this.hideWrongCollectionStaff(tempWorkList, collectionList);
							tempWorkList = this.hideOutsideTimeRange(tempWorkList, obj);
							this.patients = tempWorkList;
							this.workListCollections = JSON.parse(JSON.stringify(this.patients.filter(collection => ((collection.Status === 'Reserved' || collection.Status === 'Locked') && collection.ReservedBy.Username === this.currentPhleb.username))));
							this.allPatientsSubject.next(tempWorkList);

							Promise.all([getPriorities, getLabel]).then(responses => {
								const label = responses[1].json();
								this.simpleGetLabel(label);

								const priorities = responses[0].json();
								this.collectionListPriorities = priorities;
							});

							this.interpretFilter();
							if (this.periodText === undefined) { this.workListFilterPeriodText(this.formatDateRange(obj)); }
							this.updateCanClearSearch();

						} else {
							console.log(`GCBF complete, but objects are undefined.`);
						}
					});
				}
			});
		}
	}

	startSearch(obj) {
		console.log(obj);
		const getCollectionList = this.getCollectionLists(obj.Hub.Id).toPromise();
		const getPriorities = this.getPrioritiesForCollectionList(obj.CollectionList.Id).toPromise();
		const getLabel = this.getLabelForCollectionList(obj.CollectionList.Id).toPromise();
		Promise.all([getCollectionList]).then(response => {
			const collectionList = response[0].json().find(cl => cl.Id === obj.CollectionList.Id);
			this.simpleExtractCollectionList(collectionList);

			this.reshapeDateRange(obj, collectionList);
			const getCollections = this.getCollections(obj).toPromise();
			Promise.all([getCollections]).then(values => {
				this.searchObj = obj;
				this.saveToStorage();
				this.authService.resetWorkListTimers();
				this.updatePeriodText(this.searchObj);

				this.savedSearch = obj;
				this.updateSavedAt(this.builderObj);
				this.updateSavedAt(this.searchObj);
				this.updateSavedAt(this.savedSearch);
				this.saveWorkListSearch(this.searchObj);

				let tempWorkListBuilder = values[0].json();
				this.processNewCollections(tempWorkListBuilder);
				tempWorkListBuilder = this.hidePastFinished(tempWorkListBuilder, collectionList);
				tempWorkListBuilder = this.hideWrongCollectionStaff(tempWorkListBuilder, collectionList);
				tempWorkListBuilder = this.hideOutsideTimeRange(tempWorkListBuilder, obj);
				this.patientsToDisplay = tempWorkListBuilder;
				this.dataSubject.next(this.patientsToDisplay);

				const tempWorkList = values[0].json();
				this.processNewCollections(tempWorkList);
				this.patients = tempWorkList;
				this.workListCollections = JSON.parse(JSON.stringify(this.patients.filter(collection => ((collection.Status === 'Reserved' || collection.Status === 'Locked') && collection.ReservedBy.Username === this.currentPhleb.username))));
				this.allPatientsSubject.next(tempWorkList);

				Promise.all([getPriorities, getLabel]).then(responses => {
					const label = responses[1].json();
					this.simpleGetLabel(label);

					const priorities = responses[0].json();
					this.collectionListPriorities = priorities;
				});

				this.interpretFilter();
				if (this.periodText === undefined) { this.workListFilterPeriodText(this.formatDateRange(obj)); }
				this.updateCanClearSearch();
			});
		});
	}

	reshapeDateRange(obj, collectionList) {
		const startDate = parseInt(`${collectionList.CollectionPeriodStartSelect}${collectionList.CollectionPeriodStartDays !== '' ? collectionList.CollectionPeriodStartDays : 0}`, 10);
		const endDate = parseInt(`${collectionList.CollectionPeriodEndSelect}${collectionList.CollectionPeriodEndDays !== '' ? collectionList.CollectionPeriodEndDays : 0}`, 10);
		const collectionListStartDate = moment.utc().add(startDate, 'days').startOf('day');
		const collectionListEndDate = moment.utc().add(endDate, 'days').endOf('day');
		const searchStartDate = moment.utc(obj.DateFrom).startOf('day');
		const searchEndDate = moment.utc(obj.DateTo).endOf('day');
		if (collectionList.CollectionPeriodEndTime === 'Now') {
			const nowUTC = moment.utc().format('HH:mm');
			const newSearchEndDate = moment.utc(`${searchEndDate.format('YYYY-MM-DD')} ${nowUTC}`, 'YYYY-MM-DD HH:mm');
			obj.DateTo = newSearchEndDate.format();
		}

		if (obj.Now) {
			obj.TimeTo = moment().format('HH:mm');
		}
	}

	updateSavedAt(obj) {
		if (obj !== undefined) {
			obj.SavedAt = moment.utc().format();
		}
	}

	simpleExtractCollectionList(clObject) {
		this.setCollectionList(clObject);
		this.collectionListLab = clObject.Laboratory.Id;
		this.getSupportObjectsForLab(this.collectionListLab);
		this.checkCollectionList(clObject.Id);
		this.setManualRefreshPeriod(clObject.RefreshTimeManual);
		this.setAutoRefreshPeriod(clObject.RefreshTimeAutomatic);
		this.setProblemListFlag(clObject.CanTransferToProblemList);
		this.setSupersede(clObject.ReservationIsSuperseded);
		this.setDisplayLocationAddress(clObject.DisplayCollectionLocation);
		this.setDisplayHomeDrawAddress(clObject.DisplayHomeDrawAddress);
		this.setGroupByLocation(clObject.CanGroupByLocation);
		this.setDisplayBed(clObject.DisplayPatientRoomBed);
		this.authService.updateCleanWorkListSetting(clObject.CleanCollectionListTimer);
		this.setCollectionStaff(clObject.CollectStaff);
		this.signalCollectionListChange();
		this.refreshTransferrableUsers();
	}

	simpleGetLabel(label) {
		this.label.data = window.atob(label.TemplateFile.Data);
		this.label.pairs = label.LabelColumnPairs;
		this.label.testLineLength = label.TestLineLength;
	}

	/**
	 * Get Collections By Filter(s) & make Work List updates.
	 * @param obj Search/Filter object to designate collections.
	 */
	refreshAllCollections(obj) {
		this.getCollectionsByFilter2(obj);
	}

	hidePastFinished(tempCollections, collectionList) {
		const toRemove = [];
		const cleanTime = collectionList.CleanCollectionListTimer;
		let expireTime = moment.utc().subtract(parseInt(cleanTime.split(':')[0], 10), 'hours').subtract(parseInt(cleanTime.split(':')[1], 10), 'minutes');
		if (this.savedSearch.SavedAt === undefined || this.savedSearch.SavedAt === '') {
			console.log(`SavedAt is not set....`);
		}
		tempCollections.filter(collection => collection.Status === 'Complete' || collection.IsCancelled).forEach(collection => {
			const cancelledOrCompleted = collection.OrderedTests.filter(test => test.IsCollected || test.IsCancelled);
			const times = cancelledOrCompleted.map(test => test.CollectTime ? test.CollectTime : test.CancelTime).map(test => ({ string: test, moment: moment.utc(test) })).sort((a, b) => {
				if (a.moment.isBefore(b.moment)) {
					return -1;
				}
				if (b.moment.isBefore(a.moment)) {
					return 1;
				}
				return 0;
			});
			if (times.length && times[times.length - 1].string !== undefined) {
				if (times[times.length - 1].moment.isBefore(expireTime)) {
					toRemove.push(collection.Id);
				} else if (times[times.length - 1].moment.isBefore(moment.utc(this.savedSearch.SavedAt))) {
					toRemove.push(collection.Id);
				}
			}
		});
		return tempCollections.filter(collection => !toRemove.includes(collection.Id));
	}

	hideWrongCollectionStaff(tempCollections, collectionList) {
		const toRemove = [];
		const collectionStaff = collectionList.CollectStaff;
		if (collectionStaff === 'Both') {
			return tempCollections;
		} else {
			tempCollections.forEach(collection => {
				const matchingTests = collection.OrderedTests.filter(test => test.CollectionStaff === collectionStaff).length;
				if (!matchingTests) {
					toRemove.push(collection.Id);
				}
			});
			return tempCollections.filter(collection => !toRemove.includes(collection.Id));
		}
	}

	hideOutsideTimeRange(tempCollections, searchObj) {
		const toRemove = [];
		tempCollections.forEach(collection => {
			if (!collection.OrderedTests.filter(test => test.ScheduledTime < searchObj.TimeTo && test.ScheduledTime > searchObj.TimeFrom).length) {
				toRemove.push(collection.Id);
			}
		});
		return tempCollections.filter(collection => !toRemove.includes(collection.Id));
	}

	getResponseObject(response) {
		const responseText = response['_body'];
		const responseString = responseText.substring(responseText.indexOf('['), responseText.length);
		const responseObject = JSON.parse(responseString);
		return responseObject;
	}

	saveWorkListSearch(obj) {
		if (obj !== undefined && (obj.From === undefined || obj.From === 'Search')) {
			if (this.authService._workListTimer !== undefined) {
				obj.LastAction = moment(this.authService._workListTimer.format()).subtract(this.authService._cleanWorkListSetting, 'seconds').utc().format();
			} else {
				if (this.savedSearch !== undefined && this.savedSearch.LastAction !== undefined) {
					obj.LastAction = this.savedSearch.LastAction;
				} else {
					obj.LastAction = obj.SavedAt;
				}
			}
			this.saveLastAction(obj);

			this.saveSearch(obj).subscribe(response => {
				if (response.status === 200) {
				}
			});
		}
	}

	saveLastAction(obj?) {
		if (this.authService._workListTimer !== undefined) {
			this.saveToLocalStorage('workListLastAction', moment(this.authService._workListTimer.format()).subtract(this.authService._cleanWorkListSetting, 'seconds').utc().format());
		} else {
			if (this.savedSearch !== undefined && this.savedSearch.LastAction !== undefined) {
				this.saveToLocalStorage('workListLastAction', this.savedSearch.LastAction);
			} else {
				this.saveToLocalStorage('workListLastAction', obj.SavedAt);
			}
		}
	}

	saveToLocalStorage(string, value) {
		const storedValue = localStorage.getItem(string);
		if (storedValue !== value) {
			if (storedValue !== null) {
				localStorage.removeItem(string);
			}
			localStorage.setItem(string, value);
		}
	}

	/**
	 * Return periodText to undefined & update UI.
	 */
	resetPeriodText() {
		this.periodText = undefined;
		this.periodTextSubject.next(this.periodText);
	}

	/**
	 * Creates Moments from stored/stringified Dates.
	 * @param 	obj 	Search/Filter object to designate collections.
	 */
	formatDateRange(obj) {
		const toReturn = {
			DateFrom: moment(this.convertTimezone(moment.utc(obj.DateFrom), moment.tz.guess())),
			DateTo: moment(this.convertTimezone(moment.utc(obj.DateTo), moment.tz.guess()))
		};
		return toReturn;
	}

	/**
	 * Updates periodText based on contents of Search/Filter object.
	 * @param obj Search/Filter object to designate collections.
	 */
	updatePeriodText(obj) { // If there is no SearchFilter object, just update periodText
		if ((this.getSearchFilter() !== undefined && (!obj.Reset && obj.Hub)) || this.getSearchFilter() === undefined) { // If there is a SearchFilter object, only update periodText when function called with SearchFilter
			const dateFromStorage = this.formatDateRange(obj);
			const dateFrom = `${dateFromStorage.DateFrom.month() + 1}/${dateFromStorage.DateFrom.date()}/${dateFromStorage.DateFrom.year()}`;
			const dateTo = `${dateFromStorage.DateTo.month() + 1}/${dateFromStorage.DateTo.date()}/${dateFromStorage.DateTo.year()}`;
			const today = `${(moment()).month() + 1}/${(moment()).date()}/${(moment()).year()}`;
			if (dateFrom === dateTo && dateTo === today) { // If dateFrom===dateTo && periodText not already right
				if (this.periodText !== 'Today') {
					this.periodText = 'Today';
					this.periodTextSubject.next(this.periodText);
				}
			} else if (dateFrom === dateTo) { // If dateFrom===dateTo && notToday && periodText not already right
				if (this.periodText !== `${dateFrom}`) {
					this.periodText = `${dateFrom}`;
					this.periodTextSubject.next(this.periodText);
				}
			} else { // If dateFrom!==dateTo && periodText not already right
				if (this.periodText !== `${dateFrom} - ${dateTo}`) {
					this.periodText = `${dateFrom} - ${dateTo}`;
					this.periodTextSubject.next(this.periodText);
				}
			}
		}
	}

	/**
	 * Updates periodText for display on Work List.
	 * @param obj Search/Filter object to designate collections.
	 */
	workListFilterPeriodText(obj) {
		const dateFromStorage = {
			DateFrom: moment(obj.DateFrom),
			DateTo: moment(obj.DateTo)
		};
		const dateFrom = `${dateFromStorage.DateFrom.month() + 1}/${dateFromStorage.DateFrom.date()}/${dateFromStorage.DateFrom.year()}`;
		const dateTo = `${dateFromStorage.DateTo.month() + 1}/${dateFromStorage.DateTo.date()}/${dateFromStorage.DateTo.year()}`;
		const today = `${(moment()).month() + 1}/${(moment()).date()}/${(moment()).year()}`;
		if (dateFrom === dateTo && dateTo === today) { // If dateFrom===dateTo && periodText not already right
			if (this.periodText !== 'Today') {
				this.periodText = 'Today';
				this.periodTextSubject.next(this.periodText);
			}
		} else if (dateFrom === dateTo) { // If dateFrom===dateTo && notToday && periodText not already right
			if (this.periodText !== `${dateFrom}`) {
				this.periodText = `${dateFrom}`;
				this.periodTextSubject.next(this.periodText);
			}
		} else { // If dateFrom!==dateTo && periodText not already right
			if (this.periodText !== `${dateFrom} - ${dateTo}`) {
				this.periodText = `${dateFrom} - ${dateTo}`;
				this.periodTextSubject.next(this.periodText);
			}
		}
	}

	/**
	 * Encrypt stored collection data.
	 */
	encrypt() {
		if (localStorage.getItem('worklist')) {
			localStorage.removeItem('worklist');
		}
		const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(this.workListCollections), this.authService._generated);
		localStorage.setItem('worklist', ciphertext.toString());
	}

	/**
	 * Creates and formats CollectedLocation.Address from CollectedLocation object.
	 * @param collection Collection object.
	 */
	makeAddress(collection) {
		if (collection.CollectedLocation.AddressLine2 === '') {
			collection.CollectedLocation.Address = collection.CollectedLocation.AddressLine1 + ', ' + collection.CollectedLocation.City + ', ' + collection.CollectedLocation.State + ' ' + collection.CollectedLocation.ZipCode;
		} else {
			collection.CollectedLocation.Address = collection.CollectedLocation.AddressLine1 + ', ' + collection.CollectedLocation.AddressLine2 + ', ' + collection.CollectedLocation.City + ', ' + collection.CollectedLocation.State + ' ' + collection.CollectedLocation.ZipCode;
		}

		if (collection.Patient.AddressLine2 === '') {
			collection.Patient.Address = collection.Patient.AddressLine1 + ', ' + collection.Patient.City + ', ' + collection.Patient.State + ' ' + collection.Patient.ZipCode;
		} else {
			collection.Patient.Address = collection.Patient.AddressLine1 + ', ' + collection.Patient.AddressLine2 + ', ' + collection.Patient.City + ', ' + collection.Patient.State + ' ' + collection.Patient.ZipCode;
		}
	}

	/**
	 * Creates and formats Patient.FullName from Patient object.
	 * @param collection Collection object.
	 */
	makeFullName(collection) {
		collection.Patient.FullName = `${collection.Patient.LastName}, ${collection.Patient.FirstName}`;
	}

	addCollectionStaff(collection) {
		const staff = ['Lab to collect', 'Nurse to collect'];
		let index = collection.DecodedId % 2;
		collection.OrderedTests.forEach(test => {
			test.CollectionStaff = staff[index];
			if (index === 0) {
				index = 1;
			} else {
				index = 0;
			}
		});
	}

	interpretCollectionStaff(collection) {
		collection.OrderedTests.forEach(test => {
			if (this.collectionStaff !== 'Both') {
				if (test.CollectionStaff !== this.collectionStaff) {
					test.IsDisabled = true;
				}
			}
		});
	}

	/**
	 * Processes collections for proper displaying & manipulating.
	 *
	 * Colors, interprets rescheduling, makes addresses, makes full names, and numbers collections.
	 * @param collections Array of Collections.
	 */
	processNewCollections(collections) {
		let count = 0;
		collections.forEach(collection => {
			if (collection.OrderedTests && collection.OrderedTests.length) {
				collection.OrderedTests.forEach(test => {
					test.count = count;
					count++;
				});
			}
			this.decodeId(collection);
			this.groupTests(collection);
			this.interpretCancelled(collection);
			this.markCancelled(collection);
			this.interpretCollected(collection);
			this.markCollected(collection);
			this.markProblemList(collection);
			this.interpretTransferred(collection);
			this.dateAndTimeTests(collection);
			this.makeFullName(collection);
			this.makeAge(collection);
			this.makeAddress(collection);
			this.addCollectionStaff(collection);
			this.interpretCollectionStaff(collection);
		});
	}

	makeAge(collection) {
		if (!collection.Patient.Age) {
			collection.Patient.Age = this.calcAge(collection.Patient.DateOfBirth);
			collection.Patient.DateOfBirth = collection.Patient.DateOfBirth + `(${collection.Patient.Age}y)`;
		}
	}

	interpretCollected(collection) {
		const collectedTests = collection.OrderedTests.filter(test => test.IsCollected);
		collectedTests.forEach(test => {
			test.IsDisabled = true;
		});
	}

	markCollected(collection) {
		const collected = collection.OrderedTests.filter(test => test.IsCollected).length;
		const cancelled = collection.OrderedTests.filter(test => test.IsCancelled).length;
		const all = collection.OrderedTests.length;
		if (collected + cancelled === all) {
			collection.Status = 'Complete';
		}
	}


	interpretTransferred(collection) {
		const transferredToMe = collection.OrderedTests.filter(test => test.IsTransferred && test.TransferredTo.Username === this.currentPhleb.username).length;
		const transferredTests = collection.OrderedTests.filter(test => test.IsTransferred && test.TransferredTo.Username !== this.currentPhleb.username);
		/* transferredTests.forEach(test => {
			test.IsDisabled = true;
		}); */
		if (transferredToMe) {
			collection.IsTransferred = true;
		} else {
			collection.IsTransferred = false;
		}
	}

	interpretCancelled(collection) {
		const collectedTests = collection.OrderedTests.filter(test => test.IsCancelled);
		collectedTests.forEach(test => {
			test.IsDisabled = true;
		});
	}

	markCancelled(collection) {
		const cancelled = collection.OrderedTests.filter(test => test.IsCancelled).length;
		const collected = collection.OrderedTests.filter(test => test.IsCollected).length;
		const all = collection.OrderedTests.length;
		if (cancelled === all && !collected) {
			collection.IsCancelled = true;
		} else {
			collection.IsCancelled = false;
		}
	}

	markProblemList(collection) {
		if (collection.OrderedTests.filter(test => test.IsProblem).length) {
			collection.IsProblem = true;
		} else {
			collection.IsProblem = false;
		}
	}

	dateAndTimeTests(collection) {
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

	decodeId(collection) {
		if (collection.DecodedId === undefined) {
			collection.DecodedId = window.atob(collection.Id);
		}
	}

	/**
	 * Sets a Collection's Priority, ScheduledTime, and ShowColor based on the most urgent OrderedTest.
	 * @param collection Collection object.
	 */
	prioritizeCollection(collection) {
		let priority;
		let priorityShowColor;
		let time;
		collection.OrderedTests.forEach(test => {
			if (priority === undefined || (test.PriorityShowColor === true && priorityShowColor === false) || (this.timeStringToNumber(test.ScheduledTime) < this.timeStringToNumber(time))) {
				if (!test.disabled) {
					priority = test.Priority;
					priorityShowColor = test.PriorityShowColor;
					time = test.ScheduledTime;
				}
			}
		});
		collection.Priority.Description = priority;
		collection.Priority.ShowColor = priorityShowColor;
		collection.ScheduledTime = time;
	}

	copyTestInfo(test, collectionID) {
		return {
			ChargeAmount: test.ChargeAmount,
			Code: test.Id.replace(`${collectionID}_`, ''),
			Description: test.Description,
			Destination: test.Destination,
			LabDepartment: test.LabDepartment,
			Instructions: test.Instructions,
			IsCancelled: test.IsCancelled ? test.IsCancelled : null,
			IsProblem: test.IsProblem ? test.IsProblem : null,
			IsRequested: test.IsRequested ? test.IsRequested : null,
			IsRescheduled: test.IsRescheduled ? test.IsRescheduled : null,
			IsTransferred: test.IsTransferred ? test.IsTransferred : null,
			CancellationReason: test.CancellationReason ? test.CancellationReason : null,
			CancelledBy: test.CancelledBy ? test.CancelledBy : null,
			ProblemReason: test.ProblemReason ? test.ProblemReason : null,
			ReportedBy: test.ReportedBy ? test.ReportedBy : null,
			RescheduleComments: test.RescheduleComments ? test.RescheduleComments : null,
			RescheduledBy: test.RescheduledBy ? test.RescheduledBy : null,
			TransferReason: test.TransferReason ? test.TransferReason : null,
			TransferredBy: test.TransferredBy ? test.TransferredBy : null
		};
	}

	/**
	 * Groups the OrderedTests of a collection based on their ContainedID & LaboratoryAccessionID.
	 *
	 * If tests are grouped together, their Codes are appended to the first to be grouped, along with Volume & Priority.
	 * @param collection Collection object.
	 */
	groupTests(collection) {
		if (!collection.colored) {
			collection.colored = true;
			const collectionID = collection.DecodedId.split('||')[0];
			if (collection.OrderedTests.length) {
				this.sortTests(collection);
				let count = 0;
				let previousAcc = '';
				const previousCIDs = [];
				const testsToDelete = [];
				collection.OrderedTests.forEach(test => {
					test.TestCode = test.Id.replace(`${collectionID}_`, '');
				});
				collection.OrderedTests.forEach(test => {
					if (previousCIDs.find(CID => CID === test.CID) !== undefined) {
						const combineTest = collection.OrderedTests.find(t => t.CID === test.CID);
						combineTest.TestCode = combineTest.TestCode + `, ${test.TestCode}`;
						combineTest.Instructions = combineTest.Instructions + ` - ${test.Instructions}`;
						combineTest.Volume = this.combineVolumes(combineTest.Volume, test.Volume);
						if (!combineTest.OtherIds) {
							combineTest.OtherIds = [];
						}
						if (!combineTest.OtherTests) {
							combineTest.OtherTests = [];
						}
						combineTest.OtherIds.push(test.Id);
						combineTest.OtherTests.push(this.copyTestInfo(test, collectionID));
						test.show = false;
						test.ScheduledTime = combineTest.ScheduledTime;
						test.Priority = combineTest.Priority;
						test.PriorityShowColor = combineTest.PriorityShowColor;
						testsToDelete.push(test);
					} else {
						if (test.LaboratoryAccessionId === previousAcc) {
							count--;
						}
						test.show = true;
						previousAcc = test.LaboratoryAccessionId;
						previousCIDs.push(test.CID);
						count++;
					}
				});
				testsToDelete.forEach(test => {
					collection.OrderedTests.splice(collection.OrderedTests.indexOf(test), 1);
				});
			}
		}
	}

	/**
	 * Sorts the OrderedTests of a Collection by LaboratoryAccessionID, then Container Id.
	 * @param collection Collection object.
	 */
	sortTests(collection) {
		collection.OrderedTests.sort((m, n) => {
			if (m.LaboratoryAccessionId < n.LaboratoryAccessionId) { return -1; }
			if (m.LaboratoryAccessionId > n.LaboratoryAccessionId) { return 1; }
			if (m.CID < n.CID) { return -1; }
			if (m.CID > n.CID) { return 1; }
		});
	}


	/**
	 * Adds the Volumes of two entities, respecting significant figures.
	 * @param ml1 Volume of first entity.
	 * @param ml2 Volume of second entity.
	 */
	combineVolumes(ml1, ml2) {
		if (ml1 !== '' && ml2 !== '') {
			const decimalPlaces1 = ml1.includes('.') ? (ml1.split('ml').join('').split(/\./)[1].length) : 0;
			const decimalPlaces2 = ml2.includes('.') ? (ml2.split('ml').join('').split(/\./)[1].length) : 0;
			const decimalPlaces = Math.max(decimalPlaces1, decimalPlaces2);
			const val1 = parseFloat(ml1.split('ml').join(''));
			const val2 = parseFloat(ml2.split('ml').join(''));
			return (val1 + val2).toFixed(decimalPlaces) + 'ml';
		} else if (ml1 === '') {
			return ml2;
		} else if (ml2 === '') {
			return ml1;
		}
		return '0ml';
	}

	/**
	 * Converts a time duration of form HH:mm to integer mm.
	 * @param timeString String containing time.
	 */
	timeStringToNumber(timeString) {
		return parseInt(timeString.split(':')[0], 10) * 60 + parseInt(timeString.split(':')[1], 10);
	}

	/**
	 * Returns an integer correlating the hex code to brightness perceived by the human eye.
	 *
	 * Values above .6 are considered bright, below are considered dark.
	 * @param hex Hexidecimal string for color (#NNNNNN or #NNN).
	 */
	perceivedBrightness(hex) {
		const rgb = this.hexToRgb(hex);
		return (0.2126 * (rgb.r / 255) + 0.7152 * (rgb.g) / 255 + 0.0722 * (rgb.b / 255));
	}

	/**
	 * Converts hexidecimal string to {r, g, b} object.
	 * @param hex Hexidecimal string for color (#NNNNNN or #NNN).
	 */
	hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	/**
	 * Return the patients array as an Observable.
	 */
	getPatients(): Observable<any> {
		return this.dataSubject.asObservable();
	}

	/**
	 * Return the patientsToDisplay array as an Observable.
	 */
	getAllPatients(): Observable<any> {
		return this.allPatientsSubject.asObservable();
	}

	/**
	 * Initiate manual refresh countdown.
	 */
	startManualRefresh() {
		if (this.canManualRefresh) {
			if (this.manualRefreshSubscription) {
				this.manualRefreshSubscription.unsubscribe();
			}
			this.manualRefreshTimer = timer(this.manualRefreshPeriod);
			this.canManualRefresh = false;
			this.manualRefreshSubject.next(this.canManualRefresh);
			this.manualRefreshSubscription = this.manualRefreshTimer.subscribe(n => {
				this.manualRefreshTimerComplete();
			});
		}
	}

	/**
	 * Resets ability to manual refresh.
	 */
	manualRefreshTimerComplete() {
		this.canManualRefresh = true;
		this.manualRefreshSubject.next(this.canManualRefresh);
	}

	/**
	 * Return the canManualRefresh boolean as an Observable.
	 */
	fnCanManualRefresh() {
		return this.manualRefreshSubject.asObservable();
	}

	/**
	 * Return the canClearSearch boolean as an Observable.
	 */
	fncanClearSearch() {
		return this.canClearSearchSubject.asObservable();
	}

	/**
	 * Update the canClearSearch based on current user's resservations.
	 *
	 * Can not clear the Work List Builder Search if the user has Reserved or Locked collections in their Work List.
	 */
	updateCanClearSearch() {
		this.canClearSearch = true;
		const myCollections = this.patientsToDisplay.filter(patient => (patient.Status === 'Reserved' || patient.Status === 'Locked') && patient.ReservedBy.Username === this.currentPhleb.username);
		if (myCollections.length) {
			this.canClearSearch = false;
		}
		this.canClearSearchSubject.next(this.canClearSearch);
	}

	/**
	 * Begins the autoRefresh countdown based on Collection List settings.
	 */
	autoRefresh() {
		if (this.autoSubscription) {
			this.autoSubscription.unsubscribe();
		}
		let count = 0;
		this.autoSubscription = this.autoRefreshTimer.subscribe(tick => {
			if (this.connectionStatus) {
				count++;
				this.autoUpdate = count;
				this.autoUpdateSubject.next(this.autoUpdate);
			} else {
				console.log(`Offline refresh timer tick.`);
				this.offlineAutoRefresh();
			}
		});
	}

	/**
	 * Returns autoRefreshTimer based on Collection List settings.
	 */
	getAutoRefreshTimer() {
		if (this.autoRefreshTimer === undefined) {
			this.autoRefreshTimer = timer(this.autoRefreshPeriod, this.autoRefreshPeriod);
			this.autoRefreshTimerSubject.next(this.autoRefreshTimer);
		}
		return this.autoUpdateSubject.asObservable();
	}

	/**
	 * Sets WLS value for minimum manual refresh delay.
	 * @param timeString String containing time in format HH:mm.
	 */
	setManualRefreshPeriod(timeString) {
		this.canManualRefresh = true;
		const pieces = timeString.split(':');
		this.manualRefreshPeriod = ((parseInt(pieces[0], 10) * 60) + (parseInt(pieces[1], 10))) * 1000;
	}

	/**
	 * Sets WLS value for minimum automatic refresh delay.
	 * @param timeString String containing time in format HH:mm.
	 */
	setAutoRefreshPeriod(timeString) {
		const pieces = timeString.split(':');
		this.autoRefreshPeriod = ((parseInt(pieces[0], 10) * 60) + (parseInt(pieces[1], 10))) * 1000;
		this.autoRefreshTimer = timer(this.autoRefreshPeriod, this.autoRefreshPeriod);
		this.autoRefresh();
	}

	/**
	 * Sets whether the user is allowed to Problem List a Collection.
	 * @param value Value to set.
	 */
	setProblemListFlag(value: boolean) {
		this.problemListFlag = value;
		this.problemListFlagSubject.next(this.problemListFlag);
	}

	/**
	 * Returns the problemListFlag boolean as an Observable.
	 */
	getProblemListFlag(): Observable<any> {
		return this.problemListFlagSubject.asObservable();
	}

	checkCollectionList(id) {
		this.getCollectionListUpdate(id).subscribe(response => {
			const myUser = response.json().find(user => user.Username === this.currentPhlebObject.Username);
			if (myUser !== undefined) {
				// Delete WL/B
			}
		});
	}

	/**
	 * Extracts the various settings from the current Collection List.
	 */
	extractCollectionListSettings() {
		const clObject = this.getCollectionList();
		this.collectionListLab = clObject.Laboratory.Id;
		this.checkCollectionList(clObject.Id);
		this.setManualRefreshPeriod(clObject.RefreshTimeManual);
		this.setAutoRefreshPeriod(clObject.RefreshTimeAutomatic);
		this.setProblemListFlag(clObject.CanTransferToProblemList);
		this.setSupersede(clObject.ReservationIsSuperseded);
		this.setDisplayLocationAddress(clObject.DisplayCollectionLocation);
		this.setDisplayHomeDrawAddress(clObject.DisplayHomeDrawAddress);
		this.setGroupByLocation(clObject.CanGroupByLocation);
		this.setDisplayBed(clObject.DisplayPatientRoomBed);
		this.authService.updateCleanWorkListSetting(clObject.CleanCollectionListTimer);
		this.setCollectionStaff(clObject.CollectStaff);
		this.setCollectionListPriorities();
		this.getCollectionListLabel(clObject.Id);
		this.signalCollectionListChange();
		this.refreshTransferrableUsers();
	}

	/**
	 * Sets the label to be used for the currently selected Collection List.
	 * @param id Collection List Id.
	 */
	getCollectionListLabel(id) {
		this.getLabelForCollectionList(id).subscribe(response => {
			const labelResponse = response.json();
			this.label.data = window.atob(labelResponse.TemplateFile.Data);
			this.label.pairs = labelResponse.LabelColumnPairs;
			this.getSupportObjectsForLab(this.collectionListLab);
		}, error => {
			console.log(error);
		});
	}

	/**
	 * Notify listeners of a change to the current Collection List.
	 */
	signalCollectionListChange() {
		this.collectionListUpdate = 1;
		this.collectionListUpdateSubject.next(this.collectionListUpdate);
	}

	/**
	 * Returns the collectionListUpdate number as an Observable.
	 */
	getCollectionListChangeFlag(): Observable<any> {
		return this.collectionListUpdateSubject.asObservable();
	}

	refreshCollectionList() {
		const collectionList = this.getCollectionList();
		const hub = this.getHub();
		if (collectionList !== undefined && hub !== undefined) {
			this.getCollectionLists(hub).subscribe(response => {
				this.setCollectionList(response.json().filter(cl => cl.Id === collectionList.Id)[0]);
				this.extractCollectionListSettings();
			}, error => {
				this.utilsService.handle401(error);
			});
		}
	}

	/**
	 * Set current collectionListObject.
	 */
	setCollectionList(obj) {
		(obj !== undefined) ? (this.collectionListObject = JSON.stringify(obj)) : (this.collectionListObject = obj);
	}

	/**
	 * Return current collectionListObject.
	 */
	getCollectionList() {
		return (this.collectionListObject !== undefined) ? (JSON.parse(this.collectionListObject)) : (this.collectionListObject);
	}

	/**
	 * Set current hubObject.
	 */
	setHub(obj) {
		(obj !== undefined) ? (this.hubObject = JSON.stringify(obj)) : (this.hubObject = obj);
	}

	/**
	 * Return current hubObject.
	 */
	getHub() {
		return (this.hubObject !== undefined) ? (JSON.parse(this.hubObject)) : (this.hubObject);
	}

	/**
	 * Set current _filters.
	 */
	setFilter(obj) {
		(obj !== undefined) ? (this.filters = JSON.stringify(obj)) : (this.filters = obj);
	}

	/**
	 * Return current _filters.
	 */
	getFilter() {
		return (this.filters !== undefined) ? (JSON.parse(this.filters)) : (this.filters);
	}

	/**
	 * Set the ability for Phlebs to Reserve other's Phlebs' Reserved Collections.
	 * @param value Value to set.
	 */
	setSupersede(value: boolean) {
		this.supersede = value;
		this.supersedeSubject.next(this.supersede);
	}

	/**
	 * Return the boolean value for the ability for Phlebs to Reserve other's Phlebs' Reserved Collections as an Observable.
	 */
	canSupersede(): Observable<any> {
		return this.supersedeSubject.asObservable();
	}

	setDisplayLocationAddress(value) {
		this.displayLocationAddress = value;
		this.displayLocationAddressSubject.next(this.displayLocationAddress);
	}

	canDisplayLocationAddress() {
		return this.displayLocationAddressSubject.asObservable();
	}

	setDisplayHomeDrawAddress(value) {
		this.displayHomeDrawAddress = value;
		this.displayHomeDrawAddressSubject.next(this.displayHomeDrawAddress);
	}

	canDisplayHomeDrawAddress() {
		return this.displayHomeDrawAddressSubject.asObservable();
	}

	setDisplayBed(val) {
		this.displayBed = val;
		this.displayBedSubject.next(this.displayBed);
	}

	setCollectionListEndTimeNow(value) {
		this.collectPeriodEndTimeNow = value;
	}

	getDisplayBed() {
		return this.displayBedSubject.asObservable();
	}

	setCollectionStaff(val) {
		this.collectionStaff = val;
		this.collectionStaffSubject.next(this.collectionStaff);
	}

	getCollectionStaff() {
		return this.collectionStaffSubject.asObservable();
	}

	setGroupByLocation(val) {
		if (this.groupByLocation === undefined || this.groupByLocation !== val) {
			this.groupByLocation = val;
			this.groupByLocationSubject.next(this.groupByLocation);
		}
	}

	getGroupByLocation() {
		return this.groupByLocationSubject.asObservable();
	}

	setCanDisplayProblemList(value: boolean) {
		this.showProblemList = value;
		this.showProblemListSubject.next(this.showProblemList);
	}

	getCanDisplayProblemList() {
		return this.showProblemListSubject.asObservable();
	}

	/**
	 * Determine whether to show Problem List column based on Search/Filter objects.
	 */
	interpretFilter() {
		const searchFilter = this.getFilter();
		const filter = this.getSearchFilter();

		let parsedSearchFilter;
		let parsedSearchFilterProblemList = '';
		if (searchFilter === undefined) {
			parsedSearchFilter = undefined;
		} else if (typeof (searchFilter) === 'object') {
			parsedSearchFilter = searchFilter;
		} else {
			parsedSearchFilter = JSON.parse(searchFilter);
			if (parsedSearchFilter.Filter) {
				parsedSearchFilterProblemList = parsedSearchFilter.Filter.ProblemList;
			}
		}

		let parsedFilter;
		let parsedFilterProblemList = '';
		if (filter === undefined) {
			parsedFilter = undefined;
		} else if (typeof (filter) === 'object') {
			parsedFilter = filter;
		} else {
			parsedFilter = JSON.parse(filter);
			if (parsedFilter.Filter) {
				parsedFilterProblemList = parsedFilter.Filter.ProblemList;
			}
		}

		if ((parsedSearchFilter !== undefined && parsedSearchFilterProblemList === 'No') || (parsedFilter !== undefined && parsedFilterProblemList === 'No')) {
			this.setCanDisplayProblemList(false);
		} else if ((parsedSearchFilter !== undefined && parsedSearchFilterProblemList === 'Yes') || (parsedFilter !== undefined && parsedFilterProblemList === 'Yes')) {
			this.setCanDisplayProblemList(true);
		} else {
			this.setCanDisplayProblemList(true);
		}
	}

	updateNotificationWorkList() {
		const workListCollection = this.patients.filter(collection => collection.ReservedBy.Username === this.authService.currentUser.username && collection.Status !== 'Available' && collection.Status !== 'Complete');
		this.notificationService.directWorkListUpdate(JSON.parse(JSON.stringify(workListCollection)));
	}

	/**
	 * Set the active priorities associated with the current Collection List.
	 */
	setCollectionListPriorities() {
		this.getPrioritiesForCollectionList(this.getCollectionList().Id).subscribe(response => {
			this.collectionListPriorities = response.json();
			this.processNewCollections(this.patients);
			this.allPatientsSubject.next(this.patients);
			this.updateNotificationWorkList();
			this.workListCollections = this.patients.filter(collection => ((collection.Status === 'Reserved' || collection.Status === 'Locked') && collection.ReservedBy.Username === this.currentPhleb.username));
		}, error => {
			this.utilsService.handle401(error);
		});
	}

	/**
	 * Return the active priorities associated with the current Collection List.
	 */
	getCollectionListPriorities() {
		if (this.collectionListPriorities) {
			return JSON.parse(JSON.stringify(this.collectionListPriorities));
		} else {
			return undefined;
		}
	}

	/**
	 * Reset _patients, _patientsToDisplay & workListCollections
	 */
	filterReset() {
		this.patients = this.patientsToDisplay = this.workListCollections = [];
		this.dataSubject.next(this.patientsToDisplay);
	}

	/**
	 * Reset information used to describe the current state of Filter/Search.
	 */
	emptyFilter() {
		if (this.autoSubscription) {
			this.autoSubscription.unsubscribe();
		}
		this.setHub(undefined);
		this.setCollectionList(undefined);
		this.hubObject = this.collectionListObject = undefined;
		this.searchFilter = this.filters = undefined;
		this.searchObj = undefined;
		this.builderObj = undefined;
		this.collectionListPriorities = undefined;
		this.periodText = undefined;
		this.periodTextSubject.next(this.periodText);
		this.collectionListLab = '';
		this.saveToStorage();
	}

	/**
	 * Set _patientsToDisplay to be the same as _patients.
	 */
	resetToShow() {
		this.patientsToDisplay = this.patients;
	}

	/**
	 * Determines the next Status in the cycle when clicking the Reserve icon.
	 * @param collection Collection object.
	 */
	getStatusToReserve(collection) {
		let status = '';
		if (collection.Status === 'Available' || collection.Status === '') {
			status = 'Reserved';
		} else if (collection.Status === 'Reserved' && collection.ReservedBy.Username === this.currentPhleb.username) {
			status = 'Locked';
		} else if (collection.Status === 'Reserved' && collection.ReservedBy.Username !== this.currentPhleb.username) {
			status = 'Reserved';
		} else if (collection.Status === 'Locked') {
			status = 'Available';
		}
		return status;
	}

	/**
	 * Cycle all Available collections to Reserved.
	 */
	reserveAll() {
		this.resetCleanTime();
		if (this.checkOnlineStatus()) {
			let count = 0;
			const availableArray = this.patientsToDisplay.filter(patient => patient.Status === 'Available' || patient.Status === '');
			const toCount = availableArray.length;
			console.log(`Reserving ${availableArray.length} available collections.`);
			availableArray.forEach(patient => {
				this.reserveCollection(patient.Id, this.getStatusToReserve(patient)).subscribe(response => {
					count++;
					console.log(`Reserved number ${count} of ${toCount}`);
					if (count === toCount) {
						this.getCollectionsByFilter(this.searchObj);
					}
				}, error => {
					this.utilsService.handle401(error);
				});
			});
		} else {
			console.log(`Will reserve all next time you are online...`);
			this.workListAction({ action: 'reserveAll' });
		}
	}

	/**
	 * Set Status of all provided Collections to Reserved.
	 * @param collections Array of Collections.
	 */
	bulkReserve(collections) {
		this.resetCleanTime();
		let count = 0;
		const availableArray = collections.filter(patient => patient.Status === 'Available' || patient.Status === '');
		const toCount = availableArray.length;
		console.log(`Reserving ${availableArray.length} available collections.`);
		availableArray.forEach(patient => {
			this.reserveCollection(patient.Id, this.getStatusToReserve(patient)).subscribe(response => {
				count++;
				console.log(`Reserved number ${count} of ${toCount}`);
				if (count === toCount) {
					this.getCollectionsByFilter(this.searchObj);
				}
			}, error => {
				this.utilsService.handle401(error);
			});
		});
	}

	/**
	 * Cycle all non-Available Collections a step towards being Available.
	 */
	cycleToAvailable() {
		const reservedArray = this.patientsToDisplay.filter(patient => patient.Status === 'Reserved' && patient.ReservedBy.Username === this.currentPhleb.username);
		const lockedArray = this.patientsToDisplay.filter(patient => patient.Status === 'Locked' && patient.ReservedBy.Username === this.currentPhleb.username);
		const totalArray = reservedArray.concat(lockedArray);
		let count = 0;
		const toCount = totalArray.length;
		console.log(`Cycling ${reservedArray.length} reserved collections and ${lockedArray.length} locked collections.`);
		totalArray.forEach(patient => {
			this.reserveCollection(patient.Id, this.getStatusToReserve(patient)).subscribe(response => {
				count++;
				console.log(`Reserved number ${count} of ${toCount}`);
				if (count === toCount) {
					this.getCollectionsByFilter(this.searchObj);
				}
			}, error => {
				this.utilsService.handle401(error);
			});
		});
	}

	/**
	 * Cycle the Status of the provided Collection. Refreshes _patientsToDisplay & _patients afterwards.
	 * @param collection Collection object.
	 */
	cycleReserved(collection) {
		this.resetCleanTime();
		if (this.checkOnlineStatus()) {
			this.reserveCollection(collection.Id, this.getStatusToReserve(collection)).subscribe(response => {
				this.getCollectionsByFilter(this.searchObj);
			}, error => {
				this.utilsService.handle401(error);
			});
		} else {
			console.log(`Will reserve ${collection.Id} next time you are online...`);
			this.workListAction({ action: 'cycleReserved', collection: collection });
			collection.Status = this.getStatusToReserve(collection);
		}
	}

	/**
	 * Cycle the Status of the provided Collection. Refreshes _patients afterwards.
	 * @param collection Collection object.
	 */
	cycleReservedWL(collection) {
		this.resetCleanTime();
		if (this.checkOnlineStatus()) {
			this.reserveCollection(collection.Id, this.getStatusToReserve(collection)).subscribe(response => {
				this.refreshAllCollections(this.builderObj);
			}, error => {
				this.utilsService.handle401(error);
			});
		} else {
			console.log(`Will reserve ${collection.Id} next time you are online...`);
			this.workListAction({ action: 'cycleReservedWL', collection: collection });
			collection.Status = this.getStatusToReserve(collection);
		}
	}

	/**
	 * Returns an array of OrderedTest Id objects for APIs.
	 * @param tests Array of OrderedTests objects.
	 * @param action Array of OrderedTests objects.
	 */
	getActionedTestIds(tests, action) {
		const testsToReturn = [];
		tests.forEach(test => {
			console.log(test, action, test[action]);
			if (test[action]) {
				test.IsDisabled = true;
				testsToReturn.push({ Id: test.Id });
				if (test.OtherIds) {
					test.OtherIds.forEach(otherTest => {
						testsToReturn.push({ Id: otherTest });
					});
				}
			}
		});
		return testsToReturn;
	}

	addToActionQueue(action, collectionId, tests, info) {
		let id = 0;
		const actionQueueLen = this.actionQueue.length;
		if (actionQueueLen) {
			id = this.actionQueue[actionQueueLen - 1].id + 1;
		}
		const actionObject = {
			id: id,
			action: action,
			collectionId: collectionId,
			tests: tests,
			info: info
		};
		console.log(actionObject);
		this.actionQueue.push(actionObject);
		this.updateActionQueueStorage();
	}

	updateActionQueueStorage() {
		if (localStorage.getItem('WLCAQ') !== null) {
			localStorage.removeItem('WLCAQ');
		}
		localStorage.setItem('WLCAQ', JSON.stringify(this.actionQueue));
	}

	loadActionQueueStorage() {
		if (localStorage.getItem('WLCAQ') !== null) {
			this.actionQueue = JSON.parse(localStorage.getItem('WLCAQ'));
		}
	}

	clearActionQueue(id) {
		console.log(id);
		this.actionQueue = this.actionQueue.filter(action => action.collectionId !== id);
		this.updateActionQueueStorage();
	}

	handleActionQueueDone(count, len, completeActions) {
		count++;
		console.log(count, len);
		completeActions.forEach(action => {
			this.actionQueue = this.actionQueue.filter(act => act.id !== action.id);
		});
		this.updateActionQueueStorage();
		this.refreshAllCollections(this.searchObj);
	}

	handleActionQueueObservable(obs, id, completeActions, toDo, count) {
		obs.subscribe(response => {
			if (response.status === 200) {
				completeActions.push(id);
			}
			this.handleActionQueueDone(count, toDo, completeActions);
		}, error => {
			this.utilsService.handle401(error);
			this.handleActionQueueDone(count, toDo, completeActions);
		});
	}

	processActionQueue() {
		if (this.checkOnlineStatus()) {
			const completeActions = [];
			const toDo = this.actionQueue.length;
			let count = 0;
			this.actionQueue.forEach(action => {
				if (action.action === 'transferred') {
					this.handleActionQueueObservable(this.transferTests(action.collectionId, action.tests, action.info.reason, action.info.to, action.info.time), action.id, completeActions, toDo, count);
				} else if (action.action === 'cancelled') {
					this.handleActionQueueObservable(this.cancelTests(action.collectionId, action.tests, action.info.reason, action.info.comments, action.info.time), action.id, completeActions, toDo, count);
				} else if (action.action === 'rescheduled') {
					this.handleActionQueueObservable(this.rescheduleTests(action.collectionId, action.tests, action.info.reason, action.info.to, action.info.time), action.id, completeActions, toDo, count);
				} else if (action.action === 'problemListed') {
					this.handleActionQueueObservable(this.problemListTests(action.collectionId, action.tests, action.info.reason, action.info.time), action.id, completeActions, toDo, count);
				}
			});
		} else {
			this.actionQueue.forEach(action => {
				if (this.offlineActions.length) {
					action.id = this.offlineActions[this.offlineActions.length - 1].id + 1;
				}
				this.offlineActions.push(action);
			});
			this.actionQueue = [];
			this.updateActionQueueStorage();
		}
	}

	checkDone(collection) {
		console.log(`Checking done...`);
		const allTests = collection.OrderedTests.length;
		const disabledTests = collection.OrderedTests.filter(test => test.IsDisabled).length + collection.OrderedTests.filter(test => test['skipped']).length;
		if (allTests === disabledTests && this.transferObject === undefined) {
			this.clearCollectingStorage(collection.Id);
			this.unlockTransferTarget();
			if (this.checkOnlineStatus()) {
				const collectionToUnlock = this.patients.find(coll => coll.Id === collection.Id);
				if (collectionToUnlock !== undefined) {
					collectionToUnlock.Status = 'Available';
					this.allPatientsSubject.next(this.patients);
				}
				this.reserveCollection(collection.Id, 'Available').subscribe(response => {
					if (response.status === 200) {
						console.log(`Successfully released ${collection.Id}.`);
						this.refreshAllCollections(this.searchObj);
					}
				});
			} else {
				collection.Status = 'Available';
				this.workListAction({ action: 'actionOut', collectionId: collection.Id });
				this.allPatientsSubject.next(this.patients);
			}
		} else if (allTests === disabledTests && this.transferObject !== undefined) {
			console.log(`Checking done, there are transferred tests...`);
			this.popTransferStack();
		} else {
			if (this.checkOnlineStatus()) {
				this.refreshAllCollections(this.searchObj);
			}
		}
	}

	clearCollectingStorage(id) {
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			if (parsedStorage.id === id) {
				localStorage.removeItem('workListCollecting');
			}
		}
	}

	lockTransferTarget(user) {
		this.lockedTransferTarget = user;
		this.updateTransferTargetStorage();
		this.refreshTransferrableUsers();
	}

	unlockTransferTarget() {
		this.lockedTransferTarget = '';
		this.updateTransferTargetStorage();
		this.refreshTransferrableUsers();
	}

	pushTransferStack(collectionId, tests, comments, to, time) {
		console.log(`Pushing to transfer stack...`);
		console.log(`Current transferObject:`, this.transferObject);
		if (this.transferObject === undefined) {
			const object = { id: collectionId, OrderedTests: tests };
			object.OrderedTests.forEach(test => {
				test.IsTransferred = true;
				test.TransferComments = comments;
				test.TransferredTo = { Id: to };
				test.TransferTime = time;
			});
			this.transferObject = JSON.parse(JSON.stringify(object));
		} else {
			const tempTests = tests;
			tempTests.forEach(test => {
				test.IsTransferred = true;
				test.TransferComments = comments;
				test.TransferredTo = { Id: to };
				test.TransferTime = time;
				this.transferObject.OrderedTests.push(test);
			});
		}

		if (localStorage.getItem('transferObject') !== null) {
			localStorage.removeItem('transferObject');
			localStorage.setItem('transferObject', JSON.stringify(this.transferObject));
		} else {
			localStorage.setItem('transferObject', JSON.stringify(this.transferObject));
		}
	}

	popTransferStack() {
		if (this.checkOnlineStatus()) {
			if (this.transferObject !== undefined) {
				console.log(`Popping the transfer stack: Online...`);
				console.log(this.transferObject);
				this.transferTestsPreformed(this.transferObject.id, { OrderedTests: this.transferObject.OrderedTests }).subscribe(response => {
					if (response.status === 200) {
						console.log(`${this.transferObject.id} transferred successfully.`);
						this.clearCollectingStorage(this.transferObject.id);
						this.transferObject = undefined;
						this.unlockTransferTarget();
						this.refreshAllCollections(this.searchObj);
					}
				});
			}
		} else {
			console.log(`Popping the transfer stack: Offline...`);
			console.log(this.transferObject);
			this.workListAction({ action: 'transferred', collectionId: this.transferObject.id, object: JSON.stringify(this.transferObject) });
			this.clearCollectingStorage(this.transferObject.id);
			const collectionToRelease = this.patients.find(collection => collection.Id === this.transferObject.id);
			collectionToRelease.Status = 'Available';
			this.allPatientsSubject.next(this.patients);
			this.transferObject = undefined;
		}
		if (localStorage.getItem('transferObject') !== null) {
			localStorage.removeItem('transferObject');
		}
	}

	addToRecentlyChanged(collection) {
		const collected = collection.OrderedTests.filter(test => test.IsCollected).length;
		const cancelled = collection.OrderedTests.filter(test => test.IsCancelled).length;
		const all = collection.OrderedTests.length;
		if ((collected + cancelled) === all) {
			this.recentlyChanged.push(collection.Id);
			this.clearCollectingStorage(collection.Id);
			this.unlockTransferTarget();
		} else {
			this.checkDone(collection);
		}
	}

	/**
	 * Transfers collection.
	 * @param object Transfer object.
	 */
	transferCollection(object) {
		const tests = this.getActionedTestIds(object.collection.OrderedTests, 'transferred');
		const time = moment.utc().format('YYYY-MM-DD HH:mm:ss');
		if (this.checkOnlineStatus()) {
			this.pushTransferStack(object.collection.Id, tests, object.object.comments, object.object.to, time);
			object.collection.OrderedTests.forEach(test => {
				if (test['transferred']) {
					test['transferred'] = false;
					test.IsDisabled = true;
					test.IsTransferred = true;
					test.TransferredBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
				}
			});
			this.lockTransferTarget(object.object.to);
			this.checkDone(object.collection);
			/* this.transferTests(object.collection.Id, tests, object.object.comments, object.object.to).subscribe(response => {
				if (response.status === 200) {
					console.log(`${object.collection.Id} transferred successfully.`);
					object.collection.OrderedTests.forEach(test => {
						if (test['transferred']) {
							test['transferred'] = false;
							test.IsDisabled = true;
							test.IsTransferred = true;
							test.TransferredBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
						}
					});
					this.lockTransferTarget(object.object.to);
					this.checkDone(object.collection);
				}
			}); */
		} else {
			this.pushTransferStack(object.collection.Id, tests, object.object.comments, object.object.to, time);
			object.collection.OrderedTests.forEach(test => {
				if (test['transferred']) {
					test['transferred'] = false;
					test.IsDisabled = true;
					test.IsTransferred = true;
					test.TransferredBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
				}
			});
			this.lockTransferTarget(object.object.to);
			this.checkDone(object.collection);
		}
	}

	/**
	 * Cancels collection.
	 * @param object Cancellation object.
	 */
	cancelCollection(object) {
		const tests = this.getActionedTestIds(object.collection.OrderedTests, 'cancelled');
		const time = moment.utc().format('YYYY-MM-DD HH:mm:ss');
		if (this.checkOnlineStatus()) {
			this.cancelTests(object.collection.Id, tests, object.cancellationObject.reason, object.cancellationObject.comments, time).subscribe(response => {
				if (response.status === 200) {
					console.log(`${object.collection.Id} cancelled successfully.`);
					const cancelledCollection = this.patients.find(collection => collection.Id === object.collection.Id);
					if (cancelledCollection !== undefined) {
						const cancelledTests = object.collection.OrderedTests.filter(test => test['cancelled']).map(test => test.Id);
						const showCancelled = cancelledCollection.OrderedTests.filter(test => cancelledTests.includes(test.Id));
						showCancelled.forEach(test => {
							test['cancelled'] = false;
							test.IsDisabled = true;
							test.IsCancelled = true;
							test.CancelledBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
							test.CancellationReason = object.cancellationObject.reason;
							test.CancellationComments = object.cancellationObject.comments;
						});
						object.collection.OrderedTests.forEach(test => {
							if (test['cancelled']) {
								test['cancelled'] = false;
								test.IsDisabled = true;
								test.IsCancelled = true;
								test.CancelledBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
								test.CancellationReason = object.cancellationObject.reason;
								test.CancellationComments = object.cancellationObject.comments;
							}
						});
						this.interpretCancelled(cancelledCollection);
						this.markCancelled(cancelledCollection);
						this.addToRecentlyChanged(object.collection);
					}
				}
			});
		} else {
			this.workListAction({ action: 'cancelled', tests: tests, collectionId: object.collection.Id, info: { reason: object.cancellationObject.reason, comments: object.cancellationObject.comments, time: time } });
			object.collection.OrderedTests.forEach(test => {
				if (test['cancelled']) {
					test['cancelled'] = false;
					test.IsDisabled = true;
					test.IsCancelled = true;
					test.CancelledBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
					test.CancellationReason = object.cancellationObject.reason;
					test.CancellationComments = object.cancellationObject.comments;
				}
			});
			if (object.collection.OrderedTests.filter(test => test.IsCancelled).length === object.collection.OrderedTests.length) {
				object.collection.IsCancelled = true;
			}
			this.interpretCancelled(object.collection);
			this.markCancelled(object.collection);
			this.addToRecentlyChanged(object.collection);
		}
	}

	completeCollection(collection) {
		const tests = this.getActionedTestIds(collection.OrderedTests, 'checked');
		const time = moment.utc().format('YYYY-MM-DD HH:mm:ss');
		if (this.checkOnlineStatus()) {
			console.log(collection);
			this.completeTests(collection.Id, tests, collection.CollectionInformation, time).subscribe(response => {
				if (response.status === 200) {
					const collectionToComplete = this.patients.find(coll => coll.Id === collection.Id);
					console.log(collectionToComplete);
					console.log(`${collection.Id} successfully completed`);
					if (collectionToComplete !== undefined) {
						const completedTests = collection.OrderedTests.filter(test => test['checked']).map(test => test.Id);
						const showCompleted = collectionToComplete.OrderedTests.filter(test => completedTests.includes(test.Id));
						showCompleted.forEach(test => {
							test.IsDisabled = true;
							test.IsCollected = true;
							test.CollectedBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
						});
						collection.OrderedTests.forEach(test => {
							if (test['checked']) {
								test.IsDisabled = true;
								test.IsCollected = true;
								test.CollectedBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
							}
						});
						this.interpretCollected(collectionToComplete);
						this.markCollected(collectionToComplete);
						this.addToRecentlyChanged(collection);
					}
				}
			});
		} else {
			const collectionToComplete = this.patients.find(coll => coll.Id === collection.Id);
			this.workListAction({ action: 'completeCollect', collectionId: collection.Id, tests: tests, info: { changes: collectionToComplete.CollectionInformation, time: time } });
			collectionToComplete.OrderedTests.forEach(test => {
				if (test['checked']) {
					test.IsDisabled = true;
					test.IsCollected = true;
					test.CollectedBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
				}
			});
			this.interpretCollected(collectionToComplete);
			this.markCollected(collectionToComplete);
			this.addToRecentlyChanged(collectionToComplete);
		}
	}

	/**
	 * Reschedules collection.
	 * @param object Reschedule object.
	 */
	rescheduleCollection(object) {
		const tests = this.getActionedTestIds(object.collection.OrderedTests, 'rescheduled');
		const time = moment.utc().format('YYYY-MM-DD HH:mm:ss');
		console.log(tests);
		if (this.checkOnlineStatus()) {
			this.rescheduleTests(object.collection.Id, tests, object.object.RescheduleReason, object.object.RescheduleDateTime, time).subscribe(response => {
				if (response.status === 200) {
					const rescheduledCollection = this.patients.find(collection => collection.Id === object.collection.Id);
					console.log(rescheduledCollection);
					console.log(`${object.collection.Id} rescheduled successfully.`);
					const rescheduledTests = object.collection.OrderedTests.filter(test => test['rescheduled']).map(test => test.Id);
					const showRescheduled = rescheduledCollection.OrderedTests.filter(test => rescheduledTests.includes(test.Id));
					showRescheduled.forEach(test => {
						test['rescheduled'] = false;
						test.IsDisabled = true;
						test.IsRescheduled = true;
						test.RescheduledBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
						test.RescheduleReason = object.object.RescheduleReason;
						test.RescheduleComments = object.object.RescheduleReason;
					});
					object.collection.OrderedTests.forEach(test => {
						if (test['rescheduled']) {
							test['rescheduled'] = false;
							test.IsDisabled = true;
							test.IsRescheduled = true;
							test.RescheduledBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
							test.RescheduleReason = object.object.RescheduleReason;
							test.RescheduleComments = object.object.RescheduleReason;
						}
					});
					this.checkDone(object.collection);
				}
			});
		} else {
			this.workListAction({ action: 'rescheduled', collectionId: object.collection.Id, tests: tests, info: { reason: object.object.RescheduleReason, to: object.object.RescheduleDateTime, time: time } });
			object.collection.OrderedTests.forEach(test => {
				if (test['rescheduled']) {
					test['rescheduled'] = false;
					test.IsDisabled = true;
					test.IsRescheduled = true;
					test.RescheduledBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
					test.RescheduleReason = object.object.RescheduleReason;
					test.RescheduleComments = object.object.RescheduleReason;
				}
			});
			this.checkDone(object.collection);
		}
	}

	/**
	 * Moves object to problems list.
	 * @param object Problem list object.
	 */
	problemListCollection(object) {
		const tests = this.getActionedTestIds(object.collection.OrderedTests, 'problemListed');
		const time = moment.utc().format('YYYY-MM-DD HH:mm:ss');
		if (this.checkOnlineStatus()) {
			this.problemListTests(object.collection.Id, tests, object.reason, time).subscribe(response => {
				if (response.status === 200) {
					const problemListedCollection = this.patients.find(collection => collection.Id === object.collection.Id);
					console.log(problemListedCollection);
					console.log(`${object.collection.Id} problem listed successfully.`);
					const problemListedTests = object.collection.OrderedTests.filter(test => test['problemListed']).map(test => test.Id);
					const showProblemListed = problemListedCollection.OrderedTests.filter(test => problemListedTests.includes(test.Id));
					showProblemListed.forEach(test => {
						test['problemListed'] = false;
						test.IsDisabled = true;
						test.IsProblem = true;
						test.ReportedBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
						test.ProblemReason = object.reason;
					});
					object.collection.OrderedTests.forEach(test => {
						if (test['problemListed']) {
							test['problemListed'] = false;
							test.IsDisabled = true;
							test.IsProblem = true;
							test.ReportedBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
							test.ProblemReason = object.reason;
						}
					});
					this.checkDone(object.collection);
				}
			});
		} else {
			this.workListAction({ action: 'problemListed', tests: tests, collectionId: object.collection.Id, info: { reason: object.reason, time: time } });
			object.collection.OrderedTests.forEach(test => {
				if (test['problemListed']) {
					test['problemListed'] = false;
					test.IsDisabled = true;
					test.IsProblem = true;
					test.ReportedBy = { FirstName: this.currentPhlebObject.FirstName, LastName: this.currentPhlebObject.LastName, Username: this.currentPhlebObject.Username };
					test.ProblemReason = object.reason;
				}
			});
			this.checkDone(object.collection);
		}
	}

	checkToUnreserve(collection) {
		if (collection.OrderedTests.filter(test => test.IsRescheduled || test.IsTransferred || test.IsProblem).length === collection.OrderedTests.length) {
			collection.Status = 'Available';
			this.allPatientsSubject.next(this.patients);
		}
	}

	/**
	 * Returns true if the collection is reserved by the current user, false otherwise.
	 * @param collection Collection object.
	 */
	checkUser(collection) {
		if (collection.ReservedBy.Username === this.currentPhleb.username) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Returns the first requestee that has not had their request expire.
	 * @param array Array of Requestees.
	 */
	getCurrentRequest(array) {
		return array.find(r => r.RequestedBy === this.currentPhleb.username && !this.hasPast(r.RequestDelayDateTime));
	}

	/**
	 * Returns a string representing the time until the provided Collection's next expiring request.
	 * @param collection Collection object.
	 */
	getRequestTimer(collection) {
		if (collection.Requestees.length) {
			const currentReq = this.getCurrentRequest(collection.Requestees);
			if (currentReq !== undefined) {
				const secondsRemaining = new Date(this.getDifferenceBetweenMoments(this.convertTimezone(moment.utc(currentReq.RequestDelayDateTime), moment.tz.guess()), moment(this.now)));
				if (secondsRemaining.valueOf() > 0) {
					return this.zeroPad(secondsRemaining.getMinutes()) + ':' + this.zeroPad(secondsRemaining.getSeconds());
				}
			}
		}
		return '';
	}

	/**
	 * Returns the difference in ms between the two Moments.
	 * @param mo1 Moment
	 * @param mo2 Moment
	 */
	getDifferenceBetweenMoments(mo1, mo2) {
		return moment.duration(mo2.diff(mo1)) * -1;
	}

	/**
	 * Returns a Moment representing the UTC time of the time provided.
	 * @param time String containing time.
	 */
	getMoment(time) {
		return moment.utc(time);
	}

	/**
	 * Returns a Moment containing the time in the provided timezone.
	 * @param time String/Moment containing time.
	 * @param zone Timezone string.
	 */
	convertTimezone(time, zone) {
		return moment.utc(time).tz(zone).format();
	}

	/**
	 * Returns true if the time has passed, false otherwise.
	 * @param time String containing time.
	 */
	hasPast(time) {
		return ((new Date(time)).valueOf() < (new Date()).valueOf()) ? (true) : (false);
	}

	/**
	 * Returns a string containing the provided time in mm:ss format with padding zeros.
	 * @param datetime String containing the time.
	 */
	formatTime(datetime) {
		const d = new Date(datetime);
		const timeString = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
		return timeString;
	}

	/**
	 * Returns the number zero-padded.
	 * @param number Number.
	 */
	zeroPad(number) {
		if (number < 10) {
			return '0' + number;
		} else {
			return number;
		}
	}

	/**
	 * Returns the difference between the provided date and now in years, rounded down.
	 * @param dateString String containing the date.
	 */
	calcAge(dateString) {
		const birthday = +new Date(dateString);
		// tslint:disable-next-line:no-bitwise
		return ~~((Date.now() - birthday) / (31557600000));
	}

	/**
	 * Sets the _searchFilter.
	 * @param obj Filter object.
	 */
	setSearchFilter(obj) {
		(obj !== undefined) ? this.searchFilter = JSON.stringify(obj) : this.searchFilter = obj;
	}

	/**
	 * Returns the _searchFilter.
	 */
	getSearchFilter() {
		return (this.searchFilter !== undefined) ? (JSON.parse(this.searchFilter)) : this.searchFilter;
	}

	/**
	 * Returns the _searchFilter object as an Observable.
	 */
	getWorkListFilterFlag() {
		return this.workListFilterSubject.asObservable();
	}

	/**
	 * Notifies all _searchFilter listeners of an update.
	 */
	broadcastWorkListFilterUpdate() {
		this.workListFilterSubject.next(0);
	}

	/**
	 * Sets the _workListFilter to the provided object.
	 * @param obj Filter object.
	 */
	setWorkListFilter(obj) {
		this.workListFilter = JSON.stringify(obj);
	}

	/**
	 * Returns _workListFilter.
	 */
	getWorkListFilter() {
		return (this.workListFilter !== undefined) ? (JSON.parse(this.workListFilter)) : (this.workListFilter);
	}

	/**
	 * Returns workListFilterSubject as an Observable.
	 */
	getWorkListResetSubject() {
		return this.workListResetSubject.asObservable();
	}

	/**
	 * Returns periodText string as an Observable.
	 */
	getPeriodText() {
		return this.periodTextSubject.asObservable();
	}

	/**
	 * Loads the workListService object from storage and parses it. (#GSF)
	 */
	loadFromStorage() {
		if (localStorage.getItem('transferObject') !== null) {
			this.transferObject = JSON.parse(localStorage.getItem('transferObject'));
		}
		this.getStoredSearch().subscribe(response => {
			const returnedFilter = response.json();
			console.log(returnedFilter);

			if (!this.savedFilterEmpty(returnedFilter)) {
				const formattedFilter = this.makeFormattedFilter(returnedFilter);
				console.log(formattedFilter);
				this.searchObj = this.builderObj = this.savedSearch = returnedFilter;
				this.setCollectionListEndTimeNow(returnedFilter.Now);
				this.setFilter(formattedFilter);
				this.setSearchFilter(formattedFilter);
				this.interpretFilter();
				this.setCollectionList(returnedFilter.CollectionList);
				this.setHub(returnedFilter.Hub.Id);
				this.getCollectionsByFilter(this.searchObj);
			} else {
				console.log(`The stored filter is empty.`);
			}
		}, error => {
			console.log(`Error loading the stored search.`);
		});

	}

	loadStoredWLB() {
		this.loadActionQueueStorage();
		const storedWL = localStorage.getItem('workListService');
		if (storedWL !== null && this.isFromEarlierDate(JSON.parse(storedWL).storageTime) === false) {
			this.searchObj = this.builderObj = JSON.parse(storedWL).builderObj;
			this.setFilter(JSON.parse(storedWL).filters);
			this.interpretFilter();
			this.setCollectionList(JSON.parse(storedWL).collectionListObject);
			this.setHub(JSON.parse(storedWL).hubObject);
			this.getCollectionsByFilter(this.searchObj);
		}
	}

	loadSavedSearch() {
		this.getStoredSearch().subscribe(response => {
			const returnedFilter = response.json();
			if (!this.savedFilterEmpty(returnedFilter)) {
				const formattedFilter = this.makeFormattedFilter(returnedFilter);
				this.searchObj = this.builderObj = this.savedSearch = returnedFilter;
				this.setCollectionListEndTimeNow(returnedFilter.Now);
				this.setFilter(formattedFilter);
				this.setSearchFilter(formattedFilter);
				this.interpretFilter();
				this.setCollectionList(returnedFilter.CollectionList);
				this.setHub(returnedFilter.Hub.Id);
				this.refreshAllCollections(this.searchObj);
			}
		});
	}

	savedFilterEmpty(object) {
		return Object.keys(object).length === 0 && object.constructor === Object;
	}

	makeFormattedFilter(object) {
		let gender;
		if (object.Patient.Gender) {
			if (object.Patient.Gender === 'M') {
				gender = 'Male';
			} else if (object.Patient.Gender === 'F') {
				gender = 'Female';
			} else {
				gender = '';
			}
		} else {
			gender = '';
		}
		const timeTo = object.Now ? '' : object.TimeTo;
		const formattedFilter = {
			Hub: object.Hub.Id,
			CollectionList: object.CollectionList.Id,
			Filter: {
				AgeRange: {
					lower: object.AgeMin,
					upper: object.AgeMax
				},
				AgeMin: object.AgeMin,
				AgeMax: object.AgeMax,
				DateFrom: object.DateFrom,
				DateTo: object.DateTo,
				TimeFrom: object.TimeFrom,
				TimeTo: timeTo,
				Gender: gender,
				GenderSet: (gender === 'Male' || gender === 'Female'),
				Priority: object.Priority.Id,
				PrioritySet: object.Priority.Id !== '',
				ProblemList: object.ProblemList,
				ProblemListSet: object.ProblemList !== '',
				Location: object.CollectionLocation.Id,
				LocationSet: object.CollectionLocation.Id !== '',
				Status: object.Status,
				ReservedSet: false,
				Now: object.Now,
				SavedAt: object.SavedAt,
				LastAction: object.LastAction
			}
		};
		return formattedFilter;
	}

	/**
	 * Returns true if the provided date string is earlier than now.
	 * @param time Time string.
	 */
	isFromEarlierDate(time): boolean {
		return moment.utc(time).tz(moment.tz.guess()).isBefore(moment(), 'day');
	}

	updateTransferTargetStorage() {
		if (localStorage.getItem('workListService') !== null) {
			const parsedStorage = JSON.parse(localStorage.getItem('workListService'));
			parsedStorage.LockedTransferTarget = this.lockedTransferTarget;
			localStorage.removeItem('workListService');
			localStorage.setItem('workListService', JSON.stringify(parsedStorage));
		}
	}

	/**
	 * Updates the workListService object in localStorage.
	 */
	saveToStorage() {
		this.clearStorage();
		const workListObject = {
			builderObj: this.builderObj,
			filters: this.getFilter(),
			collectionListObject: this.getCollectionList(),
			hubObject: this.getHub(),
			storageTime: moment()
		};
		localStorage.setItem('workListService', JSON.stringify(workListObject));
	}

	/**
	 * Removed the workListService object if it exists.
	 */
	clearStorage() {
		if (localStorage.getItem('workListService') !== null) {
			localStorage.removeItem('workListService');
		}
	}

	/**
	 * Returns true and resets the offline & session timers if connected, returns false otherwise.
	 */
	checkOnlineStatus() {
		if (this.connectionStatus === true) {
			this.authService.resetTimer();
			return true;
		} else {
			return false;
		}
	}

	resetCleanTime() {
		console.log(`Reset clean time.`);
		this.authService.resetWorkListTimers();
	}

	processNotificationChangeLog(changes) {
		this.notificationChanges = [];
		changes.forEach(change => {
			const thisCollection = this.patients.find(collection => collection.Patient.MRN === change.id);
			if (thisCollection !== undefined) {
				const previousEntry = this.notificationChanges.find(notification => notification.Id === thisCollection.Id);
				if (previousEntry !== undefined) {
					previousEntry.columnsChanged.push(change.changed);
				} else {
					this.notificationChanges.push({ Id: thisCollection.Id, columnsChanged: [change.changed] });
				}
			}
		});
	}

}
