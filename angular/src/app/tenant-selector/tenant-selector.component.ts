import { Component, EventEmitter, Output, Input } from '@angular/core';
import { UtilsService } from '../services/utils.service';
import { TenantService } from '../services/tenant.service';
import { TranslationService } from 'angular-l10n';

@Component({
	selector: 'app-tenant-selector',
	templateUrl: './tenant-selector.component.html',
	styleUrls: ['./tenant-selector.component.css']
})

export class TenantSelectorComponent {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	@Input() parentData: any;
	@Input() tenantsInput: any;
	isDrawerOpen = false;
	hideOverlay = false;
	filterValue = '';
	showFilter = false;
	tenants = [];
	tenantsFiltered = [];
	tenantsToReturn = [];
	tenantsToDisplay = [];

	constructor(public utilsService: UtilsService, private tenantService: TenantService, public translation: TranslationService) {
	}

	show(hideOverlay) {
		this.loadTenants();
		this.applyFilter();
		this.isDrawerOpen = true;
		document.querySelector('app-tenant-selector .drawer-content').scrollTop = 0;

		if (hideOverlay) {
			this.hideOverlay = hideOverlay;
		}
	}

	closeDrawer() {
		this.isDrawerOpen = false;
	}

	save() {
		if (this.utilsService.checkOnlineStatus()) {
			this.tenantsToReturn = [];
			this.tenantsToDisplay.forEach(tenant => {
				const checkBoxClasses = (document.querySelector(`#checkboxTenant-${tenant.Name}`) as HTMLInputElement).classList;
				if (Array.from(checkBoxClasses).find(item => item.includes('mat-checkbox-checked'))) {
					this.tenantsToReturn.push(tenant.Name);
				}
			});
			this.onSave.emit(this.tenantsToReturn);
			this.closeDrawer();
		}
	}

	loadTenants() {
		if (this.utilsService.checkOnlineStatus()) {
			this.tenantsToDisplay = [];
			this.tenantService.getTenants().subscribe(response => {
				const allTenants = response.json();
				for (let i = 0; i < allTenants.length; i++) {
					if (allTenants[i].Name !== '') {
						const check = this.tenantsInput.map(tenant => tenant.Name).indexOf(allTenants[i].Name) !== -1;
						this.tenantsToDisplay.push({ Name: allTenants[i].Name, check: check });
					}
				}
				this.tenantsFiltered = this.tenantsToDisplay;
			}, error => {
				if (error.status === 401) {
					this.utilsService.handle401(error);
				} else {
					this.utilsService.showError(`Error: ${error}`);
				}
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
			this.tenantsFiltered = this.tenantsToDisplay;
		} else {
			this.tenantsFiltered = [];
			const currentText = this.filterValue.toLowerCase().trim(); // prevent empty search
			this.tenantsToDisplay.forEach(tenant => { // searching description and name
				if (tenant.Name.toLowerCase().search(currentText) >= 0) {
					this.tenantsFiltered.push({ Name: tenant.Name, check: tenant.check });
				}
			});
		}
	}
}
