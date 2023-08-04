import { Component, OnInit, ViewChild, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { UtilsService } from '../services/utils.service';
import { TranslationService } from 'angular-l10n';
import { UserService } from '../services/user.service';

@Component({
	selector: 'app-collection-transfer-drawer',
	templateUrl: './collection-transfer-drawer.component.html',
	styleUrls: ['./collection-transfer-drawer.component.css']
})
export class CollectionTransferDrawerComponent implements AfterViewInit {

	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();

	isDrawerOpen = false;
	headerText: string;
	rowID: string;
	pristineObject: any;
	isRequested = false;
	collection: any = {
		AssignedPhleb: '',
		RequestingPhleb: '',
		Reason: '',
		ProblemList: '',
		Status: ''
	};

	constructor(public utilsService: UtilsService, public translation: TranslationService, private userService: UserService) {

	}

	ngAfterViewInit() {
		// this.objectForm.push(this.code);
	}

	// resetAdd() {
	// 	this.objectForm.forEach(c => {
	// 		c.reset();
	// 	});
	// }

	// saveForm() {
	// 	let formValid = true;
	// 	this.objectForm.forEach(c => {
	// 		if (!c.disabled) {
	// 			c.control.markAsDirty();
	// 			c.control.markAsTouched();
	// 			c.control.updateValueAndValidity();
	// 			if (!c.valid) {
	// 				formValid = false;
	// 			}
	// 		}
	// 	});
	// 	return formValid;
	// }

	getRandomPhone() {
		let phone = '';
		for (let i = 0; i < 10; i++) {
			const b = Math.floor(Math.random() * 9);
			phone += b;
		}
		const formatted = `(${phone.substr(0, 3)}) ${phone.substr(3, 3)}-${phone.substr(6, 4)}`;
		return formatted;
	}

	openCollection(info: any, collectionId: string) {
		if (collectionId === '') {
			this.utilsService.showError(this.translation.translate('Error.Please select a collection to edit'));
		} else {
			this.rowID = collectionId;
			info.data.forEach(item => {
				if (item.Id === collectionId) {
					if (item.ReservedBy.Username !== '') {
						const reservingUser = this.userService.userStore.find(user => user.Username === item.ReservedBy.Username);
						this.headerText = item.Patient.LastName + ', ' + item.Patient.FirstName;
						this.collection.AssignedPhleb = reservingUser.FirstName + ' ' + reservingUser.LastName + ' - ' + reservingUser.PhoneNumber;
						this.collection.ProblemList = item.IsProblem;
						this.collection.Status = item.Status;
						if (item.isRequested === 0) {
							this.isRequested = false;
						} else {
							this.isRequested = true;
						}
						if (item.Requestees.length > 0) {
							const requestingUser = this.userService.userStore.find(user => user.Username === item.Requestees[0].RequestedBy);
							this.collection.RequestingPhleb = requestingUser.FirstName + ' ' + requestingUser.LastName + ' - ' + requestingUser.PhoneNumber;
							this.collection.reason = item.Requestees[0].RequestReason;
						}
					}
				}
			});
			if (this.collection.Status === 'Locked' || this.collection.Status === 'Reserved') {
				this.show();
			}
		}
	}

	show() {
		this.isDrawerOpen = true;
		// this.clearFields();
		this.goToTop();
	}

	goToTop() {
		document.querySelector('app-collection-transfer-drawer .drawer-content').scrollTop = 0;
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.utilsService.closeSnackBar();
		this.clearFields();
	}

	// trimFields() {
	// 	Object.keys(this.cancellation).forEach(key => {
	// 		if (key !== 'IsActive') {
	// 			this.cancellation[key] = this.cancellation[key].trim();
	// 		}
	// 	});
	// }

	clickOverlay() {
		this.closeDrawer();
	}

	// resetPristine() {
	// 	this.pristineObject = JSON.stringify(this.cancellation);
	// }

	clearFields() {
		this.collection = {
			AssignedPhleb: '',
			RequestingPhleb: '',
			Reason: '',
			ProblemList: ''
		};
	}

}
