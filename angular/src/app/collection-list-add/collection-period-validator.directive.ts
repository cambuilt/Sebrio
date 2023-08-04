import { Directive, ElementRef, HostListener, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { NG_VALIDATORS, FormControl, Validator, ValidationErrors } from '../../../node_modules/@angular/forms';
import { TranslationService } from 'angular-l10n';
import { CollectionListService } from '../services/collection-list.service';
import { ErrorGenerateDirective } from '../validation/error-generate.directive';

@Directive({
	// tslint:disable-next-line:directive-selector
	selector: '[collectionPeriodValidator]',
	providers: [{ provide: NG_VALIDATORS, useExisting: CollectionPeriodValidatorDirective, multi: true }]
})
export class CollectionPeriodValidatorDirective implements Validator {
	@Input() fieldName: any;
	isValid: boolean;
	message: any;

	form: FormControl;

	constructor(private collectionListService: CollectionListService, private el: ElementRef, public translation: TranslationService) {
	}

	validate(c: FormControl): ValidationErrors {
		if (this.form === undefined) {
			this.form = c;
		}
		this.determineValidity();
		if (c.dirty && (c.value === '' || c.value === null)) {
			this.isValid = false;
			this.message = {
				'message': this.translation.translate(`Label.${this.getElementPlaceholder().trim()}`) + ' ' + this.translation.translate('Label.is required')
			};
		}
		return this.isValid ? null : this.message;
	}

	determineValidity() {
		/* console.log(`Determining validity of ${this.fieldName}...`); */
		if (this.fieldName) {
			const validationObject = this.collectionListService.validateCollectionPeriod(this.fieldName);
			if (validationObject !== undefined) {
				this.isValid = validationObject.isValid;
				this.message = validationObject.message;
			} else {
				this.isValid = true;
			}
		} else {
			this.isValid = true;
		}
	}

	@HostListener('blur', ['$event']) onblur(event) {
		this.collectionListService.refreshCollectionPeriodValid();
	}

	getElementPlaceholder() {
		if (this.el.nativeElement.nextSibling.firstElementChild) {
			return (this.el.nativeElement.nextSibling.firstElementChild.textContent);
		}
	}

}
