import { Component, EventEmitter, Output, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { TranslationService } from 'angular-l10n';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-priority-selector',
	templateUrl: './priority-selector.component.html',
	styleUrls: ['./priority-selector.component.css']
})
export class PrioritySelectorComponent {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onFullClose = new EventEmitter();
	@Input() parentData: any;
	@Input() prioritiesInput: any;
	@Input() selectedInput: any;
	isDrawerOpen = false;
	hideOverlay = false;
	filterValue = '';
	showFilter = false;
	priorities = [];
	prioritiesFiltered = [];
	prioritiesToReturn = [];
	prioritiesToDisplay = [];
	pristineObject: any;

	constructor(public utilsService: UtilsService, private activeEntitiesService: ActiveEntitiesService, private unsavedChangesAlert: MatDialog, public translation: TranslationService) {
	}

	show(all, hideOverlay) {
		this.loadPriorities(all);
		this.applyFilter();
		this.isDrawerOpen = true;
		document.querySelector('rmp-priority-selector .drawer-content').scrollTop = 0;

		if (hideOverlay) {
			this.hideOverlay = hideOverlay;
		}
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.closeFilter();
	}

	save() {
		if (this.utilsService.checkOnlineStatus()) {
			this.getPrioritiesToReturn();
			this.onSave.emit(this.prioritiesToReturn);
			this.closeDrawer();
		}
	}

	loadPriorities(all) {
		console.log('priorities input: ', this.prioritiesInput);
		if (this.utilsService.checkOnlineStatus()) {
			this.prioritiesToDisplay = [];
			if (all) {
				this.activeEntitiesService.getActivePriorities().subscribe(response => {
					const allPriorities = response.json();
					console.log('all Priorities: ', allPriorities);
					allPriorities.forEach(priority => {
						let check = false;
						this.prioritiesInput.forEach(inputPriorities => {
							if (inputPriorities.Id === priority.Id) {
								check = true;
							}
						});
						this.prioritiesToDisplay.push({ Id: priority.Id, Code: priority.Code, Description: priority.Description, Priority: priority.Priority, check: check });
					});
				}, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				console.log('prioritiesInput: ', this.prioritiesInput);
				this.prioritiesInput.forEach(priority => {
					let isChecked = false;
					this.selectedInput.forEach(element => {
						if (element.Code === priority.Code) {
							isChecked = true;
						}
					});
					this.prioritiesToDisplay.push({ Id: priority.Id, Code: priority.Code, Description: priority.Description, check: isChecked });
				});
			}
		}
		setTimeout(() => console.log('prioritiesToDisplay: ', this.prioritiesToDisplay));
	}

	updatePristine() {
		this.pristineObject = JSON.stringify(this.prioritiesToReturn.map(priority => priority.Code));
	}

	propagateCheckbox(event, priority) {
		this.prioritiesToDisplay.find(p => p.Id === priority.Id).check = !this.prioritiesToDisplay.find(p => p.Id === priority.Id).check;
	}

	getPrioritiesToReturn() {
		this.prioritiesToReturn = [];
		this.prioritiesToDisplay.forEach(priority => {
			if (priority.check === true) {
				this.prioritiesToReturn.push({ Id: priority.Id, Code: priority.Code, Description: priority.Description });
			}
		});
		this.updatePristine();
	}

	clickOverlay(toPrevious) {
		this.getPrioritiesToReturn();
		if (this.pristineObject !== JSON.stringify(this.selectedInput.map(priority => priority.Code))) {
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
			this.prioritiesFiltered = this.prioritiesToDisplay;
		} else {
			this.prioritiesFiltered = [];
			const currentText = this.filterValue.toLowerCase().trim(); // prevent empty search
			console.log('currentText is: ', currentText);
			this.prioritiesToDisplay.forEach(priority => { // searching description and name
				console.log('priority to compare: ', priority);
				if ((priority.Code.toLowerCase().search(currentText) >= 0) ||
					(priority.Description.toLowerCase().search(currentText) >= 0)) {
					this.prioritiesFiltered.push(priority);
				}
			});
		}
	}
}
