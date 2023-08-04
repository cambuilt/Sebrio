import { Component, Output, Injector, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { RoleService } from '../services/role.service';
import { AuthService } from '../services/auth.service';
import { RoleAddComponent } from '../role-add/role-add.component';
import { TranslationService } from 'angular-l10n';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';

@Component({
	selector: 'app-role-permission',
	templateUrl: './role-permission.component.html',
	styleUrls: ['./role-permission.component.css'],
})

export class RolePermissionComponent implements OnInit {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onFullClose = new EventEmitter();
	isDrawerOpen = false;
	hideOverlay = false;
	headerText: string;
	allPermissions = [];
	permissions = [];
	permissionsFiltered = [];
	permissionsToReturn: any;
	pristineObject: any;
	permissionsInput: any;
	filterValue = '';
	showFilter = false;
	private roleAdd: RoleAddComponent;

	constructor(public utilsService: UtilsService, private roleService: RoleService, private unsavedChangesAlert: MatDialog, private injector: Injector, private authService: AuthService, public translation: TranslationService) {
	}


	ngOnInit() {
		if (this.utilsService.checkOnlineStatus()) {
			this.roleAdd = this.injector.get(RoleAddComponent);
			let id = 1;
			this.roleService.getRolePermissions(this.authService.currentUser.tenantId).subscribe(response => {
				response.json().forEach(permission => {
					this.allPermissions.push({ Id: id, Code: permission.Code, Description: permission.Description, checked: false });
					id++;
				});
			}, error => {
				setTimeout(() => null, 1000);
				this.roleService.getRolePermissions(this.authService.currentUser.tenantId).subscribe(response => {
					response.json().forEach(permission => {
						this.allPermissions.push({ Id: id, Code: permission.Code, Description: permission.Description, checked: false });
						id++;
					});
				}, error2 => {
					if (error2.status === 401) {
						this.utilsService.handle401(error2);
					} else {
					this.utilsService.showError(`${this.translation.translate('Error.Error getting permissions data')}: ${error2.statusText}, error ${error2.status}`);
					}
				});
			});
		}
	}

	show(hideOverlay) {
		this.loadPermissions();
		this.isDrawerOpen = true;
		document.querySelector('app-role-permission .drawer-content').scrollTop = 0;

		if (hideOverlay) {
			this.hideOverlay = hideOverlay;
		}
	}

	loadPermissions() {
		if (this.utilsService.checkOnlineStatus()) {
			this.permissions = [];
			this.permissionsFiltered = [];
			this.allPermissions.forEach(permission => {
				let checked = false;
				if (this.roleAdd.role.Permissions && this.roleAdd.role.Permissions.length > 0) {// if they exist, pre check them
					checked = this.roleAdd.role.Permissions.findIndex((item) => item['Code'] === permission.Code) > -1;
				}
				this.permissions.push({ Id: permission.Id, Code: permission.Code, Description: permission.Description, checked: checked });
			});
			this.permissionsInput = this.permissions.filter(permission => permission.checked === true);
			this.permissionsFiltered = this.permissions;
		}
	}

	closeDrawer() {
		this.isDrawerOpen = false;
		this.closeFilter();
	}

	save() {
		this.roleAdd.role.Permissions = [];
		this.getPermissionsToReturn();
		this.roleAdd.role.Permissions = this.permissionsToReturn;
		this.closeDrawer();
	}

	getPermissionsToReturn() {
		this.permissionsToReturn = this.permissions.filter(permission => permission.checked === true).map(permission => {
			return { Code: permission.Code, Description: permission.Description };
		});
		this.updatePristine();
	}

	updatePristine() {
		this.pristineObject = JSON.stringify(this.permissionsToReturn.map(permission => permission.Code));
	}

	propagateCheckbox(event, permission) {
		this.permissions.find(o => o.Code === permission.Code).checked = !this.permissions.find(o => o.Code === permission.Code).checked;
	}

	clickOverlay(toPrevious) {
		this.getPermissionsToReturn();
		if (this.pristineObject !== JSON.stringify(this.permissionsInput.map(permission => permission.Code))) {
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
			this.permissionsFiltered = this.permissions;
		} else {
			this.permissionsFiltered = [];
			const currentText = this.filterValue.toLowerCase().trim(); // prevent empty search
			this.permissions.forEach(permission => { // searching description and name
				if ((permission.Description.toLowerCase().search(currentText) >= 0) ||
					(permission.Code.toLowerCase().search(currentText) >= 0)) {
					this.permissionsFiltered.push({ Id: permission.Id, Code: permission.Code, Description: permission.Description, checked: permission.checked });
				}
			});
		}
	}
}
