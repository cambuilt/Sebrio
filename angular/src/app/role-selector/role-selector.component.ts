import { Component, EventEmitter, Output, Input } from '@angular/core';
import { UtilsService } from '../services/utils.service';
import { RoleService } from '../services/role.service';
import { AuthService } from '../services/auth.service';
import { TranslationService } from 'angular-l10n';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-role-selector',
	templateUrl: './role-selector.component.html',
	styleUrls: ['./role-selector.component.css']
})

export class RoleSelectorComponent {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	@Input() parentData: any;
	@Input() rolesInput: any;
	isDrawerOpen = false;
	hideOverlay = false;
	filterValue = '';
	showFilter = false;
	roles = [];
	rolesFiltered = [];
	rolesToReturn = [];
	rolesToDisplay = [];
	tenantId = '';

	constructor(public utilsService: UtilsService, private roleService: RoleService, public authService: AuthService, public translation: TranslationService) {
	}

	show(hideOverlay) {
		this.loadRoles();
		this.applyFilter();
		this.isDrawerOpen = true;
		document.querySelector('rmp-role-selector .drawer-content').scrollTop = 0;

		if (hideOverlay) {
			this.hideOverlay = hideOverlay;
		}
	}

	closeDrawer() {
		this.isDrawerOpen = false;
	}

	save() {
		if (this.utilsService.checkOnlineStatus()) {
			this.rolesToReturn = [];
			this.rolesToDisplay.forEach(role => {
				const checkBoxClasses = (document.querySelector(`#checkboxRole-${role.Name}`) as HTMLInputElement).classList;
				if (Array.from(checkBoxClasses).find(item => item.includes('mat-checkbox-checked'))) {
					this.rolesToReturn.push({ Name: role.Name, Id: role.Id });
				}
			});
			this.onSave.emit(this.rolesToReturn);
			this.closeDrawer();
		}
	}

	checkTheBox(id) {
		this.rolesToDisplay.forEach(role => {
			if (role.Name === id) {
				role.checked = true;
			} else {
				role.checked = false;
			}
		});
		this.applyFilter();
	}

	loadRoles() {
		if (this.utilsService.checkOnlineStatus()) {
			this.rolesToDisplay = [];
			this.roleService.getRoles().subscribe(response => {
				const allRoles = response.json();
				allRoles.forEach(role => {
					let checked = false;
					this.rolesInput.forEach(inputRoles => {
						if (inputRoles.Name === role.Name) {
							checked = true;
						}
					});
					this.rolesToDisplay.push({ Name: role.Name, checked: checked, Id: role.Id });
				});
			});
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
			this.rolesFiltered = this.rolesToDisplay;
		} else {
			this.rolesFiltered = [];
			const currentText = this.filterValue.toLowerCase().trim(); // prevent empty search
			this.rolesToDisplay.forEach(role => { // searching description and name
				if ((role.Name.toLowerCase().search(currentText) >= 0)) {
					this.rolesFiltered.push({ Name: role.Name, checked: role.checked });
				}
			});
		}
	}
}
