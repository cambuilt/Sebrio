import { Component, ViewChild, OnInit, HostListener, Output, EventEmitter, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialog, MatExpansionPanel, defaultRippleAnimationConfig } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LandingPageComponent } from '../landing-page/landing-page.component';
import { ChangePasswordDrawerComponent } from '../change-password-drawer/change-password-drawer.component';
import 'rxjs/add/observable/fromEvent';
import { UtilsService } from '../services/utils.service';
import { SystemSettingsComponent } from '../system-settings/system-settings.component';
import { NotificationsComponent } from '../notifications/notifications.component';
import { ImageUploadService, } from '../services/image-upload.service';
import { TranslationService, LocaleService } from 'angular-l10n';
import { MessagingComponent } from '../messaging/messaging.component';
import { MessagingService } from '../services/messaging.service';
import { HttpEventType } from '@angular/common/http';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { WorkListService } from '../services/work-list.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-nav-bar',
	templateUrl: './nav-bar.component.html',
	styleUrls: ['./nav-bar.component.scss']
})

export class NavBarComponent implements OnInit, OnDestroy, AfterViewInit {
	// tslint:disable-next-line:no-output-on-prefix
	@ViewChild('systemSettings') systemSettings: SystemSettingsComponent;
	@ViewChild('notifications') notifications: NotificationsComponent;
	@ViewChild('messaging') messaging: MessagingComponent;
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onBroadcast = new EventEmitter();
	showMenu = false;
	showProfilePopup = false;
	showNotificationsPopup = false;
	showEllipsisMenu = false;
	showSystemSettings = false;
	newPassword = '';
	confirmPassword = '';
	avatarUrl = '';
	@ViewChild('landingPage') landingPage: LandingPageComponent;
	@ViewChild('changePasswordDrawer') changePasswordDrawer: ChangePasswordDrawerComponent;
	@ViewChild('rsaSecurity') rsaSecurity: MatExpansionPanel;
	@ViewChild('tsaSecurity') tsaSecurity: MatExpansionPanel;
	@ViewChild('tsaReporting') tsaReporting: MatExpansionPanel;
	@ViewChild('tsaRelationship') tsaRelationship: MatExpansionPanel;
	@ViewChild('tsaList') tsaList: MatExpansionPanel;
	reportingItems = ['auditing', 'utilization', 'collection-duration', 'collection-data'];
	securityItems = ['devices', 'roles', 'users', 'user-mode'];
	relationshipItems = ['clients', 'hubs', 'labs', 'locations', 'providers'];
	listItems = ['collection-maintenance', 'cancellations', 'labels', 'workload', 'collection-list', 'collection-site', 'containers', 'priorities', 'tests', 'work-list', 'work-list-builder'];
	languages = [{ code: 'en', display: 'English' }, { code: 'fr', display: 'French' }];
	currentWindowWidth: any;
	messages = [];
	ioConnection: any;
	targetFile: any;
	counter = 0;
	messageType = '';
	online = true;

	constructor(private workListService: WorkListService, public messagingService: MessagingService, private router: Router, public authService: AuthService,
		public utilsService: UtilsService, public imageUploadService: ImageUploadService, private deleteAvatarDialog: MatDialog, public translation: TranslationService, public locale: LocaleService) {
		this.setProfileAvatar();
	}

	ngOnInit(): void {
		this.currentWindowWidth = window.innerWidth;
		const language = localStorage.getItem('language') ? localStorage.getItem('language') : 'en';
		switch (language) {
			case 'fr':
				this.languages = [{ code: 'en', display: 'Anglais' }, { code: 'fr', display: 'Français' }];
				break;
			default:
				this.languages = [{ code: 'en', display: 'English' }, { code: 'fr', display: 'French' }];
		}
		this.authService.status.subscribe(res => {
			this.online = res;
		});
		this.checkRouter();
	}

	ngOnDestroy() {
	}

	checkRouter() {
		if (this.authService._isLoggedIn === false) {
			this.router.navigate(['/']);
		}
		if (this.router.routerState.snapshot.url !== '/') {
			document.querySelector('.poweredBy').classList.add('show');
			document.querySelector('.eMyLabCollect').classList.add('show');
		}
	}

	ngAfterViewInit(): void {
		if (this.router.url !== '/') {
			document.querySelector('.poweredBy').classList.add('show');
			document.querySelector('.eMyLabCollect').classList.add('show');
		}
	}

