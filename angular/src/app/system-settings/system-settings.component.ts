import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { AuthService } from '../services/auth.service';
import { SystemService } from '../services/system.service';
import { Subscription, Observable, timer } from '../../../node_modules/rxjs';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { NgModel } from '@angular/forms';
import { ImageUploadService, } from '../services/image-upload.service';
import { TranslationService } from 'angular-l10n';
import { HttpEventType } from '@angular/common/http';


@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-system-settings',
	templateUrl: './system-settings.component.html',
	styleUrls: ['./system-settings.component.scss']
})

export class SystemSettingsComponent implements OnInit, AfterViewInit {
	@Input() navbarImageRef: any;
	isDrawerOpen = false;
	addAnother: boolean;

	@ViewChild('loginImageInput') loginImageInput: ElementRef;
	@ViewChild('navbarImageInput') navbarImageInput: ElementRef;
	@ViewChild('watermarkImageInput') watermarkImageInput: ElementRef;
	@ViewChild('idleTime') idleTimeInput: any;
	targetFile: any;
	idleTimer: any;
	subscription: Subscription;
	mouseSubscribe: Subscription;
	clickSubscribe: Subscription;
	themes = [
		{
			primary: '#BD278F',
			name: 'strong-pink-theme'
		},
		{
			primary: '#A027BD',
			name: 'strong-magenta-theme'
		},
		{
			primary: '#6C27BD',
			name: 'strong-violet-theme'
		},
		{
			primary: '#2744BD',
			name: 'strong-blue-theme'
		},
		{
			primary: '#2772BD',
			name: 'strong-blue2-theme'
		},
		{
			primary: '#2795BD',
			name: 'strong-blue3-theme'
		},
		{
			primary: '#27BDBA',
			name: 'strong-cyan-theme'
		},
		{
			primary: '#27BD6C',
			name: 'strong-cyan-lime-green-theme'
		},
		{
			primary: '#78BD27',
			name: 'strong-green-theme'
		},
		{
			primary: '#B7BD27',
			name: 'strong-yellow-theme'
		},
		{
			primary: '#BD8327',
			name: 'strong-orange-theme'
		},
		{
			primary: '#BD2727',
			name: 'strong-red-theme'
		}
	];
	settings = {
		IdleActive: false,
		IdleTime: 0,
		ThemeColor: '',
		URLLoginPage: '',
		URLLoginPageFile: '',
		URLNavigationBar: '',
		URLNavigationBarFile: '',
		URLWatermark: '',
		URLWatermarkFile: ''
	};
	newSettings = {
		IdleActive: false,
		IdleTime: 0,
		ThemeColor: '',
		URLLoginPage: '',
		URLLoginPageFile: '',
		URLNavigationBar: '',
		URLNavigationBarFile: '',
		URLWatermark: '',
		URLWatermarkFile: ''
	};
	files: any = {
		navbar: {
			default: 'assets/logo.svg',
			input: this.navbarImageInput,
			image: (<HTMLImageElement>this.navbarImageRef),
			label: {
				current: '',
				selected: ''
			},
			changed: false,
			URL: this.newSettings.URLNavigationBar
		},
		watermark: {
			default: 'assets/Watermark.png',
			input: this.watermarkImageInput,
			label: {
				current: '',
				selected: ''
			},
			changed: false,
			URL: this.newSettings.URLWatermark
		},
		login: {
			default: 'assets/logo.svg',
			input: this.loginImageInput,
			label: {
				current: '',
				selected: ''
			},
			changed: false,
			URL: this.newSettings.URLLoginPage
		}
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
	purgePeriod: any = {
		idleTime: {
			current: 0,
			selected: 0
		},
		idleTimeActive: {
			current: 0,
			selected: 0
		}
	};

	objectForm = [];
	@ViewChild('idleTime') idleTime: NgModel;

	constructor(public authService: AuthService, private systemService: SystemService, private imageUploadService: ImageUploadService, public utilsService: UtilsService, public errorAlert: MatDialog, public translation: TranslationService) {
	}

	ngAfterViewInit() {
		this.objectForm.push(this.idleTime);
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	saveForm() {
		let formValid = true;
		this.objectForm.forEach(c => {
			c.control.markAsDirty();
			c.control.markAsTouched();
			c.control.updateValueAndValidity();
			if (!c.valid) {
				formValid = false;
			}
		});
		return formValid;
	}

	ngOnInit(): void {
		console.log(`System settings init`);
		if (this.authService.currentUser.role === 'RMP_TSA') {
			this.theme.selected.name = localStorage.getItem('theme');
			this.changeTheme();
			if (this.findPermissions()) {
				this.getSystemSettings();
			} else {
				this.getSystemSettingsUnauthenticated();
			}
			this.startMouseSub();
			this.startTimer();
		} else {
			this.setWatermarkImage(this.files.watermark.default);
			this.getChildren();
			this.setNavbarImage(this.files.navbar.default);
			this.resetTheme();
			this.changeTheme();
		}
		this.identifyPlatform();
	}

	findPermissions() {
		if (this.authService.currentUser.permissions.find(permission => permission.Code === 'rmp_systemmaintenance') !== undefined) {
			return true;
		} else {
			return false;
		}
	}

	show() {
		this.isDrawerOpen = true;
		document.querySelector('rmp-system-settings .drawer-content').scrollTop = 0;
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.utilsService.closeSnackBar();
		this.resetOnClose();
	}

	clickOverlay() {
		if (this.settingsHaveChanged()) {
			const dialogRef = this.errorAlert.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (document.body.querySelector('.add-overlay')) {
					document.body.removeChild(document.body.querySelector('.add-overlay'));
				}
				if (result) {
					this.save();
				} else { this.closeDrawer(); }

			});
		} else {
			this.closeDrawer();
		}
	}

