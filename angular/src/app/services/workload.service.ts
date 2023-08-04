import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class WorkloadService {

	public workloadExists = false;
	private _url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/workloadMaintenance/workload?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/workloadMaintenance/workload?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getWorkloads() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/workloadMaintenance/workload?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(this.url);
	}

	getWorkload(id: string) {
		return this.http.get(this.url.replace('workload?', `workload/${id}?`));
	}

	createWorkload(newWorkload: string) {
		// This must be set here since the getter isn't setting properly when running the unit test
		this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/workloadMaintenance/workload?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.post(this.url, newWorkload);
	}

	updateWorkload(id: string, updatedWorkload: string) {
		return this.http.put(this.url.replace('workload?', `workload/${id}?`), updatedWorkload);
	}

	deleteWorkload(id: string) {
		return this.http.delete(this.url.replace('workload?', `workload/${id}?`));
	}
}