	// initIoConnection(): void {
	// 	this.messagingService.initSocket();
	// 	this.messages = [];
	// 	this.ioConnection = this.messagingService.onMessage()
	// 		.subscribe((response: any) => {
	// 			if (response.messages) {
	// 				response.messages.forEach(message => {
	// 					const time = moment(message.createdAt, 'YYYY-MM-DD[T]HH:mm:ss').format('h:mm a');
	// 					this.messages.push({ id: message.id, Author: message.Author, Recipient: message.Recipient, Content: message.Content, Time: time });
	// 				});
	// 				this.messaging.messagingChat.messages = this.messages;
	// 			} else if (response.data) {
	// 				const message = response.data;
	// 				const time = moment(message.createdAt, 'YYYY-MM-DD[T]HH:mm:ss').format('h:mm a');
	// 				this.messages.push({ Author: message.Author, Recipient: message.Recipient, Content: message.Content, Time: time });
	// 				if ((this.messaging.messagingChat.headerText === message.Recipient && message.Author === this.authService.currentUser.name) || (this.messaging.messagingChat.headerText === message.Author && message.Recipient === this.authService.currentUser.name)) {
	// 					this.messaging.messagingChat.displayMessages.push({ id: message.id, Author: message.Author, Recipient: message.Recipient, Content: message.Content, MessageType: message.MessageType, Time: time, Read: message.Read });
	// 				}
	// 				if (message.Recipient === this.authService.currentUser.name && message.Read === false) {
	// 					this.notificationService.notifications.push({ id: message.id, type: 'message', from: { name: message.Author, avatarURL: '' }, read: message.Read, data: message.Content, datetime: time });
	// 					this.utilsService.openNotificationsSnackBar(message.Content);
	// 				}
	// 				if (message.Recipient === 'New list') {
	// 					this.notificationService.notifications.push({ id: message.id, type: 'message', from: { name: message.Author, avatarURL: '' }, read: message.Read, data: message.Content, datetime: time });
	// 					this.onMessage.emit();
	// 				}
	// 			}
	// 		});
	// }

	@HostListener('window:resize') onResize() {
		this.currentWindowWidth = window.innerWidth;
		if (this.currentWindowWidth > 382) {
			this.showEllipsisMenu = false;
		}
	}

	setProfileAvatar() {
		if (this.authService.currentUser.avatarURL.length <= 1) {
			this.avatarUrl = '';
		} else {
			this.avatarUrl = this.authService.currentUser.avatarURL;
			this.imageUploadService.getImage(this.avatarUrl).subscribe(response => {
				if (response.status !== 200) {
					this.avatarUrl = '';
				}
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
				this.avatarUrl = '';
			});
		}
	}

	saveProfileAvatar(imageId) {
		this.authService.currentUser.avatarURL = imageId;
		localStorage.setItem('currentUser', JSON.stringify(this.authService.currentUser));
		this.setProfileAvatar();
	}

	openMenu() {
		this.showMenu = true;
		this.highlightCurrentPage();
	}

	closeMenu() {
		this.showMenu = false;
		if (this.authService.currentUser.role !== 'RMP_RSA') {
			this.tsaList.close();
			this.tsaRelationship.close();
			this.tsaSecurity.close();
			this.tsaReporting.close();
		}
	}

	hasPermission(screens) {
		let result = false;
		screens.split(',').forEach(screen => {
			if (this.authService.currentUser.permissions.find(item => item.Code.indexOf(`rmp_${screen.toLowerCase()}`) > -1)) {
				result = true;
			}
		});

		return result;
	}

	toggleSystemSettings() {
		if (this.showSystemSettings) {
			this.closeSystemSettings();
			this.showSystemSettings = !this.showSystemSettings;
		} else {
			this.openSystemSettings();
			this.showSystemSettings = !this.showSystemSettings;
		}
	}

	openSystemSettings() {
		if (this.hasPermission('system')) {
			this.systemSettings.show();
		}
	}

	closeSystemSettings() {
		this.systemSettings.closeDrawer();
	}

	openMessaging() {
		setTimeout(() => this.closeNotifications(), 300);
		this.showEllipsisMenu = false;
		this.messaging.show();
	}

	menuItemClick(menuItem) {
		this.router.navigate([menuItem], {});
		this.authService.currentUser.currentPage = menuItem;
		this.closeMenu();
	}

	clickToolbar(event) {
		if (event.srcElement && event.srcElement.localName && event.srcElement.localName === 'mat-toolbar') {
			this.notifications.closeNotifications();
		}
	}

