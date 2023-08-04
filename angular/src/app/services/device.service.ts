import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';
import { MatDialog } from '@angular/material';

@Injectable({
	providedIn: 'root'
})
export class DeviceService {
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/deviceMaintenance/device?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	constructor(private dialog: MatDialog, private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	 }

	getDevices() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/deviceMaintenance/device?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(this.url);
	}

	getDevice(id: string) {
		return this.http.get(this.url.replace('device?', `device/${id}?`));
	}

	createDevice(newDevice: string) {
		console.log('newDevice: ', JSON.stringify(newDevice));
		return this.http.post(this.url, newDevice);
	}

	updateDevice(id: string, updatedDevice: string) {
		return this.http.put(this.url.replace('device?', `device/${id}?`), updatedDevice);
	}

	deleteDevice(id: string) {
		return this.http.delete(this.url.replace('device?', `device/${id}?`));
	}

	createDeviceMobile(newDevice: string) {
		const unauthenticatedDevice = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/unauthenticated/registerDevice`;
		return this.http.post(unauthenticatedDevice, newDevice);
	}

	postToken(token) {
		const tokenURL = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/unauthenticated/authenticateDeviceToken`;
		return this.http.post(tokenURL, token);
	}
}
