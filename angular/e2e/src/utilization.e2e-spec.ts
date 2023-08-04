import { browser, element, by } from 'protractor';

describe('eMLC App', () => {
	let userFound = false;
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

	it('should drop reporting panel', () => {
		element(by.id('reportingPanel')).click();
		browser.driver.sleep(2000);
	});

	it('should select utilization', () => {
		element(by.id('menu-utilization')).click();
		browser.driver.sleep(1000);
	});

	it('should open search component', () => {
		element(by.className('page-button')).click();
		browser.driver.sleep(1000);
	});

	it('should open search component', () => {
		element(by.className('datePeriodField')).click();
		browser.driver.sleep(200);
		element(by.className('mat-option ng-star-inserted mat-active')).click();
		browser.driver.sleep(500);
	});

	it('should open user-selector component', () => {
		element(by.id('filterUserSelectorButton')).click();
		browser.driver.sleep(1000);
	});

	it('should search a user', () => {
		element.all(by.className('filter-input')).then((filterButtons) => {
			filterButtons.forEach(button => {
				button.isPresent().then((present) => {
					if (present === true) {
						button.isDisplayed().then((displayed) => {
							if (displayed === true) {
								console.log('clicked the button');
								button.click();
							}
						});
					}
				});
			});
			browser.driver.sleep(1000);
		});
		element.all(by.className('userSelectorFilterInput')).then((filterInputs) => {
			filterInputs.forEach(input => {
				input.isPresent().then((present) => {
					if (present === true) {
						input.isDisplayed().then((displayed) => {
							if (displayed === true) {
								browser.driver.sleep(500);
								input.sendKeys('josh jancula');
							}
						});
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});

	it('should select josh', () => {
		element(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).click();
		browser.driver.sleep(500);
		element.all(by.className('selectorSave')).then((buttons) => {
			buttons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						console.log('clicked the save button');
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});

	it('should perform a search', () => {
		element(by.id('submitFilter')).click();
		browser.driver.sleep(5000);
	});

	it('should find Josh Jancula', () => {
		element(by.id('utilization-table')).$$('tr').then((rows) => {
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('Jancula') > -1)) {
						userFound = true;
					}
				});
			});
		});
	});

	it('should return userFound as true', () => {
		expect(userFound).toEqual(true);
	});

});
