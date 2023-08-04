import { Directive, HostListener } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { AuthService } from '../services/auth.service';
import { SystemService } from '../services/system.service';
import { timer } from 'rxjs';
import { TranslationService } from 'angular-l10n';
import { UtilsService } from '../services/utils.service';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[ngModel][subdomainValidator]',
	providers: [{ provide: NG_VALIDATORS, useExisting: SubdomainValidationDirective, multi: true }]
})
export class SubdomainValidationDirective implements Validator {
	isValid = true;
	message: any;
	subdomain: any;
	form: FormControl;
	subscription: any;
	validateTimer: any;
	private specialCharacters = new RegExp(/[\s`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi);

	constructor(private utilsService: UtilsService, public translation: TranslationService, private systemService: SystemService) { }

	validate(c: FormControl): ValidationErrors {
		this.form = c;
		this.subdomain = c.value;
		if (c.dirty) {
			if (!this.subdomain) {
				this.message = {
					'message': this.translation.translate('Label.A valid subdomain is required')
				};
				this.isValid = false;
			}
		}
		return this.isValid ? null : this.message;
	}

	@HostListener('blur', ['$event']) onInputChange(event) {
		this.checkDomain();
	}

	activateForm() {
		if (this.subdomain) {
			this.form.markAsDirty();
			this.form.markAsTouched();
			this.form.updateValueAndValidity();
		}
	}

	checkDomain() {
		if (this.utilsService.checkOnlineStatus()) {
			this.systemService.getSubdomainUnauthenticated(this.subdomain.trim()).subscribe(response => {
				if (response.status === 200) {
					this.isValid = true;
					this.activateForm();
				}
			}, error => {
				if (error) {
					this.message = {
						'message': this.translation.translate('Label.This subdomain was not found')
					};
					this.isValid = false;
					this.activateForm();
				}
			});
		}
	}

}
