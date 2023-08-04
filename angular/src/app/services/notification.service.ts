import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';
import { MessagingService } from './messaging.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	notifications: any;
	users = [
		{ name: 'Samantha', avatarURL: 'https://res.cloudinary.com/sebrio-cdn/image/upload/v1536927996/qzxnjq1xvy2vzu6atdy6.jpg' },
		{ name: 'Cameron Conway', avatarURL: 'https://res.cloudinary.com/sebrio-cdn/image/upload/v1535904718/wftwq9dfac7abxvx4keo.png' },
		{ name: 'Sarah Brown', avatarURL: 'https://res.cloudinary.com/sebrio-cdn/image/upload/v1533816848/unb1dvbgxqwao7tplpsy.jpg' },
	];

	workList = [];
	workListSubject = new BehaviorSubject(this.workList);

	workListChangeLog = [];
	workListChangeLogSubject = new BehaviorSubject(this.workListChangeLog);
	workListCollection: any;
	workListCollectionSubject = new BehaviorSubject(this.workListCollection);

	collectionMaintenanceCollection: any;
	collectionMaintenanceCollectionSubject = new BehaviorSubject(this.collectionMaintenanceCollection);

	newRecordID: any;
	newRecordIDSubject = new BehaviorSubject(this.newRecordID);

	constructor(private router: Router, private authService: AuthService, private messagingService: MessagingService, private http: Http) {
		this.generateNotifications();
		this.getWorkList();
	}

	transferCollectionToUser(username, collectionId) {
		const object = { Status: 'Reserved', TransferredTo: { Id: username } };
		const url = `/csp/rmp/tsa/workListMaintenance/transfer/${collectionId}`;
		return this.http.post(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, object);
	}

	getStoredSearch() {
		const url = `/csp/rmp/tsa/workListMaintenance/savedFilters`;
		return this.http.get(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`);
	}

	getCollectionsByFilter(filter) {
		const url = `/csp/rmp/tsa/workListMaintenance/worklist`;
		return this.http.post(`https://${this.authService.subdomain === '' ? '' : this.authService.subdomain + '.'}emylabcollect.com${url}?CSPCHD=${this.authService.sessionToken()}&CSPSHARE=1`, filter);
	}

	deleteNotification(id) {
		this.messagingService.sendToSocket({ Action: 'DeleteNotifications', NotificationIds: [id] });
	}

	deleteNotifications(ids) {
		this.messagingService.sendToSocket({ Action: 'DeleteNotifications', NotificationIds: ids });
	}

	getWorkList() {
		this.getStoredSearch().subscribe(response => {
			if (response.json().Hub !== undefined) {
				this.getCollectionsByFilter(response.json()).subscribe(collectionsResponse => {
					const myWorkList = [];
					const myCollections = collectionsResponse.json().filter(collection => collection.ReservedBy.Username === this.authService.currentUser.username && collection.Status !== 'Available');
					myCollections.forEach(collection => {
						const completedTests = collection.OrderedTests.filter(test => test.IsCollected).length;
						const cancelledTests = collection.OrderedTests.filter(test => test.IsCancelled).length;
						const allTests = collection.OrderedTests.length;
						if (!(completedTests + cancelledTests === allTests)) {
							myWorkList.push(collection);
						}
					});
					this.workList = myWorkList.map(collection => window.atob(collection.Id));
					this.workListSubject.next(this.workList);
				});
			}
		});
	}

	directWorkListUpdate(workList) {
		this.workList = workList.map(collection => window.atob(collection.Id));
		this.workListSubject.next(this.workList);
	}

	generateNotifications() {
		let data;
		this.notifications = [];

		this.notifications.push({
			NotificationType: 'COLLECTIONUPDATE',
			CreatedDateTime: '2019-02-14 11:41:21',
			EntityId: '51020363',
			Message: 'Location',
			Patient: 'TEST GAVIN, JAMES',
			Id: 100
		});
		this.notifications.push({
			NotificationType: 'COLLECTIONUPDATE',
			CreatedDateTime: '2019-02-14 11:42:21',
			EntityId: '51020360',
			Message: 'Priority',
			Patient: 'TEST, ALYSSA',
			Id: 101
		});
	}

	getNotifications() {
		return this.notifications;
	}

	subscribeToMessages() {
		// need to get new messages and unread messages in here to push to notifications array
		// need to
	}

	getMessages() {
		console.log('getNotifications returns', this.getNotifications());
		return (this.getNotifications().filter(notification => notification.type === 'message'));
	}

	getMessagesUnread() {
		return (this.getMessages().filter(notification => notification.read === false));
	}

	getCollections() {
		return (this.getNotifications().filter(notification => notification.NotificationType === 'COLLECTIONUPDATE'));
	}

	getCollectionsUnread() {
		return (this.getCollections().filter(notification => notification.read === false));
	}

	getRequests() {
		return (this.getNotifications().filter(notification => notification.type === 'request'));
	}

	haveUnread() {
		const len = this.notifications.filter(notification => notification.read === false).length;
		// len.forEach(n => {
		// 	for (let i = 0; i < len.length; i++) {
		// 		if (len[i].from.name === n.from.name) {
		// 			len.slice(i);
		// 		}
		// 	}
		// });
		return (len > 0);
	}

	clickMessage(message) {
		console.log('settings message to read: ', message);
		this.notifications.filter(notification => notification.id === message.id)[0].read = true;
		console.log(this.notifications);
		this.notifications = this.notifications.slice();
	}

	makeDateInPast(minutesAgo) {
		const d = new Date();
		d.setMinutes(d.getMinutes() - minutesAgo);
		return d;
	}

	getMinutesAgo(datetime) {
		return Math.floor((new Date().valueOf() - datetime.valueOf()) / 1000 / 60);
	}

	updateWorkListChanges(notifications) {
		this.workListChangeLog = notifications;
		this.workListChangeLogSubject.next(this.workListChangeLog);
	}

	getWorkListChanges() {
		return this.workListChangeLogSubject.asObservable();
	}

	transferToWorkList(collection) {
		console.log(`Transferring to work list for collection ${collection.EntityId}`);
		this.workListCollection = collection.EntityId;
		this.workListCollectionSubject.next(this.workListCollection);
		this.router.navigate(['work-list'], {});
		this.authService.currentUser.currentPage = 'work-list';
	}

	getWorkListCollection() {
		return this.workListCollectionSubject.asObservable();
	}

	transferToCollectionMaintenance(collection) {
		console.log(`Transferring to collection maintenance for collection ${collection.collectionId}`);
		this.collectionMaintenanceCollection = collection.collectionId;
		this.collectionMaintenanceCollectionSubject.next(this.collectionMaintenanceCollection);
		this.router.navigate(['collection-maintenance'], {});
		this.authService.currentUser.currentPage = 'collection-maintenance';
	}

	transferTo(screen, record) {
		this.newRecordID = record;
		this.newRecordIDSubject.next(this.newRecordID);
		this.router.navigate([screen], {});
		this.authService.currentUser.currentPage = screen;
	}

	getNewRecordTransferID() {
		return this.newRecordIDSubject.asObservable();
	}

	clearNewRecordTransferID() {
		this.newRecordID = undefined;
		this.newRecordIDSubject.next(this.newRecordID);
	}
}
