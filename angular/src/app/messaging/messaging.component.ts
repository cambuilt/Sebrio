import { Component, EventEmitter, Output, Input, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatTabGroup, DialogPosition } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { UserService } from '../services/user.service';
import { BroadcastGroupService } from '../services/broadcast-group.service';
import { MessagingListAddDialogComponent } from '../messaging-list-add-dialog/messaging-list-add-dialog.component';
import { MessagingListAddComponent } from '../messaging-list-add/messaging-list-add.component';
import { TranslationService } from 'angular-l10n';
import { MatSnackBar } from '@angular/material';
import { PrintService } from '../services/print.service';
import { MessagingService } from '../services/messaging.service';
import { MessagingChatComponent } from '../messaging-chat/messaging-chat.component';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import * as moment from 'moment';
import 'moment-timezone';

@Component({
	selector: 'app-messaging',
	templateUrl: './messaging.component.html',
	providers: [PrintService],
	styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	@ViewChild('tabGroup') tabGroup: MatTabGroup;
	@ViewChild('messagingChat') messagingChat: MessagingChatComponent;
	@ViewChild('messagingUser') messagingUser: UserSelectorComponent;
	@ViewChild('listAdd') listAdd: MessagingListAddComponent;
	@Input() parentData: any;
	@Input() usersInput: any;

	properties = {
		clearFields: () => this.clearFields(),
		isDrawerOpen: false,
		manualDescriptionInput: false,
		showOverlay: false,
		hideOverlay: false,
		rowID: ''
	};
	selectedTab = 'Private';
	editPrivateMode = false;
	editBroadcastMode = false;
	broadcastGroups = [];
	selected = [];
	inboxes = [];
	tenants = [];
	objectForm = [];
	pristineObject: any;
	selectedList: string;
	pointerIsSwiping = false;
	pointerIsDown = false;
	swipedItemWidth = 321;
	swipedElement: HTMLElement;
	broadcastGroupInfoElement: HTMLElement;
	inboxLastMessage: HTMLElement;
	swipedStartX = 0;
	// deleteDelta = 0;
	messageTotal = 0;
	nextId = 1;
	clickedEditBroadcast = false;
	messageSubscription: any;
	messageChatSubscription: any;
	messageNewUserChatSubscription: any;
	hasBroadcastPermission = false;
	inboxMessageIds = {};
	loading = true;
	tzOffset = 0;

	constructor(public utilsService: UtilsService, private userService: UserService, private authService: AuthService, private dialog: MatDialog, public translation: TranslationService, private broadcastGroupService: BroadcastGroupService, public snackBar: MatSnackBar, public messagingService: MessagingService) {
		this.hasBroadcastPermission = this.authService.currentUser.permissions.filter(permission => permission.Code === 'rmp_broadcastgroupmaintenance').length !== 0 || this.authService.currentUser.role === 'RMP_RSA';
		const moment_tz = require('moment-timezone');
		this.tzOffset = parseInt(moment_tz().tz(moment_tz.tz.guess()).format('Z'), 10);
	}

	show() {
		this.loading = true;
		this.selectedTab = 'Private';
		this.loadInboxes();
		this.loadbroadcastGroups();
		if (this.tabGroup) {
			this.tabGroup.selectedIndex = 0;
		}
		this.properties.isDrawerOpen = true;
		this.properties.hideOverlay = false;
		this.properties.showOverlay = true;
		document.querySelector('.drawer-content').scrollTop = 0;
	}

	closeDrawer() {
		if (this.tabGroup) {
			this.tabGroup.selectedIndex = 0;
		}
		this.editPrivateMode = false;
		this.editBroadcastMode = false;
		if (this.messageChatSubscription) {
			this.messageChatSubscription.unsubscribe();
		}
	}

	loadInboxes() {
		this.inboxes = [];
		const latestMessages = [];
		const currentUsername = this.authService.currentUser.username;
		let inboxUser = {Username: '', FirstName: '', LastName: '', AvatarURL: ''};
		let foundLatestMessage;
		this.messageSubscription = this.messagingService.getMessageHistory().subscribe(response => {
			const messages = response.json();
			this.messageTotal = messages.length;
			messages.sort((a, b) => {
				const aToUsername = a.ToUser ? a.ToUser.Username : '';
				const bToUsername = b.ToUser ? b.ToUser.Username : '';
				const aUsername = aToUsername === currentUsername ? a.FromUser.Username : aToUsername;
				const bUsername = bToUsername === currentUsername ? b.FromUser.Username : bToUsername;
				return aUsername + a.Timestamp < bUsername + b.Timestamp ? 1 : -1;
			});

			messages.forEach(message => {
				const dateTime = moment(message.Timestamp, 'YYYY-MM-DD[T]HH:mm:ss').add(this.tzOffset, 'hours');
				const time = dateTime.format('h:mm a');
				const timestamp = dateTime.format('YYYY-MM-DD[T]HH:mm:ss');
				const toUsername = message.ToUser ? message.ToUser.Username : '';

				if ((toUsername === currentUsername || message.FromUser.Username === currentUsername) && message.IsBroadcast === false) {
					inboxUser = this.getInboxUser(message);
					foundLatestMessage = latestMessages.find(m => m.Username === inboxUser.Username);
					if (!foundLatestMessage) {
						latestMessages.push({ Username: inboxUser.Username, FirstName: inboxUser.FirstName, LastName: inboxUser.LastName, AvatarURL: inboxUser.AvatarURL, MessageText: message.MessageText, Time: time, Timestamp: timestamp });
					}
					if (!this.inboxMessageIds[inboxUser.Username]) {
						this.inboxMessageIds[inboxUser.Username] = [message.Id];
					} else {
						this.inboxMessageIds[inboxUser.Username].push(message.Id);
					}
				}
			});

			let messagesSkipped = 0;
			latestMessages.forEach(message => {
				const time = this.getInboxTime(message);
				if (this.inboxes.find(inbox => inbox.Username === message.Username) === undefined && message.Username !== currentUsername) {
					this.inboxes.push({ Username: message.Username, FirstName: message.FirstName, LastName: message.LastName, AvatarURL: message.AvatarURL, Initials: this.utilsService.getInitials(message), LastMessage: message.MessageText, LastMessageTime: time, Timestamp: message.Timestamp.replace('T', ' '), Check: false });
					if (latestMessages.length - messagesSkipped === this.inboxes.length) {
						this.inboxes.sort((a, b) => {
							return a.Timestamp < b.Timestamp ? 1 : -1;
						});
						this.observeNewMessages();
					}
				} else {
					const inbox = this.inboxes.find(i => i.Username === message.Username);
					if (!inbox) {
						console.log('cannot find inbox for', inboxUser.Username);
					} else {
						inbox.LastMessage = message.MessageText;
						inbox.LastMessageTime = time;
						inbox.Timestamp = message.Timestamp;
						if (latestMessages.length === this.inboxes.length) {
							this.inboxes.sort((a, b) => {
								return a.Timestamp < b.Timestamp ? 1 : -1;
							});
							this.observeNewMessages();
						}
					}
				}
			});
			this.loading = false;
		}, error => {
			console.log('error is', error);
			this.utilsService.showError(`Error getting inboxes: ${error.statusText}, error ${error.status}`);
			this.loading = false;
		});
	}

	loadbroadcastGroups() {
		if (this.utilsService.checkOnlineStatus()) {
			this.broadcastGroups = [];
			this.broadcastGroupService.getBroadcastGroups().subscribe(response => {
				const allGroups = response.json();
				allGroups.forEach(group => {
					const newGroup: any = {};
					newGroup.Id = group.Id;
					newGroup.Name = group.Name;
					if (!group.Id) {
						console.log('group Id is missing for', group.Name);
					}
					newGroup.GroupType = group.GroupType;
					if (newGroup.GroupType === 'USER') {
						this.broadcastGroupService.getUserBroadcastGroup(group.Id).subscribe(userResponse => {
							let recipientDisplayList = '';
							let delimiter = '';
							newGroup.Recipients = userResponse.json().Recipients;
							newGroup.Recipients.forEach(recipient => {
								recipientDisplayList = `${recipientDisplayList}${delimiter}${recipient.FirstName} ${recipient.LastName}`;
								delimiter = ', ';
							});
							newGroup.RecipientList = recipientDisplayList;
							newGroup.Check = false;
							this.broadcastGroups.push(newGroup);
						});
					} else {
						newGroup.Recipients = group.Recipients;
						let recipientDisplayList = '';
						let delimiter = '';
						if (newGroup.Recipients) {
							newGroup.Recipients.forEach(recipient => {
								recipientDisplayList = `${recipientDisplayList}${delimiter}${recipient}`;
								delimiter = ', ';
							});
						}
						newGroup.RecipientList = recipientDisplayList;
						newGroup.Check = false;
						this.broadcastGroups.push(newGroup);
					}
					this.nextId = (group.Id as number);
					this.nextId++;
				});
			}, error => {
				console.log('broadcast list error is ', error);
			});
		}
	}

	loadUserDataComplete(response) {
		const users = response.json();
		let userList = '';
		let delimiter = '';
		users.forEach(user => {
			userList = `${userList}${delimiter}${user.FirstName} ${user.LastName}`;
			delimiter = ', ';
		});
	}

	saveGroup(broadcastGroup) {
		let recipientDisplayList = '';
		let delimiter = '';
		const broadcastGroupBody = { Name: broadcastGroup.Name, Recipients: [] };
		if (broadcastGroup.Recipients) {
			broadcastGroup.Recipients.forEach(recipient => {
				if (broadcastGroup.GroupType === 'USER') {
					const name = `${recipient.FirstName + ' ' + recipient.LastName}`;
					recipientDisplayList = `${recipientDisplayList}${delimiter}${name}`;
					broadcastGroupBody.Recipients.push(recipient.Username);
				} else {
					recipientDisplayList = `${recipientDisplayList}${delimiter}${recipient}`;
					broadcastGroupBody.Recipients.push(recipient);
				}
				delimiter = ', ';
			});
		}

		if (this.listAdd.editing === true && broadcastGroup.Id !== undefined) {
			if (broadcastGroup.GroupType === 'TENANT') {
				this.broadcastGroupService.updateTenantBroadcastGroup(broadcastGroup.Id, JSON.stringify(broadcastGroupBody)).subscribe(response => { this.saveOnComplete(response); });
			} else {
				this.broadcastGroupService.updateUserBroadcastGroup(broadcastGroup.Id, JSON.stringify(broadcastGroupBody)).subscribe(response => { this.saveOnComplete(response); });
			}
			broadcastGroup.RecipientList = recipientDisplayList;
		} else {
			broadcastGroup.Id = this.nextId;
			broadcastGroup.RecipientList = recipientDisplayList;
			broadcastGroup.Check = false;
			this.broadcastGroups.push(broadcastGroup);
			if (broadcastGroup.GroupType === 'TENANT') {
				this.broadcastGroupService.createTenantBroadcastGroup(JSON.stringify(broadcastGroupBody)).subscribe(response => { this.saveOnComplete(response); });
			} else {
				this.broadcastGroupService.createUserBroadcastGroup(JSON.stringify(broadcastGroupBody)).subscribe(response => { this.saveOnComplete(response); });
			}
			this.nextId++;
		}
	}

	saveOnComplete(response) {
		if (response.status === 200) {
			if (this.listAdd.editing) {
				this.openSnackBar(this.translation.translate('Label.Broadcast List saved'));
				this.listAdd.editing = false;
			} else {
				this.openSnackBar(this.translation.translate('Label.Broadcast List added'));
			}
			this.loadbroadcastGroups();
		} else {
			this.utilsService.showError(`Broadcast List ${this.translation.translate('Label.could not be saved due an unknown error. If the error persists please contact support')}.`);
		}
	}

	openSnackBar(message: string) {
		this.snackBar.open(message, null, {
			duration: 2000,
			horizontalPosition: 'right'
		});
	}

	getInboxUser(message) {
		const aToUsername = message.ToUser ? message.ToUser.Username : '';
		const aToFirstName = message.ToUser ? message.ToUser.FirstName : '';
		const aToLastName = message.ToUser ? message.ToUser.LastName : '';
		const aToAvatarURL = message.ToUser ? message.ToUser.AvatarURL : '';
		if (aToUsername === this.authService.currentUser.username) {
			return {Username: message.FromUser.Username, FirstName : message.FromUser.FirstName, LastName: message.FromUser.LastName, AvatarURL: message.FromUser.AvatarURL };
		} else {
			return {Username: aToUsername, FirstName : aToFirstName, LastName: aToLastName, AvatarURL: aToAvatarURL };
		}
	}

	tabClick() {
		if (this.tabGroup.selectedIndex === 0) {
			this.selectedTab = 'Private';
			this.listAdd.addEditTenantList = false;
			this.editBroadcastMode = false;
		} else {
			this.selectedTab = 'Broadcast';
			this.editPrivateMode = false;
		}
	}

	clickPrivate(user) {
		if (this.pointerIsSwiping === true) {
			this.pointerIsSwiping = false;
		} else {
			this.messagingChat.show('Private', user);
			this.observeSentChatMessages();
		}
	}

	clickBroadcast(groupId, groupName, groupType) {
		if (this.clickedEditBroadcast === false) {
			this.messagingChat.groupId = groupId;
			this.messagingChat.groupType = groupType;
			this.messagingChat.showBroadcast(groupName);
		} else {
			this.clickedEditBroadcast = false;
		}
	}

	clickEditBroadcast(group) {
		this.clickedEditBroadcast = true;
		setTimeout(() => this.editBroadcastMode = false, 500);
		this.listAdd.editList(group);
	}

	observeNewMessages() {
		const { username } = this.authService.currentUser;
		if (this.messageSubscription) {
			this.messageSubscription.unsubscribe();
		}
		this.messageSubscription = this.messagingService.messages.subscribe(messages => {
			console.log('observeNewMessages got', messages);
			if (messages.length > 0) {
				const ids = [];
				const addedInboxes = [];
				const inboxLastMessages = [];
				messages.forEach(message => {
					if (message.IsBroadcast === false) {
						const inboxUser = this.getInboxUser(message);
						const dateTime = moment(message.Timestamp, 'YYYY-MM-DD[T]HH:mm:ss').add(this.tzOffset, 'hours');
						const timestamp = dateTime.format('YYYY-MM-DD HH:mm:ss');
						message.Timestamp = timestamp;
						const time = this.getInboxTime(message);

						if (this.inboxMessageIds[inboxUser.Username] && this.inboxMessageIds[inboxUser.Username].indexOf(message.Id) === -1) {
							let inbox = this.inboxes.find(i => i.Username === inboxUser.Username);

							if (!inbox) {
								if (addedInboxes.indexOf(inboxUser.Username) === -1) {
									addedInboxes.push(inboxUser.Username);
									inbox = this.inboxes.find(i => i.Username === message.Username);
									if (!inbox) {
										this.inboxes.push({ Username: inboxUser.Username, FirstName: inboxUser.FirstName, LastName: inboxUser.LastName, AvatarURL: inboxUser.AvatarURL, Initials: this.utilsService.getInitials(inboxUser), LastMessage: message.MessageText, LastMessageTime: time, Timestamp: timestamp, Check: false });
									}
								}
							} else {
								const inboxLastMessage = inboxLastMessages.find(i => i.Username === inboxUser.Username);
								if (!inboxLastMessage) {
									inboxLastMessages.push({Username: inboxUser.Username, FirstName: inboxUser.FirstName, LastName: inboxUser.LastName, AvatarURL: inboxUser.AvatarURL, Timestamp: timestamp, LastMessage: message.MessageText, LastMessageTime: time});
								} else {
									if (inboxLastMessage.Timestamp < timestamp) {
										inboxLastMessage.LastMessage = message.MessageText;
										inboxLastMessage.LastMessageTime = time;
										inboxLastMessage.Timestamp = timestamp;
									}
								}
							}
						}
						ids.push(message.Id);
						this.messagingService.messageIdsMarkedAsRead.push(message.Id);
					}
				});
				inboxLastMessages.forEach(inboxLastMessage => {
					const inbox = this.inboxes.find(i => i.Username === inboxLastMessage.Username);
					if (inbox) {
						inbox.LastMessage = inboxLastMessage.LastMessage;
						inbox.LastMessageTime = inboxLastMessage.LastMessageTime;
						inbox.Timestamp = inboxLastMessage.Timestamp;
					}
				});
				if (ids.length > 0) {
					this.messagingService.sendToSocket({ Action: 'SetMessageRead', MessageIds: ids });
					this.messagingService.sendToSocket({ Action: 'SetMessageReceived', MessageIds: ids });
				}
				this.inboxes.sort((a, b) => {
					return a.Timestamp < b.Timestamp ? 1 : -1;
				});
			}
		});
	}

	observeSentChatMessages() {
		if (!this.messageChatSubscription) {
			this.messageChatSubscription = this.messagingChat.displayMessages.subscribe(messages => {
				console.log('observeSentChatMessages got', messages);
				if (messages.length > 0) {
					messages.forEach(message => {
						if (!this.inboxMessageIds[message.ToUser.Username]) {
							this.inboxMessageIds[message.ToUser.Username] = [];
						}
						if (message.Id !== undefined && this.inboxMessageIds[message.ToUser.Username].indexOf(message.Id) === -1) {
							this.inboxMessageIds[message.ToUser.Username].push(message.Id);
						}
					});
					const lastMessage = messages[messages.length - 1];
					const time = this.getInboxTime(lastMessage);
					const inboxUser = this.getInboxUser(lastMessage);
					const inbox = this.inboxes.find(i => i.Username === inboxUser.Username);
					inbox.LastMessage = lastMessage.MessageText;
					inbox.LastMessageTime = time;
					inbox.Timestamp = lastMessage.Timestamp;

					this.inboxes.sort((a, b) => {
						return a.Timestamp < b.Timestamp ? 1 : -1;
					});
				}
			});
		}
	}

	observeNewUserChatMessages() {
		if (!this.messageNewUserChatSubscription) {
			this.messageNewUserChatSubscription = this.messagingUser.newUserChatMessages.subscribe(messages => {
				console.log('observeNewUserChatMessages got', messages);
				messages.forEach(message => {
					const time = this.getInboxTime(message);
					if (!this.inboxMessageIds[message.ToUser.Username]) {
						this.inboxMessageIds[message.ToUser.Username] = [];
					}
					if (message.Id !== undefined && this.inboxMessageIds[message.ToUser.Username].indexOf(message.Id) === -1) {
						this.inboxMessageIds[message.ToUser.Username].push(message.Id);
					}
					const lastMessage = messages[messages.length - 1];
					const inboxUser = this.getInboxUser(lastMessage);

					if (!this.inboxes.find(box => box.Username === inboxUser.Username) && (!this.inboxMessageIds[inboxUser.Username] || this.inboxMessageIds[inboxUser.Username].length === 0)) {
						this.inboxes.push({ Username: inboxUser.Username, FirstName: inboxUser.FirstName, LastName: inboxUser.LastName, AvatarURL: inboxUser.AvatarURL, Initials: this.utilsService.getInitials({FirstName: inboxUser.FirstName, LastName: inboxUser.LastName}), LastMessage: message.MessageText, LastMessageTime: time, Timestamp: lastMessage.Timestamp, Check: false });
					} else {
						const inbox = this.inboxes.find(i => i.Username === inboxUser.Username);
						if (!inbox) {
							console.log('cannot find inbox for', inboxUser.Username);
						} else {
							inbox.LastMessage = message.MessageText;
							inbox.LastMessageTime = time;
							inbox.Timestamp = lastMessage.Timestamp;
						}
					}
					this.inboxes.sort((a, b) => {
						return a.Timestamp < b.Timestamp ? 1 : -1;
					});
				});
			});
		}
	}

	// @HostListener('click', ['$event']) onClick(event) {
	// 	const {target} = event;
	// 	if (this.pointerIsSwiping === true) {
	// 		this.pointerIsSwiping = false;
	// 	}
	// }

	// @HostListener('mousedown', ['$event']) onMouseDown(event) {
	// 	const {target} = event;
	// 	if (target.parentElement.parentElement.className.search('inboxRow|GroupRow') > -1) {
	// 		this.swipedElement = target.parentElement.parentElement;
	// 		this.inboxLastMessage = this.swipedElement.querySelector('.inbox-small-span');
	// 		this.pointerIsDown = true;
	// 		this.swipedStartX = event.clientX;
	// 		this.broadcastGroupInfoElement = target.parentElement.querySelector('.broadcastGroupInfo');
	// 		if (this.broadcastGroupInfoElement) {
	// 			this.broadcastGroupInfoElement.style.color = 'transparent';
	// 		}
	// 	} else if (target.parentElement.className.search('inboxRow|GroupRow') > -1) {
	// 		this.broadcastGroupInfoElement = target.parentElement.querySelector('.broadcastGroupInfo');
	// 		this.swipedElement = target.parentElement;
	// 		this.swipedStartX = event.clientX;
	// 		this.pointerIsDown = true;
	// 	} else if (target.className.search('inboxRow|GroupRow') > -1) {
	// 		this.broadcastGroupInfoElement = target.querySelector('.broadcastGroupInfo');
	// 		this.swipedElement = target;
	// 		this.swipedStartX = event.clientX;
	// 		this.pointerIsDown = true;
	// 	}
	// }

	// @HostListener('mouseup', ['$event']) onMouseUp(event) {
	// 	this.pointerIsDown = false;
	// 	this.swipedItemWidth = 321;
	// 	if (this.swipedElement) {
	// 		this.swipedElement.style.width = '321px';
	// 		if (this.deleteDelta > 185) {
	// 			this.deleteBySwipe();
	// 		} else {
	// 			this.swipedElement = undefined;
	// 			if (this.inboxLastMessage) {
	// 				this.inboxLastMessage.style.width = '321px';
	// 				this.inboxLastMessage = undefined;
	// 			}
	// 		}
	// 		if (this.broadcastGroupInfoElement) {
	// 			this.broadcastGroupInfoElement.style.color = '';
	// 		}
	// 	}
	// }

	// @HostListener('mousemove', ['$event']) onMouseMove(event) {
	// 	if (this.swipedElement) {
	// 		if (event.offsetX > 300) {
	// 			this.pointerIsSwiping = false;
	// 			this.pointerIsDown = false;
	// 			this.swipedItemWidth = 321;
	// 			this.swipedElement.style.width = '321px';
	// 			if (this.inboxLastMessage) {
	// 				this.inboxLastMessage.style.width = '321px';
	// 			}
	// 			this.swipedElement = undefined;
	// 			this.inboxLastMessage = undefined;
	// 			if (this.broadcastGroupInfoElement) {
	// 				this.broadcastGroupInfoElement.style.color = '';
	// 			}
	// 		} else if (this.swipedStartX - event.clientX > 10) {
	// 			this.pointerIsSwiping = true;
	// 			this.deleteDelta = this.swipedStartX - event.clientX;
	// 			if (this.deleteDelta < 375) {
	// 				if (this.deleteDelta > 0) {
	// 					this.swipedElement.style.width = `${321 - this.deleteDelta}px`;
	// 					if (this.inboxLastMessage) {
	// 						this.inboxLastMessage.style.width = `${275 - this.deleteDelta}px`;
	// 					}
	// 				}
	// 			}
	// 		}
	// 	} else {
	// 		this.pointerIsSwiping = false;
	// 	}
	// }

	edit() {
		if (this.selectedTab === 'Private') {
			this.editPrivateMode = true;
		} else {
			this.editBroadcastMode = true;
		}
	}

	// deleteBySwipe() {
	// 	this.deleteDelta = 0;
	// 	if (this.selectedTab === 'Private') {
	// 		const inboxName = this.swipedElement.getElementsByClassName('inbox-span')[0].getElementsByTagName('span')[0].innerText;
	// 		const inboxToDelete = this.inboxes.find(inbox => `${(inbox.FirstName as String).trim()} ${(inbox.LastName as String).trim()}` === inboxName);
	// 		this.messagingService.sendToSocket({Action: 'DeleteMessages', MessageIds: this.inboxMessageIds[inboxToDelete.Username]});
	// 		this.inboxes.splice(this.inboxes.indexOf(inboxToDelete), 1);
	// 	} else {
	// 		const broadcastGroupName = this.swipedElement.getElementsByTagName('span')[0].innerText;
	// 		const broadcastGroupToDelete = this.broadcastGroups.find(broadcastGroup => `${broadcastGroup.Name}` === broadcastGroupName);
	// 		if (broadcastGroupToDelete.GroupType === 'TENANT') {
	// 			this.broadcastGroupService.deleteTenantBroadcastGroup(broadcastGroupToDelete.Id).subscribe(response => {
	// 				if (response.status === 200) {
	// 					this.openSnackBar(this.translation.translate('Label.Broadcast List deleted'));
	// 				} else {
	// 					this.utilsService.showError(`Broadcast List ${this.translation.translate('Label.could not be deleted due an unknown error. If the error persists please contact support')}.`);
	// 				}
	// 			}, error => {
	// 				this.utilsService.showError(`Error deleting broadcast group: ${error.statusText}, error ${error.status}`);
	// 			});
	// 		} else {
	// 			this.broadcastGroupService.deleteUserBroadcastGroup(broadcastGroupToDelete.Id).subscribe(response => {
	// 				if (response.status === 200) {
	// 					this.openSnackBar(this.translation.translate('Label.Broadcast List deleted'));
	// 				} else {
	// 					this.utilsService.showError(`Broadcast List ${this.translation.translate('Label.could not be deleted due an unknown error. If the error persists please contact support')}.`);
	// 				}
	// 			}, error => {
	// 				this.utilsService.showError(`Error deleting broadcast group: ${error.statusText}, error ${error.status}`);
	// 			});

	// 		}
	// 		this.broadcastGroups.splice(this.broadcastGroups.indexOf(broadcastGroupToDelete), 1);
	// 	}
	// 	this.swipedElement = undefined;
	// }

	deleteByCheckbox(event) {
		let foundChecked = false;
		if (this.selectedTab === 'Private') {
			const deleteNames = [];
			this.inboxes.forEach(inbox => {
				if (inbox.Check === true) {
					deleteNames.push(inbox.FirstName + ' ' + inbox.LastName);
					foundChecked = true;
				}
			});
			if (foundChecked === false) {
				this.utilsService.showError('Check at least one inbox before deleting.');
			} else {
				deleteNames.forEach(name => {
					const inboxToDelete = this.inboxes.find(box => `${(box.FirstName as String).trim()} ${(box.LastName as String).trim()}` === name);
					this.messagingService.sendToSocket({ Action: 'DeleteMessages', MessageIds: this.inboxMessageIds[inboxToDelete.Username] });
					this.inboxMessageIds[inboxToDelete.Username].forEach(id => {
						this.messagingService.messageIdsMarkedAsRead.push(id);
					});
					this.inboxMessageIds[inboxToDelete.Username] = [];
				});
				deleteNames.forEach(name => {
					const inboxToDelete = this.inboxes.find(box => `${(box.FirstName as String).trim()} ${(box.LastName as String).trim()}` === name);
					this.inboxes.splice(this.inboxes.indexOf(inboxToDelete), 1);
				});
			}
		} else {
			const deleteListIds = [];
			this.broadcastGroups.forEach(list => {
				if (list.Check === true) {
					deleteListIds.push(list.Id);
					this.broadcastGroupService.deleteUserBroadcastGroup(list.Id).subscribe(response => {
						if (response.status !== 200) {
							this.utilsService.showError('Broadcast list ' + list.Name + ' could not be deleted');
						}
					}, error => {
						this.utilsService.showError('Broadcast list ' + list.Name + ' could not be deleted. Error: ' + error);
					});
					foundChecked = true;
				}
			});
			if (foundChecked === false) {
				this.utilsService.showError('Check at least one broadcast list before deleting.');
			} else {
				deleteListIds.forEach(id => {
					this.broadcastGroups.splice(this.broadcastGroups.indexOf(this.broadcastGroups.find(lst => `${lst.Id}` === id)), 1);
				});
			}
		}
	}

	editDone() {
		this.editBroadcastMode = false;
		this.editPrivateMode = false;
	}

	showAddListMenu(event) {
		const dialogPosition: DialogPosition = {
			top: event.y - 110 + 'px',
			left: event.x - 95 + 'px'
		};
		const dialogRef = this.dialog.open(MessagingListAddDialogComponent, {
			width: '112px',
			position: { bottom: '45px', right: '46px' },
			backdropClass: 'blankOverlay',
			panelClass: 'addListDialog'
		});
		dialogRef.beforeClose().subscribe(result => {
			if (!!result) {
				this.listAdd.listType = result;
				this.listAdd.addList();
				setTimeout(() => this.focusOnFirstListField(), 500);
			}
		});
	}

	focusOnFirstListField() {
		const firstListField: HTMLInputElement = document.querySelector('#firstListField');
		if (firstListField) {
			firstListField.focus();
		}
	}

	// getBase64Avatar(user) {
	// 	if (user.AvatarURL === '') {
	// 		user.AvatarBase64 = '';
	// 	} else {
	// 		this.imageUploadService.getImage(user.AvatarURL).subscribe(response => {
	// 			user.AvatarBase64 = response.text();
	// 		}, error => {
	// 			user.AvatarBase64 = '';
	// 		});
	// 	}
	// }

	fullClose(save) {
		if (save) {
			// this.save(false);
		} else {
			this.utilsService.closeDrawer(this.properties);
			this.closeDrawer();
		}
	}

	processUserSelect(user: any) {
		if (this.inboxes.find(box => box.Username === user.Username) === undefined && this.inboxMessageIds[user.Username]) {
			const time = moment().format('h:mm a');
			this.inboxes.push({ Username: user.Username, FirstName: user.FirstName, LastName: user.LastName, AvatarURL: user.AvatarURL, Initials: this.utilsService.getInitials(user), LastMessage: '', LastMessageTime: time, Check: false });
		}
	}

	propagateCheckbox(event, item) {
		if (this.selectedTab === 'Private') {
			this.inboxes.find(box => box.Username === item.Username).Check = event.checked;
		} else {
			this.broadcastGroups.find(list => list.Name === item.Name).Check = event.checked;
		}
	}

	backFromChat(user) {
		if (user.LastMessage !== '') {
			this.inboxes.find(box => box.Username === user.Username).LastMessage = user.LastMessage;
		}
	}

	getInboxTime(message: any) {
		const timestamp = message.Timestamp;
		const messageDateTime = moment(timestamp, 'YYYY-MM-DD[T]HH:mm:ss');
		const daysFromToday = moment().diff(messageDateTime, 'days');
		const yesterday = moment().subtract(1, 'day');
		const sevenDaysAgo = moment().subtract(7, 'day');

		let time = '';

		if (messageDateTime.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
			time = messageDateTime.format('h:mm a');
		} else if (messageDateTime.format('YYYY-MM-DD') === yesterday.format('YYYY-MM-DD')) {
			time = 'YESTERDAY';
		} else if (messageDateTime.format('YYYY-MM-DD') > sevenDaysAgo.format('YYYY-MM-DD')) {
			time = messageDateTime.format('dddd').toLocaleUpperCase();
		} else {
			time = moment(message.Timestamp, 'YYYY-MM-DD[T]HH:mm:ss').format('MM/DD/YY');
		}

		if (time.toLowerCase() === 'invalid date') {
			console.log('invalid date: ', message.Timestamp);
			time = '';
		}

		return time;
	}

	clearFields() {

	}
}
