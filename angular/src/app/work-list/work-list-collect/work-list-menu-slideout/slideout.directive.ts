import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
	selector: '[appWorkListMenuSlideout]'
})
export class SlideoutDirective {

	constructor(public viewContainerRef: ViewContainerRef) { }

}
