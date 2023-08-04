import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-work-list-legend',
	templateUrl: './work-list-legend.component.html',
	styleUrls: ['./work-list-legend.component.css']
})
export class WorkListLegendComponent implements OnInit {
	showLegend = false;
	clicks = 0;
	showOtherReserves = false;

	@ViewChild('legendCont') legendCont: ElementRef;

	constructor(private router: Router) { }

	ngOnInit() { }

	show(event: PointerEvent) {
		if (this.router.routerState.snapshot.url !== '/collection-maintenance') {
			this.showOtherReserves = true;
		}
		const legendIcon = document.getElementById('legendIcon');
		this.repositionLegend(legendIcon);
		this.showLegend = true;
		this.attachListener();
	}

	boundRemoveListener = evt => this.removeListener(evt);

	attachListener() {
		document.body.addEventListener('click', this.boundRemoveListener);
	}

	removeListener(event: MouseEvent) {
		this.clicks++;
		if (this.clicks > 1) {
			if (!this.clickedOnContainer(event)) {
				this.clicks = 0;
				document.body.removeEventListener('click', this.boundRemoveListener);
				this.showLegend = false;
			}
		}
	}

	clickedOnContainer(event): boolean {
		if (event.path.find(element => element.id === 'legendContainer') === undefined) {
			return false;
		} else {
			return true;
		}
	}

	repositionLegend(legendIcon) {
		const bodyBox = document.body.getBoundingClientRect();
		const legendBox = legendIcon.getBoundingClientRect();
		const verticalOffset = legendBox.top - bodyBox.top;
		let horizontalOffset = bodyBox.right - legendBox.right;
		if (window.innerWidth < 335) {
			horizontalOffset = horizontalOffset - (335 - window.innerWidth);
		}
		document.getElementById('legendContainer').style.top = `${verticalOffset + 36}px`;
		document.getElementById('legendContainer').style.right = `${horizontalOffset}px`;
	}

	close() {
		this.showLegend = false;
		this.showOtherReserves = false;
	}

	@HostListener('window:resize') onResize() {
		this.repositionLegend(document.getElementById('legendIcon'));
	}

}
