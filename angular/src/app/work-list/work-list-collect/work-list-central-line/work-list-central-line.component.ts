import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslationService } from 'angular-l10n';

@Component({
	selector: 'app-work-list-central-line',
	templateUrl: './work-list-central-line.component.html',
	styleUrls: ['./work-list-central-line.component.css']
})
export class WorkListCentralLineComponent {
	@Output() submitCentralLine = new EventEmitter();
	showCentralLine = false;

	centralLine = {
		IsActive: false
	};
	FastingStatus = '';
	CollectionNote = '';

	canUpdateCentralLineStatus = true;
	canAddCollectionNote = true;

	constructor(public translation: TranslationService) { }

	show() {
		this.showCentralLine = true;
	}

	close() {
		this.showCentralLine = false;
	}

	reset() {
		this.showCentralLine = false;
		this.centralLine = {
			IsActive: false
		};
		this.FastingStatus = '';
		this.CollectionNote = '';
	}

	submit() {
		this.submitCentralLine.emit({ CentralLine: this.centralLine.IsActive, CollectionNote: this.CollectionNote, FastingStatus: this.FastingStatus });
	}

	updateStorage(storedString, value) {
		const storedCollection = localStorage.getItem('workListCollecting');
		if (storedCollection !== null) {
			const parsedStorage = JSON.parse(storedCollection);
			parsedStorage[storedString] = value;
			localStorage.setItem('workListCollecting', JSON.stringify(parsedStorage));
		}
	}

	updateCentralLine() {
		this.updateStorage('CentralLine', this.centralLine.IsActive);
	}

	updateCollectionNote() {
		this.updateStorage('CollectionNote', this.CollectionNote);
	}

	updateFastingStatus() {
		this.updateStorage('FastingStatus', this.FastingStatus);
	}

	complete() {
		this.updateStorage('CentralLineComplete', true);
	}
}
