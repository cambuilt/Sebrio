import { Directive, Input, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { ErrorGenerateDirective } from './error-generate.directive';
import { TranslationService } from 'angular-l10n';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[confirmPassword]',
	providers: [{ provide: NG_VALIDATORS, useExisting: PasswordConfirmDirective, multi: true }]
})
export class PasswordConfirmDirective implements Validator {
	@Input() otherPassword: any;
	@Input() recentlyUsed: any;

	constructor(public translation: TranslationService) { }

	validate(c: FormControl): ValidationErrors {
		let message = {
			'message': ''
		};
		let isValid = false;

		if (c.dirty) {
			if (c.value === null || c.value === '') {
				message = {
					'message': this.translation.translate('Label.Confirm password is required')
				};
				isValid = false;
			} else if (this.recentlyUsed.value === true) {
				message = {
					'message': this.translation.translate('Label.This password has recently been used')
				};
			} else if (this.otherPassword !== null) {
				if (!this.otherPassword) {
					message = {
						'message': this.translation.translate('Label.Passwords do not match')
					};
					isValid = false;
				} else if (this.otherPassword.length > 0) {
					if (c.value !== this.otherPassword) {
						message = {
							'message': this.translation.translate('Label.Passwords do not match')
						};
						isValid = false;
					} else {
						isValid = true;
					}
				} else {
					message = {
						'message': this.translation.translate('Label.Passwords do not match')
					};
					isValid = false;
				}

			} else {
				isValid = true;
			}

			return isValid ? null : message;
		}
	}

}