	settingsHaveChanged() {
		if (this.files.navbar.changed || this.files.watermark.changed || this.files.login.changed ||
			this.theme.changed || (this.purgePeriod.idleTime.selected !== this.purgePeriod.idleTime.current) ||
			(this.purgePeriod.idleTimeActive.selected !== this.purgePeriod.idleTimeActive.current)) {
			return true;
		} else {
			return false;
		}
	}

	resetOnClose() {
		this.resetAdd();
		Object.keys(this.files).forEach(key => {
			this.files[key].label.selected = this.files[key].label.current;
			this.files[key].input.value = '';
			this.files[key].changed = false;
		});
		this.purgePeriod.idleTime.selected = this.purgePeriod.idleTime.current;
		this.purgePeriod.idleTimeActive.selected = this.purgePeriod.idleTimeActive.current;
		this.idleTimeInput.valueAccessor._elementRef.nativeElement.value = this.purgePeriod.idleTime.selected;
		this.theme.selected = this.theme.current;
		this.theme.changed = false;
		const picker = document.querySelector('.color-picker-icon');
		(<HTMLElement>picker).removeAttribute('style');
		this.newSettings = JSON.parse(JSON.stringify(this.settings));
	}

	getSystemSettings(): void {
		this.systemService.getTenantSettings().subscribe(response => {
			this.getChildren();
			this.settings = response.json();
			this.purgePeriod.idleTime.current = this.purgePeriod.idleTime.selected = this.settings.IdleTime;
			this.purgePeriod.idleTime.current = this.purgePeriod.idleTime.selected = this.displayIdleTime();
			this.purgePeriod.idleTimeActive.current = this.purgePeriod.idleTimeActive.selected = this.settings.IdleActive;
			if (this.settings.ThemeColor === '') {
				this.theme.current.name = this.theme.selected.name = 'strong-cyan-theme';
			} else {
				this.theme.current.name = this.theme.selected.name = this.settings.ThemeColor;
			}
			this.files.navbar.label.selected = this.files.navbar.label.current = this.settings.URLNavigationBarFile;
			this.files.navbar.URL = this.settings.URLNavigationBar;
			this.files.login.label.selected = this.files.login.label.current = this.settings.URLLoginPageFile;
			this.files.login.URL = this.settings.URLLoginPage;
			this.files.watermark.label.selected = this.files.watermark.label.current = this.settings.URLWatermarkFile;
			this.files.login.URL = this.settings.URLWatermarkFile;
			this.newSettings = JSON.parse(JSON.stringify(this.settings));
			this.changeTheme();
			if (this.settings.URLNavigationBar !== '') {
				this.setNavbarImage(this.settings.URLNavigationBar);
			} else {
				this.setNavbarImage(this.files.navbar.default);
			}
			if (this.settings.URLWatermark !== '') {
				this.setWatermarkImage(this.settings.URLWatermark);
			} else {
				this.setWatermarkImage(this.files.watermark.default);
			}

		}, error => {
			if (error.status !== 403) {
				this.utilsService.showError(`${this.translation.translate('Error.Error getting system settings')} ${error.statusText}, ${this.translation.translate('Label.error')}  ${error.status}`);
			}
			this.utilsService.handle401(error);
		});

	}

