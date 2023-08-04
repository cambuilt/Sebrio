import { Directive, HostListener } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { AuthService } from '../services/auth.service';
import { timer } from 'rxjs';
import { CancellationService } from '../services/cancellation.service';
import { DeviceService } from '../services/device.service';
import { RoleService } from '../services/role.service';
import { ClientService } from '../services/client.service';
import { HubService } from '../services/hub.service';
import { LabService } from '../services/lab.service';
import { LocationService } from '../services/location.service';
import { ProviderService } from '../services/provider.service';
import { ContainerService } from '../services/container.service';
import { TestService } from '../services/test.service';
import { PriorityService } from '../services/priority.service';
import { CollectionListService } from '../services/collection-list.service';
import { TranslationService } from 'angular-l10n';
import { WorkloadService } from '../services/workload.service';
import { CollectionSiteService } from '../services/collection-site.service';
import { LabelService } from '../services/label.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Directive({
	selector: '[appCodeValidation]',
	providers: [{ provide: NG_VALIDATORS, useExisting: CodeValidationDirective, multi: true }]
})
export class CodeValidationDirective implements Validator {
	isValid = true;
	message: any;
	code: any;
	form: FormControl;
	subscription: any;
	validateTimer: any;

	constructor(private router: Router, private userService: UserService, private labelService: LabelService, private collectionSiteService: CollectionSiteService, private workloadService: WorkloadService, public translation: TranslationService, private providerService: ProviderService, private containerService: ContainerService, private testService: TestService, private priorityService: PriorityService, private collectionListService: CollectionListService, private labService: LabService, private locationService: LocationService, private hubService: HubService, private clientService: ClientService, private roleService: RoleService, private deviceService: DeviceService, private authService: AuthService, private cancellationService: CancellationService) { }

	validate(c: FormControl): ValidationErrors {
		this.form = c;
		this.code = c.value;
		if (c.dirty && this.router.routerState.snapshot.url !== '/users') {
			if (!this.code) {
				this.message = {
					'message': this.translation.translate('Label.Code is required')
				};
				this.isValid = false;
			}
		} else {
			this.isValid = true;
		}
		return this.isValid ? null : this.message;
	}

	@HostListener('blur', ['$event']) onInputChange(event) {
		// const currentPage = location.href.split('/')[3];
		const currentPage = this.router.routerState.snapshot.url;
		switch (currentPage) {
			case '/cancellations': this.checkCancellation(); break;
			case '/devices': this.checkDevice(); break;
			case '/roles': this.checkRole(); break;
			case '/clients': this.checkClient(); break;
			case '/hubs': this.checkHub(); break;
			case '/labs': this.checkLab(); break;
			case '/labels': this.checkLabel(); break;
			case '/locations': this.checkLocation(); break;
			case '/providers': this.checkProvider(); break;
			case '/priorities': this.checkPriority(); break;
			case '/collection-list': this.checkCollectionList(); break;
			case '/containers': this.checkContainer(); break;
			case '/tests': this.checkTest(); break;
			case '/workload': this.checkWorkload(); break;
			case '/collection-site': this.checkCollectionSite(); break;
			case '/users': this.checkUser(); break;
		}
	}

	activateForm() {
		if (this.code) {
			this.form.markAsDirty();
			this.form.markAsTouched();
			this.form.updateValueAndValidity();
		}
	}

	processUserResponse(response, code) {
		if (this.code !== '' && this.code !== undefined && this.code !== null) {
			let res = (response.map(row => row.Code.toLowerCase()));
			res = res.filter(row => (row === this.code.toLowerCase()));
			if (res.length === 1) {
				this.message = {
					'message': this.translation.translate('Label.This code already exists')
				};
				this.isValid = false;
				this.activateForm();
			} else {
				this.isValid = true;
				this.activateForm();
			}
		}
	}

	processResponse(response, code) {
		if (code === true) {
			if (this.code !== '' && this.code !== undefined && this.code !== null) {
				let res = (response.json().map(row => row.Code.toLowerCase()));
				res = res.filter(row => (row === this.code.toLowerCase()));
				if (res.length === 1) {
					this.message = {
						'message': this.translation.translate('Label.This code already exists')
					};
					this.isValid = false;
					this.activateForm();
				} else {
					this.isValid = true;
					this.activateForm();
				}
			}
		} else {
			if (this.code !== '' && this.code !== undefined && this.code !== null) {
				let res = (response.json().map(row => row.Name.toLowerCase()));
				res = res.filter(row => (row === this.code.toLowerCase()));
				if (res.length === 1) {
					this.message = {
						'message': this.translation.translate('Label.This code already exists')
					};
					this.isValid = false;
					this.activateForm();
				} else {
					this.isValid = true;
					this.activateForm();
				}
			}
		}
	}

	checkCancellation() {
		this.cancellationService.getCancellations().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkUser() {
		this.userService.getUsers();
		this.userService.users.subscribe(response => {
			this.processUserResponse(response, true);
		});
	}

	checkDevice() {
		this.deviceService.getDevices().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkRole() {
		this.roleService.getRoles().subscribe(response => {
			this.processResponse(response, false);
		});
	}

	checkClient() {
		this.clientService.getClients().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkHub() {
		this.hubService.getHubs().subscribe(response => {
			this.processResponse(response, false);
		});
	}

	checkLab() {
		this.labService.getLabs().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkLabel() {
		this.labelService.getLabels().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkLocation() {
		this.locationService.getLocations().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkProvider() {
		this.providerService.getProviders().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkPriority() {
		this.priorityService.getPriorities().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkCollectionList() {
		this.collectionListService.getCollectionLists().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkContainer() {
		this.containerService.getContainers().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkTest() {
		this.testService.getTests().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkCollectionSite() {
		this.collectionSiteService.getCollectionSites().subscribe(response => {
			this.processResponse(response, true);
		});
	}

	checkWorkload() {
		this.workloadService.getWorkloads().subscribe(response => {
			this.processResponse(response, true);
		});
	}

}
