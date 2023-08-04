import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { MatDialog } from '@angular/material';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs/Subject';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';


@Injectable({
	providedIn: 'root'
})
export class UserService {

	public userStore = [];
	public userSubject = new Subject();
	users = this.userSubject.asObservable();
	destructionSubscription: any;
	destructionStatus: boolean;
	usernameExists = false;

	constructor(private errorAlert: MatDialog, private http: Http, private authService: AuthService) {
		this.authService.subdomain = this.authService.subdomain.replace('localhost:9876', 'rhodes');
		if (window.location.port !== '9876') {
			this.getUsers();
			this.checkDestructionSubject();
		}
	}

	showError(errorMessage) {
		this.errorAlert.open(ErrorDialogComponent, {
			panelClass: 'err-dialog',
			backdropClass: 'errorOverlay',
			data: errorMessage,
			autoFocus: false
		});
	}

	checkDestructionSubject() {
		this.destructionSubscription = this.authService.destroy.subscribe(res => {
			if (res === true) {
				this.userStore = [];
			}
		});
	}

	getUsers() {
		if (this.authService.currentUser.role === 'RMP_TSA') {
			this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/userMaintenance/user?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`).subscribe(response => {
				if (response.status === 200) {
					this.userStore = response.json();
					this.userSubject.next(this.userStore);
				} else {
					this.showError(`Error ${response.status} retrieving TSA users.`);
				}
			}, error => {
				this.showError(`Error retrieving TSA users: ${error.statusText}, error ${error.status}`);
			});
		} else {
			console.log('getUsers called');
			this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/rsa/userMaintenance/user?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`).subscribe(response => {
				if (response.status === 200) {
					this.userStore = response.json();
					this.userSubject.next(this.userStore);
				} else {
					this.showError(`Error ${response.status} retrieving RSA users.`);
				}
			}, error => {
				this.showError(`Error retrieving RSA users: ${error.statusText}, error ${error.status}`);
			});
		}
	}

	getUser(username: string) {
		if (this.authService.currentUser.role === 'RMP_TSA') {
			return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/userMaintenance/user/${username}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
		} else {
			console.log('getUser called');
			return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/rsa/userMaintenance/user/${username}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
		}
	}

	createUser(newUser: string) {
		if (this.authService.currentUser.role === 'RMP_TSA') {
			return this.http.post(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/userMaintenance/user?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, newUser);
		} else {
			return this.http.post(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/rsa/userMaintenance/user?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, newUser);
		}
	}

	updateUser(username: string, updatedUser: string) {
		if (this.authService.currentUser.role === 'RMP_TSA') {
			return this.http.put(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/userMaintenance/user/${username}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, updatedUser);
		} else {
			console.log('updateUser called');
			return this.http.put(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/rsa/userMaintenance/user/${username}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, updatedUser);
		}
	}

	deleteUser(username: string) {
		if (this.authService.currentUser.role === 'RMP_TSA') {
			return this.http.delete(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/tenantUsers/${username}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
		} else {
			return this.http.delete(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/rsa/userMaintenance/user/${username}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
		}
	}

	getUserModes() {
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com/csp/rmp/tsa/userMaintenance/userMode?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	getUniqueRoles() {
		const uniqueRoles = [];
		this.userStore.map(user => user.Role.Name).forEach(role => {
			if (uniqueRoles.indexOf(role) === -1) {
				uniqueRoles.push(role);
			}
		});
		uniqueRoles.sort().splice(0, 0, 'All');
		return uniqueRoles;
	}

	filterUsers(filter, columns) {
		console.log('filter for users: ', filter);
		console.log('columns passed to users: ', columns);
		let filterStore = this.userStore;
		console.log(filterStore, filter);
		Object.keys(filter).forEach(key => {
			if (filter[key] !== '') {
				const dropdown = columns.filter(obj => obj.name === key)[0].dropdown;
				if (dropdown === true) {
					if (key === 'Role') {
						if (filter[key] !== 'All') {
							filterStore = filterStore.filter(row => (row[key].Name === filter[key]));
						}
					} else if (key === 'IsActive') {
						if (filter[key] === 'Active') {
							filterStore = filterStore.filter(row => (row[key] === true));
						} else {
							filterStore = filterStore.filter(row => (row[key] === false));
						}
					} else {
						filterStore = filterStore.filter(row => (row[key] === filter[key]));
					}
				} else {
					if (key === 'Phone') {
						filterStore = filterStore.filter(row => (row['PhoneNumber'].indexOf(filter[key]) > -1));
					} else {
						filterStore = filterStore.filter(row => (row[key].toLowerCase().indexOf(filter[key].toLowerCase()) > -1));
					}
				}
			}
		});
		return filterStore;
		/* this.userSubject.next(filterStore); */
	}
}
