import { Component, EventEmitter, Output, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { TranslationService } from 'angular-l10n';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-provider-selector',
	templateUrl: './provider-selector.component.html',
	styleUrls: ['./provider-selector.component.css']
})
export class ProviderSelectorComponent {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onFullClose = new EventEmitter();
	@Input() parentData: any;
	@Input() providersInput: any;
	@Input() selectedInput: any;
	isDrawerOpen = false;
	hideOverlay = false;
	filterValue = '';
	showFilter = false;
	providers = [];
	providersFiltered = [];
	providersToReturn = [];
	providersToDisplay = [];
	pristineObject: any;

	constructor(private activeEntitiesService: ActiveEntitiesService, public utilsService: UtilsService, private unsavedChangesAlert: MatDialog, public translation: TranslationService) { }

	show(all, hideOverlay) {
		this.loadProviders(all);
		this.applyFilter();
		this.isDrawerOpen = true;
		document.querySelector('rmp-provider-selector .drawer-content').scrollTop = 0;

		if (hideOverlay) {
			this.hideOverlay = hideOverlay;
		}
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.closeFilter();
	}

	sanitizeWhitespace(code) {
		return code.split(' ').join('');
	}

	save() {
		if (this.utilsService.checkOnlineStatus()) {
			this.getProvidersToReturn();
			this.onSave.emit(this.providersToReturn);
			this.closeDrawer();
		}
	}

	loadProviders(all) {
		if (this.utilsService.checkOnlineStatus()) {
			this.providersToDisplay = [];
			if (all) {
				this.activeEntitiesService.getActiveProviders().subscribe(response => {
					const allPriorities = response.json();
					allPriorities.forEach(provider => {
						let check = false;
						this.providersInput.forEach(inputProviders => {
							if (inputProviders.Code === provider.Code) {
								check = true;
							}
						});
						this.providersToDisplay.push({ Id: provider.Id, Code: provider.Code, CompanyName: provider.CompanyName, check: check });
					});
				}, error => { this.utilsService.handle401(error); });
			} else {
				this.providersInput.forEach(provider => {
					let isChecked = false;
					this.selectedInput.forEach(element => {
						if (element.Code === provider.Code) {
							isChecked = true;
						}
					});
					this.providersToDisplay.push({ Id: provider.Id, Code: provider.Code, CompanyName: provider.CompanyName, check: isChecked });
				});
			}
		}
	}

	updatePristine() {
		this.pristineObject = JSON.stringify(this.providersToReturn.map(provider => provider.Code));
	}

	propagateCheckbox(event, provider) {
		this.providersToDisplay.find(p => p.Id === provider.Id).check = !this.providersToDisplay.find(p => p.Id === provider.Id).check;
	}

	getProvidersToReturn() {
		this.providersToReturn = [];
		this.providersToDisplay.forEach(provider => {
			if (provider.check === true) {
				this.providersToReturn.push({ Code: provider.Code, Description: provider.Description, Id: provider.Id, CompanyName: provider.CompanyName });
			}
		});
		this.updatePristine();
	}

	clickOverlay(toPrevious) {
		this.getProvidersToReturn();
		if (this.pristineObject !== JSON.stringify(this.selectedInput.map(provider => provider.Code))) {
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
			this.providersFiltered = this.providersToDisplay;
		} else {
			this.providersFiltered = [];
			const currentText = this.filterValue.toLowerCase().trim(); // prevent empty search
			this.providersToDisplay.forEach(provider => { // searching description and name
				if ((provider.Code.toLowerCase().search(currentText) >= 0)) {
					this.providersFiltered.push(provider);
					// this.providersFiltered.push({ Code: provider.Code, CompanyName: provider.CompanyName, check: provider.check });
				}
			});
		}
	}
}
