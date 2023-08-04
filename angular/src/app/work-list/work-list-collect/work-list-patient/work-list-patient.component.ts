import { Component, OnDestroy, HostListener, Output, EventEmitter } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';

@Component({
	selector: 'app-work-list-patient',
	templateUrl: './work-list-patient.component.html',
	styleUrls: ['./work-list-patient.component.css']
})
export class WorkListPatientComponent implements OnDestroy {
	@Output() displayPatientInfo = new EventEmitter();
	showInfo = false;
	showSlidedown = false;
	collection = new Collection();

	showClientInfo = true;
	showPatientAddressPhone = true;

	clientInfo: any = {
		Code: '',
		Address: '',
		Phone: '',
		Contact: ''
	};
	notes: any;

	displayPatientAddressAndPhone = true;
	displayPatientRoomBed = true;
	displayHomeDrawAddress = true;
	displayCollectionLocation = true;
	displayClient = true;
	displayClientAddressAndPhone = true;


	collectionListSubscription: any;

	clicks = 0;

	cardTrueHeight;

	constructor() { }

	ngOnDestroy(): void {
		if (this.collectionListSubscription) {
			this.collectionListSubscription.unsubscribe();
		}
	}

	show() {
		this.showInfo = true;
		setTimeout(() => this.evaluateHeight(), 0);
		this.showSlidedown = true;
		this.attachListener();
	}

	close() {
		this.displayPatientInfo.emit(false);
		this.showSlidedown = false;
		setTimeout(() => {
			this.undoCardHeight();
			this.showInfo = false;
		}, 260);
		this.removeListener();
		this.reset();
	}

	toggle() {
		if (this.showInfo) {
			this.close();
		} else {
			this.show();
		}
	}

	reset() {
		this.showInfo = false;
		this.showSlidedown = false;
		this.collection = new Collection();

		this.showClientInfo = true;
		this.showPatientAddressPhone = true;

		this.clientInfo = {
			Code: '',
			Address: '',
			Phone: '',
			Contact: ''
		};
		this.notes = undefined;

		this.displayPatientAddressAndPhone = true;
		this.displayPatientRoomBed = true;
		this.displayHomeDrawAddress = true;
		this.displayCollectionLocation = true;
		this.displayClient = true;
		this.displayClientAddressAndPhone = true;


		this.collectionListSubscription = undefined;

		this.clicks = 0;

		this.cardTrueHeight = undefined;
	}

	@HostListener('window:resize') onResize() {
		if (this.showInfo) {
			this.evaluateHeight();
		}
	}

	evaluateHeight() {
		const drawerContent = document.body.querySelector('app-work-list-collect').querySelector('.drawer-content');
		const patientCard = document.body.querySelector('.patientInfoCard');
		if (patientCard !== null && drawerContent !== null) {
			const drawerHeight = drawerContent.clientHeight;
			const cardHeight = this.getComputedHeight(patientCard) + 50;

			if (cardHeight > (drawerHeight - 14)) {
				if (this.cardTrueHeight === undefined) {
					this.cardTrueHeight = cardHeight;
				}
				(<HTMLElement>patientCard).style.height = `${drawerHeight - 14 - 50}px`;
			} else {
				if (cardHeight < this.cardTrueHeight) {
					(<HTMLElement>patientCard).style.height = `${drawerHeight - 14 - 50}px`;
				} else {
					this.cardTrueHeight = undefined;
					this.undoCardHeight();
				}
			}
		}
	}

	undoCardHeight() {
		const patientCard = document.body.querySelector('.patientInfoCard');
		if (patientCard) {
			this.cardTrueHeight = undefined;
			(<HTMLElement>patientCard).style.height = null;
		}
	}

	getComputedHeight(element) {
		return parseInt(((getComputedStyle(element).height).split('px').join('')), 10);
	}

	boundRemoveListener = evt => this.checkListener(evt);

	attachListener() {
		document.body.addEventListener('click', this.boundRemoveListener);
	}

	removeListener() {
		this.clicks = 0;
		document.body.removeEventListener('click', this.boundRemoveListener);
	}

	checkListener(event: MouseEvent) {
		this.clicks++;
		if (this.clicks > 1) {
			if (!this.clickedOnContainer(event)) {
				this.close();
			}
		}
	}

	clickedOnContainer(event): boolean {
		if (event.path.find(element => element.id === 'patientInfoContainer') === undefined) {
			return false;
		} else {
			return true;
		}
	}

	makeAddress(address: any): string {
		if (address.StreetAddress2 !== '') {
			return (address.StreetAddress1 + ', ' + address.StreetAddress2 + ', ' + address.City + ', ' + address.State + ' ' + address.PostalCode);
		} else {
			return (address.StreetAddress1 + ', ' + address.City + ', ' + address.State + ' ' + address.PostalCode);
		}
	}

}
