import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from '../../../node_modules/rxjs';

@Injectable({
	providedIn: 'root'
})
export class AuditingService {
	private url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/auditing/auditing?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;

	constructor(private http: Http, private httpClient: HttpClient, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getAuditing() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		this.url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/auditing/auditing?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(this.url);
	}

	getDateCount(filter: string) {
		this.url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/auditing/searchSummaries?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.post(this.url, filter);
	}

	searchAuditing(filter: string) {
		// This must be set here since sessionToken() could have been null when class was initialized.
		this.url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/auditing/searchDetails?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.post(this.url, filter);
	}

	printAuditing(filter: string) {
		this.url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/auditing/generateReport?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.httpClient.post(this.url, filter, { headers: new HttpHeaders({ 'Accept-Language': this.authService.currentUser.language }), responseType: 'arraybuffer' });
	}

}
