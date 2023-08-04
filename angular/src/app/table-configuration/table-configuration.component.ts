import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from 'angular-l10n';
import { UnsavedChangesDialogComponent } from '../unsaved-changes-dialog/unsaved-changes-dialog.component';
import { MatDialog } from '@angular/material';
import { UtilsService } from '../services/utils.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'rmp-table-configuration',
	templateUrl: './table-configuration.component.html',
	styleUrls: ['./table-configuration.component.css']
})

export class TableConfigurationComponent {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onSave = new EventEmitter();

	isDrawerOpen = false;
	columns: any = [];
	dragItem: any;
	dragStartY = 0;
	tileHeight = 48;
	pristineObject: any;

	constructor(private utilsService: UtilsService, private router: Router, public translation: TranslationService, private errorAlert: MatDialog) {

	}

	dragStart($event) {
		this.dragItem = $event.currentTarget.parentNode;
		this.dragItem.classList.add('isDragging');
		if ((<any>window).deviceReady === true) {
			this.dragStartY = ($event.targetTouches[0] ? $event.targetTouches[0].pageY : $event.changedTouches[$event.changedTouches.length - 1].pageY);
		} else {
			this.dragStartY = $event.clientY;
		}
		// tslint:disable-next-line:radix
		this.setItemOver(parseInt(this.dragItem.getAttribute('data-index')) + 1);
		this.addDragHandlers();
		$event.preventDefault();
	}

	dragMove(event) {
		let moveAmount;
		// tslint:disable-next-line:radix
		const dragIndex = parseInt(this.dragItem.getAttribute('data-index'));
		if ((<any>window).deviceReady === true) {
			moveAmount = ((event.targetTouches[0] ? event.targetTouches[0].pageY : event.changedTouches[event.changedTouches.length - 1].pageY) - this.dragStartY);
		} else {
			moveAmount = event.clientY - this.dragStartY;
		}
		let newIndexOver = dragIndex + Math.floor(moveAmount / this.tileHeight);

		if (newIndexOver >= dragIndex) {
			newIndexOver += 1;
		} else {
			moveAmount -= this.tileHeight;
		}

		if ((newIndexOver >= 0) && (newIndexOver <= this.columns.length)) {
			this.setItemOver(newIndexOver);
			this.dragItem.style.transform = 'translateY(' + moveAmount + 'px)';
		}
		event.preventDefault();
	}

	dragEnd(event) {
		let moveAmount;
		this.dragItem.classList.remove('isDragging');
		this.dragItem.style.transform = 'none';
		this.setItemOver(-1);

		// tslint:disable-next-line:radix
		const dragIndex = parseInt(this.dragItem.getAttribute('data-index'));
		if ((<any>window).deviceReady === true) {
			moveAmount = ((event.targetTouches[0] ? event.targetTouches[0].pageY : event.changedTouches[event.changedTouches.length - 1].pageY) - this.dragStartY);
		} else {
			moveAmount = event.clientY - this.dragStartY;
		}
		let newIndexOver = dragIndex + Math.floor(moveAmount / this.tileHeight);

		if (newIndexOver < 0) {
			newIndexOver = 0;
		} else if (newIndexOver >= this.columns.length) {
			newIndexOver = this.columns.length - 1;
		}

		const dragItem = this.columns[dragIndex];
		this.columns.splice(dragIndex, 1);
		this.columns.splice(newIndexOver, 0, dragItem);
		this.removeDragHandlers();

		event.preventDefault();
	}

	addDragHandlers() {
		document.body.onmousemove = (event: MouseEvent): any => { this.dragMove(event); };
		document.body.ontouchmove = (event: TouchEvent): any => { this.dragMove(event); };
		document.body.onmouseup = (event: MouseEvent): any => { this.dragEnd(event); };
		document.body.onmouseleave = (event: MouseEvent): any => { this.dragEnd(event); };
		document.body.ontouchend = (event: TouchEvent): any => { this.dragEnd(event); };
	}

	removeDragHandlers() {
		document.body.onmousemove = null;
		document.body.onmouseup = null;
		document.body.onmouseleave = null;
		document.body.ontouchmove = null;
		document.body.ontouchend = null;
	}

	setItemOver(index) {
		const columnTiles = document.querySelectorAll('.column-tile');
		const columnsCard = document.querySelector('.columns-card');

		for (let i = 0; i < columnTiles.length; i++) {
			// tslint:disable-next-line:radix
			if (parseInt(columnTiles[i].getAttribute('data-index')) === index) {
				columnTiles[i].classList.add('itemOver');
			} else {
				columnTiles[i].classList.remove('itemOver');
			}
		}

		if (index === this.columns.length) {
			columnsCard.classList.add('overLastItem');
		} else {
			columnsCard.classList.remove('overLastItem');
		}
	}

	resetPristine() {
		this.pristineObject = JSON.stringify(this.columns);
	}

