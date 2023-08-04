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
	browser.driver.sleep(2000);

	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should navigate to devices', () => {
		element(by.id('menu-devices')).click();
		browser.driver.sleep(3000);
	});

	it('should return data', () => {
		element(by.id('device-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('XCE') > -1)) {
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


	it('should click on XCE', () => {
		element(by.id('device-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('deviceEditIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should update active', () => {
		element(by.id('deviceActiveToggle')).click();
		browser.driver.sleep(1000);
		element(by.id('saveDeviceButton')).click();
		browser.driver.sleep(3000);
	});

	it('should open filter component', () => {
		element(by.id('deviceFilterIcon')).click();
		browser.driver.sleep(1500);
	});

	it('should run a search', () => {
		let search = 'XCE';
		element(by.id('filterInput1')).sendKeys(search);
		browser.driver.sleep(3000);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(3000);
	});

	it('should find XCE again', () => {
		element(by.id('device-maintenance-table')).$$('tr').then((rows) => {
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('XCE') > -1)) {
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
	});

	it('should clear filter', () => {
		element(by.id('deviceFilterIcon2')).click();
		browser.driver.sleep(1500);
		element(by.id('clearFilterButton')).click();
		browser.driver.sleep(1000);
		element(by.className('drawer-overlay show')).click();
		browser.driver.sleep(1000);
	});

	it('should open configurator', () => {
		element(by.id('deviceConfiguratorIcon')).click();
		browser.driver.sleep(1500);
	});

	it('should click Description checkbox', () => {
		element(by.id('configurator2')).click();
		browser.driver.sleep(1500);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1500);
	});

	it('should restore configurator settings', () => {
		element(by.id('deviceConfiguratorIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('configurator2')).click();
		browser.driver.sleep(1000);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1000);
	});

});
