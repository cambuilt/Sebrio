import { Component, Output, EventEmitter } from '@angular/core';
import { Collection } from 'src/app/models/collection.model';

@Component({
	selector: 'app-work-list-select',
	templateUrl: './work-list-select.component.html',
	styleUrls: ['./work-list-select.component.css']
})
export class WorkListSelectComponent {
	@Output() updateNext = new EventEmitter();

	showSelect = false;
	collection = new Collection();

	constructor() { }

	makeTestControls() {
		this.collection.OrderedTests.forEach(test => {
			if (!test['checked']) {
				test['checked'] = false;
			}
		});
	}

	show() {
		this.showSelect = true;
		this.makeTestControls();
	}

	close() {
		this.showSelect = false;
	}

	toggleCheck(test) {
		test['checked'] = !test['checked'];
		this.updateNext.emit(this.collection.OrderedTests.filter(t => t['checked']).length > 0);
	}

	reset() {
		this.showSelect = false;
		this.collection = new Collection();
	}

	complete() {
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			parsedStorage.SelectComplete = true;
			localStorage.setItem('workListCollecting', JSON.stringify(parsedStorage));
		}
	}

}