	getSystemSettingsUnauthenticated(): void {
		this.systemService.getTenantSettingsUnauthenticated().subscribe(response => {
			this.getChildren();
			this.settings = response.json();
			this.theme.current.name = this.theme.selected.name = this.settings.ThemeColor;
			this.files.navbar.label.selected = this.files.navbar.label.current = this.settings.URLNavigationBarFile;
			this.files.login.label.selected = this.files.login.label.current = this.settings.URLLoginPageFile;
			this.files.watermark.label.selected = this.files.watermark.label.current = this.settings.URLWatermarkFile;
			this.newSettings = JSON.parse(JSON.stringify(this.settings));
			this.changeTheme();
			if (this.settings.URLNavigationBar !== '') {
				this.setNavbarImage(this.settings.URLNavigationBar);
			} else {
				this.setNavbarImage(this.files.navbar.default);
			}
			if (this.settings.URLWatermark !== '') {
				this.setWatermarkImage(this.settings.URLWatermark);
			} else {
				this.setWatermarkImage(this.files.watermark.default);
			}

		}, error => {
			if (error.status !== 403) {
				this.utilsService.showError(`${this.translation.translate('Error.Error getting system settings')} ${error.statusText}, ${this.translation.translate('Label.error')}  ${error.status}`);
			}
			this.utilsService.handle401(error);
		});
	}

	getChildren(): void {
		this.files.navbar.image = (<HTMLImageElement>this.navbarImageRef);
		this.files.navbar.input = this.navbarImageInput.nativeElement;
		this.files.watermark.input = this.watermarkImageInput.nativeElement;
		this.files.login.input = this.loginImageInput.nativeElement;
	}

	setWatermarkImage(url) {
		const watermark = <HTMLElement>document.querySelector('.watermark');
		watermark.removeAttribute('style');

		if (url === '') {
			watermark.setAttribute('style', 'background-image: url(' + this.files.watermark.default + '); opacity: .08;');
		} else {
			watermark.setAttribute('style', 'background-image: url("' + url + '"); opacity: .08;');
		}
		document.querySelector('.watermark').classList.add('show');
	}

	setNavbarImage(url) {
		const img = this.files.navbar.image;
		img.height = 31;
		img.width = 200;

		if (url === '') {
			img.src = this.files.navbar.default;
		} else {
			img.src = url;
		}
	}

	displayIdleTime(): string {
		const minutes = this.purgePeriod.idleTime.selected % 60;
		const hours = Math.floor(this.purgePeriod.idleTime.selected / 60);
		let minutesDisplay = minutes.toString();
		let hoursDisplay = hours.toString();
		if (minutes < 10) {
			minutesDisplay = '0' + minutesDisplay;
		}
		if (hours < 10) {
			hoursDisplay = '0' + hoursDisplay;
		}
		return (hoursDisplay + ':' + minutesDisplay);
	}

	reduceIdleTime(s: string): number {
		const times = s.split(':');
		const timeInMinutes = parseInt(times[0], 10) * 60 + parseInt(times[1], 10);
		return timeInMinutes;
	}

