import { Component, EventEmitter, Output, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { TranslationService } from 'angular-l10n';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { ActiveEntitiesService } from '../services/active-entities.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-location-selector',
	templateUrl: './location-selector.component.html',
	styleUrls: ['./location-selector.component.css']
})
export class LocationSelectorComponent {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onFullClose = new EventEmitter();
	@Input() parentData: any;
	@Input() locationsInput: any;
	@Input() selectedInput: any;
	isDrawerOpen = false;
	hideOverlay = false;
	filterValue = '';
	showFilter = false;
	locations = [];
	locationsFiltered = [];
	locationsToReturn = [];
	locationsToDisplay = [];
	pristineObject: any;

	constructor(public utilsService: UtilsService, private activeEntitiesService: ActiveEntitiesService, private unsavedChangesAlert: MatDialog, public translation: TranslationService) {
	}

	show(all, hideOverlay) {
		this.loadLocations(all);
		this.applyFilter();
		this.isDrawerOpen = true;
		document.querySelector('rmp-location-selector .drawer-content').scrollTop = 0;

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
			this.getLocationsToReturn();
			this.onSave.emit(this.locationsToReturn);
			this.closeDrawer();
		}
	}

	loadLocations(all) {
		if (this.utilsService.checkOnlineStatus()) {
			this.locationsToDisplay = [];
			if (all) {
				this.activeEntitiesService.getActiveLocations().subscribe(response => {
					const allLocations = response.json();
					allLocations.forEach(location => {
						let check = false;
						this.locationsInput.forEach(inputLocations => {
							if (inputLocations.Code === location.Code) {
								check = true;
							}
						});
						this.locationsToDisplay.push({ Id: location.Id, Code: location.Code, Description: location.Description, check: check });
					});
				}, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.locationsInput.forEach(location => {
					let isChecked = false;
					this.selectedInput.forEach(element => {
						if (element.Code === location.Code) {
							isChecked = true;
						}
					});
					this.locationsToDisplay.push({ Id: location.Id, Code: location.Code, Description: location.Description, check: isChecked });
				});
			}
		}
	}

	updatePristine() {
		this.pristineObject = JSON.stringify(this.locationsToReturn.map(location => location.Code));
	}

	propagateCheckbox(event, location) {
		this.locationsToDisplay.find(l => l.Id === location.Id).check = !this.locationsToDisplay.find(l => l.Id === location.Id).check;
	}

	getLocationsToReturn() {
		this.locationsToReturn = [];
		this.locationsToDisplay.forEach(location => {
			if (location.check === true) {
				this.locationsToReturn.push({ Code: location.Code, Description: location.Description, Id: location.Id });
			}
		});
		this.updatePristine();
	}

	clickOverlay(toPrevious) {
		this.getLocationsToReturn();
		if (this.pristineObject !== JSON.stringify(this.selectedInput.map(location => location.Code))) {
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
			this.locationsFiltered = this.locationsToDisplay;
		} else {
			this.locationsFiltered = this.locationsToDisplay.filter(location => (location.Code.toLowerCase().search(this.filterValue.toLowerCase().trim()) >= 0));
		}
	}
}
