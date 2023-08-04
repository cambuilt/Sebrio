import { browser, element, by, Key } from 'protractor';

describe('Client Test', () => {
	let elementFound = false;
	let elementIndex = 0;
	browser.waitForAngularEnabled(false);

	browser.get('/');

	browser.driver.sleep(6000);
	element(by.className('input-username')).sendKeys('joshtsa');
	element(by.className('input-password')).sendKeys('Password1!');
	browser.driver.sleep(1000);
	element(by.className('button-sign-in')).click();
	browser.driver.sleep(3000);

	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should drop relationship panel', () => {
		element(by.id('relationshipPanel')).click();
		browser.driver.sleep(2000);
	});

	it('should select clients', () => {
		element(by.id('menu-clients')).click();
		browser.driver.sleep(1000);
	});

	// find oh
	// it('should return data', () => {
	// 	element(by.id('client-maintenance-table')).$$('tr').then((rows) => {
	// 		let count = 0;
	// 		rows.forEach(row => {
	// 			row.getText().then((text) => {
	// 				console.log('row text', text);
	// 				if ((text.indexOf('OH') > -1)) {
	// 					elementIndex = count;
	// 					return;
	// 				}
	// 				count += 1;
	// 			});
	// 		});
	// 	});
	// });


	// it('should click on OH', () => {
	// 	element(by.id('client-maintenance-table')).$$('tr').get(elementIndex).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should open the drawer', () => {
	// 	element(by.id('clientEditIcon')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should add a lab', () => {
	// 	element(by.id('clientAddLab')).click();
	// 	browser.driver.sleep(2000);
	// });


	// it('should search for KNN', () => {
	// 	element.all(by.className('filter-icon')).then((filterButtons) => {
	// 		filterButtons.forEach(button => {
	// 			button.isDisplayed().then((displayed) => {
	// 				if (displayed === true) {
	// 					console.log('clicked the button');
	// 					button.click();
	// 				}
	// 			});
	// 		});
	// 		browser.driver.sleep(1000);
	// 	});
	// 	element.all(by.className('labSelectorFilterInput')).then((filterInputs) => {
	// 		filterInputs.forEach(input => {
	// 			input.isDisplayed().then((displayed) => {
	// 				if (displayed === true) {
	// 					browser.driver.sleep(500);
	// 					input.sendKeys('KNN');
	// 				}
	// 			});
	// 		});
	// 		browser.driver.sleep(1000);
	// 	});
	// });

	// it('should select KNN', () => {
	// 	element(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).click();
	// 	browser.driver.sleep(500);
	// 	element.all(by.id('labSelectorSaveButton')).then((buttons) => {
	// 		buttons.forEach(button => {
	// 			button.isDisplayed().then((displayed) => {
	// 				if (displayed === true) {
	// 					button.click();
	// 				}
	// 			});
	// 		});
	// 		browser.driver.sleep(3000);
	// 	});
	// });

	// it('should save the record', () => {
	// 	element(by.id('saveClientButton')).click();
	// 	browser.driver.sleep(2000);
	// });

	// it('should open filter component', () => {
	// 	element(by.id('clientFilterIcon')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should run a search', () => {
	// 	let search = 'OH';
	// 	element(by.id('filterInput1')).sendKeys(search);
	// 	browser.driver.sleep(3000);
	// 	element(by.id('submitFilter')).click();
	// 	browser.driver.sleep(1500);
	// });

	// it('should find OH again', () => {
	// 	elementIndex = 0;
	// 	element(by.id('client-maintenance-table')).$$('tr').then((rows) => {
	// 		let count = 0;
	// 		rows.forEach(row => {
	// 			row.getText().then((text) => {
	// 				console.log('row text', text);
	// 				if ((text.indexOf('OH') > -1)) {
	// 					elementIndex = count;
	// 					return;
	// 				}
	// 				count += 1;
	// 			});
	// 		});
	// 	});
	// });

	// it('should click on OH again', () => {
	// 	element(by.id('client-maintenance-table')).$$('tr').get(elementIndex).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should open the drawer', () => {
	// 	element(by.id('clientEditIcon')).click();
	// 	browser.driver.sleep(1000);
	// });

	// // it should remove KNN
	// it('should return data', () => {
	// 	element.all(by.className('labsCard')).$$('.selectorRow').then((rows) => {
	// 		let count = 0;
	// 		rows.forEach(row => {
	// 			row.getText().then((text) => {
	// 				console.log('row text', text);
	// 				if ((text.indexOf('KNN') > -1)) {
	// 					elementIndex = count;
	// 					return;
	// 				}
	// 				count += 1;
	// 			});
	// 		});
	// 	});
	// });

	// it('should remove KNN', () => {
	// 	element.all(by.className('removeAssociate')).then((options) => {
	// 		options.forEach(option => {
	// 			option.isDisplayed().then((displayed) => {
	// 				console.log('displayed: ', displayed);
	// 				if (option === options[elementIndex]) {
	// 					option.click();
	// 				}
	// 			});
	// 		});
	// 		browser.driver.sleep(3000);
	// 	});
	// });

	// it('should save the record again', () => {
	// 	element(by.id('saveClientButton')).click();
	// 	browser.driver.sleep(2000);
	// });

	it('should begin adding a new record', () => {
		const bs = Key.BACK_SPACE;
		element(by.className('page-button')).click();
		browser.driver.sleep(1500);
		element(by.id('firstField')).sendKeys('VSC');
		browser.driver.sleep(1500);
		element(by.id('clientStreet1')).sendKeys('4356 Carson blvd');
		browser.driver.sleep(1000);
		element(by.id('clientCity')).sendKeys('Charlotte');
		browser.driver.sleep(1000);
		element(by.id('clientState')).click();
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
		element(by.id('clientZip')).sendKeys('28270');
		browser.driver.sleep(1000);
		element(by.id('clientCounty')).click();
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
		element(by.id('clientPhone')).sendKeys('9088726652');
		browser.driver.sleep(1000);
		element(by.id('clientFax')).sendKeys('6637383838');
		browser.driver.sleep(1000);
		element(by.id('clientEmail')).sendKeys('vsc@examplified.org');
		browser.driver.sleep(1000);
		element(by.id('clientContact1')).sendKeys('Bill Lumberg');
		browser.driver.sleep(1000);
		element(by.id('clientComments')).sendKeys('Very particular about their TPS reports');
		browser.driver.sleep(1000);
	});

		it('should add a lab', () => {
		element(by.id('clientAddLab')).click();
		browser.driver.sleep(2000);
	});


	it('should search for KNN', () => {
		element.all(by.className('filter-icon')).then((filterButtons) => {
			filterButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						console.log('clicked the button');
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
		element.all(by.className('labSelectorFilterInput')).then((filterInputs) => {
			filterInputs.forEach(input => {
				input.isDisplayed().then((displayed) => {
					if (displayed === true) {
						browser.driver.sleep(500);
						input.sendKeys('KNN');
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});

	it('should select KNN', () => {
		element(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).click();
		browser.driver.sleep(500);
		element.all(by.id('labSelectorSaveButton')).then((buttons) => {
			buttons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						button.click();
					}
				});
			});
			browser.driver.sleep(3000);
		});
	});

	// it('should save the record', () => {
	// 	element(by.id('labSaveButton')).click();
	// 	browser.driver.sleep(2000);
	// });


});
