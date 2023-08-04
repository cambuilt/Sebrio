import { Component, OnInit, ViewChild } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';
import { WorkListPatientComponent } from 'src/app/work-list/work-list-collect/work-list-patient/work-list-patient.component';
import { ActiveEntitiesService } from 'src/app/services/active-entities.service';
import { TranslationService } from 'angular-l10n';

@Component({
	selector: 'app-work-list-cancelled',
	templateUrl: './work-list-cancelled.component.html',
	styleUrls: ['./work-list-cancelled.component.css']
})
export class WorkListCancelledComponent implements OnInit {

	@ViewChild('workListCollection') workListCollection: WorkListPatientComponent;

	showDrawer = false;
	showOverlay = false;
	showPatientInfo = false;
	collection = new Collection();
	AssignedPhleb = '';

	constructor(private activeEntitiesService: ActiveEntitiesService, public translation: TranslationService) { }

	ngOnInit() { }

	show(collection) {
		this.collection = collection;
		this.AssignedPhleb = `${collection.ReservedBy.FirstName} ${collection.ReservedBy.LastName} - (465) 532-7240`;
		this.showDrawer = true;
	}

	close() {
		this.showDrawer = false;
	}

	clickOverlay() {
		this.close();
	}

	reset() {
		this.showDrawer = false;
		this.showPatientInfo = false;
		this.collection = new Collection();
		this.AssignedPhleb = '';
	}

	clickInfo() {
		this.showPatientInfo = !this.showPatientInfo;
		this.workListCollection.collection = this.collection;
		this.workListCollection.toggle();
	}

	preventSelect(event) {
		event.preventDefault();
	}
}
