import { browser, element, by, Key } from 'protractor';

describe('Cancellation Test', () => {
	let newMessage = '';
	let broadcastMessage = '';
	const bs = Key.BACK_SPACE;

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

		element(by.id('menu-cancellations')).isDisplayed().then((displayed) => {
			if (!displayed) {
				element.all(by.className('menu-group-icon')).then((icons) => {
					icons[0].click();
				});
				browser.driver.sleep(1000);
			}
		});

		element(by.id('menu-cancellations')).click();
		browser.driver.sleep(1000);
		element(by.className('mat-row')).click();
		browser.driver.sleep(1000);
		element(by.id('editIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('descriptionField')).sendKeys(' (Changed)');
		browser.driver.sleep(1000);
		element(by.id('cancellationSaveButton')).click();
		browser.driver.sleep(3000);
	});

	it('should add record', () => {
		element(by.id('cancellationAddButton')).click();
		browser.driver.sleep(1000);
		element(by.id('firstField')).sendKeys('MV');
		browser.driver.sleep(500);
		element(by.id('descriptionField')).sendKeys(bs, bs, 'Missing Vein');
		browser.driver.sleep(1000);
		element(by.id('labSelect')).click();
		browser.driver.sleep(1000);
		element(by.id('labSelect')).sendKeys(Key.ENTER);
		browser.driver.sleep(1000);
		element(by.id('cancellationIsActive')).click();
		browser.driver.sleep(1000);
		element(by.id('cancellationSaveAndAddButton')).click();
		browser.driver.sleep(1000);
		element(by.id('cancellationBackArrow')).click();
		browser.driver.sleep(3000);
	});

	it('should log out', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(1000);
		element(by.id('signOutButton')).click();
		browser.driver.sleep(3000);
	});
});

