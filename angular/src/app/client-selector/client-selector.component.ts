import { Component, EventEmitter, Output, Injector, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { ActiveEntitiesService } from '../services/active-entities.service';
import { TranslationService } from 'angular-l10n';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-client-selector',
	templateUrl: './client-selector.component.html',
	styleUrls: ['./client-selector.component.css']
})
export class ClientSelectorComponent {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onFullClose = new EventEmitter();
	@Input() parentData: any;
	@Input() clientsInput: any;
	@Input() selectedInput: any;
	isDrawerOpen = false;
	hideOverlay = false;
	filterValue = '';
	showFilter = false;
	clients = [];
	clientsFiltered = [];
	clientsToReturn = [];
	clientsToDisplay = [];
	pristineObject: any;

	constructor(private activeEntitiesService: ActiveEntitiesService, public utilsService: UtilsService, private errorAlert: MatDialog, public translation: TranslationService) {
	}

	show(all, hideOverlay) {
		this.loadClients(all);
		this.applyFilter();
		this.isDrawerOpen = true;
		document.querySelector('rmp-client-selector .drawer-content').scrollTop = 0;

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
		this.getClientsToReturn();
		this.onSave.emit(this.clientsToReturn);
		this.closeDrawer();
	}

	loadClients(all) {
		if (this.utilsService.checkOnlineStatus()) {
			this.clientsToDisplay = [];
			if (all) {
				this.activeEntitiesService.getActiveClients().subscribe(response => {
					const allClients = response.json();
					allClients.forEach(client => {
						let check = false;
						this.clientsInput.forEach(inputClients => {
							if (inputClients.Code === client.Code) {
								check = true;
							}
						});
						this.clientsToDisplay.push({ Id: client.Id, Code: client.Code, Name: client.Name, check: check });
					});
				}, error => {
					if (error.status === 401) {
						this.utilsService.handle401(error);
					} else {
						this.utilsService.showError(`Error: ${error}`);
					}
				});
			} else {
				this.clientsInput.forEach(client => {
					let isChecked = false;
					this.selectedInput.forEach(element => {
						if (element.Code === client.Code) {
							isChecked = true;
						}
					});
					this.clientsToDisplay.push({ Id: client.Id, Code: client.Code, Name: client.Name, check: isChecked });
				});
			}
		}
	}

	updatePristine() {
		this.pristineObject = JSON.stringify(this.clientsToReturn.map(client => client.Code));
	}

	propagateCheckbox(event, client) {
		this.clientsToDisplay.find(c => c.Id === client.Id).check = !this.clientsToDisplay.find(c => c.Id === client.Id).check;
	}

	getClientsToReturn() {
		this.clientsToReturn = [];
		this.clientsToDisplay.forEach(client => {
			if (client.check === true) {
				this.clientsToReturn.push({ Code: client.Code, Name: client.Name, Id: client.Id });
			}
		});
		this.updatePristine();
	}

	clickOverlay(toPrevious) {
		this.getClientsToReturn();
		if (this.pristineObject !== JSON.stringify(this.selectedInput.map(client => client.Code))) {
			const dialogRef = this.errorAlert.open(UnsavedChangesDialogComponent, {
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
			this.clientsFiltered = this.clientsToDisplay;
		} else {
			this.clientsFiltered = [];
			const currentText = this.filterValue.toLowerCase().trim(); // prevent empty search
			this.clientsToDisplay.forEach(client => { // searching description and name
				if ((client.Code.toLowerCase().search(currentText) >= 0)) {
					this.clientsFiltered.push(client);
				}
			});
		}
	}
}
