import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class ContainerService {
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/containerMaintenance/container?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}
	public containerExists = false;

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getContainers() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		return this.http.get(this.url);
	}

	getContainer(id: string) {
		return this.http.get(this.url.replace('container?', `container/${id}?`));
	}

	createContainer(newContainer: string) {
		return this.http.post(this.url, newContainer);
	}

	updateContainer(id: string, updatedContainer: string) {
		return this.http.put(this.url.replace('container?', `container/${id}?`), updatedContainer);
	}

	deleteContainer(id: string) {
		return this.http.delete(this.url.replace('container?', `container/${id}?`));
	}
}
