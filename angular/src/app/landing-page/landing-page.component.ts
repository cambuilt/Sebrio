import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UtilsService } from '../services/utils.service';
import { TranslationService } from 'angular-l10n';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-landing-page',
	templateUrl: './landing-page.component.html',
	styleUrls: ['./landing-page.component.css'],
})

export class LandingPageComponent implements OnInit {
	landingPage: string;
	isDrawerOpen = false;
	avatarURL: string;

	constructor(public utilsService: UtilsService, public authService: AuthService, public translation: TranslationService, private errorAlert: MatDialog) { }

	ngOnInit() {
		this.avatarURL = this.authService.currentUser.avatarURL;
	}

	show() {
		document.querySelector('rmp-landing-page .drawer-content').scrollTop = 0;
		setTimeout(() => this.landingPage = this.authService.currentUser.landingPage, 500);
		this.isDrawerOpen = true;
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.utilsService.closeSnackBar();
		this.landingPage = '';
	}

	clickOverlay() {
		if (this.landingPage !== this.authService.currentUser.landingPage) {
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
					this.onSaveClick();
				} else { this.closeDrawer(); }

			});
		} else {
			this.closeDrawer();
		}
	}

	onSaveClick() {
		if (this.utilsService.checkOnlineStatus()) {
			const updateBody = { AvatarURL: this.avatarURL, LandingPage: this.landingPage };
			this.authService.updateProfile(JSON.stringify(updateBody)).subscribe(updateResponse => {
				if (updateResponse.status === 200) {
					this.closeDrawer();
					this.utilsService.openPwdSnackBar(this.translation.translate('Label.Landing page saved'));
					this.authService.currentUser.landingPage = this.landingPage;
				}
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
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

}
