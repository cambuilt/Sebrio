import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class TenantService {
	private url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/rsa/tenantMaintenance/tenant?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
	public subdomain = '';
	constructor(private http: Http, private authService: AuthService) {

	}

	getTenants() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		this.url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/rsa/tenantMaintenance/tenant?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(this.url);
	}

	getTenant(id: string) {
		return this.http.get(this.url.replace('tenant?', `tenant/${id}?`));
	}

	createTenant(newTenant: string) {
		return this.http.post(this.url, newTenant);
	}

	updateTenant(id: string, updatedTenant: string) {
		return this.http.put(this.url.replace('tenant?', `tenant/${id}?`), updatedTenant);
	}

	deleteTenant(id: string) {
		return this.http.delete(this.url.replace('tenant?', `tenant/${id}?`));
	}
}
