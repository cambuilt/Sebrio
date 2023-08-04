import { browser, element, by } from 'protractor';

describe('Messaging 5 Test', () => {
	let newMessage = '';
	let broadcastMessage = '';

	browser.waitForAngularEnabled(false);
	browser.get('/');

	browser.driver.sleep(2000);
	element(by.className('input-username')).sendKeys('tsauser');
	element(by.className('input-password')).sendKeys('Password1!');
	browser.driver.sleep(1000);
	element(by.className('button-sign-in')).click();
	browser.driver.sleep(2000);

	it('should open messaging', () => {
		element(by.className('messaging-icon')).click();
		browser.driver.sleep(2000);
	});

	it('should select last inbox', () => {
		element(by.className('inboxCard')).$$('.inbox-span').then((rows) => {
			rows.forEach(row => {
				row.getText().then((text) => {
					if (text.indexOf('Samantha') > -1) {
						row.click();
						browser.driver.sleep(4000);
					}
				});
			});
		});
	});

	it('should send a message', () => {
		newMessage = 'Message for notify message sent on ' + Date();
		element(by.id('messagingMessageField')).sendKeys(newMessage);
		browser.driver.sleep(3000);
		element(by.id('sendButton')).click();
		browser.driver.sleep(3000);
		element(by.id('messagingChatBackArrow')).click();
		browser.driver.sleep(2000);
		element(by.id('messagingBackArrow')).click();
		browser.driver.sleep(1000);
	});

	it('should log out', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(2000);
		element(by.id('signOutButton')).click();
		browser.driver.sleep(2000);
	});

	it('should login as samantha', () => {
		element(by.className('input-username')).sendKeys('samanthatsa');
		element(by.className('input-password')).sendKeys('Password1!');
		browser.driver.sleep(6000);
		element(by.className('button-sign-in')).click();
		browser.driver.sleep(2000);
	});

	it('should open notify', () => {
		element(by.className('notifications-icon')).click();
		browser.driver.sleep(2000);
		element(by.className('notification-subtext')).click();
		browser.driver.sleep(2000);
		element(by.className('message')).click();
		browser.driver.sleep(4000);
		element(by.id('messagingChatBackArrow')).click();
		browser.driver.sleep(2000);
	});

	it('should log out', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(1000);
		element(by.id('signOutButton')).click();
		browser.driver.sleep(5000);
	});
});