	idleTimeChange(event: any) {
		const e = event.target;
		let times = e.value.split(':');
		if (e.value.length === 2) {
			times = times.join('');
			e.value = times.charAt(0) + ':' + times.charAt(1) + times.charAt(2);
		} else if (e.value.length === 4) {
			times = times.join('');
			e.value = times.charAt(0) + times.charAt(1) + ':' + times.charAt(2) + times.charAt(3);
		}
		const charCode = (event.which) ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		} else { return true; }
	}

	idleTimeFill(event: any) {
		const e = event.target;
		if (e.value.length === 4) {
			let times = e.value.split(':');
			if (e.value.charAt(1) === ':') {
				times[0] = '0' + times[0];
				times = times.join(':');
				e.value = times;
			} else {
				times[1] = '0' + times[1];
				times = times.join(':');
				e.value = times;
			}
		} else if (e.value.length === 2) {
			e.value = '00:' + e.value;
		} else if (e.value.length === 1) {
			e.value = '00:0' + e.value;
		}
		this.purgePeriod.idleTime.selected = this.reduceIdleTime(this.idleTimeInput.nativeElement.value);
	}

	startMouseSub() {
		this.mouseSubscribe = Observable.fromEvent(document, 'mousemove').subscribe(e => { this.resetTimer(); });
		this.clickSubscribe = Observable.fromEvent(document, 'click').subscribe(e => { this.resetTimer(); });
	}

	startTimer() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
		if (this.purgePeriod.idleTimeActive.selected) {
			this.idleTimer = timer(this.reduceIdleTime(this.purgePeriod.idleTime.selected) * 60000);
			this.subscription = this.idleTimer.subscribe(n => {
				this.timerComplete(n);
			});
		}
	}

	resetTimer() {
		this.startTimer();
	}

	timerComplete(n: any) {
		if (this.purgePeriod.idleTimeActive.selected) {
			localStorage.clear();
			this.authService.logout();
		}
	}

	resetTheme(): void {
		this.theme.selected = this.theme.default;
		this.newSettings.ThemeColor = this.theme.selected.name;
		this.theme.changed = true;
		const picker = document.querySelector('.color-picker-icon');
		(<HTMLElement>picker).setAttribute('style', 'color: ' + this.theme.selected.primary);
	}

	previewTheme(theme: any) {
		const picker = document.querySelector('.color-picker-icon');
		(<HTMLElement>picker).setAttribute('style', 'color: ' + theme.primary);
	}

	themeClick(theme: any): void {
		this.theme.selected = theme;
		this.previewTheme(theme);
		this.theme.changed = true;
	}

	changeTheme(): void {
		const bodyClasses = document.body.classList;
		console.log('bodyClasses before', bodyClasses);
		bodyClasses.remove(Array.from(bodyClasses).find(item => item.includes('-theme')));
		if (this.theme.selected.name !== '') {
			bodyClasses.add(this.theme.selected.name);
			localStorage.setItem('theme', this.theme.selected.name);
		}
		console.log('bodyClasses after', bodyClasses);

	}

	identifyPlatform(): void {
		const bodyClasses = document.body.classList;
		bodyClasses.remove(Array.from(bodyClasses).find(item => item === 'mac'));
		bodyClasses.remove(Array.from(bodyClasses).find(item => item === 'windows'));
		const platform = window.navigator.platform;
		if (!(platform === 'Win32' || platform === 'Win64')) {
			bodyClasses.add('mac');
		} else {
			bodyClasses.add('windows');
		}
	}

	resetFile(name): void {
		this.targetFile = undefined;
		this.files[name].label.selected = '';
		this.files[name].changed = true;
		this.files[name].input.value = null;
		if (name === 'login') {
			if (this.files[name].URL !== this.settings.URLLoginPage && this.files[name].URL !== '') {
				this.deleteImage(this.files[name].URL.split('/')[6]);
			}
			this.files[name].URL = '';
			/* this.files[name].URL = this.files[name].default; */
			this.newSettings.URLLoginPageFile = this.files[name].label.selected;
			this.newSettings.URLLoginPage = this.files[name].URL;
		} else if (name === 'navbar') {
			if (this.files[name].URL !== this.settings.URLNavigationBar && this.files[name].URL !== '') {
				this.deleteImage(this.files[name].URL.split('/')[6]);
			}
			this.files[name].URL = '';
			this.newSettings.URLNavigationBarFile = this.files[name].label.selected;
			this.newSettings.URLNavigationBar = this.files[name].URL;
		} else if (name === 'watermark') {
			if (this.files[name].URL !== this.settings.URLWatermark && this.files[name].URL !== '') {
				this.deleteImage(this.files[name].URL.split('/')[6]);
			}
			this.files[name].URL = '';
			this.newSettings.URLWatermarkFile = this.files[name].label.selected;
			this.newSettings.URLWatermark = this.files[name].URL;
		}
	}

	changeFile(name: any, event?): void {
		this.uploadImage(event.target.files[0], name);
	}

	uploadImage(file, which) {
		if (this.utilsService.checkOnlineStatus()) {
			const reader = new FileReader();
			reader.readAsBinaryString(file);
			reader.onload = (event) => { this.processUpload(which, file, event, file.type); };
			reader.onerror = (error) => { this.uploadImageError(error); return; };
		}
	}

	processUpload(which, file, event, type) {
		console.log(`Uploading new ${which} (${file.name}) of type: ${type}`);
		this.targetFile = file;
		this.files[which].label.selected = file.name;
		this.files[which].changed = true;
		this.uploadImageSuccess(which, file.name, event, type);
	}

	uploadImageSuccess(which, name, event, type) {
		this.imageUploadService.saveImage(this.targetFile).subscribe((events) => {
			if (events.type === HttpEventType.Response) {
				const imageId = atob(events.headers.get('Filename'));
				const imageURL = this.imageUploadService.getImageUrl(imageId);
				let propertyName;

				if (which === 'login') {
					propertyName = 'URLLoginPage';
				} else if (which === 'navbar') {
					propertyName = 'URLNavigationBar';
				} else if (which === 'watermark') {
					propertyName = 'URLWatermark';
				}

				if ((this.newSettings[propertyName] !== '') && (this.settings[propertyName] !== this.newSettings[propertyName]) && (this.files[which].URL !== '')) {
					this.deleteImage(this.files[which].URL.split('/')[6]);
				}

				if (which === 'login') {
					this.newSettings.URLLoginPage = imageURL;
					this.newSettings.URLLoginPageFile = name;
					this.files.login.URL = imageURL;
					this.files.login.changed = true;
				} else if (which === 'navbar') {
					this.newSettings.URLNavigationBar = imageURL;
					this.newSettings.URLNavigationBarFile = name;
					this.files.navbar.URL = imageURL;
					this.files.navbar.changed = true;
				} else if (which === 'watermark') {
					this.newSettings.URLWatermark = imageURL;
					this.newSettings.URLWatermarkFile = name;
					this.files.watermark.URL = imageURL;
					this.files.watermark.changed = true;
				}
			}
		}, (error) => {
			this.uploadImageError(error);
			this.utilsService.handle401(error);
		});
	}

	deleteImage(toEncode) {
		const encoded = btoa(toEncode);
		this.imageUploadService.deleteImage(encoded).subscribe(response => {
			// Delete success
			console.log(`deleteImage response: `, response);
		}, (error) => {
			// Delete error
			this.utilsService.handle401(error);
			console.log(`deleteImage error: `, error);
		});
	}

	uploadImageError(error) {
		if (error.status === 413) {
			this.utilsService.showError(this.translation.translate('Error.The image you are trying to upload is too big, please select a different image'));
		} else {
			this.utilsService.showError(this.translation.translate('Error.Error, profile image could not be uploaded Please try again'));
		}
	}

	save(): void {
		if (this.utilsService.checkOnlineStatus()) {
			if (this.saveForm()) {
				if (this.purgePeriod.idleTimeActive.selected) {
					this.startTimer();
				}
				this.newSettings.IdleTime = this.reduceIdleTime(this.purgePeriod.idleTime.selected);
				this.newSettings.IdleActive = this.purgePeriod.idleTimeActive.selected;

				if (this.theme.changed) {
					this.theme.current = this.theme.selected;
					this.changeTheme();
					this.newSettings.ThemeColor = this.theme.current.name;
					this.theme.changed = false;
				}
				if (this.files.navbar.changed) {
					if (this.settings.URLNavigationBar !== '') {
						this.deleteImage(this.settings.URLNavigationBar.split('/')[6]);
					}
					this.setNavbarImage(this.files.navbar.URL);
					this.files.navbar.label.current = this.files.navbar.label.selected;
					this.files.navbar.changed = false;
				}
				if (this.files.watermark.changed) {
					if (this.settings.URLWatermark !== '') {
						this.deleteImage(this.settings.URLWatermark.split('/')[6]);
					}
					this.setWatermarkImage(this.files.watermark.URL);
					this.files.watermark.label.current = this.files.watermark.label.selected;
					this.files.watermark.changed = false;
				}
				if (this.files.login.changed) {
					if (this.settings.URLLoginPage !== '') {
						this.deleteImage(this.settings.URLLoginPage.split('/')[6]);
					}
					this.files.login.label.current = this.files.login.label.selected;
					this.files.login.changed = false;
				}
				this.systemService.setTenantSettings(JSON.stringify(this.newSettings)).subscribe(response => { this.settingsSaveOnComplete(response); }, error => { this.utilsService.handle401(error); });
			}
		}
	}

	settingsSaveOnComplete(response) {
		this.settings = JSON.parse(JSON.stringify(this.newSettings));
		this.isDrawerOpen = false;
		if (response.status === 200) {
			this.purgePeriod.idleTime.current = this.purgePeriod.idleTime.selected;
			this.purgePeriod.idleTimeActive.current = this.purgePeriod.idleTimeActive.selected;
			this.utilsService.openPwdSnackBar(this.translation.translate('Label.Settings saved'));
		} else {
			this.errorAlert.open(ErrorDialogComponent, {
				panelClass: 'update-error',
				backdropClass: 'errorOverlay',
				data: `${this.translation.translate(`Error.Settings could not be updated Error`)} ${response.statusText}`,
				autoFocus: false
			});
		}
	}
}
