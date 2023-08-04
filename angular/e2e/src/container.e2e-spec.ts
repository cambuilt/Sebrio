import { browser, element, by, Key } from 'protractor';

describe('Container Test', () => {
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

		element(by.id('menu-containers')).isDisplayed().then((displayed) => {
			if (!displayed) {
				element.all(by.className('menu-group-icon')).then((icons) => {
					icons[0].click();
				});
				browser.driver.sleep(1000);
			}
		});

		element(by.id('menu-containers')).click();
		browser.driver.sleep(1000);
		element(by.className('mat-row')).click();
		browser.driver.sleep(1000);
		element(by.id('editIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('descriptionField')).sendKeys(' (Changed)');
		browser.driver.sleep(1000);
		element(by.id('containerSaveButton')).click();
		browser.driver.sleep(1000);
	});

	let recordCount = 0;

	it('should add record and check record count', () => {
		element(by.tagName('mat-paginator')).getText().then((text) => {
			recordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
		});
		browser.driver.sleep(3000);
	});

	it('should add record', () => {
		element(by.id('containerAddButton')).click();
		browser.driver.sleep(1000);
		element(by.id('firstField')).sendKeys('PT');
		browser.driver.sleep(500);
		element(by.id('nameField')).sendKeys('PT');
		browser.driver.sleep(500);
		element(by.id('colorPickerIcon')).click();
		browser.driver.sleep(500);
		const bs = Key.BACK_SPACE;
		element(by.id('colorCode')).sendKeys(bs, bs, bs, bs, bs, bs, '942192');
		browser.driver.sleep(2000);
		element(by.id('colorConfirmButton')).click();
		element(by.id('descriptionField')).sendKeys(bs, bs, 'Purple tube');
		browser.driver.sleep(500);
		element(by.id('containerVolume')).sendKeys('20ml');
		browser.driver.sleep(500);
		element(by.id('containerType')).sendKeys('Aluminum');
		browser.driver.sleep(1000);
		element(by.id('containerRank')).click();
		browser.driver.sleep(1000);
		element(by.id('containerRank')).sendKeys(Key.ENTER);
		browser.driver.sleep(1000);
		element(by.id('specimenCode')).sendKeys('|BB|');
		browser.driver.sleep(500);
		element(by.id('drawOrder')).sendKeys('3');
		browser.driver.sleep(500);
		element(by.id('storageCode')).sendKeys('12b');
		browser.driver.sleep(2000);
		element(by.id('containerSaveButton')).click();
		browser.driver.sleep(2000);

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

