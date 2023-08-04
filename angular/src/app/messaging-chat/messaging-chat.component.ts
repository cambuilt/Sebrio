import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { MessagingService } from '../services/messaging.service';
import * as moment from 'moment';
import 'moment-timezone';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'app-messaging-chat',
	templateUrl: './messaging-chat.component.html',
	styleUrls: ['./messaging-chat.component.css']
})
export class MessagingChatComponent implements OnInit {
	@Input() messageFieldName = 'messageField';
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onClose = new EventEmitter();
	isDrawerOpen = false;
	message = '';
	headerText = '';
	hideOverlay = true;
	ioConnection: any;
	event: any;
	displayMessagesStore = [];
	displayMessageSubject = new BehaviorSubject(this.displayMessagesStore);
	displayMessages = this.displayMessageSubject.asObservable();
	newInbox = false;
	groupId = '';
	groupType = '';
	messageType = '';
	selectedUser: any;
	messageSubscription;
	dateHeadersDisplayed = [];
	tzOffset = 0;
	drawer;
	// MessageTypes can be 'Private', 'Broadcast', 'Collection', or 'Request'
	constructor(private authService: AuthService, private utilsService: UtilsService, private messagingService: MessagingService) {
	}

	ngOnInit() {
		const moment_tz = require('moment-timezone');
		this.tzOffset = parseInt(moment_tz().tz(moment_tz.tz.guess()).format('Z'), 10);
	}

	show(messageType, user) {
		this.drawer = document.querySelector(`#${this.messageFieldName}-chatMessagingDrawer`);
		if (messageType === 'PrivateNotify') {
			setTimeout(() => { this.drawer.scrollTop = this.drawer.scrollHeight; });
		}
		if (user) {
			this.headerText = user.FirstName + ' ' + user.LastName;
			this.selectedUser = user;
		}

		// this.messagingService.sendToSocket({ Action: 'GetMessageHistory' });
		this.messageType = messageType;
		const messageField: HTMLInputElement = document.querySelector(`#${this.messageFieldName}`);
		messageField.focus();
		messageField.innerText = '';
		this.isDrawerOpen = true;
		this.displayMessagesStore = [];
		const { username } = this.authService.currentUser;
		let messageAdded = false;

		this.messageSubscription = this.messagingService.getMessageHistory().subscribe(response => {
			const messages = response.json();
			const ids = [];

			messages.forEach(message => {
				const dateTime = moment(message.Timestamp, 'YYYY-MM-DD[T]HH:mm:ss').add(this.tzOffset, 'hours');
				const timestamp = dateTime.format('YYYY-MM-DD[T]HH:mm:ss');
				const time = dateTime.format('h:mm a');
				const date = dateTime.format('M/D/YY') === moment().format('M/D/YY') ? 'Today' : dateTime.format('M/D/YY');
				if (!this.displayMessagesStore.find(m => m.MessageText === message.MessageText && m.Time === time)) {
					const stringId = message.Id as string;
					const aToUsername = message.ToUser ? message.ToUser.Username : '';
					if (this.messageType === 'Broadcast' && message.IsBroadcast === true && message.ToGroup === this.groupId) {
						this.displayMessagesStore.push({ Id: message.Id, FromUser: message.FromUser, ToUser: message.ToUser, MessageText: message.MessageText, Date: date, Time: time, Timestamp: timestamp });
						messageAdded = true;
					} else if (this.messageType.startsWith('Private') && message.IsBroadcast === false && (aToUsername === username || message.FromUser.Username === username) && (aToUsername === user.Username || message.FromUser.Username === user.Username)) {
						this.displayMessagesStore.push({ Id: message.Id, FromUser: message.FromUser, ToUser: message.ToUser, MessageText: message.MessageText, Date: date, Time: time, Timestamp: timestamp });
						messageAdded = true;
					}
					if (message.ToUser && message.ToUser.Username === username && this.messagingService.messageIdsMarkedAsRead.indexOf(stringId) === -1) {
						ids.push(stringId);
						this.messagingService.messageIdsMarkedAsRead.push(stringId);
					}
				}
			});

			this.displayMessagesStore.sort((a, b) => {
				return a.Timestamp > b.Timestamp ? 1 : -1;
			});

			this.dateHeadersDisplayed = [];

			this.displayMessagesStore.forEach(message => {
				const dateTime = moment(message.Timestamp, 'YYYY-MM-DD[T]HH:mm:ss');
				const date = dateTime.format('M/D/YY') === moment().format('M/D/YY') ? 'Today' : dateTime.format('M/D/YY');
				message.Date = date;
				if (this.dateHeadersDisplayed.indexOf(message.Date) > -1) { message.Date = undefined; } else { this.dateHeadersDisplayed.push(message.Date); }
			});

			if (ids.length > 0) {
				this.messagingService.sendToSocket({ Action: 'SetMessageRead', MessageIds: ids });
				this.messagingService.sendToSocket({ Action: 'SetMessageReceived', MessageIds: ids });
			}

			if (messageAdded === true) {
				setTimeout(() => { this.drawer.scrollTop = this.drawer.scrollHeight; });
				messageAdded = false;
			}

			if (user) {
				const newUnreadMessages = this.messagingService.unreadMessages.filter(m => m.FromUser.Username != user.Username);
				this.messagingService.unreadMessages = newUnreadMessages;
			}
		});
	}

