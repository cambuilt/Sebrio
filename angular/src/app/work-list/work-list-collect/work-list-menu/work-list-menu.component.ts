import { Component, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
	selector: 'app-work-list-menu',
	templateUrl: './work-list-menu.component.html',
	styleUrls: ['./work-list-menu.component.css']
})
export class WorkListMenuComponent  {
	@Output() cancel = new EventEmitter();
	@Output() printComm = new EventEmitter();
	@Output() printPatient = new EventEmitter();
	@Output() problemList = new EventEmitter();
	@Output() reschedule = new EventEmitter();
	@Output() transfer = new EventEmitter();
	@Output() closeMenu = new EventEmitter();

	showMenu = false;
	showSlideup = false;

	canCancelOrder = true;
	canGenerateCommunicationLabel = true;
	canTransferToProblemList = true;
	canRescheduleOrder = true;

	clicks = 0;

	cardTrueHeight;

	constructor() { }

	show() {
		this.showMenu = true;
		setTimeout(() => this.evaluateHeight(), 0);
		this.showSlideup = true;
		this.attachListener();
	}

	close() {
		this.showSlideup = false;
		setTimeout(() => this.undoCardHeight(), 0);
		setTimeout(() => {
			this.showMenu = false;
			this.closeMenu.emit();
		}, 260);
		this.removeListener();
	}

	@HostListener('window:resize') onResize() {
		if (this.showMenu) {
			this.evaluateHeight();
		}
	}

	evaluateHeight() {
		const drawerContent = document.body.querySelector('app-work-list-collect').querySelector('.drawer-content');
		const drawerHeight = drawerContent.clientHeight;
		const menuCard = document.body.querySelector('.menuOptions');
		const cardHeight = this.getComputedHeight(menuCard) + 50;

		if (cardHeight > (drawerHeight - 13)) {
			if (this.cardTrueHeight === undefined) {
				this.cardTrueHeight = cardHeight;
			}
			(<HTMLElement>menuCard).style.height = `${drawerHeight - 13 - 50}px`;
		} else {
			if (cardHeight < this.cardTrueHeight) {
				(<HTMLElement>menuCard).style.height = `${drawerHeight - 13 - 50}px`;
			} else {
				this.cardTrueHeight = undefined;
				this.undoCardHeight();
			}
		}
	}

	undoCardHeight() {
		const patientCard = document.body.querySelector('.menuOptions');
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
		if (event.path.find(element => element.id === 'menuContainer') === undefined) {
			return false;
		} else {
			return true;
		}
	}

}
