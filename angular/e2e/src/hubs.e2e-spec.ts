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

	it('should select hubs', () => {
		element(by.id('menu-hubs')).click();
		browser.driver.sleep(1000);
	});

	// it('should open filter component', () => {
	// 	element(by.id('hubFilterIcon')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should run a search', () => {
	// 	let search = 'CB4';
	// 	element(by.id('filterInput1')).sendKeys(search);
	// 	browser.driver.sleep(3000);
	// 	element(by.id('submitFilter')).click();
	// 	browser.driver.sleep(1500);
	// });


	// // find CB4
	// it('should return data', () => {
	// 	element(by.id('hub-maintenance-table')).$$('tr').then((rows) => {
	// 		let count = 0;
	// 		rows.forEach(row => {
	// 			row.getText().then((text) => {
	// 				console.log('row text', text);
	// 				if ((text.indexOf('CB4') > -1)) {
	// 					elementIndex = count;
	// 					return;
	// 				}
	// 				count += 1;
	// 			});
	// 		});
	// 	});
	// });


	// it('should click on CB4', () => {
	// 	element(by.id('hub-maintenance-table')).$$('tr').get(elementIndex).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should open the drawer', () => {
	// 	element(by.id('hubEditIcon')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should add a user', () => {
	// 	element(by.id('hubAddUser')).click();
	// 	browser.driver.sleep(2000);
	// });


	// it('should search a user', () => {
	// 	element.all(by.className('filter-icon')).then((filterButtons) => {
	// 		filterButtons.forEach(button => {
	// button.isPresent().then((present) => {
	// if (present === true) {
	// 			button.isDisplayed().then((displayed) => {
	// 				if (displayed === true) {
	// 					console.log('clicked the button');
	// 					button.click();
	// 				}
	// 			});
	// }
	// });
	// 		});
	// 		browser.driver.sleep(1000);
	// 	});
	// 	element.all(by.className('userSelectorFilterInput')).then((filterInputs) => {
	// 		filterInputs.forEach(input => {
	// input.isPresent().then((present) => {
	// if (present === true) {
	// 			input.isDisplayed().then((displayed) => {
	// 				if (displayed === true) {
	// 					browser.driver.sleep(500);
	// 					input.sendKeys('josh jancula');
	// 				}
	// 			});
	// }
	// });
	// 		});
	// 		browser.driver.sleep(1000);
	// 	});
	// });

	// it('should select josh', () => {
	// 	element(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should click the save button', () => {
	// 	element.all(by.className('selectorSave')).then((buttons) => {
	// 		buttons.forEach(button => {
	// 			button.isDisplayed().then((displayed) => {
	// 				if (displayed === true) {
	// 					button.click();
	// 				}
	// 			});
	// 		});
	// 		browser.driver.sleep(2000);
	// 	});
	// });


	// it('should click the overlay', () => {
	// 	element(by.className('drawer-overlay show')).click();
	// 	browser.driver.sleep(2000);
	// });

	// it('should click no', () => {
	// 	element(by.className('btn-alert-ok btn-alert-no')).click();
	// 	browser.driver.sleep(3000);
	// });

	it('should begin adding a new record', () => {
		const bs = Key.BACK_SPACE;
		element(by.className('page-button')).click();
		browser.driver.sleep(1500);
		element(by.id('firstField')).sendKeys('LT9');
		browser.driver.sleep(1500);
		element(by.id('hubStreet1')).sendKeys('2998 King st');
		browser.driver.sleep(1000);
		element(by.id('hubCity')).sendKeys('Charlotte');
		browser.driver.sleep(1000);
		element(by.id('hubState')).click();
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
			browser.driver.sleep(2000);
		});
	});

	it('should send more keys and select a county', () => {
		element(by.id('hubZip')).sendKeys('28270');
		browser.driver.sleep(1000);
		element(by.id('hubCounty')).click();
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
			browser.driver.sleep(2000);
		});
		element(by.id('hubPhone')).sendKeys('3837365383');
		browser.driver.sleep(1000);
	});


});
