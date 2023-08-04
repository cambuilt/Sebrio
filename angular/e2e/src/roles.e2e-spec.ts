import { browser, element, by } from 'protractor';

describe('eMLC App', () => {
	let elementFound = false;
	let elementIndex = null;
	let elementBox = '';
	let wasUpdated = false;
	browser.waitForAngularEnabled(false);

	browser.get('/');

	browser.driver.sleep(3000);
	element(by.className('input-username')).sendKeys('joshtsa');
	element(by.className('input-password')).sendKeys('Password1!');
	browser.driver.sleep(1000);
	element(by.className('button-sign-in')).click();
	browser.driver.sleep(4000);

	it('should return data', () => {
		element(by.id('role-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('MR1') > -1)) {
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

	it('should find role MR1', () => {
		browser.driver.sleep(1000);
		expect(elementFound).toEqual(true);
	});

	it('should click on MR1', () => {
		element(by.id('role-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('roleEditIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should update active', () => {
		element(by.id('roleActiveToggle')).click();
		browser.driver.sleep(1000);
		element(by.id('roleSaveButton')).click();
		browser.driver.sleep(5000);
	});

	it('should open filter component', () => {
		element(by.id('roleFilterIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should run a search', () => {
		let search = 'MR1';
		element(by.id('filterInput1')).sendKeys(search);
		browser.driver.sleep(3000);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1500);
	});

	it('should find MR1 again', () => {
		element(by.id('role-maintenance-table')).$$('tr').then((rows) => {
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('MR1') > -1)) {
						if ((text.indexOf('check_box_outline_blank') > -1)) {
							if (elementBox === 'check_box_outline_blank') {
								wasUpdated = false;
							} else { wasUpdated = true; }
						} else {
							if (elementBox === 'check_box') {
								wasUpdated = false;
							} else { wasUpdated = true; }
						}
					}
				});
			});
		});
	});

	it('should return wasUpdated as true', () => {
		expect(wasUpdated).toEqual(true);
		browser.driver.sleep(1500);
	});

	it('should clear filter', () => {
		element(by.id('roleFilterIcon2')).click();
		browser.driver.sleep(1000);
		element(by.id('clearFilterButton')).click();
		browser.driver.sleep(1000);
		element(by.className('drawer-overlay show')).click();
		browser.driver.sleep(1000);
	});


	it('should open configurator', () => {
		element(by.id('roleConfiguratorIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should click Description checkbox', () => {
		element(by.id('configurator2')).click();
		browser.driver.sleep(1000);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1000);
	});

	it('should restore configurator settings', () => {
		element(by.id('roleConfiguratorIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('configurator2')).click();
		browser.driver.sleep(1000);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1000);
	});

});
