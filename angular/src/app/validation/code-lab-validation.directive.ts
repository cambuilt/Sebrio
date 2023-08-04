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
	selector: '[appCodeLabValidation]',
	providers: [{ provide: NG_VALIDATORS, useExisting: CodeLabValidationDirective, multi: true }]
})
export class CodeLabValidationDirective implements Validator {
	isValid = true;
	message: any;
	code: any;
	form: FormControl;
	subscription: any;
	validateTimer: any;

	constructor(private router: Router, private userService: UserService, private labelService: LabelService, private collectionSiteService: CollectionSiteService, private workloadService: WorkloadService, public translation: TranslationService, private providerService: ProviderService, private containerService: ContainerService, private testService: TestService, private priorityService: PriorityService, private collectionListService: CollectionListService, private labService: LabService, private locationService: LocationService, private hubService: HubService, private clientService: ClientService, private roleService: RoleService, private deviceService: DeviceService, private authService: AuthService, private cancellationService: CancellationService) { }

	validate(c: FormControl): ValidationErrors {
		let verifyThis = false;
		const currentPage = this.router.routerState.snapshot.url;
		console.log('currentPage: ', currentPage);
		switch (currentPage) {
			case '/cancellations': verifyThis = this.cancellationService.cancellationExists; break;
			case '/collection-list': verifyThis = this.collectionListService.collectionExists; break;
			case '/containers': verifyThis = this.containerService.containerExists; break;
			case '/labels': verifyThis = this.labelService.labelExists; break;
			case '/priorities': verifyThis = this.priorityService.priorityExists; break;
			case '/tests': verifyThis = this.testService.testExists; break;
			case '/workload': verifyThis = this.workloadService.workloadExists; break;
			case '/clients': verifyThis = this.clientService.clientExists; break;
			case '/providers': verifyThis = this.providerService.providerExists; break;
			case '/locations': verifyThis = this.locationService.locationExists; break;
			case '/collection-site': verifyThis = this.collectionSiteService.siteExists; break;
		}
		this.form = c;
		this.code = c.value;
		console.log('verifyThis: ', verifyThis);
		if (c.dirty) {
			if (!this.code) {
				this.message = {
					'message': this.translation.translate('Label.Code is required')
				};
				this.isValid = false;
			} else if (verifyThis === true) {
				console.log('verifyThis: ', verifyThis);
				this.message = {
					'message': this.translation.translate('Label.Code already exists for this lab')
				};
				this.isValid = false;
			} else {
				this.isValid = true;
			}
		} else {
			this.isValid = true;
		}
		return this.isValid ? null : this.message;
	}

	activateForm() {
		if (this.code) {
			this.form.markAsDirty();
			this.form.markAsTouched();
			this.form.updateValueAndValidity();
		}
	}

}
