import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class SystemService {
	private url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/systemMaintenance/setting?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;

	constructor(private http: Http, private authService: AuthService) {

	}

	getTenantSettings() {
		this.url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/systemMaintenance/setting?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(this.url);
	}

	getTenantSettingsUnauthenticated() {
		const unAuthUrl = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/unauthenticated/getSubDomainDetails/${this.authService.subdomain}`;
		return this.http.get(unAuthUrl);
	}

	getSubdomainUnauthenticated(sub) {
		const unAuthUrl = `https://${sub}.emylabcollect.com/csp/rmp/unauthenticated/getSubDomainDetails/${sub}`;
		return this.http.get(unAuthUrl);
	}

	setTenantSettings(updatedSettings: string) {
		return this.http.put(this.url, updatedSettings);
	}
}
