import { browser, element, by } from 'protractor';

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

	it('should select providers', () => {
		element(by.id('menu-providers')).click();
		browser.driver.sleep(1000);
	});

	// it('should open filter component', () => {
	// 	element(by.id('providerFilterIcon')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should run a search', () => {
	// 	let search = 'QCP';
	// 	element(by.id('filterInput1')).sendKeys(search);
	// 	browser.driver.sleep(3000);
	// 	element(by.id('submitFilter')).click();
	// 	browser.driver.sleep(1500);
	// });

	// it('should find QCP again', () => {
	// 	elementIndex = 0;
	// 	element(by.id('provider-maintenance-table')).$$('tr').then((rows) => {
	// 		let count = 0;
	// 		rows.forEach(row => {
	// 			row.getText().then((text) => {
	// 				console.log('row text', text);
	// 				if ((text.indexOf('QCP') > -1)) {
	// 					elementIndex = count;
	// 					return;
	// 				}
	// 				count += 1;
	// 			});
	// 		});
	// 	});
	// });

	// it('should click on QCP', () => {
	// 	element(by.id('provider-maintenance-table')).$$('tr').get(elementIndex).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should open the drawer', () => {
	// 	element(by.id('providerEditIcon')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should add a lab', () => {
	// 	element(by.id('providerAddLab')).click();
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
	// 	element(by.id('saveProviderButton')).click();
	// 	browser.driver.sleep(2000);
	// });

	// it('should click on QCP', () => {
	// 	element(by.id('provider-maintenance-table')).$$('tr').get(elementIndex).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should open the drawer', () => {
	// 	element(by.id('providerEditIcon')).click();
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
	// 	element(by.id('saveProviderButton')).click();
	// 	browser.driver.sleep(2000);
	// });

	it('should add a new record', () => {
		element(by.className('page-button')).click();
		browser.driver.sleep(1500);
		element(by.id('firstField')).sendKeys('FQP');
		browser.driver.sleep(1500);
		element(by.id('descriptionField')).sendKeys('Fine Quality Providers');
		browser.driver.sleep(1500);
		element(by.id('providerTitleSelect')).click();
		browser.driver.sleep(1000);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			const random = Math.floor(Math.random() * 10);
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
		element(by.id('providerFirstName')).sendKeys('Thomas');
		browser.driver.sleep(1000);
		element(by.id('providerMiddleName')).sendKeys('E');
		browser.driver.sleep(1000);
		element(by.id('providerLastName')).sendKeys('Flarity');
		browser.driver.sleep(1000);
		element(by.id('providerSuffix')).sendKeys('Dr');
		browser.driver.sleep(1000);
		element(by.id('providerType')).sendKeys('Expert');
		browser.driver.sleep(1000);
		element(by.id('providerSpecialty')).click();
		browser.driver.sleep(1500);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			const random = Math.floor(Math.random() * 10);
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
		element(by.id('providerLicense')).sendKeys('29282892');
		browser.driver.sleep(1000);
		element(by.id('providerUPIN')).sendKeys('H2020888');
		browser.driver.sleep(1000);
		element(by.id('providerNPI')).sendKeys('182999');
		browser.driver.sleep(1000);
		element(by.id('providerStreet1')).sendKeys('123 Maple st');
		browser.driver.sleep(1000);
		element(by.id('providerCity')).sendKeys('Charlotte');
		browser.driver.sleep(1000);
		element(by.id('providerState')).click();
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
								clicked = true;
							}
						});
					}
				});
			});
			browser.driver.sleep(2000);
		});
		element(by.id('providerZip')).sendKeys('28270');
		browser.driver.sleep(1000);
		element(by.id('providerCounty')).click();
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
		element(by.id('providerPhone1')).sendKeys('5555555555');
		browser.driver.sleep(1000);
		element(by.id('providerPhone2')).sendKeys('1234567890');
		browser.driver.sleep(1000);
		element(by.id('providerCellPhone')).sendKeys('0987654321');
		browser.driver.sleep(1000);
		element(by.id('providerFax')).sendKeys('82872829201');
		browser.driver.sleep(1000);
		element(by.id('providerEmail')).sendKeys('fqproviders@examplified.org');
		browser.driver.sleep(1000);
		element(by.id('providerSystemID')).sendKeys('99272888');
		browser.driver.sleep(1000);
		element(by.id('providerAddLab')).click();
		browser.driver.sleep(2000);
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

	it('should save the record', () => {
		element(by.id('saveProviderButton')).click();
		browser.driver.sleep(2000);
	});


});
