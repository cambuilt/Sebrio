import { browser, element, by, Key } from 'protractor';

describe('User Add Test', () => {
	let elementIndex = null;
	const bs = Key.BACK_SPACE;
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
		browser.driver.sleep(1000);

		element(by.id('menu-users')).isDisplayed().then((displayed) => {
			if (!displayed) {
				element.all(by.className('menu-group-icon')).then((icons) => {
					console.log('icon count is', icons.length);
					element(by.id('menu-cancellations')).isDisplayed().then((listMenuDisplayed) => {
						if (listMenuDisplayed) {
							icons[0].click();
							browser.driver.sleep(1000);
						}
					});
					icons[3].click();
				});
				browser.driver.sleep(1000);
			}
		});
		element(by.id('menu-users')).click();
		browser.driver.sleep(1000);
	});

	it('should select user-maintenance, select first user and edit', () => {
		element(by.className('mat-row')).click();
		browser.driver.sleep(1000);
		element(by.id('userMainEditIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('phoneField')).sendKeys(bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, '4534531234');
		browser.driver.sleep(1000);
		element(by.id('firstField')).sendKeys(bs, bs, bs, bs, 'B910');
		browser.driver.sleep(500);
		element(by.id('techCodeField')).sendKeys(bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, 'TC322');
		browser.driver.sleep(500);
		element(by.id('userMainSaveButton')).click();
		browser.driver.sleep(3000);
	});

	let recordCount = 0;

	it('should add record and check record count', () => {
		element(by.tagName('mat-paginator')).getText().then((text) => {
			recordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
		});
		browser.driver.sleep(1000);
	});

	it('should add record', () => {
		element(by.id('userAddButton')).click();
		browser.driver.sleep(1000);
		element(by.id('firstField')).sendKeys('B438');
		browser.driver.sleep(500);
		element(by.id('techCodeField')).sendKeys('TC610');
		browser.driver.sleep(500);
		element(by.id('firstNameField')).sendKeys('Roger');
		browser.driver.sleep(500);
		element(by.id('lastNameField')).sendKeys('Ferguson');
		browser.driver.sleep(500);
		element(by.id('phoneField')).sendKeys('2015384219');
		browser.driver.sleep(500);
		element(by.id('emailField')).sendKeys('cameron.conway@sebrio.com');
		browser.driver.sleep(500);
		element(by.id('usernameField')).sendKeys('cconway');
		browser.driver.sleep(500);
		element(by.id('roleSelect')).click();
		browser.driver.sleep(1000);
		element(by.id('roleSelect')).sendKeys(Key.ENTER);
		browser.driver.sleep(2000);
		element(by.id('userMainSaveButton')).click();
		browser.driver.sleep(2000);

		element(by.tagName('mat-paginator')).getText().then((text) => {
			const newRecordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
			expect(newRecordCount).toEqual(recordCount + 1);
		});
	});


});
