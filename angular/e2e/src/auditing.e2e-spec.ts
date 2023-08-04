import { browser, element, by } from 'protractor';

describe('Auditing Test', () => {
	let userFound = false;
	browser.waitForAngularEnabled(false);

	browser.get('/');

	browser.driver.sleep(3000);
	element(by.className('input-username')).sendKeys('joshtsa');
	element(by.className('input-password')).sendKeys('Password1!');
	browser.driver.sleep(1000);
	element(by.className('button-sign-in')).click();
	browser.driver.sleep(4000);

	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should drop reporting panel', () => {
		element(by.id('reportingPanel')).click();
		browser.driver.sleep(2000);
	});

	it('should select auditing', () => {
		element(by.id('menu-auditing')).click();
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

	it('should attempt a search', () => {
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1000);
	});

	it('should set an action', () => {
		element(by.id('filterInput2')).click();
		browser.driver.sleep(500);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					if (option === options[options.length - 1]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});

	it('should perform a search', () => {
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1000);
	});

	it('should open user-selector component', () => {
		element(by.id('filterUserSelectorButton')).click();
		browser.driver.sleep(1000);
	});

	it('should search a user', () => {
		element.all(by.className('filter-icon')).then((filterButtons) => {
			filterButtons.forEach(button => {
				button.isPresent().then((present) => {
					if (present === true) {
						button.isDisplayed().then((displayed) => {
							if (displayed === true) {
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
				input.isDisplayed().then((displayed) => {
					if (displayed === true) {
						browser.driver.sleep(500);
						input.sendKeys('josh jancula');
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
				button.isPresent().then((present) => {
					if (present === true) {
						button.isDisplayed().then((displayed) => {
							if (displayed === true) {
								button.click();
							}
						});
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


});
