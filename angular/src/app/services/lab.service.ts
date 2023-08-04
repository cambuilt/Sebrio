import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class LabService {
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/laboratoryMaintenance/laboratory?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getLabs() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		return this.http.get(this.url);
	}

	getLab(id: string) {
		return this.http.get(this.url.replace('laboratory?', `laboratory/${id}?`));
	}

	createLab(newLab: string) {
		return this.http.post(this.url, newLab);
	}

	updateLab(id: string, updatedLab: string) {
		console.log(updatedLab);
		return this.http.put(this.url.replace('laboratory?', `laboratory/${id}?`), updatedLab);
	}

	deleteLab(id: string) {
		return this.http.delete(this.url.replace('laboratory?', `laboratory/${id}?`));
	}
}
