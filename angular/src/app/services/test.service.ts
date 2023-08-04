import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class TestService {
	public testExists = false;
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/testMaintenance/test?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	constructor(private http: Http, private authService: AuthService) { 
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getTests() {
		return this.http.get(this.url);
	}

	getTest(id: string) {
		return this.http.get(this.url.replace('test?', `test/${id}?`));
	}

	createTest(newTest: string) {
		return this.http.post(this.url, newTest);
	}

	updateTest(id: string, updatedTest: string) {
		return this.http.put(this.url.replace('test?', `test/${id}?`), updatedTest);
	}

	deleteTest(id: string) {
		return this.http.delete(this.url.replace('test?', `test/${id}?`));
	}
}
