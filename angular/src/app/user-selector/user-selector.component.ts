import { Component, EventEmitter, Output, OnInit, Input, ViewChild, HostListener, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { ImageUploadService, } from '../services/image-upload.service';
import { TranslationService } from 'angular-l10n';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { MessagingChatComponent } from '../messaging-chat/messaging-chat.component';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-user-selector',
	templateUrl: './user-selector.component.html',
	styleUrls: ['./user-selector.component.css']
})

export class UserSelectorComponent implements OnInit {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onFullClose = new EventEmitter();
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSelect = new EventEmitter();
	@Input() parentData: any;
	@Input() usersInput: any;
	@Input() singleSelect = false;
	@ViewChild('messagingChat') messagingChat: MessagingChatComponent;
	@ViewChild('userSelectorDrawer') userSelectorDrawer: ElementRef;
	isDrawerOpen = false;
	hideOverlay = false;
	filterValue = '';
	showFilter = false;
	users = [];
	usersFiltered = [];
	usersToReturn = [];
	usersToDisplay = [];
	pristineObject: any;
	newInbox = false;
	platform;
	scrollDrawer;
	newUserChatMessagesSubscription;
	newUserChatMessagesStore = [];
	newUserChatMessagesSubject = new BehaviorSubject(this.newUserChatMessagesStore);
	newUserChatMessages = this.newUserChatMessagesSubject.asObservable();
	inboxMessageIds = {};

	constructor(private router: Router, public utilsService: UtilsService, private activeEntitiesService: ActiveEntitiesService, private imageUploadService: ImageUploadService, private unsavedChangesAlert: MatDialog, public translation: TranslationService, private authService: AuthService) {
		this.platform = window.navigator.platform;
	}

	ngOnInit(): void {
		this.adjustForWindowsScroll();
	}

	show(hideOverlay) {
		console.log('parentData: ', this.parentData);
		if (this.newInbox === false) {
			this.sortByLastName(this.usersInput);
		}
		this.loadUsers();
		this.applyFilter();
		this.isDrawerOpen = true;
		document.querySelector('rmp-user-selector .drawer-content').scrollTop = 0;

		if (hideOverlay) {
			this.hideOverlay = hideOverlay;
		}
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.closeFilter();
	}

	save() {
		if (this.utilsService.checkOnlineStatus()) {
			this.getUsersToReturn();
			this.onSave.emit(this.usersToReturn);
			this.closeDrawer();
		}
	}

	getUsersToReturn() {
		this.usersToReturn = [];
		this.usersToDisplay.forEach(user => {
			if (user.check === true) {
				this.usersToReturn.push({ Initials: this.utilsService.getInitials(user), FirstName: user.FirstName, LastName: user.LastName, Username: user.Username, Email: user.Email, AvatarURL: user.AvatarURL });
			}
		});
		this.updatePristine();
	}

	loadUsers() {
		if (this.utilsService.checkOnlineStatus()) {
			this.activeEntitiesService.getUsers();
			this.activeEntitiesService.users.subscribe(response => {
				this.usersToDisplay = [];
				const allUsers = response as any[];
				for (let i = 0; i < allUsers.length; i++) {
					if (allUsers[i].Username !== '' && allUsers[i].Email !== '' && (allUsers[i].Username !== this.authService.currentUser.username || this.singleSelect === false)) {
						allUsers[i].Initials = this.utilsService.getInitials(allUsers[i]);
						if (this.usersInput) {
							const check = this.usersInput.map(user => user.Username).indexOf(allUsers[i].Username) !== -1;
							allUsers[i].check = check;
						}
						if (this.parentData.title === 'RoleAdd') {
							if (allUsers[i].Role.Id !== '1') {
								this.usersToDisplay.push(allUsers[i]);
							}
						} else {
							this.usersToDisplay.push(allUsers[i]);
						}
					}
				}
				this.sortByLastName(this.usersToDisplay);
				this.usersFiltered = this.usersToDisplay;
				this.adjustForWindowsScroll();
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
		}
	}

	sortByLastName(array) {
		if (array) {
			array.sort((m, n) => {
				const a = m.LastName.toLowerCase();
				const b = n.LastName.toLowerCase();
				if (a < b) { return -1; }
				if (a > b) { return 1; }
				const c = m.FirstName.toLowerCase();
				const d = n.FirstName.toLowerCase();
				if (c < d) { return -1; }
				if (c > d) { return 1; }
				return 0;
			});
		}
	}

	openFilter() {
		this.showFilter = true;
		const input: HTMLInputElement = document.querySelector('.userSelectorFilterInput');
		input.focus();
	}

	closeFilter() {
		this.clearFilter();
		this.showFilter = false;
	}

	clearFilter() {
		this.filterValue = '';
		this.applyFilter();
	}

	updatePristine() {
		this.pristineObject = JSON.stringify(this.usersToReturn.map(user => user.Username));
	}

	propagateCheckbox(event, user) {
		this.usersToDisplay.find(u => u.Username === user.Username).check = !this.usersToDisplay.find(u => u.Username === user.Username).check;
	}

	selectAllUsers(event) {
		this.usersFiltered.forEach(user => {
			user.check = true;
		});
	}

	clickOverlay(toPrevious) {
		this.getUsersToReturn();
		if (this.userSelectionChanged() === true) {
			const dialogRef = this.unsavedChangesAlert.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (document.body.querySelector('.add-overlay')) {
					document.body.removeChild(document.body.querySelector('.add-overlay'));
				}
				if (result === true) {
					this.save();
				} else {
					this.closeDrawer();
				}
			});
		} else {
			this.closeDrawer();
		}
	}

