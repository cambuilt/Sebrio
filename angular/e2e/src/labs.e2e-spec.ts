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

	it('should select labs', () => {
		element(by.id('menu-labs')).click();
		browser.driver.sleep(1000);
	});

	// it('should open filter component', () => {
	// 	element(by.id('labFilterIcon')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should run a search', () => {
	// 	let search = 'XP4';
	// 	element(by.id('filterInput1')).sendKeys(search);
	// 	browser.driver.sleep(3000);
	// 	element(by.id('submitFilter')).click();
	// 	browser.driver.sleep(1500);
	// });


	// // find XP4
	// it('should return data', () => {
	// 	element(by.id('lab-maintenance-table')).$$('tr').then((rows) => {
	// 		let count = 0;
	// 		rows.forEach(row => {
	// 			row.getText().then((text) => {
	// 				console.log('row text', text);
	// 				if ((text.indexOf('XP4') > -1)) {
	// 					elementIndex = count;
	// 					return;
	// 				}
	// 				count += 1;
	// 			});
	// 		});
	// 	});
	// });


	// it('should click on XP4', () => {
	// 	element(by.id('lab-maintenance-table')).$$('tr').get(elementIndex).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should open the drawer', () => {
	// 	element(by.id('labEditIcon')).click();
	// 	browser.driver.sleep(2000);
	// });

	// it('should deactivate the lab', () => {
	// 	element(by.id('labActiveToggle')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should click the overlay', () => {
	// 	element(by.className('drawer-overlay show')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should click no', () => {
	// 	element(by.className('btn-alert-ok btn-alert-no')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should click configurator icon', () => {
	// 	element(by.id('labConfiguratorIcon')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should remove columns', () => {
	// 	element(by.id('configurator1')).click();
	// 	browser.driver.sleep(500);
	// 	element(by.id('configurator2')).click();
	// 	browser.driver.sleep(500);
	// 	element(by.id('configurator3')).click();
	// 	browser.driver.sleep(500);
	// 	element(by.id('configuratorSaveButton')).click();
	// 	browser.driver.sleep(2000);
	// });

	// it('should restore configurator settings', () => {
	// 	element(by.id('labConfiguratorIcon')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('configurator1')).click();
	// 	browser.driver.sleep(500);
	// 	element(by.id('configurator2')).click();
	// 	browser.driver.sleep(500);
	// 	element(by.id('configurator3')).click();
	// 	browser.driver.sleep(500);
	// 	element(by.id('configuratorSaveButton')).click();
	// 	browser.driver.sleep(1500);
	// });

	it('should begin adding a new record', () => {
		const bs = Key.BACK_SPACE;
		element(by.className('page-button')).click();
		browser.driver.sleep(1500);
		element(by.id('firstField')).sendKeys('PL');
		browser.driver.sleep(1500);
		element(by.id('descriptionField')).sendKeys(bs, bs, 'Pristine Labs');
		browser.driver.sleep(1500);
		element(by.id('labStreet1')).sendKeys('543 East blvd');
		browser.driver.sleep(1000);
		element(by.id('labCity')).sendKeys('Charlotte');
		browser.driver.sleep(1000);
		element(by.id('labState')).click();
		browser.driver.sleep(1500);
	});

	it('should select a state', () => {
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			let clicked = false;
			options.forEach(option => {
				option.isPresent().then((present) => {
					if (present === true && clicked === false) {
						option.isDisplayed().then((displayed) => {
							console.log('displayed: ', displayed);
							if (displayed === true) {
								if (option === options[27]) {
									console.log('about to click on state');
									option.click();
									clicked = true;
									console.log('clicked on state');
								}
							}
						});
					}
				});
			});
			browser.driver.sleep(3000);
		});
	});

	it('should send more keys and select a county', () => {
		element(by.id('labZip')).sendKeys('28270');
		browser.driver.sleep(1000);
		element(by.id('labCounty')).click();
		browser.driver.sleep(2000);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			let clicked = false;
			options.forEach(option => {
				option.isPresent().then((present) => {
					if (present === true && clicked === false) {
						option.isDisplayed().then((displayed) => {
							console.log('displayed: ', displayed);
							if (displayed === true) {
								if (option === options[59]) {
									console.log('about to click on county');
									option.click();
									clicked = true;
									console.log('clicked on county');
								}
							}
						});
					}
				});
			});
			browser.driver.sleep(3000);
		});
	});

	it('should complete the form', () => {
		element(by.id('labPhone')).sendKeys('3837365383');
		browser.driver.sleep(1000);
		element(by.id('labEmail')).sendKeys('pristinelabs@examplified.org');
		browser.driver.sleep(1000);
		element(by.id('labSelectIdentifiers')).click();
		browser.driver.sleep(1000);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			options.forEach(option => {
				let clicked = false;
				const random = Math.floor(Math.random() * 4);
				option.isPresent().then((present) => {
					if (present === true && clicked === false) {
						option.isDisplayed().then((displayed) => {
							console.log('displayed: ', displayed);
							if (displayed === true) {
								if (option === options[random]) {
									option.click();
									clicked = true;
								}
							}
						});
					}
				});
			});
			browser.driver.sleep(4000);
		});
	});

	// it('should save the record', () => {
	// 	element(by.id('labSaveButton')).click();
	// 	browser.driver.sleep(2000);
	// });


});
