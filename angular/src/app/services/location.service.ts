import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class LocationService {
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/locationMaintenance/location?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}
	public locationExists = false;

	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getLocations() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		return this.http.get(this.url);
	}

	getLocation(id: string) {
		return this.http.get(this.url.replace('location?', `location/${id}?`));
	}

	createLocation(newLocation: string) {
		return this.http.post(this.url, newLocation);
	}

	updateLocation(id: string, updatedLocation: string) {
		return this.http.put(this.url.replace('location?', `location/${id}?`), updatedLocation);
	}

	deleteLocation(id: string) {
		return this.http.delete(this.url.replace('location?', `location/${id}?`));
	}
}