	userSelectionChanged() {
		let changed = false;

		if (this.usersInput) {
			this.usersInput.forEach(user => {
				if (this.pristineObject.indexOf(user.Username) === -1) {
					changed = true;
				}
			});
		}

		if (this.pristineObject) {
			const pristineArray = JSON.parse(this.pristineObject);
			pristineArray.forEach(user => {
				if (this.usersInput.find(u => u.Username === user) === undefined) {
					changed = true;
				}
			});
		}

		return changed;
	}

	applyFilter() {
		if (this.filterValue === '') {
			this.usersFiltered = this.usersToDisplay;
		} else {
			this.usersFiltered = [];
			const currentText = this.filterValue.toLowerCase().trim(); // prevent empty search
			this.usersToDisplay.forEach(user => { // searching description and name
				const fullName = user.FirstName.toLowerCase() + ' ' + user.LastName.toLowerCase();
				if ((user.FirstName.toLowerCase().search(currentText) >= 0) ||
					(fullName.search(currentText) >= 0) ||
					(user.LastName.toLowerCase().search(currentText) >= 0) ||
					(user.Email.toLowerCase().search(currentText) >= 0)) {
					this.usersFiltered.push(user);
				}
			});
		}
	}

	selectUser(user) {
		if (this.singleSelect === true) {
			this.messagingChat.newInbox = this.newInbox;
			this.observeNewUserChatMessages();
			this.messagingChat.show('Private', user);
		}
	}

	closedChat(user) {
		this.onSelect.emit(user);
		this.closeDrawer();
	}

	@HostListener('window:resize') onResize() {
		this.adjustForWindowsScroll();
	}

	adjustForWindowsScroll() {
		if (this.userSelectorDrawer.nativeElement.scrollHeight > this.userSelectorDrawer.nativeElement.clientHeight) {
			this.scrollDrawer = true;
		} else {
			this.scrollDrawer = false;
		}
	}

	observeNewUserChatMessages() {
		if (!this.newUserChatMessagesSubscription) {
			this.newUserChatMessagesSubscription = this.messagingChat.displayMessages.subscribe(messages => {
				console.log('observeNewUserChatMessages got', messages);
				messages.forEach(message => {
					if (!this.inboxMessageIds[message.ToUser.Username]) {
						this.inboxMessageIds[message.ToUser.Username] = [];
					}
					if (message.Id !== undefined && this.inboxMessageIds[message.ToUser.Username].indexOf(message.Id) === -1) {
						this.inboxMessageIds[message.ToUser.Username].push(message.Id);
					}
					if (message.Id === undefined || this.inboxMessageIds[message.ToUser.Username].indexOf(message.Id) === -1) {
						this.newUserChatMessagesStore.push({ FromUser: message.FromUser, ToUser: message.ToUser, LastName: message.LastName, FirstName: message.FirstName, MessageText: message.MessageText, Date: message.Date, Time: message.Time, Timestamp: message.Timestamp });
						console.log('this.newUserChatMessagesStore is', this.newUserChatMessagesStore);
						this.newUserChatMessagesSubject.next(this.newUserChatMessagesStore);
					}
				});
			});
		}
	}
}
