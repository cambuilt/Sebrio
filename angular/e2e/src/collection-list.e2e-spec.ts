import { browser, element, by, Key } from 'protractor';

describe('eMLC App', () => {
	let elementFound = false;
	let elementIndex = null;
	let elementBox = '';
	let wasUpdated = false;
	let recordCount = 0;
	browser.waitForAngularEnabled(false);

	browser.get('/');

	browser.driver.sleep(3000);
	element(by.className('input-username')).sendKeys('joshtsa');
	element(by.className('input-password')).sendKeys('Password1!');
	browser.driver.sleep(1000);
	element(by.className('button-sign-in')).click();
	browser.driver.sleep(2000);

	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should drop list panel', () => {
		element(by.id('listPanel')).click();
		browser.driver.sleep(2000);
	});

	it('should navigate to collection list', () => {
		element(by.id('menu-collection-list')).click();
		browser.driver.sleep(3000);
	});

	it('should open filter component', () => {
		element(by.id('collectionListFilterIcon')).click();
		browser.driver.sleep(1500);
	});

	it('should run a search', () => {
		let search = 'D12';
		element(by.id('filterInput1')).sendKeys(search);
		browser.driver.sleep(3000);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(3000);
	});

	it('should return data', () => {
		element(by.id('collection-list-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('D12') > -1)) {
						elementFound = true;
						elementIndex = count;
						if (text.indexOf('check_box_outline_blank') > -1) {
							elementBox = 'check_box_outline_blank';
						} else {
							elementBox = 'check_box';
						}
						return;
					}
					count += 1;
				});
			});
		});
	});


	it('should click on D12', () => {
		element(by.id('collection-list-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('collectionListEditIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should update active', () => {
		element(by.id('collectionListActiveToggle')).click();
		browser.driver.sleep(1000);
		element(by.id('collectionListSaveButton')).click();
		browser.driver.sleep(2000);
	});

	it('should opt to not deactivate record', () => {
		element(by.className('btn-alert-ok btn-alert-no')).click();
		browser.driver.sleep(2000);
	});

	it('should add record and check record count', () => {
		element(by.tagName('mat-paginator')).getText().then((text) => {
			recordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
		});
		browser.driver.sleep(3000);
	});

	it('should add record', () => {
		element(by.className('page-button')).click();
		browser.driver.sleep(1000);
		const bs = Key.BACK_SPACE;
		element(by.id('firstField')).sendKeys('FR');
		browser.driver.sleep(500);
		element(by.id('descriptionField')).sendKeys(bs, bs, 'Friday Reservations');
		browser.driver.sleep(1500);
		element(by.id('hubSelectCollection')).click();
		browser.driver.sleep(1500);
		element(by.className('mat-option ng-star-inserted mat-active')).click();
		browser.driver.sleep(2000);
		element(by.id('labSelectCollection')).click();
		browser.driver.sleep(1500);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					console.log('displayed: ', displayed);
					if (option === options[options.length - 1]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(2000);
		});
		element(by.id('autoRefreshCollection')).sendKeys('100');
		browser.driver.sleep(500);
		element(by.id('manualRefreshCollection')).sendKeys('100');
		browser.driver.sleep(500);
		element(by.id('teeSelect')).click();
		browser.driver.sleep(1500);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					console.log('displayed: ', displayed);
					if (option === options[options.length - 2]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(2000);
		});
		element(by.id('daysFrom')).sendKeys('1');
		browser.driver.sleep(1000);
		element(by.id('startTime')).sendKeys('0000');
		browser.driver.sleep(1000);
		element(by.id('teeSelect2')).click();
		browser.driver.sleep(1500);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					console.log('displayed: ', displayed);
					if (option === options[options.length - 1]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(2000);
		});
		element(by.id('daysTo')).sendKeys('1');
		browser.driver.sleep(1000);
		element(by.id('endTime')).sendKeys('2359');
		browser.driver.sleep(1000); // add location
		element(by.id('addLocationCollection')).click();
		browser.driver.sleep(1500);
		element(by.className('locationSelectorFilterIcon')).click();
		browser.driver.sleep(1500);
		element(by.className('locationSelectorFilterInput')).sendKeys('delta9');
		browser.driver.sleep(1500);
		element(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).click();
		browser.driver.sleep(500);
		element(by.id('locationSelectorSaveButton')).click();
		browser.driver.sleep(1500); // add a client
		element(by.id('addClientCollection')).click();
		browser.driver.sleep(1500);
		element(by.className('clientSelectorFilterIcon')).click();
		browser.driver.sleep(1500);
		element(by.className('clientSelectorFilterInput')).sendKeys('oh');
		browser.driver.sleep(1500);
		element.all(by.className('checkBoxDiv selectorCheckbox otherSelector mat-icon material-icons')).then((boxes) => {
			boxes.forEach(box => {
				box.isPresent().then((present) => {
					if (present === true) {
						box.isDisplayed().then((displayed) => {
							if (displayed === true) {
								box.click();
							}
						});
					}
				});
			});
			browser.driver.sleep(2000);
		});
		browser.driver.sleep(1000);
		element(by.id('clientSelectorSaveButton')).click();
		browser.driver.sleep(2500); // add a prvider
		element(by.id('addProviderCollection')).click();
		browser.driver.sleep(1500);
		element(by.className('providerSelectorFilterIcon')).click();
		browser.driver.sleep(1500);
		element(by.className('providerSelectorFilterInput')).sendKeys('qcp');
		browser.driver.sleep(1500);
		element.all(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).then((boxes) => {
			boxes.forEach(box => {
				box.isPresent().then((present) => {
					if (present === true) {
						box.isDisplayed().then((displayed) => {
							if (displayed === true) {
								box.click();
							}
						});
					}
				});
			});
			browser.driver.sleep(2000);
		});
		browser.driver.sleep(1000);
		element(by.id('providerSelectorSaveButton')).click();
		browser.driver.sleep(2500); // add priority
		element(by.id('addPriorityCollection')).click();
		browser.driver.sleep(1500);
		element(by.className('prioritySelectorFilterIcon')).click();
		browser.driver.sleep(1500);
		element(by.className('prioritySelectorFilterInput')).sendKeys('stat');
		browser.driver.sleep(1500);
		element.all(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).then((boxes) => {
			boxes.forEach(box => {
				box.isPresent().then((present) => {
					if (present === true) {
						box.isDisplayed().then((displayed) => {
							if (displayed === true) {
								box.click();
							}
						});
					}
				});
			});
			browser.driver.sleep(2000);
		});
		browser.driver.sleep(1000);
		element(by.id('prioritySelectorSaveButton')).click();
		browser.driver.sleep(1500);
		element(by.id('collectionReservationExp')).sendKeys('100');
		browser.driver.sleep(1500);
		element(by.id('patientWristbandToggle')).click();
		browser.driver.sleep(1500);
		element(by.id('numberOfIdentifiers')).click();
		browser.driver.sleep(1500);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					console.log('displayed: ', displayed);
					if (option === options[0]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(2000);
		});
		element(by.id('documentId1')).click();
		browser.driver.sleep(1500);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					console.log('displayed: ', displayed);
					if (option === options[0]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(2000);
		});
		element(by.id('collectionListSaveButton')).click();
		browser.driver.sleep(2000);
		element(by.tagName('mat-paginator')).getText().then((text) => {
			const newRecordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
			expect(newRecordCount).toEqual(recordCount + 1);
		});
	});



});
