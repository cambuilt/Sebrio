import { browser, element, by } from 'protractor';

describe('eMLC App', () => {
	let userOnline = false;
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

	it('should select user-mode', () => {
		element(by.id('menu-user-mode')).click();
		browser.driver.sleep(3000);
	});

	it('should open filter component', () => {
		element(by.id('userModeFilterIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should run a search', () => {
		element(by.id('filterInput3')).click();
		browser.driver.sleep(200);
		element(by.className('mat-option ng-star-inserted mat-active')).click();
		browser.driver.sleep(200);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1500);
	});

	it('should find Josh Jancula', () => {
		element(by.id('user-mode-table')).$$('tr').then((rows) => {
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('Jancula') > -1) && (text.indexOf('Online') > -1)) {
						userOnline = true;
					}
				});
			});
		});
	});

	it('should return userOnline as true', () => {
		expect(userOnline).toEqual(true);
	});

	it('should clear filter', () => {
		element(by.id('userModeFilterIcon2')).click();
		browser.driver.sleep(1000);
		element(by.id('clearFilterButton')).click();
		browser.driver.sleep(1000);
		element(by.className('drawer-overlay show')).click();
		browser.driver.sleep(1000);
	});


	it('should open configurator', () => {
		element(by.id('userModeConfiguratorIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should click Description checkbox', () => {
		element(by.id('configurator2')).click();
		browser.driver.sleep(1000);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1000);
	});

	it('should restore configurator settings', () => {
		element(by.id('userModeConfiguratorIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('configurator2')).click();
		browser.driver.sleep(1000);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1000);
	});

});
