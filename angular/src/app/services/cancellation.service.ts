import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class CancellationService {
	private _url: string;

	public cancellationExists = false;

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/cancellationReasonMaintenance/cancellationReason?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	getCancellations() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		return this.http.get(this.url);
	}

	getCancellation(id: string) {
		return this.http.get(this.url.replace('cancellationReason?', `cancellationReason/${id}?`));
	}

	createCancellation(newCancellation: string) {
		return this.http.post(this.url, newCancellation);
	}

	updateCancellation(id: string, updatedCancellation: string) {
		return this.http.put(this.url.replace('cancellationReason?', `cancellationReason/${id}?`), updatedCancellation);
	}

	deleteCancellation(id: string) {
		return this.http.delete(this.url.replace('cancellationReason?', `cancellationReason/${id}?`));
	}
}
