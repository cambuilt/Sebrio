import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class CollectionListService {
	private _url: string;

	get url() {
		if (!this._url) {
			this._url = `https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/collectionListMaintenance/collection?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`;
		}
		return this._url;
	}

	public collectionExists = false;
	public collectionList: any;
	public collectionListFields: any;
	constructor(private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
	}

	getCollectionLists() {
		return this.http.get(this.url);
	}

	getCollectionListUsers(id: string) {
		return this.http.get(this.url.replace('collection?', `collectionUsers/${id}?`));
	}

	getCollectionList(id: string) {
		return this.http.get(this.url.replace('collection?', `collection/${id}?`));
	}

	createCollectionList(newCollectionList: string) {
		return this.http.post(this.url, newCollectionList);
	}

	updateCollectionList(id: string, updatedCollectionList: string) {
		return this.http.put(this.url.replace('collection?', `collection/${id}?`), updatedCollectionList);
	}

	deleteCollectionList(id: string) {
		return this.http.delete(this.url.replace('collection?', `collection/${id}?`));
	}

	loadCollectionList(object, fields) {
		this.collectionList = object;
		this.collectionListFields = undefined;
		fields.forEach(c => {
			const controlObj = {
				id: c.id,
				control: c.control,
				valueAcc: c.control.valueAccessor,
				element: c.control.valueAccessor._elementRef,
				nativeElement: c.control.valueAccessor._elementRef.nativeElement
			};
		});
		this.collectionListFields = fields;

	}

	refreshCollectionPeriodValid() {
		this.collectionListFields.find(field => field.id === 'endTime').control.control.updateValueAndValidity();
		this.collectionListFields.find(field => field.id === 'endDays').control.control.updateValueAndValidity();
	}

	generateValidationErrors(valid, message) {
		return {
			isValid: valid,
			message: {
				'message': message
			}
		};
	}

	validateCollectionPeriod(field) {
		if (this.collectionList !== undefined) {
			const cl = this.collectionList;
			const startDays = this.fieldsToNumber(cl.CollectionPeriodStartSelect, cl.CollectionPeriodStartDays);
			const startTime = cl.CollectionPeriodStartTime;
			const endDays = this.fieldsToNumber(cl.CollectionPeriodEndSelect, cl.CollectionPeriodEndDays);
			const endTime = cl.CollectionPeriodEndTime;
			if (field === 'endTimeField') {
				if ((startDays === endDays)) {
					if (startTime > endTime) {
						return this.generateValidationErrors(false, 'End time must be after Start time.');
					}
				}
			} else if (field === 'endDaysField') {
				if (startDays > endDays) {
					return this.generateValidationErrors(false, 'Days to must be after Days from.');
				}
			}
		}
		return this.generateValidationErrors(true, '');
	}

	fieldsToNumber(select, days) {
		let sign;
		let number;
		sign = select;
		if (days === '') {
			number = 0;
		} else {
			number = days;
		}
		return (parseInt(sign + number, 10));
	}

}
