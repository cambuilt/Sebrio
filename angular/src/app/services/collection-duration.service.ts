import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class CollectionDurationService {
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/collectionMaintenance/collectionDuration?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	constructor(private http: Http, private httpClient: HttpClient, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getDurations() {
		return this.http.get(this.url);
	}

	searchDurations(filter: string) {
		return this.http.post(this.url, filter);
	}

	printDurations(filter: string) {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/collectionMaintenance/generateCollectionDurationReport?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.httpClient.post(url, filter, { headers: new HttpHeaders({ 'Accept-Language': this.authService.currentUser.language }), responseType: 'arraybuffer' });
	}

	getCollectionsForTenant() {
		const url = `/csp/rmp/tsa/collectionMaintenance/collection`;
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	getCollectionDetails(collectionId) {
		const url = `/csp/rmp/tsa/collectionMaintenance/collection/${collectionId}`;
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

}
