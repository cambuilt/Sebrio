import { browser, element, by } from 'protractor';

describe('eMLC App', () => {
	let elementIndex = null;
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

	it('should select user-maintenance', () => {
		element(by.id('menu-users')).click();
		browser.driver.sleep(3000);
	});

	it('should open filter component', () => {
		element(by.id('userMainFilterIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should run a search', () => {
		let search = 'Gallucci';
		element(by.id('filterInput4')).sendKeys(search);
		browser.driver.sleep(3000);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1500);
	});


	it('should find Gallucci', () => {
		element(by.id('user-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('Gallucci') > -1)) {
						elementIndex = count;
					}
					count++;
				});
			});
		});
	});

	it('should click on Gallucci', () => {
		element(by.id('user-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('userMainEditIcon')).click();
		browser.driver.sleep(2000);
	});

	// reactivate this once the backend fixes badge ID ///////////////////////
	// it('should update active', () => {
	// 	element(by.id('userMainActiveToggle')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('userMainSaveButton')).click();
	// 	browser.driver.sleep(5000);
	// });

	// deactivate this once the backend fixes badge ID ///////////////////////
	it('should update the badge id', () => {
		let newData = '292828292';
		element(by.id('firstField')).sendKeys(newData);
		browser.driver.sleep(3000);
		element(by.id('userMainSaveButton')).click();
		browser.driver.sleep(1500);
	});

	it('should open configurator', () => {
		element(by.id('userMainConfiguratorIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should click Description checkbox', () => {
		element(by.id('configurator2')).click();
		browser.driver.sleep(1000);
		element(by.id('configurator3')).click();
		browser.driver.sleep(1000);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1000);
	});

	it('should restore configurator settings', () => {
		element(by.id('userMainConfiguratorIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('configurator2')).click();
		browser.driver.sleep(1000);
		element(by.id('configurator3')).click();
		browser.driver.sleep(1000);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1000);
	});

});
