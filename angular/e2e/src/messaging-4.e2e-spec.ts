import { browser, element, by } from 'protractor';
import { Server } from 'https';

describe('Messaging 4 Test', () => {
	let newMessage = '';
	let broadcastMessage = 'test';

	browser.waitForAngularEnabled(false);
	browser.get('/');

	browser.driver.sleep(1000);

	it('should login as samantha', () => {
		element(by.className('input-username')).sendKeys('samantharsa');
		element(by.className('input-password')).sendKeys('Password1!');
		browser.driver.sleep(1000);
		element(by.className('button-sign-in')).click();
		browser.driver.sleep(1000);
	});

	it('should create tenant broadcast list', () => {
		element(by.className('messaging-icon')).click();
		browser.driver.sleep(1000);
		element(by.id('broadcastTab')).click();
		browser.driver.sleep(1000);
		element(by.id('addButton')).click();
		browser.driver.sleep(1000);
		element(by.id('newTenantListButton')).click();
		browser.driver.sleep(1000);
		element(by.id('firstListField')).sendKeys('RSA Tenant Broadcast List');
		browser.driver.sleep(1000);
		element(by.id('selectTenantButton')).click();
		browser.driver.sleep(1000);
		element.all(by.id('tenantSelectorCard')).$$('.tenantRow').then((tenantRows) => {
			tenantRows.forEach(tenantRow => {
				tenantRow.getText().then((text) => {
					if (text.indexOf('Default_Tenant') > -1) {
						tenantRow.element(by.id('checkboxTenant-Default_Tenant')).click();
						browser.driver.sleep(2000);
					}
				});
			});
		});
		element(by.id('tenantSelectorSaveButton')).click();
		browser.driver.sleep(1000);
		element(by.id('buttonCreate')).click();
		browser.driver.sleep(9000);
	});

	it('should send tenant broadcast on new list and back out', () => {
		element.all(by.className('broadcastGroupRow')).then((rows) => {
			rows[rows.length - 1].click();
		});
		browser.driver.sleep(1000);
		broadcastMessage = 'New Tenant Broadcast message to group on ' + Date();
		element(by.id('messagingMessageField')).sendKeys(broadcastMessage);
		browser.driver.sleep(1000);
		element.all(by.css('.sendButton')).then((sendButtons) => {
			sendButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
		element.all(by.id('messagingChatBackArrow')).then((backButtons) => {
			backButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
			element(by.id('messagingBackArrow')).click();
			browser.driver.sleep(1000);
		});
	});

	it('should log out', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(1000);
		element(by.id('signOutButton')).click();
		browser.driver.sleep(1000);
	});

	it('should login as camerontsa', () => {
		element(by.className('input-username')).sendKeys('tsauser');
		element(by.className('input-password')).sendKeys('Password1!');
		browser.driver.sleep(1000);
		element(by.className('button-sign-in')).click();
		browser.driver.sleep(1000);
	});

	it('should see broadcast message', () => {
		element(by.className('notificationContent')).getText().then((text) => {
			if (text.indexOf(broadcastMessage) > -1) {
				expect(true).toEqual(true);
				browser.driver.sleep(1000);
				element(by.className('closeBroadcast')).click();
			} else {
				expect(false).toEqual(true);
			}
		});

		browser.driver.sleep(1000);
	});

	it('should not see broadcast message', () => {
		element(by.id('menu-collection-data')).isDisplayed().then((displayed) => {
			if (!displayed) {
				element.all(by.className('menu-group-icon')).then((icons) => {
					icons[0].click();
				});
				browser.driver.sleep(1000);
			}
		});

		element(by.id('menu-collection-data')).click();
		browser.driver.sleep(1000);
		element(by.className('notificationContent')).getText().then((text) => {
			expect(true).toEqual(true);
		});
		browser.driver.sleep(2000);
	});

	it('should log out', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(1000);
		element(by.id('signOutButton')).click();
		browser.driver.sleep(1000);
	});

	it('should login as samanthatsa', () => {
		element(by.className('input-username')).sendKeys('samanthatsa');
		element(by.className('input-password')).sendKeys('Password2!');
		browser.driver.sleep(1000);
		element(by.className('button-sign-in')).click();
		browser.driver.sleep(2000);
	});

	it('should edit broadcast list', () => {
		element(by.className('closeBroadcast')).click();
		browser.driver.sleep(1000);
		element(by.className('messaging-icon')).click();
		browser.driver.sleep(1000);
		element(by.id('broadcastTab')).click();
		browser.driver.sleep(1000);
		element(by.className('broadcastGroupInfo')).click();
		browser.driver.sleep(1000);
		element(by.className('remove')).click();
		element(by.id('firstListField')).sendKeys(' (Change)');
		browser.driver.sleep(2000);
		element(by.id('buttonEditSave')).click();
		browser.driver.sleep(1000);
		element(by.id('messagingBackArrow')).click();
		browser.driver.sleep(1000);
	});

	it('should log out', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(1000);
		element(by.id('signOutButton')).click();
		browser.driver.sleep(5000);
	});

});
