import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

export interface Message {
	author: string;
	IsBroadcast: boolean;
	message: string;
	timestamp: string;
}

@Injectable({
	providedIn: 'root'
})
export class MessagingService implements OnDestroy, OnInit {
	private messageStore: any = [];
	private messageSubject = new BehaviorSubject(this.messageStore);
	messages = this.messageSubject.asObservable();
	private _mysocket: any;
	public unreadMessages = [];
	public messageIdsMarkedAsRead = [];
	logoutSubscription: any;
	public socketConnected = false;
	online = true;
	destructionSubscription: any;
	destructionStatus: boolean;


	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
		this.getLogout();
		this.checkDestructionSubject();
		this.authService.status.subscribe(res => {
			this.online = res;
		});
	}

	ngOnInit() {

	}

	checkDestructionSubject() {
		this.destructionSubscription = this.authService.destroy.subscribe(res => {
			if (res === true) {
				this.messageStore = [];
			}
		});
	}

	get mysocket() {
		if (this.authService._isLoggedIn === true) {
			if (!this._mysocket) {
				if (this.online === true) {
					const urlRole = this.authService.currentUser.role === 'RMP_TSA' ? 'TSA' : 'RSA';
					this._mysocket = new WebSocket(`wss://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/ws/Rhodes.RMP.${urlRole}User.WebSocketController.cls?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, 'chat');
					console.log('opening socket...');
					this._mysocket.onopen = (event) => {
						console.log('connected to socket');
						this.socketConnected = true;
					};

					this._mysocket.onmessage = (event) => {
						// console.log('Got message! event is ', event);
						if (event.data === 'ERROR') {
							console.log('onmessage error.', event);
						} else {
							this.messageStore = JSON.parse(event.data);
							this.messageSubject.next(this.messageStore);
						}
					};

					this._mysocket.onerror = (event) => {
						console.log('WebSocket error:', event);
					};

					this._mysocket.onclose = (event) => {
						console.log('event on close is ', event);
						this.socketConnected = false;
						if (event) {
							console.log('connection was closed: ', event.code);
							this._mysocket = undefined;
							// this.authService.logout();
						} else {
							this._mysocket = undefined;
							// this.authService.logout();
							console.log('connection was closed');
						}
					};
				}
			}
			return this._mysocket;
		}
	}

	getLogout() {
		if (this.logoutSubscription) {
			this.logoutSubscription.unsubscribe();
		}
		this.logoutSubscription = this.authService.getLogoutFlag().subscribe(response => {
			if (response === 0) {
				console.log('Logged out.');
				this.disconnectSocket();
			}
		});
	}

	sendToSocket(data) {
		if (this.online === true) {
			try {
				console.log('sent to socket:', JSON.stringify(data));
				if (this.mysocket.readyState === 0) {
					setTimeout(() => this.sendToSocket(data), 1000);
				} else {
					this.mysocket.send(JSON.stringify(data) + String.fromCharCode(3));
				}
			} catch (error) {
				console.log('socket send error:', error.message);
				setTimeout(() => this.sendToSocket(data), 1000);
			}
		}
	}

	disconnectSocket() {
		if (this._mysocket) {
			this._mysocket.close();
		}
		this._mysocket = undefined;
		this.socketConnected = false;
	}

	ngOnDestroy() {
		console.log('ngOnDestroy was called for messaging service.');
		if (this.logoutSubscription) {
			this.logoutSubscription.unsubscribe();
		}
	}

	sendToUserBroadcastGroup(id: string, message: string) {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/${(this.authService.currentUser.role as String).toLowerCase().indexOf('tsa') > -1 ? 'tsa' : 'rsa'}/messaging/sendToUserGroup/${id}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.post(url, message);
	}

	sendToTenantBroadcastGroup(id: string, message: string) {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/${(this.authService.currentUser.role as String).toLowerCase().indexOf('tsa') > -1 ? 'tsa' : 'rsa'}/messaging/sendToTenantGroup/${id}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.post(url, message);
	}

	getMessageHistory() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/${(this.authService.currentUser.role as String).toLowerCase().indexOf('tsa') > -1 ? 'tsa' : 'rsa'}/messaging/getMessageHistory?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}
}
