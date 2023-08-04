import { browser, element, by, Key } from 'protractor';

describe('Priority Test', () => {
	browser.waitForAngularEnabled(false);
	browser.get('/');

	browser.driver.sleep(2000);
	element(by.className('input-username')).sendKeys('tsauser');
	element(by.className('input-password')).sendKeys('Password1!');
	browser.driver.sleep(1000);
	element(by.className('button-sign-in')).click();
	browser.driver.sleep(2000);

	it('should edit first record', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(1000);

		element(by.id('menu-priorities')).isDisplayed().then((displayed) => {
			if (!displayed) {
				element.all(by.className('menu-group-icon')).then((icons) => {
					icons[0].click();
				});
				browser.driver.sleep(1000);
			}
		});

		element(by.id('menu-priorities')).click();
		browser.driver.sleep(1000);
		element(by.className('mat-row')).click();
		browser.driver.sleep(1000);
		element(by.id('editIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('descriptionField')).sendKeys(' (Changed)');
		browser.driver.sleep(1000);
		element(by.id('prioritySelect')).click();
		browser.driver.sleep(1000);
		element(by.id('prioritySelect')).sendKeys(Key.ENTER);
		browser.driver.sleep(1000);
		element(by.id('prioritySaveButton')).click();
		browser.driver.sleep(1000);
	});

	it('should add record and check record count', () => {
		let recordCount = 0;
		const bs = Key.BACK_SPACE;
		element(by.tagName('mat-paginator')).getText().then((text) => {
			recordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
		});
		element(by.id('priorityAddButton')).click();
		browser.driver.sleep(1000);
		element(by.id('firstField')).sendKeys('Low');
		browser.driver.sleep(500);
		element(by.id('descriptionField')).sendKeys(bs, bs, bs, 'Collect when all other tasks are complete');
		browser.driver.sleep(1000);
		element(by.id('prioritySelect')).click();
		browser.driver.sleep(1000);
		element(by.id('prioritySelect')).sendKeys(Key.ENTER);
		browser.driver.sleep(1000);
		element(by.id('colorToggle')).click();
		browser.driver.sleep(1000);
		element(by.id('prioritySaveButton')).click();
		browser.driver.sleep(1000);
		element(by.tagName('mat-paginator')).getText().then((text) => {
			const newRecordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
			expect(newRecordCount).toEqual(recordCount + 1);
		});
	});

	it('should log out', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(1000);
		element(by.id('signOutButton')).click();
		browser.driver.sleep(1000);
	});
});