	highlightCurrentPage() {
		if (this.authService.currentUser.role === 'RMP_TSA') {
			this.tsaList.close();
			this.tsaRelationship.close();
			this.tsaSecurity.close();
			this.tsaReporting.close();
			const currentPage = document.querySelector('#menu-' + this.router.url.split('/').join(''));
			if (currentPage) {
				if (this.securityItems.indexOf(this.router.url.split('/').join('')) !== -1) {
					this.tsaSecurity.open();
				} else if (this.relationshipItems.indexOf(this.router.url.split('/').join('')) !== -1) {
					this.tsaRelationship.open();
				} else if (this.listItems.indexOf(this.router.url.split('/').join('')) !== -1) {
					this.tsaList.open();
				} else if (this.reportingItems.indexOf(this.router.url.split('/').join('')) !== -1) {
					this.tsaReporting.open();
				}
				currentPage.classList.add('menu-item-selected');
			}
		} else if (this.authService.currentUser.role === 'RMP_RSA') {
			const currentPage = document.querySelector('#menu-' + this.router.url.split('/').join(''));
			this.rsaSecurity.open();
			currentPage.classList.add('menu-item-selected');
		}

	}

	openProfile() {
		this.showProfilePopup = true;
	}

	closeProfile() {
		this.showProfilePopup = false;
	}

	getAvatarText() {
		const namePieces = this.authService.currentUser.name.split(' ');
		let avatarText = '';
		if (namePieces.length >= 1) {
			avatarText += namePieces[0].substring(0, 1).toUpperCase();
		}
		if (namePieces.length >= 2) {
			avatarText += namePieces[1].substring(0, 1).toUpperCase();
		}
		return avatarText;
	}

	openSetLandingPage() {
		this.closeProfile();
		this.landingPage.show();
	}

	toggleOverlay(): void {
		const overlay: HTMLDivElement = document.querySelector('#overlay');
		overlay.hidden = !overlay.hidden;
	}

	openChangePassword() {
		this.closeProfile();
		this.changePasswordDrawer.show();
	}

	signOut() {
		this.authService.logout().subscribe(response => {
			if (response.status !== 200) {
				console.log('Sign Out error: ', response.statusText);
			}
		});
		this.authService.manualLogout = true;
		this.router.navigate(['/'], {});
	}

	uploadFile($event) {
		if (this.utilsService.checkOnlineStatus()) {
			if ($event.target.files.length > 0) {
				// tslint:disable-next-line:prefer-const
				let reader = new FileReader();
				// tslint:disable-next-line:no-shadowed-variable
				reader.onload = ($event) => { this.uploadFileSuccess(); };
				reader.onerror = (error) => { this.uploadFileError(error); };
				reader.readAsBinaryString($event.target.files[0]);
				this.targetFile = $event.target.files[0];
			}
		}
	}

	uploadFileSuccess() {
		this.imageUploadService.saveImage(this.targetFile).subscribe((events) => {
			if (events.type === HttpEventType.UploadProgress) {
				console.log('Upload: ', Math.round(events.loaded / events.total * 100) + '%');
			} else if (events.type === HttpEventType.Response) {
				const imageId = atob(events.headers.get('Filename'));
				const imageURL = this.imageUploadService.getImageUrl(imageId);
				const updateBody = { 'AvatarURL': imageURL, 'LandingPage': this.authService.currentUser.landingPage };
				this.authService.updateProfile(JSON.stringify(updateBody)).subscribe((updateReponse) => {
					this.uploadProfileSuccess(imageURL);
				}, (error) => {
					this.uploadFileError(error);
				});
			}
		}, (error) => {
			this.uploadFileError(error);
			if (error.status === 401) { this.utilsService.handle401(error);
			 } else {
				this.uploadFileError(error);
			}
		});
	}

	uploadProfileSuccess(image) {
		if (this.authService.currentUser.avatarURL.length > 1) {
			const toEncode = this.authService.currentUser.avatarURL.split('/')[6];
			const encoded = btoa(toEncode);

			if (encoded && encoded !== 'null') {
				this.imageUploadService.deleteImage(encoded).subscribe((response) => {
					// Delete success
					console.log('response uploadSuccess: ', response);
				}, (error) => {
					// Delete error
					console.log('error uploadProfile: ', error);
				});
			}
		}
		this.saveProfileAvatar(image);
	}

