import { Component, EventEmitter, Output, Injector, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { TranslationService } from 'angular-l10n';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { ActiveEntitiesService } from '../services/active-entities.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-lab-selector',
	templateUrl: './lab-selector.component.html',
	styleUrls: ['./lab-selector.component.css']
})

export class LabSelectorComponent {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onFullClose = new EventEmitter();
	@Input() labsInput: any;
	isDrawerOpen = false;
	hideOverlay = false;
	filterValue = '';
	showFilter = false;
	labs = [];
	labsFiltered = [];
	labsToReturn = [];
	labsToDisplay = [];
	pristineObject: any;

	constructor(public utilsService: UtilsService, private activeEntitiesService: ActiveEntitiesService, private unsavedChangesAlert: MatDialog, public translation: TranslationService) {
	}

	show(hideOverlay) {
		this.loadLabs();
		this.applyFilter();
		this.isDrawerOpen = true;
		document.querySelector('rmp-lab-selector .drawer-content').scrollTop = 0;

		if (hideOverlay) {
			this.hideOverlay = hideOverlay;
		}
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.hideOverlay = false;
		this.closeFilter();
	}

	save() {
		if (this.utilsService.checkOnlineStatus()) {
			this.getLabsToReturn();
			this.onSave.emit(this.labsToReturn);
			this.closeDrawer();
		}
	}

	loadLabs() {
		if (this.utilsService.checkOnlineStatus()) {
			this.labsToDisplay = [];
			this.activeEntitiesService.getActiveLabs().subscribe(response => {
				const allLabs = response.json();
				allLabs.forEach(lab => {
					let check = false;
					this.labsInput.forEach(inputLabs => {
						if (inputLabs.Id === lab.Id) {
							check = true;
						}
					});
					this.labsToDisplay.push({ Id: lab.Id, Code: lab.Code, Description: lab.Description, check: check });
				});
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
			});
		}
	}

	updatePristine() {
		this.pristineObject = JSON.stringify(this.labsToReturn.map(lab => lab.Code));
	}

	propagateCheckbox(event, lab) {
		this.labsToDisplay.find(c => c.Code === lab.Code).check = !this.labsToDisplay.find(c => c.Code === lab.Code).check;
	}

	getLabsToReturn() {
		this.labsToReturn = [];
		this.labsToDisplay.forEach(lab => {
			if (lab.check === true) {
				this.labsToReturn.push({ Code: lab.Code, Description: lab.Description, Id: lab.Code });
			}
		});
		this.updatePristine();
	}

	clickOverlay(toPrevious) {
		this.getLabsToReturn();
		if (this.pristineObject !== JSON.stringify(this.labsInput.map(lab => lab.Code))) {
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
			this.labsFiltered = this.labsToDisplay;
		} else {
			this.labsFiltered = [];
			const currentText = this.filterValue.toLowerCase().trim(); // prevent empty search
			this.labsToDisplay.forEach(lab => { // searching description and name
				if ((lab.Code.toLowerCase().search(currentText) >= 0) ||
					(lab.Description.toLowerCase().search(currentText) >= 0)) {
					this.labsFiltered.push(lab);
				}
			});
		}
	}
}
