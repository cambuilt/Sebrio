import { Component, OnInit, HostListener, Output, EventEmitter, ViewChild } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { TranslationService } from 'angular-l10n';
import { MessagingService } from '../services/messaging.service';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { UserService } from '../services/user.service';
import * as moment from 'moment';
import 'moment-timezone';
import { MessagingChatComponent } from '../messaging-chat/messaging-chat.component';
import { WorkListService } from '../services/work-list.service';

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onBroadcast = new EventEmitter();
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onMessageClick = new EventEmitter();
	@ViewChild('messagingChat') messagingChat: MessagingChatComponent;
	showNotificationsPopup = false;
	messagesExpanded = false;
	collectionsExpanded = false;
	requestsExpanded = false;
	newRecordsExpanded = false;
	currentWindowWidth: any;
	isReadBroadcasts = [];
	minutesAgoSinceMostRecentMessage = -1;
	timeSinceLastMessage = '';
	hoursSinceLastMessage = -1;
	minutesSinceLastMessage = -1;
	messageSenders = [];
	messageSenderCount = '';
	tzOffset = 0;

	workListSubscription: any;

	dummyNotifications = [];

	allNotifications = [];

	collectionNotifications = [];
	requestNotifications = [];
	newRecordNotifications = [];

	constructor(public messagingService: MessagingService, private authService: AuthService, private notificationService: NotificationService, public translation: TranslationService, private userService: UserService, public utilsService: UtilsService) { }

	ngOnInit() {
		const socket = this.messagingService.mysocket;
		const moment_tz = require('moment-timezone');
		this.tzOffset = parseInt(moment_tz().tz(moment_tz.tz.guess()).format('Z'), 10);
		this.currentWindowWidth = window.innerWidth;

		this.messagingService.getMessageHistory().subscribe(response => {
			const messages = response.json();
			this.checkIncomingMessages(messages);
		});

		this.messagingService.messages.subscribe(response => {
			if (this.areMessages(response)) {
				this.checkIncomingMessages(response);
			}
			if (this.areNotifications(response)) {
				this.saveAllNotification(response);
				this.sortOutRequests(response);
				this.sortOutCollectionUpdates();
				this.sortOutNewRecordUpdates(response);
			}
		}, error => {
			console.log('Error getting message: ' + error.message);
		});
	}

	saveAllNotification(response) {
		if (response.length && JSON.stringify(response.map(msg => msg.Id)) !== JSON.stringify(this.allNotifications.map(msg => msg.Id))) {
			this.allNotifications = response;
			console.log(this.allNotifications);
		}
	}

	areMessages(messages) {
		return (messages.length && messages[0].MessageText) ? true : false;
	}

	areNotifications(messages) {
		return (messages.length && messages[0].EntityId) ? true : false;
	}

	sortOutRequests(messages) {
		const tempMessages = [];
		messages.forEach(message => {
			if (message.NotificationType === 'COLLECTIONREQUEST') {
				const tempMessage = JSON.parse(JSON.stringify(message));
				const entityArray = window.atob(tempMessage.EntityId).split('||');
				const messageArray = tempMessage.Message.replace('Patient: ', '').replace('TSA:', '').split('.');
				const requestingUser = this.userService.userStore.find(user => user.Username === entityArray[1]);
				tempMessage.collectionId = entityArray[0];
				tempMessage.display = {
					Reason: '',
					from: {
						FullName: `${requestingUser.FirstName} ${requestingUser.LastName}`,
						avatarURL: requestingUser.AvatarURL
					},
					Patient: {
						Name: messageArray[0],
						Collection: entityArray[0]
					},
					toTSA: messageArray[1]
				};
				tempMessages.push(tempMessage);
			}
		});
		if (JSON.stringify(tempMessages.map(message => message.Id)) !== JSON.stringify(this.requestNotifications.map(message => message.Id))) {
			this.requestNotifications = tempMessages;
			console.log(this.requestNotifications);
		}
	}

	sortOutCollectionUpdates() {
		if (this.workListSubscription) {
			this.workListSubscription.unsubscribe();
		}
		this.workListSubscription = this.notificationService.workListSubject.asObservable().subscribe(resp => {
			const tempMessages = [];
			this.notificationService.getCollections().forEach(message => {
				if (message.NotificationType === 'COLLECTIONUPDATE') {
					if (this.notificationService.workList.includes(message.EntityId)) {
						const tempMessage = JSON.parse(JSON.stringify(message));
						tempMessage.display = {
							message: `${tempMessage.Patient} - ${tempMessage.EntityId}`,
							changed: tempMessage.Message
						};
						tempMessages.push(tempMessage);
					}
				}
			});
			if (JSON.stringify(tempMessages.map(message => message.Id)) !== JSON.stringify(this.collectionNotifications.map(message => message.Id))) {
				this.collectionNotifications = tempMessages;
				this.notificationService.updateWorkListChanges(this.getWorkListChanges(this.collectionNotifications));
				console.log(this.collectionNotifications);
			}
		});
	}

	getWorkListChanges(notifications) {
		const changes = [];
		notifications.forEach(notification => {
			const change = {
				id: notification.EntityId,
				changed: notification.Message
			};
			changes.push(change);
		});
		return changes;
	}

	sortOutNewRecordUpdates(messages) {
		const tempMessages = [];
		const canEditLocations = this.authService.currentUser.permissions.find(code => code.Code === 'rmp_locationmaintenance') !== undefined;
		const canEditTests = this.authService.currentUser.permissions.find(code => code.Code === 'rmp_testmaintenance') !== undefined;
		const canEditPriorities = this.authService.currentUser.permissions.find(code => code.Code === 'rmp_prioritymaintenance') !== undefined;
		const canEditContainers = this.authService.currentUser.permissions.find(code => code.Code === 'rmp_containermaintenance') !== undefined;
		const updateTypes = ['LOCATION', 'TEST', 'PRIORITY', 'CONTAINER'];
		const formattedTypes = ['Location', 'Test', 'Priority', 'Container'];
		const typePermissions = [canEditLocations, canEditTests, canEditPriorities, canEditContainers];
		messages.forEach(message => {
			if (updateTypes.includes(message.NotificationType) && typePermissions[updateTypes.indexOf(message.NotificationType)]) {
				const tempMessage = JSON.parse(JSON.stringify(message));
				tempMessage.display = {
					message: `${formattedTypes[updateTypes.indexOf(tempMessage.NotificationType)]} - ${tempMessage.EntityId}`
				};
				tempMessages.push(tempMessage);
			}
		});
		if (JSON.stringify(tempMessages.map(message => message.Id)) !== JSON.stringify(this.newRecordNotifications.map(message => message.Id))) {
			this.newRecordNotifications = tempMessages;
			console.log(this.newRecordNotifications);
		}
	}

	@HostListener('window:resize') onResize() {
		this.currentWindowWidth = window.innerWidth;
	}

	clickMessage(message) {
		if (this.utilsService.checkOnlineStatus()) {
			this.closeNotifications();
			this.userService.getUser(message.FromUser.Username).subscribe(response => {
				const user = response.json();
				this.onMessageClick.emit(user);
			});

			//  this.messagingChat.show('Private', user);
			// 	this.notificationService.clickMessage(message);
			// 	this.checkToClose();
			// 	const socketMessage = { id: message.id, Read: true };
			// 	this.messageingService.updateStatus(socketMessage);
		}
	}

	clickOrder(collection) {
		this.notificationService.transferToWorkList(collection);
		this.collectionNotifications = this.collectionNotifications.filter(notification => notification.Id !== collection.Id);
	}

	clickRequest(event, request) {
		if (!(event.target.className.includes('mat-button'))) {
			if (this.authService.currentUser.permissions.find(code => code.Code === 'rmp_collectionmaintenance') !== undefined) {
				this.notificationService.transferToCollectionMaintenance(request);
			} else if (this.authService.currentUser.permissions.find(code => code.Code === 'rmp_worklistmaintenance') !== undefined) {
				this.notificationService.transferToWorkList(request);
			}
		}
	}

	transfer(request) {
		event.preventDefault();
		console.log(`Transferring: `, request);
		const transferTo = request.SentBy;
		this.notificationService.transferCollectionToUser(transferTo, request.collectionId).subscribe(response => {
			console.log(response);
		});
	}

	reject(request) {
		console.log(`Rejecting: `, request);
		const notificationId = request.Id;
		/* this.messagingService.sendToSocket({ Action: 'SetMessageRead', NotificationIds: [request.Id] }); */
	}

	clickNewRecord(record) {
		switch (record.NotificationType) {
			case 'LOCATION':
				this.notificationService.transferTo('locations', record);
				break;
			case 'TEST':
				this.notificationService.transferTo('tests', record);
				break;
			case 'PRIORITY':
				this.notificationService.transferTo('priorities', record);
				break;
			case 'CONTAINER':
				this.notificationService.transferTo('containers', record);
				break;
			default:
				break;
		}
	}

	getTimeAgo(time) {
		const dateTimeMoment = moment.utc(time, 'YYYY-MM-DD HH:mm:ss').local();
		return Math.floor(moment.duration(moment().diff(dateTimeMoment)).asMinutes());
	}

	checkIncomingMessages(messages) {
		try {
			let broadcastShown = false;
			const currentUsername = this.authService.currentUser.username;
			let minutesAgo = 100000;

			messages.forEach(message => {
				const toUsername = message.ToUser ? message.ToUser.Username : '';
				if (message.IsBroadcast === true && broadcastShown === false) {
					if (message.IsRead === false && toUsername === currentUsername && message.FromUser.Username !== currentUsername && !this.isReadBroadcasts.find(id => id === message.Id)) {
						this.onBroadcast.emit(message);
						this.isReadBroadcasts.push(message.Id);
						broadcastShown = true;
					}
				} else if (message.IsBroadcast === false && toUsername === currentUsername) {
					let timestampDate = new Date(message.Timestamp);
					let offsetDate = new Date(new Date(timestampDate).setHours(timestampDate.getHours() + this.tzOffset));
					const dateTime = moment(offsetDate);
					const diff = moment().diff(dateTime, 'minutes');
					if (diff < minutesAgo) {
						minutesAgo = diff;
					}
					if (this.messagingService.unreadMessages.find(m => m.MessageText === message.MessageText && m.Timestamp === message.Timestamp) === undefined && this.messagingService.messageIdsMarkedAsRead.indexOf(message.Id) === -1) {
						message.FromName = `${message.FromUser.FirstName} ${message.FromUser.LastName}`;
						timestampDate = new Date(message.Timestamp);
						offsetDate = new Date(new Date(timestampDate).setHours(timestampDate.getHours() + this.tzOffset));
						const offsetMoment = moment(offsetDate);
						message.DateTime = offsetMoment;
						const otherMessages = this.messagingService.unreadMessages.find(m => m.Username === message.FromUser.Username);
						let skipAdd = false;
						if (otherMessages) {
							Array(otherMessages).forEach(otherMessage => {
								if (otherMessage.Timestamp < message.Timestamp) {
									this.messagingService.unreadMessages.splice(this.messagingService.unreadMessages.indexOf(otherMessage), 1);
								} else {
									skipAdd = true;
								}
							});
						}
						if (skipAdd === false && message.IsRead === false) { this.messagingService.unreadMessages.push(message); }
						this.getMessageSenders();
					}
				}
			});

			if (minutesAgo !== 100000) {
				this.minutesAgoSinceMostRecentMessage = minutesAgo;
				const hours = Math.floor(this.minutesAgoSinceMostRecentMessage / 60);
				const minutes = this.minutesAgoSinceMostRecentMessage % 60;
				if (this.hoursSinceLastMessage > hours || (this.hoursSinceLastMessage === -1 && this.minutesSinceLastMessage === -1)) {
					this.hoursSinceLastMessage = hours;
					this.minutesSinceLastMessage = minutes;
					this.timeSinceLastMessage = `${hours}:${minutes}`;
				} else if (this.hoursSinceLastMessage === hours) {
					this.minutesSinceLastMessage = minutes;
					this.timeSinceLastMessage = `${hours}:${minutes}`;
				}
			}
		} catch (e) {
			console.log('Error! event is ', event, ', error is ', e.message);
		}
	}

	haveUnread() {
		return this.messagingService.unreadMessages.length > 0;
	}

	getCollections() {
		return this.notificationService.getCollections();
	}

	toggleCollectionsExpanded() {
		if (this.getCollectionNumber() > 0) {
			this.collectionsExpanded = !this.collectionsExpanded;
		}
	}

	getMessages() {
		return this.notificationService.getMessages();
	}

	toggleMessagesExpanded() {
		this.messagesExpanded = !this.messagesExpanded;
	}

	getRequests() {
		return this.notificationService.getRequests();
	}

	toggleRequestsExpanded() {
		this.requestsExpanded = !this.requestsExpanded;
	}

	toggleNewRecordsExpanded() {
		this.newRecordsExpanded = !this.newRecordsExpanded;
	}

	getMinutesAgo(datetime) {
		return this.notificationService.getMinutesAgo(datetime);
	}

	getNumber(notifications) {
		return (notifications.length > 0) ? (notifications.length) : (this.translation.translate('Label.No'));
	}

	getMessageNumber() {
		return this.getNumber(this.notificationService.getMessagesUnread());
	}

	getCollectionNumber() {
		/* return this.getNumber(this.notificationService.getCollectionsUnread()); */
		return this.getNumber(this.collectionNotifications);
	}

	getRequestNumber() {
		return this.getNumber(this.notificationService.getRequests());
	}

	getMessageSenders() {
		this.messageSenders = [];
		this.messagingService.unreadMessages.forEach(message => {
			if (this.messageSenders.indexOf(message.FromName) === -1) {
				this.messageSenders.push(message.FromName);
			}
		});
		this.messageSenderCount = this.messageSenders.length === 0 ? this.translation.translate('Label.No') : this.messageSenders.length;
	}

	getCollectionSenders() {
		let senderString = '';
		this.getCollections().forEach(n => {
			if (n.read === false) {
				senderString = n.data.patient + ', ' + senderString;
			}
		});
		return (senderString.substring(0, senderString.length - 2));
	}

	getRequestSenders() {
		return ''; // this.getNames(this.getRequests());
	}

	checkToClose() {
		if (this.notificationService.getCollectionsUnread().length === 0) {
			this.collectionsExpanded = false;
		}
		if (this.notificationService.getMessagesUnread().length === 0) {
			this.messagesExpanded = false;
		}
	}

	openNotifications() {
		this.showNotificationsPopup = !this.showNotificationsPopup;
	}

	closeNotifications() {
		this.showNotificationsPopup = false;
		this.messagesExpanded = false;
	}

}