	uploadFileError(error) {
		if (error.status === 413) {
			this.utilsService.showError(this.translation.translate('Error.The image you are trying to upload is too big, please select a different image'));
		} else {
			this.utilsService.showError(this.translation.translate('Error.Error, profile image could not be uploaded Please try again'));
		}
	}

	removeProfileAvatar() {
		if (this.utilsService.checkOnlineStatus()) {
			if (this.authService.currentUser.avatarURL.length >= 1) {
				const toEncode = this.authService.currentUser.avatarURL.split('/')[6];
				const encoded = btoa(toEncode);
				if (encoded && encoded !== 'null') {
					this.imageUploadService.deleteImage(encoded).subscribe((response) => {
						this.saveProfileAvatar('');
					}, (error) => {
						console.log('avatar delete error: ', error);
						if (error.status === 401) {
							this.utilsService.handle401(error);
						} else {
						this.deleteAvatarError();
						}
					});
				}
			}
		}
	}

	clickDeleteAvatar() {
		const dialogRef = this.deleteAvatarDialog.open(DeleteDialogComponent, {
			width: '300px',
			backdropClass: 'errorOverlay',
			autoFocus: false
		});
		dialogRef.beforeClose().subscribe(result => {
			if (document.body.querySelector('.add-overlay')) {
				document.body.removeChild(document.body.querySelector('.add-overlay'));
			}
			if (result) {
				this.removeProfileAvatar();
			} else { dialogRef.close(); }

		});
	}

	deleteAvatarError() {
		this.utilsService.showError(this.translation.translate('Error.Error, profile image could not be deleted Please try again'));
	}

	languageChange() {
		const language = this.authService.currentUser.language;
		let countryCode = 'US';
		let currencyCode = 'USD';
		const poweredBy = document.querySelector('.poweredBy');
		const pageSizeLabel = document.querySelector('.items-per-page') === null ? document.querySelector('.mat-paginator-page-size-label') : document.querySelector('.items-per-page');
		const pageRangeLabel = document.querySelector('.paginator-range') === null ? document.querySelector('.mat-paginator-range-label') : document.querySelector('.paginator-range');
		const previousButton: HTMLButtonElement = document.querySelector('.right-chevron') === null ? document.querySelector('.mat-paginator-navigation-previous') : document.querySelector('.right-chevron');
		const nextButton: HTMLButtonElement = document.querySelector('.left-chevron') === null ? document.querySelector('.mat-paginator-navigation-next') : document.querySelector('.left-chevron');

		switch (language) {
			case 'fr':
				countryCode = 'FR';
				currencyCode = 'EUR';
				poweredBy.innerHTML = 'Alimenté par';
				pageSizeLabel.innerHTML = 'objets par page';
				pageRangeLabel.innerHTML = pageRangeLabel.innerHTML.replace('of', 'de');
				window.sessionStorage.setItem('language', 'fr');
				this.languages = [{ code: 'en', display: 'Anglais' }, { code: 'fr', display: 'Français' }];
				previousButton.title = 'Précédent';
				nextButton.title = 'Prochain';
				localStorage.setItem('language', 'fr');
				break;
			default:
				poweredBy.innerHTML = 'Powered by';
				pageSizeLabel.innerHTML = 'Items per page';
				pageRangeLabel.innerHTML = pageRangeLabel.innerHTML.replace('de', 'of');
				window.sessionStorage.setItem('language', 'en');
				this.languages = [{ code: 'en', display: 'English' }, { code: 'fr', display: 'French' }];
				previousButton.title = 'Previous';
				nextButton.title = 'Next';
				localStorage.setItem('language', 'en');
				break;
		}

		this.locale.setDefaultLocale(this.authService.currentUser.language, countryCode, '', 'latn');
		this.locale.setCurrentCurrency(currencyCode);
		localStorage.setItem('currentUser', JSON.stringify(this.authService.currentUser));
	}

	openNotifications() {
		this.showNotificationsPopup = true;
	}

	closeNotifications() {
		this.showNotificationsPopup = false;
		this.notifications.showNotificationsPopup = false;
		this.notifications.messagesExpanded = false;
	}

	openEllipsisMenu() {
		this.showEllipsisMenu = true;
	}

	closeEllipsisMenu() {
		this.showEllipsisMenu = false;
	}

	receivedBroadcast(message) {
		this.onBroadcast.emit(message);
	}

	clickedNotificationMessage(user) {
		this.messaging.messagingChat.show('PrivateNotify', user);
	}
}
