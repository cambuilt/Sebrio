import { browser, element, by } from 'protractor';

describe('Messaging 1 Test', () => {
	let newMessage = '';

	browser.waitForAngularEnabled(false);
	// beforeEach(() => {
	// });

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
			rows[rows.length - 1].click();
			browser.driver.sleep(4000);
		});
	});

	it('should send a message', () => {
		newMessage = 'New message sent on ' + Date();
		element(by.id('messagingMessageField')).sendKeys(newMessage);
		browser.driver.sleep(3000);
		element(by.id('sendButton')).click();
		browser.driver.sleep(3000);
		element(by.id('messagingChatBackArrow')).click();
		browser.driver.sleep(2000);
	});

	it('should have samantha first in list', () => {
		element(by.className('inboxCard')).$$('.inbox-span').then((rows) => {
			rows[0].getText().then((text) => {
				console.log('newMessage is', newMessage, ', text is', text);
				expect(text.indexOf(newMessage)).toBeGreaterThan(-1);
			});
			element(by.id('messagingBackArrow')).click();
			browser.driver.sleep(1000);
		});
	});

	it('should log out', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(2000);
		element(by.id('signOutButton')).click();
		browser.driver.sleep(2000);
	});

	it('should login as samantha', () => {
		element(by.className('input-username')).sendKeys('samanthatsa');
		element(by.className('input-password')).sendKeys('Password2!');
		browser.driver.sleep(1000);
		element(by.className('button-sign-in')).click();
		browser.driver.sleep(2000);
	});

	it('should open messaging and check top inbox and count of 3', () => {
		element(by.className('messaging-icon')).click();
		browser.driver.sleep(2000);
		element(by.className('inboxCard')).$$('.inbox-span').then((rows) => {
			console.log('length of rows is', rows.length);
			expect(rows.length).toEqual(3);
			rows[0].getText().then((text) => {
				console.log('next newMessage is', newMessage, ', text is', text);
				expect(text.indexOf(newMessage)).toBeGreaterThan(-1);
			});
			browser.driver.sleep(2000);
			rows[0].click();
			browser.driver.sleep(2000);
		});
	});

	it('should have last sent message on the bottom', () => {
		element(by.id('chatMessagingDrawer')).$$('tr').then((rows) => {
			console.log('length of rows is', rows.length);
			rows[rows.length - 1].getText().then((text) => {
				expect(text.indexOf(newMessage)).toBeGreaterThan(-1);
			});
			browser.driver.sleep(1000);
			element(by.id('messagingChatBackArrow')).click();
			browser.driver.sleep(1000);
		});
	});
});

