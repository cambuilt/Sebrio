import { browser, element, by } from 'protractor';

describe('eMLC App', () => {
	let elementFound = false;
	let elementIndex = null;
	let elementBox = '';
	let wasUpdated = false;
	browser.waitForAngularEnabled(false);

	browser.get('/');

	browser.driver.sleep(3000);
	element(by.className('input-username')).sendKeys('joshtsa');
	element(by.className('input-password')).sendKeys('Password1!');
	browser.driver.sleep(1000);
	element(by.className('button-sign-in')).click();
	browser.driver.sleep(3000);

	// // should open profile popup
	// it('should open the profile popup', () => {
	// 	element(by.className('profile-button')).click();
	// 	browser.driver.sleep(2000);
	// });

	// // open set landing page component
	// it('should open landing page component', () => {
	// 	element.all(by.className('prof-menu-item')).then((options) => {
	// 		options.forEach(option => {
	// 			option.isDisplayed().then((displayed) => {
	// 				if (option === options[0]) {
	// 					option.click();
	// 				}
	// 			});
	// 		});
	// 		browser.driver.sleep(2000);
	// 	});
	// });


	// // set new landing page
	// it('should set a new landing page', () => {
	// 	element.all(by.className('radioButton mat-radio-button')).then((options) => {
	// 		const random = Math.floor(Math.random() * 10);
	// 		options.forEach(option => {
	// 			option.isDisplayed().then((displayed) => {
	// 				if (option === options[random]) {
	// 					option.click();
	// 				}
	// 			});
	// 		});
	// 		browser.driver.sleep(2000);
	// 	});
	// });

	// // save new landing page
	// it('should save new landing page', () => {
	// 	element(by.id('saveLandingPageButton')).click();
	// 	browser.driver.sleep(2000);
	// });

	// // logout
	// it('should log out', () => {
	// 	element(by.className('profile-button')).click();
	// 	browser.driver.sleep(2000);
	// 	element(by.id('signOutButton')).click();
	// 	browser.driver.sleep(2000);
	// });

	// // log back in
	// it('should log back in', () => {
	// 	browser.driver.sleep(3000);
	// 	element(by.className('input-username')).sendKeys('joshtsa');
	// 	element(by.className('input-password')).sendKeys('Password1!');
	// 	browser.driver.sleep(1000);
	// 	element(by.className('button-sign-in')).click();
	// 	browser.driver.sleep(2000);
	// });

	// should open profile popup
	it('should open the profile popup', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(2000);
		element(by.id('selectLanguageField')).click();
		browser.driver.sleep(2000);
	});

	// set language to french
	it('should set language to french', () => {
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					if (option === options[options.length - 1]) {
						console.log('option setting to french', option);
						option.click();
					}
				});
			});
			browser.driver.sleep(3000);
		});
	});

	it('should click the overlay', () => {
		element(by.className('profile-overlay show')).click();
		browser.driver.sleep(3000);
	});


	// // should click the settings icon
	// it('should open system settings', () => {
	// 	element(by.className('system-settings-icon mat-icon show material-icons ng-star-inserted')).click();
	// 	browser.driver.sleep(2000);
	// });

	// // should click color picker
	// it('should click the color picker', () => {
	// 	element(by.className('color-picker-icon mat-icon material-icons')).click();
	// 	browser.driver.sleep(2000);
	// });

	// // should select a different color theme
	// it('should select a new color theme', () => {
	// 	const random = Math.floor(Math.random() * 10);
	// 	element.all(by.className('picker-color-circle')).then((options) => {
	// 		options.forEach(option => {
	// 			option.isDisplayed().then((displayed) => {
	// 				if (option === options[random]) {
	// 					option.click();
	// 				}
	// 			});
	// 		});
	// 		browser.driver.sleep(3000);
	// 	});
	// });

	// // should save the new theme
	// it('should save new settings', () => {
	// 	element(by.id('saveSystemSettingsButton')).click();
	// 	browser.driver.sleep(5000);
	// });

	// should open profile popup
	it('should open the profile popup', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(2000);
		element(by.id('selectLanguageField')).click();
		browser.driver.sleep(3000);
	});

	// set language back to english
	it('should set language to english', () => {
		element.all(by.className('mat-option')).then((options) => {
			options.forEach(option => {
				option.isPresent().then((present) => {
					console.log('isPresent is: ', present);
					if (present === true) {
						option.getText().then((text) => {
							if (text.indexOf('Anglais') > -1) {
								option.click();
								browser.driver.sleep(2000);
							}
						});
					}
				});
			});
		});
	});

});
