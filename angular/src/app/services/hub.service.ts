import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class HubService {
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/hubMaintenance/hub?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getHubs() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		return this.http.get(this.url);
	}

	getHub(id: string) {
		return this.http.get(this.url.replace('hub?', `hub/${id}?`));
	}

	createHub(newHub: string) {
		return this.http.post(this.url, newHub);
	}

	updateHub(id: string, updatedHub: string) {
		return this.http.put(this.url.replace('hub?', `hub/${id}?`), updatedHub);
	}

	deleteHub(id: string) {
		return this.http.delete(this.url.replace('hub?', `hub/${id}?`));
	}
}
