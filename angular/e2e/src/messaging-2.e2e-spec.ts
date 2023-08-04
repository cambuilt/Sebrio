import { browser, element, by } from 'protractor';

describe('Messaging 2 Test', () => {
	let newMessage = '';

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

	it ('should create new inbox for sean', () => {
		element(by.id('newButton')).click();
		browser.driver.sleep(1000);
		element.all(by.id('userSelectorCard')).$$('.selectorRow').then((users) => {
			users[2].click();
			browser.driver.sleep(2000);
		});
		browser.driver.sleep(1000);
		newMessage = 'Sean message sent on ' + Date();
		element(by.id('userSelectorMessageFieldSingleSelect')).sendKeys(newMessage);
		browser.driver.sleep(3000);
		element.all(by.css('.sendButton')).then((sendButtons) => {
			sendButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						button.click();
					}
				});
			});
			browser.driver.sleep(3000);
		});
		element.all(by.id('messagingChatBackArrow')).then((backButtons) => {
			backButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						button.click();
					}
				});
			});
			browser.driver.sleep(3000);
		});
		// element(by.className('inboxCard')).$$('.inbox-span').then((rows) => {
		// 	rows[0].getText().then((text) => {
		// 		expect(text.indexOf(newMessage)).toBeGreaterThan(-1);
		// 	});
		// 	browser.driver.sleep(2000);
		// });
	});

	it ('should delete sean inbox', () => {
		element(by.id('editButton')).click();
		browser.driver.sleep(3000);
		element.all(by.tagName('mat-checkbox')).then((checkBoxes) => {
			checkBoxes[0].click();
			browser.driver.sleep(2000);
			element(by.id('deleteButton')).click();
			browser.driver.sleep(2000);
			element(by.id('doneButton')).click();
			browser.driver.sleep(2000);
			element(by.id('messagingBackArrow')).click();
			browser.driver.sleep(2000);
		});
	});
});
