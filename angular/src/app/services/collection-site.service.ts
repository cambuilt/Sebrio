import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class CollectionSiteService {
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/collectionSiteMaintenance/collectionSite?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	public siteExists = false;

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getCollectionSites() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		return this.http.get(this.url);
	}

	getCollectionSite(id: string) {
		return this.http.get(this.url.replace('collectionSite?', `collectionSite/${id}?`));
	}

	createCollectionSite(newCollectionSite: string) {
		return this.http.post(this.url, newCollectionSite);
	}

	updateCollectionSite(id: string, updatedCollectionSite: string) {
		return this.http.put(this.url.replace('collectionSite?', `collectionSite/${id}?`), updatedCollectionSite);
	}

	deleteCollectionSite(id: string) {
		return this.http.delete(this.url.replace('collectionSite?', `collectionSite/${id}?`));
	}
}
