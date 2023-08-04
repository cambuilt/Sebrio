import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatIconRegistry } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { LoginTwofactorComponent } from '../login-twofactor/login-twofactor.component';
import { SubdomainDialogComponent } from '../subdomain-dialog/subdomain-dialog.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DeviceService } from '../services/device.service';
import { RedirectDialogComponent } from '../redirect-dialog/redirect-dialog.component';
import { HttpClient } from '@angular/common/http';
import * as bcrypt from 'bcryptjs';
import { SystemService } from '../services/system.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslationService, LocaleService } from 'angular-l10n';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { MessagingService } from '../services/messaging.service';
// import { WorkListService } from '../services/work-list.service';
import { NgModel } from '@angular/forms';
import * as moment from 'moment';
declare var Fingerprint2: any;

@Component(
	{
		// tslint:disable-next-line:component-selector
		selector: 'rmp-login',
		templateUrl: './login.component.html',
		styleUrls: ['./login.component.css']
	})

export class LoginComponent implements OnInit, AfterViewInit {
	username: string;
	password: string;
	hasPasswordFocus = false;
	isSigningIn = false;
	public needsPasswordUpdate = false;
	deviceInfo = null;
	cordovaInfo = null;
	device: any = {
		SerialNumber: '',
		UUID: '',
		CordovaVersion: '',
		Model: '',
		OSVersion: '',
		Simulator: false,
		FingerPrint: '',
		Manufacturer: '',
		Platform: ''
	};
	theme: any = {
		default: {
			name: 'strong-cyan-theme',
			primary: '#27BDBA'
		},
		current: {
			name: '',
			primary: ''
		},
		selected: {
			name: '',
			primary: ''
		},
		changed: false
	};
	fingerPrint: string;
	ipAddress = (<any>window).ip;
	componentsReturned: any;
	saltRounds = 1;
	isOnline = true;
	showContent = false;
	correctSub = true;
	loginAttempts = 5;
	language = 'en';
	timer = moment().add(15, 'minutes'); // should be set to purge time
	interval: any;
	online = true;
	purgeActive = false;
	passed2FA = false;
	auth = '';
	accountJson;
	@ViewChild('passwordForm') passwordForm: any;

