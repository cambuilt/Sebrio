import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { UtilsService } from '../../services/utils.service';

@Component({
	selector: 'app-work-list-preview',
	templateUrl: './work-list-preview.component.html',
	styleUrls: ['./work-list-preview.component.css']
})
export class WorkListPreviewComponent implements OnInit {
	@Output() previousCollection = new EventEmitter();
	@Output() nextCollection = new EventEmitter();
	@Output() openCollect = new EventEmitter();
	@Output() openOver = new EventEmitter();

	isDrawerOpen = false;
	showDrawerOverlay = false;
	collection = new Collection();
	previous: any;
	next: any;
	platform: any;

	collectDisabled = false;

	constructor(public launchNavigator: LaunchNavigator, public utilsService: UtilsService) {
		this.platform = window.navigator.platform;
	}

	ngOnInit() {
	}

	previewCollection(patient, previous, next) {
		this.previous = previous;
		this.next = next;
		this.collection = patient;
		if (this.collection.IsCancelled || this.collection.Status === 'Complete') {
			this.collectDisabled = true;
		} else {
			this.collectDisabled = false;
		}
		this.show();
	}

	openMap() {
		if ((<any>window).deviceReady === true) {
			const collection = JSON.parse(JSON.stringify(this.collection));
			const address = `${collection.CollectedLocation.AddressLine1}, ${collection.CollectedLocation.City} ${collection.CollectedLocation.State} ${collection.CollectedLocation.ZipCode}`;
			this.launchNavigator.navigate(address);
		} else {
			const collection = JSON.parse(JSON.stringify(this.collection));
			const str = collection.CollectedLocation.AddressLine1.toString();
			const words = str.split(' ');
			let words2 = '';
			words.forEach(word => { words2 += word += '+'; });
			const url = `https://www.google.com/maps/place/${words2}${collection.CollectedLocation.City}+${collection.CollectedLocation.State}+${collection.CollectedLocation.ZipCode}/`;
			const win = window.open(url, '_blank');
 			 win.focus();
		}
	}

	showNext() {
		if (this.next !== null) {
			this.nextCollection.emit(this.next);
		}
	}

	showPrevious() {
		if (this.previous !== null) {
			this.previousCollection.emit(this.previous);
		}
	}

	show() {
		this.isDrawerOpen = true;
		this.showDrawerOverlay = true;
	}

	close() {
		this.isDrawerOpen = false;
		this.showDrawerOverlay = false;
	}

	clickOverlay() {
		this.close();
	}

	collect() {
		if (this.collection.Status !== 'Complete') {
			/* this.showDrawerOverlay = false; */
			this.openOver.emit();
			this.openCollect.emit(this.collection);
			/* setTimeout(() => this.close(), 250); */
		}
	}

}