	findRequest(columns) {
		let x = 0;
		columns.forEach(item => {
			if (item.name.search('TsuRequest') > -1) {
				columns.splice(x, 1);
			}
			x++;
			if (x === (columns.length - 1)) {
				this.columns = JSON.parse(JSON.stringify(columns));
			}
		});
	}

	show(columns) {
		if (this.router.routerState.snapshot.url === '/collection-maintenance') {
			this.findRequest(columns);
		} else {
			this.columns = JSON.parse(JSON.stringify(columns));
		}
		this.isDrawerOpen = true;
		this.resetPristine();
		document.querySelector('rmp-table-configuration .drawer-content').scrollTop = 0;
	}

	close() {
		this.isDrawerOpen = false;
		this.resetPristine();
	}

	clickOverlay() {
		if (this.pristineObject !== JSON.stringify(this.columns)) {
			const dialogRef = this.errorAlert.open(UnsavedChangesDialogComponent, {
				width: '300px',
				backdropClass: 'unsavedOverlay',
				autoFocus: false
			});
			dialogRef.beforeClose().subscribe(result => {
				if (document.body.querySelector('.add-overlay')) {
					document.body.removeChild(document.body.querySelector('.add-overlay'));
				}
				if (result) {
					this.save();
				} else { this.close(); }

			});
		} else {
			this.close();
		}
	}

	save() {
		if (this.checkColumns()) {
			if (this.router.routerState.snapshot.url === '/collection-maintenance') {
				this.columns.unshift({ id: 1, name: 'TsuRequest', dropdown: false, array: [], model: 'TsuRequest', dateTime: false, checked: true });
				this.onSave.emit({ columns: this.columns });
			} else {
				this.onSave.emit({ columns: this.columns });
			}
			this.close();
		}
	}

	checkColumns() {
		let checked = 0;
		let count = 0;
		let hasColumns = false;
		this.columns.forEach(col => {
			if (col.checked === true) {
				checked++;
			}
			count++;
			if (count === this.columns.length && checked === 0) {
				this.utilsService.showError(`${this.translation.translate('Error.At least one column is required')}`);
				hasColumns = false;
			} else if (count === this.columns.length && checked > 0) {
				hasColumns = true;
			}
		});
		return hasColumns;
	}

	getColumnDisplayName(column) {
		let displayName: string;
		switch (column.name) {
			case 'FirstName': displayName = this.translation.translate('Label.First name'); break;
			case 'UTCTimeStamp': displayName = this.translation.translate('Label.Date & Time'); break;
			case 'Phone1': displayName = this.translation.translate('Label.Primary phone'); break;
			case 'IsActive': displayName = this.translation.translate('Label.Active'); break;
			case 'LastName': displayName = this.translation.translate('Label.Last name'); break;
			case 'LabId': displayName = this.translation.translate('Label.Lab'); break;
			case 'CompanyName': displayName = this.translation.translate('Label.Company name'); break;
			case 'CellPhone': displayName = this.translation.translate('Label.Cell phone'); break;
			case 'ContainerType': displayName = this.translation.translate('Label.Container type'); break;
			case 'ContainerRank': displayName = this.translation.translate('Label.Container rank'); break;
			case 'SpecimenCode': displayName = this.translation.translate('Label.Specimen code'); break;
			case 'DrawOrder': displayName = this.translation.translate('Label.Draw order'); break;
			case 'StorageCode': displayName = this.translation.translate('Label.Storage code'); break;
			case 'HandlingInstructions': displayName = this.translation.translate('Label.Handling instructions'); break;
			case 'LabDepartment': displayName = this.translation.translate('Label.Lab department'); break;
			case 'DefaultContainer': displayName = this.translation.translate('Label.Default container'); break;
			case 'DOB': displayName = this.translation.translate('Label.Date of birth'); break;
			case 'SecretNumber': displayName = this.translation.translate('Label.Secret'); break;
			case 'NumberOfCollections': displayName = this.translation.translate('Label.Number of Collections'); break;
			case 'AverageDurationMinutes': displayName = this.translation.translate('Label.Average Duration (Minutes)'); break;
			case 'TsuRequest': displayName = this.translation.translate('Label.Request indicator'); break;
			default: displayName = this.translation.translate(`Label.${column.name}`); break;
		}
		if (this.router.routerState.snapshot.url === '/providers' && column.name === 'FirstName') {
			displayName = this.translation.translate('Label.Full name');
		}
		if (this.router.routerState.snapshot.url === '/roles' && column.name === 'Name' || this.router.routerState.snapshot.url === '/hubs' && column.name === 'Name') {
			displayName = this.translation.translate('Label.Code');
		}
		if (this.router.routerState.snapshot.url === '/auditing' && column.name === 'Users' || this.router.routerState.snapshot.url === '/utilization' && column.name === 'Users' || this.router.routerState.snapshot.url === '/collection-data' && column.name === 'Users' || this.router.routerState.snapshot.url === '/collection-duration' && column.name === 'Users') {
			displayName = this.translation.translate('Label.User');
		}
		return displayName;
	}
}
