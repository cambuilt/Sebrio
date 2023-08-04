import { Http, RequestOptions, Headers } from '@angular/http';
import { Injectable, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';
import { fromEvent } from 'rxjs';
import { MatPaginatorIntl, MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

@Injectable({
	providedIn: 'root'
})

export class AuthService implements OnInit {
	public lastKnownPrinter = '';
	private _needsPwdUpdate = false;
	private _subdomain = '';
	private _currentUser = { username: null, name: null, email: null, avatarURL: null, role: null, sessionToken: null, tenantId: null, encodedCredentials: null, currentPage: null, landingPage: null, permissions: [], language: null };
	public language = 'en';
	public countryCode = 'US';
	public currencyCode = 'USD';
	public logoutSubject = new BehaviorSubject(2);
	public displayKeysLength = 0;
	public fileSelected = false;
	public _generated = '';
	// public _sessionTimer = 900;
	public _sessionTimer = moment().add(15, 'minutes');
	public _isLoggedIn = false;
	// public _offlineTimer = 900;
	public _offlineTimer = moment().add(15, 'minutes');
	private _sessionInterval: any;
	private _offlineInterval: any;
	public _cleanWorkListSetting: any;
	public _workListTimer: any;
	private _workListInterval: any;
	public cleanWorkList = false;
	public cleanWorkListSubject = new BehaviorSubject(this.cleanWorkList);
	public activateWorkList = false;
	public activateWorkListSubject = new BehaviorSubject(this.activateWorkList);
	public manualLogout = false;
	public _connectionStatus = true;
	public connectionSubject = new BehaviorSubject(this._connectionStatus);
	status = this.connectionSubject.asObservable();
	mouseSubscribe: Subscription;
	clickSubscribe: Subscription;
	public _destroyData = false;
	public destructionSubject = new BehaviorSubject(this._destroyData);
	destroy = this.destructionSubject.asObservable();

	constructor(public bluetoothSerial: BluetoothSerial, private http: Http, private router: Router, private errorAlert: MatDialog) {
		this.checkOnline();
		this.generate();
		if (localStorage.getItem('token')) {
			this._isLoggedIn = true;
		}
		// setTimeout(() => this.disabledSelect(), 5000);
	}

	ngOnInit() {
		setTimeout(() => this.disabledSelect(), 1000);
	}

	checkOnline() {
		window.addEventListener('online', (e) => {
			this._connectionStatus = true;
			this.connectionSubject.next(this._connectionStatus);
			this.checkSavedWL();
			if (moment().isAfter(this._sessionTimer)) {
				this.logout();
			}
			clearInterval(this._offlineInterval);
			this._offlineTimer = moment().add(15, 'minutes');
			this.startMouseSub();
		}, true);
		window.addEventListener('offline', (e) => {
			console.log('Offline');
			this._connectionStatus = false;
			this.connectionSubject.next(this._connectionStatus);
			this.startMouseSub();
			this.startMouseTimer(this._sessionTimer);
		}, true);
	}

	disabledSelect() {
		const inp: HTMLInputElement = document.querySelector('#codeField');
		inp.addEventListener('select', (event) => {
			console.log('select event should be firing....');
			console.log('select event: ', event);
			event.returnValue = false;
			inp.selectionEnd = 0;
			inp.selectionStart = 0;
			inp.setSelectionRange(0, 0, 'none');
			event.preventDefault();
			inp.selectionStart = inp.selectionEnd;
			inp.click();
			inp.blur();
		}, false);
	}

	// checkRouter() {
	// 	if (this.router.routerState.snapshot.url !== '/') {
	// 		document.querySelector('.poweredBy').classList.add('show');
	// 		document.querySelector('.eMyLabCollect').classList.add('show');
	// 	}
	// }

	startMouseSub() {
		if (this._connectionStatus === false) {
			this.mouseSubscribe = fromEvent(document, 'mousemove').subscribe(e => { this.startMouseTimer(this._sessionTimer); });
			this.clickSubscribe = fromEvent(document, 'click').subscribe(e => { this.startMouseTimer(this._sessionTimer); });
		} else {
			if (this.mouseSubscribe) {
				this.mouseSubscribe.unsubscribe();
			} else if (this.clickSubscribe) {
				this.clickSubscribe.unsubscribe();
			}
		}
	}

	startCountDown() {
		this._sessionInterval = setInterval(() => this.beginSessionTimer(), 60000);
	}

	beginSessionTimer() {
		if (moment().isAfter(this._sessionTimer)) {
			console.log('session expired timer is.... ', this._sessionTimer);
			clearInterval(this._sessionInterval);
			this._sessionTimer = moment().add(15, 'minutes');
			if (this._connectionStatus === true) {
				console.log('session tracker triggered logout');
				this.logout();
			} else {
				console.log('session timer expired but we are in offline mode tracking user actions still. If user comes back online within ', this._offlineTimer, ' seconds they will remain logged in. Otherwise they will be logged out');
			}
		}
	}

	startMouseTimer(int) {
		if (this._offlineInterval !== undefined) {
			console.log('mouse event fired');
			clearInterval(this._offlineInterval);
			this._offlineTimer = int;
		}
		this._offlineInterval = setInterval(() => this.beginMouseTimer(), 60000);
	}

	beginMouseTimer() {
		if (moment().isAfter(this._offlineTimer)) {
			console.log('offline timer triggered logout');
			this.logout();
		}
	}

	resetTimer() {
		clearInterval(this._sessionInterval);
		clearInterval(this._offlineInterval);
		this._offlineTimer = moment().add(15, 'minutes');
		this._sessionTimer = moment().add(15, 'minutes');
		this.startCountDown();
	}

	startWorkListTimer() {
		if (this._workListInterval !== undefined) {
			clearInterval(this._workListInterval);
			this._workListInterval = undefined;
		}
		if (this._cleanWorkListSetting !== undefined) {
			if (this._workListTimer === undefined) {
				this._workListTimer = moment().add(this._cleanWorkListSetting, 'seconds');
			}

			this._workListInterval = setInterval(() => {
				this.displayCleanWLTick();
				if (this._workListTimer !== undefined) {
					if (moment().isAfter(this._workListTimer)) {
						this.cleanWorkList = true;
						this.cleanWorkListSubject.next(this.cleanWorkList);
						clearInterval(this._workListInterval);
						this._workListInterval = undefined;
					}
				} else {
					clearInterval(this._workListInterval);
					this._workListInterval = undefined;
				}
			}, 60000);
		} else {
			this._workListTimer = undefined;
		}
	}

	displayCleanWLTick() {
		const secondsToWipe = this._workListTimer.diff(moment(), 'seconds');
		console.log(`Work List will be cleaned in ${Math.floor(secondsToWipe / 60)} minutes, ${secondsToWipe % 60} seconds`);
	}

	resetWorkListTimers() {
		this._workListTimer = undefined;
		this.startWorkListTimer();
	}

	updateCleanWorkListSetting(value) {
		if (typeof (value) === 'string') {
			const time = value.split(':').map(times => parseInt(times, 10));
			const dur = moment.duration(time[0], 'hours').add(time[1], 'minutes');
			if (this._cleanWorkListSetting !== undefined && this._cleanWorkListSetting !== dur.asSeconds()) {
				/* console.log(`Clean work list setting changed from ${this._cleanWorkListSetting} to ${dur.asSeconds()}.`); */
				const difference = dur.asSeconds() - this._cleanWorkListSetting;
				const remaining = this._workListTimer.diff(moment(), 'seconds');
				const newTimer = remaining + difference;
				/* console.log(`Difference is ${Math.floor(difference / 60)} minutes, ${difference % 60} seconds and there are currently ${Math.floor(this._workListTimer.diff(moment(), 'seconds') / 60)} minutes, ${this._workListTimer.diff(moment(), 'seconds') % 60} seconds remaining.`); */
				if (newTimer <= 0) {
					/* console.log(`This change would have set the timer to less than or equal to zero, cleaning Work List...`); */
					this.cleanWorkList = true;
					this._cleanWorkListSetting = undefined;
					this._workListTimer = undefined;
					clearInterval(this._workListInterval);
					this._workListInterval = undefined;
					this.cleanWorkListSubject.next(this.cleanWorkList);
				} else {
					/* console.log(`CleanWorkList timer will now expire in ${Math.floor(newTimer / 60)} minutes, ${newTimer % 60} seconds.`); */
					this._cleanWorkListSetting = dur.asSeconds();
					this._workListTimer = this._workListTimer.add(difference, 'seconds');
					/* console.log(`Check: ${newTimer} === ${this._workListTimer.diff(moment(), 'seconds')}`); */
				}
			} else if (this._cleanWorkListSetting === undefined) {
				this._cleanWorkListSetting = dur.asSeconds();
				if (this._workListInterval === undefined) {
					/* console.log(`Interval undefined, starting timer.`); */
					this.checkLastAction();
				}
			}
		} else {
			this._cleanWorkListSetting = undefined;
		}
	}

	checkLastAction() {
		const url = `/csp/rmp/tsa/workListMaintenance/savedFilters`;
		this.http.get(`https://${this.subdomain === '' ? '' : this.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.sessionToken()}&CSPSHARE=1`).subscribe(response => {
			const beLastAction = response.json().LastAction;
			const lsLastAction = localStorage.getItem('workListLastAction') !== null ? localStorage.getItem('workListLastAction') : undefined;
			const beElapsed = moment().diff(moment(beLastAction), 'seconds');
			const lsElapsed = lsLastAction !== undefined ? moment().diff(moment(lsLastAction), 'seconds') : null;
			const elapsed = Math.min(beElapsed, lsElapsed);
			/* console.log(`Checking BE-stored LastAction: ${beLastAction}`);
			console.log(`Checking LS-stored LastAction: ${lsLastAction}`); */
			console.log(`Checking BE-elapsed LastAction: ${beElapsed}`);
			console.log(`Checking LS-elapsed LastAction: ${lsElapsed}`);
			console.log(`Elapsed: ${elapsed}`);
			console.log(`Clean setting: ${this._cleanWorkListSetting}`);
			if (elapsed >= this._cleanWorkListSetting) {
				console.log(`Time elapsed greater than WL expire time, cleaning WL.`);
				this.cleanWorkList = true;
				this.cleanWorkListSubject.next(this.cleanWorkList);

			} else {
				if (lsElapsed < beElapsed) {
					const updatedFilter = response.json();
					console.log(response.json());
					console.log(`Updating BE to LS LastAction: ${lsLastAction}`);
					updatedFilter.LastAction = lsLastAction;
					const url2 = `/csp/rmp/tsa/workListMaintenance/save`;
					return this.http.post(`https://${this.subdomain === '' ? '' : this.subdomain + '.'}emylabcollect.com${url2}?CSPCHD=${this.sessionToken()}&CSPSHARE=1`, updatedFilter).subscribe(resp => {
						if (resp.status === 200) {
							console.log(`BE updated.`);
							this._workListTimer = moment().add((this._cleanWorkListSetting - elapsed), 'seconds');
							console.log(`Reactivating WL...`);
							this.activateWorkList = true;
							this.activateWorkListSubject.next(this.activateWorkList);
							this.startWorkListTimer();
						}
					});
				} else {
					this._workListTimer = moment().add((this._cleanWorkListSetting - elapsed), 'seconds');
					console.log(`Reactivating WL...`);
					this.activateWorkList = true;
					this.activateWorkListSubject.next(this.activateWorkList);
					this.startWorkListTimer();
				}
			}
		}, error => {
			console.log(error);
		});
	}

	checkSavedWL() {
		console.log(`Going online from being previously offline. Deactivating WL updates...`);
		this.activateWorkList = false;
		this.activateWorkListSubject.next(this.activateWorkList);
		this.checkLastAction();
	}

	getWorkListClean() {
		return this.cleanWorkListSubject.asObservable();
	}

	workListCleaned() {
		this.cleanWorkList = false;
		this.cleanWorkListSubject.next(this.cleanWorkList);
		this.activateWorkList = true;
		this.activateWorkListSubject.next(this.activateWorkList);
	}

	getUserAccountStatus(username: string, password: string) {
		this.currentUser.encodedCredentials = window.btoa(`${username}:${password}`);
		const headers = new Headers();
		headers.append('Authorization', `Basic ${this.currentUser.encodedCredentials}`);
		const options = new RequestOptions({ headers: headers, withCredentials: true });
		const credentials = { Username: username, Password: password };
		return this.http.post(`https://${this.subdomain === '' ? '' : this.subdomain + '.'}emylabcollect.com/csp/rmp/unauthenticated/getUserAccountStatus`, JSON.stringify(credentials));
	}

	login(urlRole: string, username: string, password: string, token: string, auth: string) {
		if (!this._currentUser.name) {
			if (localStorage.getItem('currentUser')) {
				const data = localStorage.getItem('currentUser');
				this._currentUser = JSON.parse(data);
			} else {
				this._currentUser = { username: null, name: null, email: null, avatarURL: null, role: null, sessionToken: null, tenantId: null, encodedCredentials: null, currentPage: null, landingPage: null, permissions: [], language: null };
			}
		}
		this.startCountDown();
		this.manualLogout = false;
		if (document.querySelector('.eMyLabCollect')) { document.querySelector('.eMyLabCollect').classList.add('show'); }
		if (document.querySelector('.poweredBy')) { document.querySelector('.poweredBy').classList.add('show'); }
		const authParam = auth ? `&Auth=${auth}` : '&Auth=a';
		return this.http.get(`https://${this.subdomain === '' ? '' : this.subdomain + '.'}emylabcollect.com/csp/rmp/${urlRole}/login?CacheUserName=${username}&CachePassword=${password}&JWT=${token}${authParam}`);
	}

	get currentUser() {
		if (!this._currentUser.name) {
			if (localStorage.getItem('currentUser')) {
				const data = localStorage.getItem('currentUser');
				this._currentUser = JSON.parse(data);
			} else {
				this._currentUser = { username: null, name: null, email: null, avatarURL: null, role: null, sessionToken: null, tenantId: null, encodedCredentials: null, currentPage: null, landingPage: null, permissions: [], language: null };
			}
		}

		return this._currentUser;
	}

	generate() {
		let d = '';
		const x = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		for (let i = 0; i < 20; i++) {
			const b = Math.floor(Math.random() * 25);
			const c = x[b];
			d += c;
		}
		this._generated = d;
	}


	lookupNeedsPwdUpdate(credentials: string) {
		this.getAccountStatus(credentials).subscribe(res => {
			const status = res.json();
			if (status.ChangePasswordRequired === true) {
				this.needsPwdUpdate = true;
			}
		}, error => {
			console.log(`Verify password update error...`);
		});
	}

	get subdomain() {
		if (this._subdomain === '') {
			if (location.href.split('/')[2].split('.')[0] === 'localhost:4200' || location.href.split('/')[2].split('.')[0] === 'emylabcollect') {
				this._subdomain = 'rhodes';
			} else {
				this._subdomain = location.href.split('/')[2].split('.')[0];
			}
		}

		return this._subdomain;
	}

	set subdomain(subdomain: string) {
		this._subdomain = subdomain;
	}

	get needsPwdUpdate() {
		return this._needsPwdUpdate;
	}

	set needsPwdUpdate(needsPwdUpdate: boolean) {
		this._needsPwdUpdate = needsPwdUpdate;
	}

	// public sessionToken() {
	// 	let token;
	// 	if (this.currentUser.sessionToken === null) {
	// 		const item = localStorage.getItem('token');
	// 		const decrypt = CryptoJS.AES.decrypt(item, this.currentUser.role);
	// 		token = CryptoJS.enc.Utf8.stringify(decrypt);
	// 	} else {
	// 		const item = this.currentUser.sessionToken;
	// 		const decrypt = CryptoJS.AES.decrypt(item, this.currentUser.role);
	// 		token = CryptoJS.enc.Utf8.stringify(decrypt);
	// 	}
	// 	 return token;
	// }

	public sessionToken() {
		if (this.currentUser.sessionToken === null) {
			this.currentUser.sessionToken = localStorage.getItem('token');
		}
		return this.currentUser.sessionToken;
	}


	logout() {
		const urlRole = this.currentUser.role === 'RMP_TSA' ? 'tsa' : 'rsa';
		const url = `https://${this.subdomain === '' ? '' : this.subdomain + '.'}emylabcollect.com/csp/rmp/${urlRole}/logout?CSPCHD=${this.sessionToken()}&CSPSHARE=1`;
		localStorage.removeItem('token');
		localStorage.removeItem('token');
		clearInterval(this._sessionInterval);
		clearInterval(this._offlineInterval);
		this._offlineTimer = moment().add(15, 'minutes');
		this._sessionTimer = moment().add(15, 'minutes');
		this._isLoggedIn = false;
		this.logoutSubject.next(0);
		this.router.navigate(['/'], {});
		// this.disconnectSocket();
		return this.http.get(url);
	}

	getLogoutFlag() {
		return this.logoutSubject.asObservable();
	}

	setCurrentPage(page: string) {
		this._currentUser.currentPage = page;
	}

	testMessage() {
		return 'testing';
	}

	getAccountStatus(credentials: string) {
		const url = `https://${this.subdomain === '' ? '' : this.subdomain + '.'}emylabcollect.com/csp/rmp/unauthenticated/getUserAccountStatus?CSPCHD=${this.sessionToken()}&CSPSHARE=1`;
		return this.http.post(url, credentials);
	}

	changePassword(updatedPassword: string) {
		const url = `https://${this.subdomain === '' ? '' : this.subdomain + '.'}emylabcollect.com/csp/rmp/unauthenticated/changePassword?CSPCHD=${this.sessionToken()}&CSPSHARE=1`;
		return this.http.put(url, updatedPassword);
	}

	updateProfile(updates: string) {
		const urlRole = this.currentUser.role === 'RMP_TSA' ? 'tsa' : 'rsa';
		const url = `https://${this.subdomain === '' ? '' : this.subdomain + '.'}emylabcollect.com/csp/rmp/${urlRole}/profile?CSPCHD=${this.sessionToken()}&CSPSHARE=1`;
		console.log('url for saving profile ', url);
		return this.http.put(url, updates);
	}

	getIpAddress() {
		return this.http
			.get('https://api.ipify.org')
			.map(response => response || {});
	}

	showError(errorMessage) {
		this.errorAlert.open(ErrorDialogComponent, {
			panelClass: 'err-dialog',
			backdropClass: 'errorOverlay',
			data: errorMessage,
			autoFocus: false
		});
	}
}

export class LocalizedPaginator extends MatPaginatorIntl {
	of = 'of';

	constructor() {
		super();
		const authService = new AuthService(null, null, null, null);
		const poweredBy = document.querySelector('.poweredBy');
		if (authService.currentUser.language === 'fr') {
			this.itemsPerPageLabel = 'objets par page';
			this.of = 'de';
			poweredBy.innerHTML = 'Alimenté par';
		} else if (authService.currentUser.language === 'en') {
			this.itemsPerPageLabel = 'Items per page';
			this.of = 'of';
			poweredBy.innerHTML = 'Powered by';
		}
	}

	getRangeLabel = function (page, pageSize, length) {
		if (length === 0 || pageSize === 0) {
			return `0 ${this.of} ${length}`;
		}
		length = Math.max(length, 0);
		const startIndex = page * pageSize;
		// If the start index exceeds the list length, do not try and fix the end index to the end.
		const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
		return `${startIndex + 1} - ${endIndex} ${this.of} ${length}`;
	};
}
