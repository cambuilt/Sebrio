import { Component, EventEmitter, Output, Injector, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { TranslationService } from 'angular-l10n';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-user-chip',
	templateUrl: './user-chip.component.html',
	styleUrls: ['./user-chip.component.css']
})
export class UserChipComponent {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	@Input() parentData: any;
	@Input() usersInput: any;
	isDrawerOpen = false;
	filterValue = '';
	showFilter = false;
	users = [];
	usersFiltered = [];
	usersToReturn = [];
	usersToDisplay = [];
	pristineObject: any;
	row: any;

	constructor(public utilsService: UtilsService, private unsavedChangesAlert: MatDialog, public translation: TranslationService) {
	}

	show() {
		this.loadUsers();
		this.applyFilter();
		this.updatePristine();
		this.isDrawerOpen = true;
		document.querySelector('.drawer-content').scrollTop = 0;
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.closeFilter();
	}

	editAssociatedUsers(row) {
		this.row = row;
		this.usersInput = row.Users;
		this.show();
	}

	save() {
		if (this.utilsService.checkOnlineStatus()) {
			this.getUsersToReturn();
			const newRow = this.row;
			newRow.Users = this.usersToReturn;
			this.onSave.emit(newRow);
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
			this.usersToDisplay = [];
			this.usersInput.forEach(user => {
				const initials = this.utilsService.getInitials(user);
				this.usersToDisplay.push({ Initials: initials, FirstName: user.FirstName, LastName: user.LastName, Username: user.Username, Email: user.Email, AvatarURL: user.AvatarURL, check: true });
			});
		}
	}

	updatePristine() {
		this.pristineObject = JSON.stringify(this.usersToReturn.map(user => user.Username));
	}

	propagateCheckbox(event, user) {
		this.usersToDisplay.find(u => u.Username === user.Username).check = !this.usersToDisplay.find(u => u.Username === user.Username).check;
	}

	clickOverlay() {
		this.getUsersToReturn();
		if (this.pristineObject !== JSON.stringify(this.usersInput.map(user => user.Username))) {
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

	openFilter() {
		this.showFilter = true;
	}

	closeFilter() {
		this.clearFilter();
		this.showFilter = false;
	}

	clearFilter() {
		this.filterValue = '';
		this.applyFilter();
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
					this.usersFiltered.push({ Initials: user.initials, FirstName: user.FirstName, LastName: user.LastName, Username: user.Username, Email: user.Email, AvatarURL: user.AvatarURL, check: user.check });
				}
			});
		}
	}
}
