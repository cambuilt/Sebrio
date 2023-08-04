import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders, HttpResponse, HttpEventType } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class ImageUploadService {

	private url: string;
	private urlUnauthenticated: string;
	private urlParams: string;

	constructor(private http: Http, private httpClient: HttpClient, private authService: AuthService) {
		this.url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/authenticated/imageMaintenance/image`;
		this.urlUnauthenticated = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/unauthenticated/imageMaintenance/image`;
		this.urlParams = `?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
	}

	saveImage(data: any) {
		return this.httpClient.post(this.url + this.urlParams, data, { reportProgress: true, observe: 'events' as 'events' });
	}

	getImage(id: String) {
		return this.http.get(this.urlUnauthenticated + '/' + id);
	}

	deleteImage(id: String) {
		return this.http.delete(this.url + '/' + id + this.urlParams);
	}

	getImageUrl(imageId): string {
		return `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/image/${imageId}`;
	}
}
