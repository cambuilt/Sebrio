import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class ProviderService {
	public providerExists = false;
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/providerMaintenance/provider?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getProviders() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		return this.http.get(this.url);
	}

	getProvider(id: string) {
		return this.http.get(this.url.replace('provider?', `provider/${id}?`));
	}

	createProvider(newProvider: string) {
		return this.http.post(this.url, newProvider);
	}

	updateProvider(id: string, updatedProvider: string) {
		return this.http.put(this.url.replace('provider?', `provider/${id}?`), updatedProvider);
	}

	deleteProvider(id: string) {
		return this.http.delete(this.url.replace('provider?', `provider/${id}?`));
	}
}
