import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class ClientService {
	private _url: string;

	public clientExists = false;

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/clientMaintenance/client?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	getClients() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		return this.http.get(this.url);
	}

	getClient(id: string) {
		return this.http.get(this.url.replace('client?', `client/${id}?`));
	}

	createClient(newClient: string) {
		return this.http.post(this.url, newClient);
	}

	updateClient(id: string, updatedClient: string) {
		return this.http.put(this.url.replace('client?', `client/${id}?`), updatedClient);
	}

	deleteClient(id: string) {
		return this.http.delete(this.url.replace('client?', `client/${id}?`));
	}
}
