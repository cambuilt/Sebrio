import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class LabelService {

	public labelExists = false;
	private url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/labelMaintenance/label?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
	// public displayKeysLength = 0;
	// public fileSelected = false;

	constructor(private http: Http, private authService: AuthService) { }

	getLabels(criteria: string) {
		// This must be set here since sessionToken() could have been null when class was initialized.
		this.url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/labelMaintenance/searchLabel?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.post(this.url, criteria);
	}

	getLabel(id: string) {
		return this.http.get(this.url.replace('label?', `label/${id}?`));
	}

	getKey() {
		const keyURL = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/labelMaintenance/desktopKey?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(keyURL);
	}

	createLabel(newLabel: string) {
		return this.http.post(this.url, newLabel);
	}

	updateLabel(id: string, updatedLabel: string) {
		console.log(JSON.stringify(updatedLabel));
		return this.http.put(this.url.replace('label?', `label/${id}?`), updatedLabel);
	}

	deleteLabel(id: string) {
		return this.http.delete(this.url.replace('label?', `label/${id}?`));
	}
}
