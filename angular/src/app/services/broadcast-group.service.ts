import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class BroadcastGroupService {
	private _url: string;

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/${(this.authService.currentUser.role as String).toLowerCase().indexOf('tsa') > -1 ? 'tsa' : 'rsa'}/broadcastGroupMaintenance/broadcastGroups?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	getBroadcastGroups() {
		return this.http.get(this.url);
	}

	getTenantBroadcastGroup(id: string) {
		return this.http.get(this.url.replace('broadcastGroups?', `tenantGroup/${id}?`));
	}

	getUserBroadcastGroup(id: string) {
		return this.http.get(this.url.replace('broadcastGroups?', `userGroup/${id}?`));
	}

	createTenantBroadcastGroup(newBroadcastGroup: string) {
		return this.http.post(this.url.replace('broadcastGroups?', `tenantGroup?`), newBroadcastGroup);
	}

	createUserBroadcastGroup(newBroadcastGroup: string) {
		return this.http.post(this.url.replace('broadcastGroups?', `userGroup?`), newBroadcastGroup);
	}

	updateTenantBroadcastGroup(id: string, updatedBroadcastGroup: string) {
		return this.http.put(this.url.replace('broadcastGroups?', `tenantGroup/${id}?`), updatedBroadcastGroup);
	}

	updateUserBroadcastGroup(id: string, updatedBroadcastGroup: string) {
		return this.http.put(this.url.replace('broadcastGroups?', `userGroup/${id}?`), updatedBroadcastGroup);
	}

	deleteTenantBroadcastGroup(id: string) {
		return this.http.delete(this.url.replace('broadcastGroups?', `tenantGroup/${id}?`));
	}

	deleteUserBroadcastGroup(id: string) {
		return this.http.delete(this.url.replace('broadcastGroups?', `userGroup/${id}?`));
	}
}
