import { Directive, ElementRef, AfterViewInit } from '@angular/core';
import { TranslationService } from 'angular-l10n';

@Directive({
	selector: '[appErrorGenerate]'
})
export class ErrorGenerateDirective implements AfterViewInit {

	constructor(private el: ElementRef, public translation: TranslationService) { }

	ngAfterViewInit() {

	}

	getElementPlaceholder() {
		if (this.el.nativeElement.nextSibling.firstElementChild) {
			return (this.el.nativeElement.nextSibling.firstElementChild.textContent);
		}

	}


}
