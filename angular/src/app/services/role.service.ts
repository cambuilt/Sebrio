import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class RoleService {
	private _url: string;

	get url() {
		this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/roleMaintenance/role?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this._url;
	}

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getRoles() {
		return this.http.get(this.url);
	}

	getActiveRoles() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		return this.http.get(this.url.replace('role?', 'activeRoles?'));
	}

	getRole(roleId: string) {
		return this.http.get(this.url.replace('role?', `role/${roleId}?`));
	}

	getRolePermissions(tenantId: string) {
		return this.http.get(this.url.replace('roleMaintenance/role?', `roleMaintenance/permissions?`));
	}

	getAuthenticationFactors() {
		return this.http.get(this.url.replace('roleMaintenance/role?', `roleMaintenance/authenticationFactors?`));
	}

	createRole(newRole: string) {
		return this.http.post(this.url, newRole);
	}

	updateRole(roleId: string, updatedRole: string) {
		return this.http.put(this.url.replace('role?', `role/${roleId}?`), updatedRole);
	}

	deleteRole(id: string) {
		return this.http.delete(this.url.replace('role?', `role/${id}?`));
	}

}
