import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ActiveEntitiesService {
	private userStore = [];
	userSubject = new BehaviorSubject(this.userStore);
	users = this.userSubject.asObservable();
	destructionSubscription: any;
	destructionStatus: boolean;

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
		if (window.location.port !== '9876') {
			this.getUsers();
			this.checkDestructionSubject();
		}
	}

	checkDestructionSubject() {
		this.destructionSubscription = this.authService.destroy.subscribe(res => {
			if (res === true) {
				this.userStore = [];
			}
		});
	}

	getUsersSubject() {

	}

	getUsers() {
		if (this.authService.currentUser.role === 'RMP_TSA') {
			this.getActiveUsers().subscribe(response => {
				this.userStore = response.json();
				this.userSubject.next(this.userStore);
			});
		} else {
			this.getRSAUsers().subscribe(response => {
				this.userStore = response.json();
				this.userSubject.next(this.userStore);
			});
		}
	}

	getActiveRoles() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/roleMaintenance/activeRoles?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActiveUsers() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/userMaintenance/activeUsers?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getRSAUsers() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/rsa/userMaintenance/user?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActiveCancellations() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/cancellationReasonMaintenance/activeCancellations?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActiveClients() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/clientMaintenance/activeClients?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActiveCollectionSites() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/collectionSiteMaintenance/activeCollectionSites?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActiveContainers() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/containerMaintenance/activeContainers?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActiveContainersForLab(id) {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com//csp/rmp/tsa/containerMaintenance/laboratoryContainers/${id}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActiveHubs() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/hubMaintenance/activeHubs?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActiveLabs() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/laboratoryMaintenance/activeLaboratories?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActiveLocations() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/locationMaintenance/activeLocations?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActiveProviders() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/providerMaintenance/activeProviders?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActivePriorities() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/priorityMaintenance/activePriorities?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getActiveWorkloads() {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/workloadMaintenance/activeWorkloads?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

	getDefaultCollectionListForLab(labID) {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/laboratoryMaintenance/defaultCollectionList/${labID}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.get(url);
	}

}
