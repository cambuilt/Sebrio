import { Component, EventEmitter, Output, Injector, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UtilsService } from '../services/utils.service';
import { HubService } from '../services/hub.service';
import { TranslationService } from 'angular-l10n';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-hub-selector',
	templateUrl: './hub-selector.component.html',
	styleUrls: ['./hub-selector.component.css']
})
export class HubSelectorComponent {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	@Input() parentData: any;
	@Input() hubsInput: any;
	isDrawerOpen = false;
	hideOverlay = false;
	filterValue = '';
	showFilter = false;
	hubs = [];
	hubsFiltered = [];
	hubsToReturn = [];
	hubsToDisplay = [];

	constructor(public utilsService: UtilsService, private hubService: HubService, public translation: TranslationService) {
	}

	show(all, hideOverlay) {
		this.loadHubs(all);
		this.applyFilter();
		this.isDrawerOpen = true;
		document.querySelector('rmp-hub-selector .drawer-content').scrollTop = 0;

		if (hideOverlay) {
			this.hideOverlay = hideOverlay;
		}
	}

	closeDrawer() {
		this.isDrawerOpen = false;
	}

	save() {
		if (this.utilsService.checkOnlineStatus()) {
			this.hubsToReturn = [];
			this.hubsToDisplay.forEach(hub => {
				const checkBoxClasses = (document.querySelector(`#checkboxHub-${this.sanitizeWhitespace(hub.Name)}`) as HTMLInputElement).classList;
				if (Array.from(checkBoxClasses).find(item => item.includes('mat-checkbox-checked'))) {
					this.hubsToReturn.push({ Name: hub.Name, Description: hub.Description });
				}
			});
			this.onSave.emit(this.hubsToReturn);
			this.closeDrawer();
		}
	}

	loadHubs(all) {
		if (this.utilsService.checkOnlineStatus()) {
			if (all) {
				this.hubsToDisplay = [];
				this.hubService.getHubs().subscribe(response => {
					const allHubs = response.json();
					allHubs.forEach(hub => {
						let check = false;
						if (this.hubsInput) {
							this.hubsInput.forEach(inputHubs => {
								if (inputHubs.Name === hub.Name) {
									check = true;
								}
							});
						}
						this.hubsToDisplay.push({ Name: hub.Name, Description: hub.Description, check: check });
					});
				}, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.hubsInput.forEach(hub => {
					this.hubsToDisplay.push({ Name: hub.Name, check: true });
				});
			}
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
			this.hubsFiltered = this.hubsToDisplay;
		} else {
			this.hubsFiltered = [];
			const currentText = this.filterValue.toLowerCase().trim(); // prevent empty search
			this.hubsToDisplay.forEach(hub => { // searching description and name
				if ((hub.Name.toLowerCase().search(currentText) >= 0) ||
					(hub.Description.toLowerCase().search(currentText) >= 0)) {
					this.hubsFiltered.push({ Name: hub.Name, Description: hub.Description, check: hub.check });
				}
			});
		}
	}

	sanitizeWhitespace(name) {
		return name.split(' ').join('');
	}
}
