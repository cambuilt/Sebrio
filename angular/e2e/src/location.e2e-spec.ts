import { browser, element, by, Key } from 'protractor';

describe('eMLC App', () => {
	let elementFound = false;
	let elementIndex = 0;
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

	it('should drop relationship panel', () => {
		element(by.id('relationshipPanel')).click();
		browser.driver.sleep(2000);
	});

	it('should select locations', () => {
		element(by.id('menu-locations')).click();
		browser.driver.sleep(1000);
	});

	// it('should open filter component', () => {
	// 	element(by.id('locationFilterIcon')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should run a search', () => {
	// 	let search = 'Delta9';
	// 	element(by.id('filterInput1')).sendKeys(search);
	// 	browser.driver.sleep(3000);
	// 	element(by.id('submitFilter')).click();
	// 	browser.driver.sleep(1500);
	// });


	// // find Delta9
	// it('should return data', () => {
	// 	element(by.id('location-maintenance-table')).$$('tr').then((rows) => {
	// 		let count = 0;
	// 		rows.forEach(row => {
	// 			row.getText().then((text) => {
	// 				console.log('row text', text);
	// 				if ((text.indexOf('Delta9') > -1)) {
	// 					elementIndex = count;
	// 					return;
	// 				}
	// 				count += 1;
	// 			});
	// 		});
	// 	});
	// });


	// it('should click on Delta9', () => {
	// 	element(by.id('location-maintenance-table')).$$('tr').get(elementIndex).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should open the drawer', () => {
	// 	element(by.id('locationEditIcon')).click();
	// 	browser.driver.sleep(2000);
	// });

	// it('should deactivate the location', () => {
	// 	element(by.id('locationActiveToggle')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should click the overlay', () => {
	// 	element(by.className('drawer-overlay show')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should click no', () => {
	// 	element(by.className('btn-alert-ok btn-alert-no')).click();
	// 	browser.driver.sleep(3000);
	// });

	it('should add a new record', () => {
		const bs = Key.BACK_SPACE;
		element(by.className('page-button')).click();
		browser.driver.sleep(1500);
		element(by.id('firstField')).sendKeys('L1');
		browser.driver.sleep(1500);
		element(by.id('descriptionField')).sendKeys(bs, bs, 'Location 1');
		browser.driver.sleep(1500);
		element(by.id('locationStreet1')).sendKeys('8219 West point dr');
		browser.driver.sleep(1000);
		element(by.id('locationCity')).sendKeys('Charlotte');
		browser.driver.sleep(1000);
		element(by.id('locationState')).click();
		browser.driver.sleep(1000);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			let clicked = false;
			options.forEach(option => {
				option.isPresent().then((present) => {
					if (present === true && clicked === false) {
						option.isDisplayed().then((displayed) => {
							console.log('displayed: ', displayed);
							if (option === options[27]) {
								option.click();
								clicked = false;
							}
						});
					}
				});
			});
			browser.driver.sleep(2000);
		});
		element(by.id('locationZip')).sendKeys('28270');
		browser.driver.sleep(1000);
		element(by.id('locationCounty')).click();
		browser.driver.sleep(1000);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			let clicked = false;
			options.forEach(option => {
				option.isPresent().then((present) => {
					if (present === true && clicked === false) {
						option.isDisplayed().then((displayed) => {
							console.log('displayed: ', displayed);
							if (option === options[59]) {
								option.click();
								clicked = true;
							}
						});
					}
				});
			});
			browser.driver.sleep(2000);
		});
		element(by.id('locationPhone')).sendKeys('9282652728');
		browser.driver.sleep(1000);
		element(by.id('locationSelectLab')).click();
		browser.driver.sleep(1500);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			const random = Math.floor(Math.random() * 4);
			let clicked = false;
			options.forEach(option => {
				option.isPresent().then((present) => {
					if (present === true && clicked === false) {
						option.isDisplayed().then((displayed) => {
							console.log('displayed: ', displayed);
							if (option === options[random]) {
								option.click();
								clicked = true;
							}
						});
					}
				});
			});
			browser.driver.sleep(2000);
		});
	});

	// it('should save the record', () => {
	// 	element(by.id('locationSaveButton')).click();
	// 	browser.driver.sleep(2000);
	// });

});