	constructor(private bluetoothSerial: BluetoothSerial, private systemService: SystemService, public http: HttpClient, public dialog: MatDialog, private router: Router, private authService: AuthService,
		private deviceService: DeviceDetectorService, private deviceServiceAuth: DeviceService, private utilsService: UtilsService, public translation: TranslationService,
		iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, public locale: LocaleService, private messagingService: MessagingService) {
		new Fingerprint2().get((result, components) => {
			this.device.FingerPrint = result;
			this.componentsReturned = components;
		});
		iconRegistry
			.addSvgIcon(
				'password-icon',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/lock.svg'))
			.addSvgIcon(
				'username-icon',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/outline-perm_identity-24px.svg'))
			;
	}

	ngOnInit() {
		setTimeout(() => this.observeOnlineStatus(), 600);
		setTimeout(() => this.checkCordova(), 700);
		this.language = localStorage.getItem('language') ? localStorage.getItem('language') : 'en';

		switch (this.language) {
			case 'fr':
				this.locale.setDefaultLocale('fr', 'FR', '', 'latn');
				this.locale.setCurrentCurrency('EUR');
				break;
			default:
				this.locale.setDefaultLocale('en', 'US', '', 'latn');
				this.locale.setCurrentCurrency('USD');
		}
		this.checkLoginStatus();
	}

	ngAfterViewInit(): void {
		this.checkSessionError();
	}

	checkSessionError() {
		const sessionExpireDirective = this.passwordForm._rawValidators[0];
		sessionExpireDirective.loadForm(this.passwordForm);
		if (this.authService.manualLogout === false && this.authService.logoutSubject.value !== 2) { // Session timeout
			sessionExpireDirective.setError();
		} else {
			sessionExpireDirective.removeError();
		}
	}

	checkLoginStatus() {
		if (this.authService._isLoggedIn === false) {
			this.startCountDown();
		} else {
			clearInterval(this.interval);
		}
	}

	observeOnlineStatus() {
		this.authService.status.subscribe(res => {
			this.online = res;
		});
	}

	clearStorage() {
		console.log('clear storage executed');
		localStorage.removeItem('lastKnownUser');
		localStorage.removeItem('currentUser');
		localStorage.removeItem('workListService');
		this.authService._destroyData = true;
		this.authService.destructionSubject.next(this.authService._destroyData);
	}

	startCountDown() {
		console.log('manual logout: ', this.authService.manualLogout);
		if (location.href.split('/')[2].split('.')[0] !== 'rsa') {
			if (this.purgeActive == true) {
				// tslint:disable-next-line:radix
				let purge = parseInt(localStorage.getItem('purge'));
				this.timer = moment().add(purge, 'minutes');
				if (this.authService.manualLogout === false) { // Session timeout
					this.timer = moment().subtract(15, 'minutes');
					console.log('user did not manually log out, subtracting 15 min from purge timer. Timer is... ', this.timer);
				} else {

				}
				this.interval = setInterval(() => this.beginCounting(), 60000);
			}
		}
	}

	beginCounting() {
		// this.timer--;
		// console.log('purge timer: ', this.timer, ' seconds before data wipe');
		// if (this.timer <= 0) {
		if (moment().isAfter(this.timer)) {
			clearInterval(this.interval);
			this.clearStorage();
			console.log('the purge has commenced, all your data is now gone');
		}
	}

	stopCounting() {
		clearInterval(this.interval);
	}

	getIP() { // not using this now, probably will for desktop authentication
		this.authService.getIpAddress().subscribe(data => {
			this.ipAddress = (<any>data)._body;
		});
	}

	getSystemSettings() {
		if (this.authService._connectionStatus === true) {
			this.systemService.getTenantSettingsUnauthenticated().subscribe(response => {
				const settings = response.json();
				console.log('settings are', settings);
				console.log('settings: ', settings);
				if (localStorage.getItem('purge')) {
					localStorage.removeItem('purge');
				}
				console.log('idle return: ', settings.IdleTime);
				const purge = ((settings.IdleTime * 60));
				localStorage.setItem('purge', purge.toString());
				this.timer = moment().add(purge, 'minutes');
				const mpLogo: HTMLImageElement = document.querySelector('#mpLogo');
				if (settings.URLLoginPage === '') {
					mpLogo.src = 'assets/logo.svg';
				} else {
					mpLogo.src = settings.URLLoginPage;
				}
				this.theme.selected.name = settings.ThemeColor;
				this.changeTheme();
				// this.startCountDown();
			});
		}
	}

	changeTheme(): void {
		const bodyClasses = document.body.classList;
		bodyClasses.remove(Array.from(bodyClasses).find(item => item.includes('-theme')));
		if (this.theme.selected.name !== '') {
			bodyClasses.add(this.theme.selected.name);
		}
		this.showContent = true;
	}

	checkCordova() {
		if ((<any>window).deviceReady === true) {
			// check localstorage for a subdomain
			if (localStorage.getItem('subdomain')) {
				this.findPrinters();
				this.checkConnection();
			} else { // get subdomain from them
				this.openSubdomainDialog();
			}
		} else { // if not found (not on cordova app)
			this.checkConnection();
		}
	}

	findPrinters() {
		this.bluetoothSerial.list().then(success => {
			this.disconnectPrinters(JSON.stringify(success));
		}, error => {
			this.utilsService.showError(`Error.Error: ${JSON.stringify(error)}`);
		});
	}

	disconnectPrinters(items) {
		this.authService.lastKnownPrinter = '';
		items.forEach(item => {
			if (item.class === 1664) {
				this.bluetoothSerial.disconnect();
			}
		});
	}

	testSubDomain() {
		const domain = localStorage.getItem('subdomain');
		this.systemService.getSubdomainUnauthenticated(domain).subscribe(response => {
			if (response.status !== 200) {
				localStorage.removeItem('subdomain');
				this.openSubdomainDialog();
			} else { // set the subdomain for authService and checkToken()
				this.authService.subdomain = localStorage.getItem('subdomain');
				this.checkToken();
			}
		});
	}

	checkConnection() {
		if (this.online === true) {
			if ((<any>window).deviceReady === true) {
				this.testSubDomain();
			} else {
				this.setSubdomainBrowser();
				this.checkToken();
			}
		} else {
			const mpLogo: HTMLImageElement = document.querySelector('#mpLogo');
			mpLogo.src = 'assets/logo.svg';
			this.showContent = true;
			// tslint:disable-next-line:radix
			this.timer = moment().add(parseInt(localStorage.getItem('purge')), 'minutes');
			this.startCountDown();
			return;
		}
	}

	setSubdomainBrowser() {
		if (location.href.split('/')[2].split('.')[0] === 'localhost:4200') {
			this.authService.subdomain = 'rhodes';
		} else if (location.href.split('/')[2].split('.')[0] === 'emylabcollect') {
			this.utilsService.showError(this.translation.translate('Error.Please access the correct subdomain'));
			return;
		} else {
			this.authService.subdomain = location.href.split('/')[2].split('.')[0];
		}
	}

	checkDevice() { // check if they are on a mobile device
		this.deviceInfo = this.deviceService.getDeviceInfo();
		if (this.deviceInfo.userAgent.toLowerCase().search('android|iphone|ipad') >= 0) {
			// if they are, determine platform (browser or app?)
			setTimeout(() => this.determinePlatform(), 500);
		} else { // they are on a desktop so let them thru
			const desktopJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXAiOiJEZXNrdG9wIn0=.zT3I6hOak90xH5VEhSzLtVMHeBeaSnn0PD4rNBC1dRM=';
			localStorage.setItem('deviceJWT', desktopJWT);
			const token = { DeviceToken: desktopJWT };
			this.sendToken(token);
		}
	}

	determinePlatform() { // cordova will only be present if running the app
		if ((<any>window).deviceReady) { // set device info to post
			this.device.Model = (<any>window).device.model;
			this.device.SerialNumber = (<any>window).device.serial;
			this.device.OSVersion = (<any>window).device.version;
			this.device.Simulator = (<any>window).device.isVirtual;
			this.device.UUID = (<any>window).device.uuid;
			this.device.Manufacturer = (<any>window).device.manufacturer;
			this.device.Platform = (<any>window).device.platform;
			this.device.CordovaVersion = (<any>window).device.cordova;
			// This is where we will perform POST
			this.postDeviceInfo();
		} else { // if no cordova is found then they need to use the app
			this.showRedirectDialog();
		}
	}

	checkIfRooted() {
		// if ((<any>window).device.manufacturer.toLowerCase() !== 'pad') {
		if ((<any>window).deviceRooted === true) { // if it is rooted it is unsafe to use
			this.callOperatorDialog(`This device has been either rooted or jailbroken and is unsafe to use`);
			return;
		} else {
			const token = localStorage.getItem('deviceJWT');
			const tokenObject = { DeviceToken: token };
			this.sendToken(tokenObject);
		}
	}

	postDeviceInfo() {
		this.deviceServiceAuth.createDeviceMobile(JSON.stringify(this.device)).subscribe(response => { this.saveOnComplete(response); }, error => {
			this.saveOnComplete(error);
		});
	}

	checkToken() { // check to see if there is a valid token
		this.getSystemSettings();
		if (localStorage.getItem('deviceJWT')) {
			if ((<any>window).deviceReady === true) { // if on cordova check to verify the device hasn't been jailbroken or rooted
				this.checkIfRooted();
			} else { // on a desktop send the token if exists
				const token = localStorage.getItem('deviceJWT');
				const tokenObject = { DeviceToken: token };
				this.sendToken(tokenObject);
			}
		} else { // check the device
			setTimeout(() => this.checkDevice(), 500);
		}
	}

	sendToken(token) {
		this.deviceServiceAuth.postToken(token).subscribe(response => { this.sendTokenComplete(response); }, error => {
			this.sendTokenComplete(error);
		});
	}

	sendTokenComplete(response) {
		if (response.status === 200) {
			// allow login
		} else if (response.status === 403) {
			this.determinePlatform();
		} else if (response.status === 401) {
			localStorage.removeItem('deviceJWT');
			this.determinePlatform();
		} else {
			this.utilsService.showError(this.translation.translate(`Error.Error authenticating device`));
		}
	}

	saveOnComplete(response) {
		if (response.status === 200) {
			const returnedInfo = response.json(); // special number comes from Barry
			const secretNumber = returnedInfo.SecretNumber;
			const token = returnedInfo.DeviceToken;
			// set token then tell them to call
			if (returnedInfo.Exists === 0) {
				localStorage.setItem('deviceJWT', token);
				this.callOperatorDialog(`${this.translation.translate('Error.Please call the following number: 704-277-2181 and confirm this secret number')} ${secretNumber}`);
			} else {
				if (token !== null && token !== undefined && token !== '') {
					localStorage.removeItem('deviceJWT');
					localStorage.setItem('deviceJWT', token);
				}
				this.callOperatorDialog(`${this.translation.translate('Error.Your device already exists in the system Please call 704-277-2181 and confirm this secret number')} ${secretNumber}`);
			}
		} else {
			this.utilsService.showError(`${this.translation.translate('Error.Device could not be saved due an unknown error If the error persists please contact support')}`);
		}
	}

	setLastUser() {
		localStorage.removeItem('lastKnownUser');
		const hashThis = this.username + this.password;
		bcrypt.genSalt(this.saltRounds, function (err, salt) {
			bcrypt.hash(hashThis, salt, function (err2, hash) {
				localStorage.setItem('lastKnownUser', hash);
			});
		});
	}

	compareLastKnownUser() {
		if (this.loginAttempts > 0) {
			const lastKnown = localStorage.getItem('lastKnownUser');
			const compareThis = this.username + this.password;
			bcrypt.compare(compareThis, lastKnown).then((res) => {
				if (res) {
					console.log('Congrats! You were the last user');
					clearInterval(this.interval);
					this.utilsService.showError(this.translation.translate('Error.You were the last user, routing to work list'));
					this.router.navigate(['/work-list'], {});
					this.authService._isLoggedIn = true;
					this.authService.startCountDown();
					this.authService.startMouseSub();
				} else {
					this.loginAttempts--;
					this.utilsService.showError(`You were not the lastKnownUser, you only have ${this.loginAttempts} attempts remaining to login before data is lost. This message is for demonstration and will be replaced by a different message.`);
				}
			})
				.catch((err) => {
					this.utilsService.showError(err);
				});
		} else {
			// purge data now
			this.loginAttempts = 5;
			clearInterval(this.interval);
			this.clearStorage();
			this.utilsService.showError(`you are out of attempts, data has been cleared`);
		}
	}

	inputOnFocus(inputName) {
		if (inputName === 'username') {
			this.hasPasswordFocus = false;
		} else if (inputName === 'password') {
			this.hasPasswordFocus = true;
		}
	}

	signIn() {
		if (this.username !== '' && this.username !== undefined && this.username !== null && this.password !== '' && this.password !== null && this.password !== undefined) {
			if (this.online === false) {
				const mpLogo: HTMLImageElement = document.querySelector('#mpLogo');
				mpLogo.src = 'assets/logo.svg';
				this.showContent = true;
				this.compareLastKnownUser();
			} else {
				// if (!this.isSigningIn) {
				this.isSigningIn = true;
				this.authService.getUserAccountStatus(this.username.trim(), this.password.trim()).subscribe(accountResponse => {
					this.loginAttempts--;
					// if (this.loginAttempts <= 0) { this.clearStorage(); }
					if (accountResponse.status === 200) {
						this.authService.currentUser.username = this.username;
						setTimeout(() => this.setLastUser(), 1000); // reset lastKnownUser
						this.accountJson = accountResponse.json();
						if (this.accountJson.HasSession === true) {
							// user already is in session
							this.utilsService.showError(`${this.translation.translate(`Error.Your session is currently locked Please try again later`)}`);
							return;
						} else if (location.href.split('/')[2].split('.')[0] === 'localhost:4200') {
							const userType: string = this.accountJson.UserType;
							this.setUserInfo(userType.toLowerCase(), `RMP_${userType}`);
						} else if (location.href.split('/')[2].split('.')[0] !== 'localhost:4200') {
							this.verifyDomain();
						}
					} else {
						this.utilsService.showError(`${this.translation.translate('Error.Error retrieving user account status')} HTTP error ${accountResponse.statusText}, error ${accountResponse.status}`);
					}
				}, error => {
					this.isSigningIn = false;
					if (error.status === 423) {
						this.loginAttempts--;
						if (this.loginAttempts <= 0) { this.clearStorage(); }
						console.log(`there are ${this.loginAttempts} remaining before clearStorage()`);
						this.utilsService.showError(`User "${this.username}" ${this.translation.translate('Error.is inactive or there were too many login attempts Please contact your system administrator')}`);
					} else {
						this.loginAttempts--;
						if (this.loginAttempts <= 0) { this.clearStorage(); }
						console.log(`there are ${this.loginAttempts} remaining before clearStorage()`);
						this.utilsService.showError(`${this.translation.translate('Error.Invalid Username or Password Please try again')}. error occurred on line 364 in login`);
					}
				});
				// }
			}
		} else {
		this.isSigningIn = false; this.utilsService.showError(`${this.translation.translate('Error.Invalid Username or Password Please try again')}.`);
		}
	}

	verifyDomain() {
		let sub;
		if ((<any>window).deviceReady === true) {
			sub = this.authService.subdomain;
		} else {
			sub = location.href.split('/')[2].split('.')[0];
		}
		if (this.accountJson.SubDomain.toLowerCase() !== sub.toLowerCase()) {
			// tell user to access the correct subdomain to login
			this.isSigningIn = false;
			this.correctSub = false;
			if ((<any>window).deviceReady) {
				this.utilsService.showError(`${this.translation.translate('Error.You are not a user of')} ${this.authService.subdomain}. ${this.translation.translate('Error.Please navigate to your domain and try again')}`);
				localStorage.removeItem('subdomain');
				setTimeout(() => this.dialog.closeAll(), 3500);
				setTimeout(() => this.openSubdomainDialog(), 4000);
			} else {
				this.utilsService.showError(`${this.translation.translate('Error.You are not a user of')} ${location.href.split('/')[2].split('.')[0]}. ${this.translation.translate('Error.Please navigate to your domain and try again')}`);
			}
			return;
		} else {
			if (this.checkNeedsPassword() === false) {
				this.checkNeedsSecurityCode();
			}
		}
	}

	checkNeedsPassword() {
		if (this.accountJson.ChangePasswordRequired === true) {
			this.openChangePasswordDialog();
			this.password = '';
			this.isSigningIn = false;
			return true;
		} else {
			const userType: string = this.accountJson.UserType;
			this.setUserInfo(userType.toLowerCase(), `RMP_${userType}`);
			return false;
		}
	}

	checkNeedsSecurityCode() {
		return false;
	}

	showRedirectDialog() {
		this.dialog.open(RedirectDialogComponent,
			{
				panelClass: 'redirect-dialog',
				backdropClass: 'errorOverlay',
				data: this.translation.translate('Error.In order to run the eMyLabCollect application, please download the mobile app by clicking on the following link')
			});
	}

	callOperatorDialog(message) {
		this.dialog.open(ErrorDialogComponent,
			{
				panelClass: 'err-dialog',
				backdropClass: 'errorOverlay',
				data: message,
				disableClose: true,
				autoFocus: false
			});
		(document.querySelector('.alert-dialog')).removeChild(document.querySelector('.btn-alert-ok'));
	}

	openChangePasswordDialog(): void {
		const dialogRef = this.dialog.open(ChangePasswordComponent, {
			panelClass: 'rmp-change-pwd-dialog',
			backdropClass: 'fullPageOverlay',
			disableClose: true,
			data: { username: this.username, password: this.password }
		});
		dialogRef.beforeClose().subscribe(data => {
			this.password = dialogRef.componentInstance.data.password;
			if (this.checkNeedsSecurityCode() === false) {
				this.signIn();
			}
		});
	}

	openSubdomainDialog(): void {
		const dialogRef = this.dialog.open(SubdomainDialogComponent, {
			panelClass: 'rmp-subdomain-dialog',
			backdropClass: 'fullPageOverlay',
			disableClose: true
		});
		(<any>window).Keyboard.show();
		dialogRef.beforeClose().subscribe(result => {
			setTimeout(() => this.checkCordova(), 500);
		});
	}

	setUserInfo(urlRole, role) {
		const token = localStorage.getItem('deviceJWT');
		if (this.accountJson.Role.Is2FAEnabled == true && this.passed2FA === false) {
			this.passed2FA = true;
			const dialogRef = this.dialog.open(LoginTwofactorComponent, {
				panelClass: 'rmp-login-twofactor-dialog',
				backdropClass: 'fullPageOverlay',
				disableClose: true,
				data: { username: this.username.trim(), code: this.accountJson.Role.AuthenticationFactor.Code, urlRole: urlRole, password: this.password.trim(), token: token }
			});
			dialogRef.beforeClose().subscribe(data => {
				const date = this.accountJson.Role.AuthenticationFactor.Code === 'dateTechCode' ? moment().format('MMDDYYYY') : '';
				this.auth = `${date}${dialogRef.componentInstance.data}`;
				if (this.auth) {
					this.setUserInfo(urlRole, role);
				}
			});
			return;
		}
		this.authService.login(urlRole, this.username.trim(), this.password.trim(), token, this.auth).subscribe(response => {
			this.isSigningIn = false;
			const json = response.json();
			if (response.status === 200) {
				this.loginAttempts = 5;
				this.authService._isLoggedIn = true;
				this.authService.logoutSubject.next(1);
				this.authService.generate();
				this.authService.currentUser.name = `${json.FirstName} ${json.LastName}`;
				this.authService.currentUser.role = role; // 'RMP_RSA'
				this.authService.currentUser.avatarURL = !!json.AvatarURL ? json.AvatarURL : '';
				this.authService.currentUser.landingPage = json.LandingPage;
				if (this.authService.currentUser.role === 'RMP_RSA' && json.LandingPage !== 'tenants' && json.LandingPage !== 'users') {
					this.authService.currentUser.landingPage = 'tenants';
				}
				// if (this.authService.currentUser.role === 'RMP_TSA') {
				// 	this.authService.currentUser.landingPage = 'roles';
				// }
				this.authService.currentUser.name = `${json.FirstName} ${json.LastName}`;
				this.authService.currentUser.email = json.Email;
				this.authService.currentUser.language = this.language;
				this.authService.currentUser.tenantId = this.authService.currentUser.role === 'RMP_TSA' ? json.TenantId : undefined;
				this.authService.currentUser.username = this.username.trim().toLowerCase();
				this.authService.currentUser.permissions = this.authService.currentUser.role === 'RMP_RSA' ? [{ Code: 'rmp_tenantmaintenance' }, { Code: 'rmp_usermaintenance' }] : json.Permissions.filter(a => a.RWU !== '');
				this.authService.currentUser.sessionToken = json.SessionToken;
				localStorage.setItem('token', json.SessionToken);
				clearInterval(this.interval);
				if (localStorage.getItem('currentUser') !== null && JSON.parse(localStorage.getItem('currentUser')).username !== this.authService.currentUser.username) {
					localStorage.removeItem('workListLastAction');
				}
				localStorage.setItem('currentUser', JSON.stringify(this.authService.currentUser));
				this.authService.logoutSubject.next(1);
				this.router.navigate([`/${this.authService.currentUser.landingPage}`], {});
				// ******* This console log is needed to instantiate web socket. DO NOT DELETE! **************
				setTimeout(() => console.log('activate web socket: ', this.messagingService.mysocket), 1000);
			} else {
				this.loginAttempts--;
				this.isSigningIn = false;
				if (this.loginAttempts <= 0) { this.clearStorage(); }
				console.log(`there are ${this.loginAttempts} remaining before clearStorage()`);
				this.utilsService.showError(`${this.translation.translate('Error.Invalid Username or Password Please try again')}. Error ${response.statusText}, status ${response.status}, error occurred on line 629 in login`);
			}
		}, error => {
			this.loginAttempts--;
			if (this.loginAttempts <= 0) { this.clearStorage(); }
			console.log(`there are ${this.loginAttempts} remaining before clearStorage()`);
			this.isSigningIn = false;
			this.utilsService.showError(`${this.translation.translate('Error.Invalid Username or Password Please try again')}. Error ${error.statusText}, status ${error.status}, error occurred on line 636 in login`);
		});
	}

}
