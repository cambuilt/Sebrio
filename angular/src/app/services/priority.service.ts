import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class PriorityService {
	public priorityExists = false;
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/priorityMaintenance/priority?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getPriorities() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		return this.http.get(this.url);
	}

	getPriority(id: string) {
		return this.http.get(this.url.replace('priority?', `priority/${id}?`));
	}

	createPriority(newPriority: string) {
		return this.http.post(this.url, newPriority);
	}

	updatePriority(id: string, updatedPriority: string) {
		return this.http.put(this.url.replace('priority?', `priority/${id}?`), updatedPriority);
	}

	deletePriority(id: string) {
		return this.http.delete(this.url.replace('priority?', `priority/${id}?`));
	}
}