	hasTodayHeader() {
		const dateHeaderDivs = document.querySelectorAll('.dateHeader');
		let hasHeader = false;
		Array.from(dateHeaderDivs).forEach(div => {
			const divHtml = div as HTMLDivElement;
			if (divHtml.innerText === 'Today') {
				hasHeader = true;
			}
		});
		return hasHeader;
	}

	showBroadcast(groupName) {
		this.headerText = groupName;
		this.show('Broadcast', undefined);
	}

	sendMessage() {
		if (this.utilsService.checkOnlineStatus()) {
			const messageField: HTMLInputElement = document.querySelector(`#${this.messageFieldName}`);
			if (this.message === '') {
				messageField.focus();
				return;
			}
			let selectedUser = {Username: '', FirstName: '', LastName: '', AvatarURL: ''};

			if (this.selectedUser) {
				selectedUser = this.selectedUser;
			}

			const time = moment().format('h:mm a');
			const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
			let date = 'Today';

			if (this.dateHeadersDisplayed.indexOf(date) === -1) {
				this.dateHeadersDisplayed.push(date);
			} else {
				date = undefined;
			}

			if (this.messageType === 'Broadcast') {
				const message = { MessageText: this.message };
				if (this.groupType === 'TENANT') {
					this.messagingService.sendToTenantBroadcastGroup(this.groupId, JSON.stringify(message)).subscribe(response => { this.saveOnComplete(response); });
				} else {
					this.messagingService.sendToUserBroadcastGroup(this.groupId, JSON.stringify(message)).subscribe(response => { this.saveOnComplete(response); });
				}
			} else {
				this.messagingService.sendToSocket({ Action: 'SendMessage', ToUser: this.selectedUser.Username, MessageText: this.message });
			}

			this.displayMessagesStore.push({ FromUser: this.authService.currentUser, ToUser: selectedUser, MessageText: this.message, Date: date, Time: time, Timestamp: timestamp });
			this.displayMessageSubject.next(this.displayMessagesStore);
			setTimeout(() => { this.drawer.scrollTop = this.drawer.scrollHeight; });
			this.message = '';
			messageField.focus();
		}
	}

	saveOnComplete(response) {
		if (response.status !== 200) {
			this.utilsService.showError(`Message Error ${response.status}`);
		}
	}

	closeDrawer() {
		this.messageSubscription.unsubscribe();
		this.displayMessagesStore = [];

		if (this.newInbox === true) {
			this.onClose.emit(this.selectedUser);
		}
		this.isDrawerOpen = false;
	}

	handleEnter(event) {
		if (event.code === 'Enter' || event.code === 'NumpadEnter') {
			this.sendMessage();
		}
	}

	clickOverlay() {
		this.closeDrawer();
	}

}

