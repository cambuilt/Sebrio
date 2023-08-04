import { browser, element, by, Key } from 'protractor';

describe('Hub Add Test', () => {
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

		element(by.id('menu-hubs')).isDisplayed().then((displayed) => {
			if (!displayed) {
				element.all(by.className('menu-group-icon')).then((icons) => {
					console.log('icon count is', icons.length);
					element(by.id('menu-cancellations')).isDisplayed().then((listMenuDisplayed) => {
						if (listMenuDisplayed) {
							icons[0].click();
							browser.driver.sleep(1000);
						}
					});
					icons[1].click();
				});
				browser.driver.sleep(1000);
			}
		});
		element(by.id('menu-hubs')).click();
		browser.driver.sleep(1000);
	});

	it('should select hub-maintenance, select first hub and edit', () => {
		element(by.className('mat-row')).click();
		browser.driver.sleep(1000);
		element(by.id('hubEditIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('descriptionField')).sendKeys(bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, 'Collection Bank 4');
		browser.driver.sleep(1000);
		element(by.id('hubSaveButton')).click();
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
		element(by.id('hubAddButton')).click();
		browser.driver.sleep(1000);
		element(by.id('firstField')).sendKeys('PCN');
		browser.driver.sleep(500);
		element(by.id('descriptionField')).sendKeys(bs, bs, bs, 'Paracare Network');
		browser.driver.sleep(500);
		element(by.id('streetAddress1Field')).sendKeys('455 St Michaels Dr');
		browser.driver.sleep(500);
		element(by.id('streetAddress2Field')).sendKeys('Suite 301');
		browser.driver.sleep(500);
		element(by.id('cityField')).sendKeys('Sante Fe');
		browser.driver.sleep(500);
		element(by.id('stateSelect')).click();
		browser.driver.sleep(1000);
		element(by.id('stateSelect')).sendKeys('N');
		browser.driver.sleep(500);
		element(by.id('stateSelect')).sendKeys(Key.DOWN, Key.DOWN, Key.DOWN, Key.DOWN, Key.DOWN, Key.DOWN, Key.ENTER);
		browser.driver.sleep(2000);
		element(by.id('postalCodeField')).sendKeys('87505');
		browser.driver.sleep(500);
		element(by.id('countySelect')).click();
		browser.driver.sleep(1000);
		element(by.id('countySelect')).sendKeys('S');
		browser.driver.sleep(500);
		element(by.id('countySelect')).sendKeys(Key.DOWN, Key.DOWN, Key.DOWN, Key.ENTER);
		browser.driver.sleep(2000);
		element(by.id('phoneField')).sendKeys('5059833362');
		browser.driver.sleep(1000);
		element(by.id('hubAddUser')).click();
		browser.driver.sleep(1000);
		element.all(by.id('userSelectorCard')).$$('.selectorCheckbox').then((userCheckboxes) => {
			userCheckboxes[1].click();
			userCheckboxes[2].click();
			userCheckboxes[3].click();
			userCheckboxes[5].click();
			browser.driver.sleep(1000);
		});
		element.all(by.id('userSelectorSaveButton')).then((userSelectorSaveButtons) => {
			userSelectorSaveButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
		element(by.id('hubSaveButton')).click();
		browser.driver.sleep(2000);

		element(by.tagName('mat-paginator')).getText().then((text) => {
			const newRecordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
			expect(newRecordCount).toEqual(recordCount + 1);
		});
	});


	it('should log out', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(2000);
		element(by.id('signOutButton')).click();
		browser.driver.sleep(2000);
	});
});
