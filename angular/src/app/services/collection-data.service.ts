import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject } from '../../../node_modules/rxjs';

@Injectable({
	providedIn: 'root'
})
export class CollectionDataService {
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/utilization/utilization?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	public fakeData = [
		{Username: 'samanthatsa', Code: '1234567', Name: 'Brand, Samantha', Total: 22, Date: '01/04/19'},
		{Username: 'samanthatsa', Code: '1234567', Name: 'Brand, Samantha', Total: 2, Date: '01/05/19'},
		{Username: 'samanthatsa', Code: '1234567', Name: 'Brand, Samantha', Total: 12, Date: '01/06/19'},
		{Username: 'samanthatsa', Code: '1234567', Name: 'Brand, Samantha', Total: 17, Date: '01/07/19'},
		{Username: 'samanthatsa', Code: '1234567', Name: 'Brand, Samantha', Total: 22, Date: '01/08/19'},
		{Username: 'samanthatsa', Code: '1234567', Name: 'Brand, Samantha', Total: 10, Date: '01/09/19'},
		{Username: 'samanthatsa', Code: '1234567', Name: 'Brand, Samantha', Total: 22, Date: '01/10/19'},
		{Username: 'samanthatsa', Code: '1234567', Name: 'Brand, Samantha', Total: 8, Date: '01/11/19'},
		{Username: 'samanthatsa', Code: '1234567', Name: 'Brand, Samantha', Total: 22, Date: '01/12/19'},
		{Username: 'joshtsa', Code: '7373828', Name: 'Jancula, Josh', Total: 9, Date: '01/04/19'},
		{Username: 'joshtsa', Code: '7373828', Name: 'Jancula, Josh', Total: 2, Date: '01/05/19'},
		{Username: 'joshtsa', Code: '7373828', Name: 'Jancula, Josh', Total: 18, Date: '01/06/19'},
		{Username: 'joshtsa', Code: '7373828', Name: 'Jancula, Josh', Total: 17, Date: '01/07/19'},
		{Username: 'joshtsa', Code: '7373828', Name: 'Jancula, Josh', Total: 2, Date: '01/08/19'},
		{Username: 'joshtsa', Code: '7373828', Name: 'Jancula, Josh', Total: 11, Date: '01/09/19'},
		{Username: 'joshtsa', Code: '7373828', Name: 'Jancula, Josh', Total: 21, Date: '01/10/19'},
		{Username: 'joshtsa', Code: '7373828', Name: 'Jancula, Josh', Total: 19, Date: '01/11/19'},
		{Username: 'joshtsa', Code: '7373828', Name: 'Jancula, Josh', Total: 3, Date: '01/12/19'},
		{Username: 'tracetsa', Code: '9282727', Name: 'Birchfield, Trace', Total: 8, Date: '01/04/19'},
		{Username: 'tracetsa', Code: '9282727', Name: 'Birchfield, Trace', Total: 3, Date: '01/05/19'},
		{Username: 'tracetsa', Code: '9282727', Name: 'Birchfield, Trace', Total: 17, Date: '01/06/19'},
		{Username: 'tracetsa', Code: '9282727', Name: 'Birchfield, Trace', Total: 10, Date: '01/07/19'},
		{Username: 'tracetsa', Code: '9282727', Name: 'Birchfield, Trace', Total: 32, Date: '01/08/19'},
		{Username: 'tracetsa', Code: '9282727', Name: 'Birchfield, Trace', Total: 11, Date: '01/09/19'},
		{Username: 'tracetsa', Code: '9282727', Name: 'Birchfield, Trace', Total: 6, Date: '01/10/19'},
		{Username: 'tracetsa', Code: '9282727', Name: 'Birchfield, Trace', Total: 14, Date: '01/11/19'},
		{Username: 'tracetsa', Code: '9282727', Name: 'Birchfield, Trace', Total: 26, Date: '01/12/19'},
	];

	private filteredData = [];
	private collectionData = new BehaviorSubject(this.filteredData);
	filteredDataSubject = this.collectionData.asObservable();

	constructor(private http: Http, private httpClient: HttpClient, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getFakeData(filter) {
		console.log('filter passed to service: ', filter);
		console.log('filter.UTCTimeStamp.dateTo: ', filter.UTCTimeStamp.dateTo);
		// tslint:disable-next-line:prefer-const
		let returnData = [];
		if (filter.Users.length === 0) {
			console.log('Users array was empty');
			// get all entries for the Date passed
			this.fakeData.forEach(item => {
				console.log('item.Date: ', item.Date);
				if (item.Date === filter.UTCTimeStamp.dateTo) {
					returnData.push(item);
				}
			});
		} else {
			console.log('there are users');
			// go thru each user and get all dates that match filter.DateTo
			// tslint:disable-next-line:prefer-const
			this.fakeData.forEach(item => {
				console.log('item.Date: ', item.Date);
				if (item.Date === filter.UTCTimeStamp.dateTo) {
					filter.Users.forEach(user => {
						if (item.Username === user) {
							returnData.push(item);
						}
					});
				}
			});
		}
		console.log('returnData: ', returnData);
		this.filteredData = returnData;
		this.collectionData.next(this.filteredData);
	}

	getData() {
		// This must be set here since sessionToken() could have been null when class was initialized.
		return this.http.get(this.url);
	}

	searchData(filter: string) {
		// This must be set here since sessionToken() could have been null when class was initialized.
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/userMaintenance/utilization?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.http.post(url, filter);
	}

	printData(filter: string) {
		const url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/collectionMaintenance/generateCollectionDataReport?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		return this.httpClient.post(url, filter, { headers: new HttpHeaders({ 'Accept-Language': this.authService.currentUser.language }), responseType: 'arraybuffer' });
	}

}
