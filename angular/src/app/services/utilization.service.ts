import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from '../../../node_modules/rxjs';

@Injectable({
	providedIn: 'root'
})
export class UtilizationService {
	private _url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/utilization/utilization?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/utilization/utilization?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	constructor(private http: Http, private httpClient: HttpClient, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	 }

	getUtilization() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/utilization/utilization?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(this.url);
	}

	searchUtilization(filter: string) {
		// This must be set here since sessionToken() could have been null when class was initialized.
		this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/userMaintenance/utilization?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.post(this.url, filter);
	}

	printUtilization(filter: string) {
		this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/userMaintenance/generateUtilizationReport?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.httpClient.post(this.url, filter, { headers: new HttpHeaders({'Accept-Language' : this.authService.currentUser.language}), responseType: 'arraybuffer' });
	}

}
