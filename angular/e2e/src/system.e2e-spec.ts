import { browser, element, by, Key } from 'protractor';

describe('eMLC App', () => {
	let elementFound = false;
	let elementIndex = null;
	let elementBox = '';
	let wasUpdated = false;
	let userOnline = false;
	let userFound = false;
	let newMessage = '';
	let broadcastMessage = '';
	let recordCount = 0;
	browser.waitForAngularEnabled(false);

	browser.get('/');

	// should log back in as josh
	browser.driver.sleep(5000);
	element(by.className('input-username')).sendKeys('joshtsa');
	element(by.className('input-password')).sendKeys('Password1!');
	browser.driver.sleep(1000);
	element(by.className('button-sign-in')).click();
	browser.driver.sleep(3000);


	// run settings tests
	// should open profile popup
	it('should open the profile popup', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(2000);
	});

	// open set landing page component
	it('should open landing page component', () => {
		element.all(by.className('prof-menu-item')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					if (option === options[0]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(2000);
		});
	});


	// set new landing page
	it('should set a new landing page', () => {
		element.all(by.className('radioButton mat-radio-button')).then((options) => {
			const random = Math.floor(Math.random() * 10);
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					if (option === options[random]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(2000);
		});
	});

	// save new landing page
	it('should save new landing page', () => {
		element(by.id('saveLandingPageButton')).click();
		browser.driver.sleep(2000);
	});

	// logout
	it('should log out', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(2000);
		element(by.id('signOutButton')).click();
		browser.driver.sleep(2000);
	});

	// log back in
	it('should log back in', () => {
		browser.driver.sleep(3000);
		element(by.className('input-username')).sendKeys('joshtsa');
		element(by.className('input-password')).sendKeys('Password1!');
		browser.driver.sleep(1000);
		element(by.className('button-sign-in')).click();
		browser.driver.sleep(2000);
	});

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


	// should click the settings icon
	it('should open system settings', () => {
		element(by.className('system-settings-icon mat-icon show material-icons ng-star-inserted')).click();
		browser.driver.sleep(3000);
	});

	// should click color picker
	it('should click the color picker', () => {
		element(by.className('color-picker-icon mat-icon material-icons')).click();
		browser.driver.sleep(2000);
	});

	// should select a different color theme
	it('should select a new color theme', () => {
		const random = Math.floor(Math.random() * 10);
		element.all(by.className('picker-color-circle')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					if (option === options[random]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(3000);
		});
	});

	// should save the new theme
	it('should save new settings', () => {
		element(by.id('saveSystemSettingsButton')).click();
		browser.driver.sleep(5000);
	});

	// // open the menu
	// it('should open menu', () => {
	// 	element(by.className('btn-menu')).click();
	// 	browser.driver.sleep(2000);
	// });

	// it('should drop security panel', () => {
	// 	element(by.id('securityPanel')).click();
	// 	browser.driver.sleep(2000);
	// });

	// // go to roles
	// it('should navigate to roles', () => {
	// 	element(by.id('menu-roles')).click();
	// 	browser.driver.sleep(3000);
	// });

	// // run test on role-maintenance
	// it('should return data', () => {
	// 	element(by.id('role-maintenance-table')).$$('tr').then((rows) => {
	// 		let count = 0;
	// 		rows.forEach(row => {
	// 			row.getText().then((text) => {
	// 				console.log('row text', text);
	// 				if ((text.indexOf('MR1') > -1)) {
	// 					elementFound = true;
	// 					elementIndex = count;
	// 					if (text.indexOf('check_box_outline_blank') > -1) {
	// 						elementBox = 'check_box_outline_blank';
	// 						console.log('elementBox is: ', elementBox);
	// 					} else {
	// 						elementBox = 'check_box';
	// 						console.log('elementBox is: ', elementBox);
	// 					}
	// 					return;
	// 				}
	// 				count += 1;
	// 			});
	// 		});
	// 	});
	// });

	// it('should find role MR1', () => {
	// 	browser.driver.sleep(1000);
	// 	expect(elementFound).toEqual(true);
	// });

	// it('should click on MR1', () => {
	// 	element(by.id('role-maintenance-table')).$$('tr').get(elementIndex).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should open the drawer', () => {
	// 	element(by.id('roleEditIcon')).click();
	// 	browser.driver.sleep(1000);
	// });

	// it('should update active', () => {
	// 	element(by.id('roleActiveToggle')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('roleSaveButton')).click();
	// 	browser.driver.sleep(4000);
	// });

	// it('should open filter component', () => {
	// 	element(by.id('roleFilterIcon')).click();
	// 	browser.driver.sleep(2000);
	// });

	// it('should run a search', () => {
	// 	let search = 'MR1';
	// 	element(by.id('filterInput1')).sendKeys(search);
	// 	browser.driver.sleep(3000);
	// 	element(by.id('submitFilter')).click();
	// 	browser.driver.sleep(1500);
	// });

	// it('should find MR1 again', () => {
	// 	element(by.id('role-maintenance-table')).$$('tr').then((rows) => {
	// 		rows.forEach(row => {
	// 			row.getText().then((text) => {
	// 				console.log('row text', text);
	// 				if ((text.indexOf('MR1') > -1)) {
	// 					console.log('elementBox about to check text is: ', elementBox);
	// 					if ((text.indexOf('check_box_outline_blank') > -1)) {
	// 						if (elementBox === 'check_box_outline_blank') {
	// 							wasUpdated = false;
	// 						} else { wasUpdated = true; }
	// 					} else {
	// 						if (elementBox === 'check_box') {
	// 							wasUpdated = false;
	// 						} else { wasUpdated = true; }
	// 					}
	// 				}
	// 			});
	// 		});
	// 	});
	// });

	// it('should return wasUpdated as true', () => {
	// 	expect(wasUpdated).toEqual(true);
	// 	browser.driver.sleep(1500);
	// });

	// it('should clear filter', () => {
	// 	element(by.id('roleFilterIcon2')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('clearFilterButton')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.className('drawer-overlay show')).click();
	// 	browser.driver.sleep(1000);
	// });

	// run tests on user maintenance
	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	// remove this once jarryd fixes roles!!!!!!!!!!!!!
	it('should drop security panel', () => {
		element(by.id('securityPanel')).click();
		browser.driver.sleep(2000);
	});


	it('should select user-maintenance', () => {
		element(by.id('menu-users')).click();
		browser.driver.sleep(3000);
	});

	it('should open filter component', () => {
		element(by.id('userMainFilterIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should run a search', () => {
		let search = 'Gallucci';
		element(by.id('filterInput4')).sendKeys(search);
		browser.driver.sleep(3000);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1500);
	});


	it('should find Gallucci', () => {
		element(by.id('user-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('Gallucci') > -1)) {
						elementIndex = count;
					}
					count++;
				});
			});
		});
	});

	it('should click on Gallucci', () => {
		element(by.id('user-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('userMainEditIcon')).click();
		browser.driver.sleep(2000);
	});

	// reactivate this once the backend fixes badge ID ///////////////////////
	// it('should update active', () => {
	// 	element(by.id('userMainActiveToggle')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('userMainSaveButton')).click();
	// 	browser.driver.sleep(5000);
	// });

	// deactivate this once the backend fixes badge ID ///////////////////////
	it('should update the badge id', () => {
		let newData = '292828292';
		element(by.id('firstField')).sendKeys(newData);
		browser.driver.sleep(3000);
		element(by.id('userMainSaveButton')).click();
		browser.driver.sleep(1500);
	});

	it('should open configurator', () => {
		element(by.id('userMainConfiguratorIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should click Description checkbox', () => {
		element(by.id('configurator2')).click();
		browser.driver.sleep(1000);
		element(by.id('configurator3')).click();
		browser.driver.sleep(1000);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1000);
	});

	it('should restore configurator settings', () => {
		element(by.id('userMainConfiguratorIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('configurator2')).click();
		browser.driver.sleep(1000);
		element(by.id('configurator3')).click();
		browser.driver.sleep(1000);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1000);
	});


	// run tests on device-maintenance
	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should navigate to devices', () => {
		element(by.id('menu-devices')).click();
		browser.driver.sleep(3000);
	});

	// restore language to english
	it('should open the profile popup', () => {
		element(by.className('profile-button')).click();
		browser.driver.sleep(2000);
		element(by.id('selectLanguageField')).click();
		browser.driver.sleep(2000);
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

	it('should click the overlay', () => {
		element(by.className('profile-overlay show')).click();
		browser.driver.sleep(3000);
	});

	it('should return data', () => {
		element(by.id('device-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('XCE') > -1)) {
						elementFound = true;
						elementIndex = count;
						if (text.indexOf('check_box_outline_blank') > -1) {
							elementBox = 'check_box_outline_blank';
						} else {
							elementBox = 'check_box';
						}
						return;
					}
					count += 1;
				});
			});
		});
	});


	it('should click on XCE', () => {
		element(by.id('device-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('deviceEditIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should update active', () => {
		element(by.id('deviceActiveToggle')).click();
		browser.driver.sleep(1000);
		element(by.id('saveDeviceButton')).click();
		browser.driver.sleep(3000);
	});

	it('should open filter component', () => {
		element(by.id('deviceFilterIcon')).click();
		browser.driver.sleep(1500);
	});

	it('should run a search', () => {
		let search = 'XCE';
		element(by.id('filterInput1')).sendKeys(search);
		browser.driver.sleep(3000);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(3000);
	});

	it('should find XCE again', () => {
		element(by.id('device-maintenance-table')).$$('tr').then((rows) => {
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('XCE') > -1)) {
						if ((text.indexOf('check_box_outline_blank') > -1)) {
							if (elementBox === 'check_box_outline_blank') {
								wasUpdated = false;
							} else { wasUpdated = true; }
						} else {
							if (elementBox === 'check_box') {
								wasUpdated = false;
							} else { wasUpdated = true; }
						}
					}
				});
			});
		});
	});

	it('should return wasUpdated as true', () => {
		expect(wasUpdated).toEqual(true);
	});

	it('should clear filter', () => {
		element(by.id('deviceFilterIcon2')).click();
		browser.driver.sleep(1500);
		element(by.id('clearFilterButton')).click();
		browser.driver.sleep(1000);
		element(by.className('drawer-overlay show')).click();
		browser.driver.sleep(1000);
	});

	// run tests on user-mode screen
	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should select user-mode', () => {
		element(by.id('menu-user-mode')).click();
		browser.driver.sleep(3000);
	});

	it('should open filter component', () => {
		element(by.id('userModeFilterIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should run a search', () => {
		element(by.id('filterInput3')).click();
		browser.driver.sleep(200);
		element(by.className('mat-option ng-star-inserted mat-active')).click();
		browser.driver.sleep(200);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1500);
	});

	it('should find Josh Jancula', () => {
		element(by.id('user-mode-table')).$$('tr').then((rows) => {
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('Jancula') > -1) && (text.indexOf('Online') > -1)) {
						userOnline = true;
					}
				});
			});
		});
	});

	it('should return userOnline as true', () => {
		expect(userOnline).toEqual(true);
	});

	it('should clear filter', () => {
		element(by.id('userModeFilterIcon2')).click();
		browser.driver.sleep(1000);
		element(by.id('clearFilterButton')).click();
		browser.driver.sleep(1000);
		element(by.className('drawer-overlay show')).click();
		browser.driver.sleep(1000);
	});


	it('should open configurator', () => {
		element(by.id('userModeConfiguratorIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should click Description checkbox', () => {
		element(by.id('configurator2')).click();
		browser.driver.sleep(1000);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1000);
	});

	it('should restore configurator settings', () => {
		element(by.id('userModeConfiguratorIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('configurator2')).click();
		browser.driver.sleep(1000);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1000);
	});

	// run tests in utilization
	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should drop reporting panel', () => {
		element(by.id('reportingPanel')).click();
		browser.driver.sleep(2000);
	});

	it('should select utilization', () => {
		element(by.id('menu-utilization')).click();
		browser.driver.sleep(1000);
	});

	it('should open search component', () => {
		element(by.className('page-button')).click();
		browser.driver.sleep(1000);
	});

	it('should open search component', () => {
		element(by.className('datePeriodField')).click();
		browser.driver.sleep(200);
		element(by.className('mat-option ng-star-inserted mat-active')).click();
		browser.driver.sleep(500);
	});

	it('should open user-selector component', () => {
		element(by.id('filterUserSelectorButton')).click();
		browser.driver.sleep(1000);
	});

	it('should search a user', () => {
		element.all(by.id('userSelectorFilterIcon')).then((filterButtons) => {
			filterButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						console.log('clicked the button');
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
		element.all(by.id('userSelectorFilterInput')).then((filterInputs) => {
			filterInputs.forEach(input => {
				input.isDisplayed().then((displayed) => {
					if (displayed === true) {
						browser.driver.sleep(500);
						input.sendKeys('josh jancula');
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});

	it('should select josh', () => {
		element(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).click();
		browser.driver.sleep(500);
		element.all(by.id('userSelectorSaveButton')).then((buttons) => {
			buttons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						console.log('clicked the save button');
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});

	it('should perform a search', () => {
		element(by.id('submitFilter')).click();
		browser.driver.sleep(5000);
	});

	it('should find Josh Jancula', () => {
		element(by.id('utilization-table')).$$('tr').then((rows) => {
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('Jancula') > -1)) {
						userFound = true;
					}
				});
			});
		});
	});

	it('should return userFound as true', () => {
		expect(userFound).toEqual(true);
	});

	// run tests in auditing
	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should select auditing', () => {
		element(by.id('menu-auditing')).click();
		browser.driver.sleep(1000);
	});

	it('should open search component', () => {
		element(by.className('page-button')).click();
		browser.driver.sleep(1000);
	});

	it('should open search component', () => {
		element(by.className('datePeriodField')).click();
		browser.driver.sleep(200);
		element(by.className('mat-option ng-star-inserted mat-active')).click();
		browser.driver.sleep(500);
	});

	it('should attempt a search', () => {
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1000);
	});

	it('should set an action', () => {
		element(by.id('filterInput2')).click();
		browser.driver.sleep(500);
		element.all(by.className('mat-option ng-star-inserted')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					console.log('displayed: ', displayed);
					if (option === options[options.length - 1]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});

	it('should perform a search', () => {
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1000);
	});

	it('should open user-selector component', () => {
		element(by.id('filterUserSelectorButton')).click();
		browser.driver.sleep(1000);
	});

	it('should search a user', () => {
		element.all(by.id('userSelectorFilterIcon')).then((filterButtons) => {
			filterButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						console.log('clicked the button');
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
		element.all(by.id('userSelectorFilterInput')).then((filterInputs) => {
			filterInputs.forEach(input => {
				input.isDisplayed().then((displayed) => {
					if (displayed === true) {
						browser.driver.sleep(500);
						input.sendKeys('josh jancula');
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});

	it('should select josh', () => {
		element(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).click();
		browser.driver.sleep(500);
		element.all(by.id('userSelectorSaveButton')).then((buttons) => {
			buttons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});


	it('should perform a search', () => {
		element(by.id('submitFilter')).click();
		browser.driver.sleep(5000);
	});

	// run tests in providers
	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should drop relationship panel', () => {
		element(by.id('relationshipPanel')).click();
		browser.driver.sleep(2000);
	});

	it('should select providers', () => {
		element(by.id('menu-providers')).click();
		browser.driver.sleep(1000);
	});

	it('should open filter component', () => {
		element(by.id('providerFilterIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should run a search', () => {
		let search = 'QCP';
		element(by.id('filterInput1')).sendKeys(search);
		browser.driver.sleep(3000);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1500);
	});

	it('should find QCP again', () => {
		elementIndex = 0;
		element(by.id('provider-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('QCP') > -1)) {
						elementIndex = count;
						return;
					}
					count += 1;
				});
			});
		});
	});

	it('should click on QCP', () => {
		element(by.id('provider-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('providerEditIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should add a lab', () => {
		element(by.id('providerAddLab')).click();
		browser.driver.sleep(2000);
	});


	it('should search for KNN', () => {
		element.all(by.className('filter-icon')).then((filterButtons) => {
			filterButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						console.log('clicked the button');
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
		element.all(by.className('labSelectorFilterInput')).then((filterInputs) => {
			filterInputs.forEach(input => {
				input.isDisplayed().then((displayed) => {
					if (displayed === true) {
						browser.driver.sleep(500);
						input.sendKeys('KNN');
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});

	it('should select KNN', () => {
		element(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).click();
		browser.driver.sleep(500);
		element.all(by.id('labSelectorSaveButton')).then((buttons) => {
			buttons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						button.click();
					}
				});
			});
			browser.driver.sleep(3000);
		});
	});

	it('should save the record', () => {
		element(by.id('saveProviderButton')).click();
		browser.driver.sleep(2000);
	});

	it('should click on QCP', () => {
		element(by.id('provider-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('providerEditIcon')).click();
		browser.driver.sleep(1000);
	});

	// it should remove KNN
	it('should return data', () => {
		element.all(by.className('labsCard')).$$('.selectorRow').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('KNN') > -1)) {
						elementIndex = count;
						return;
					}
					count += 1;
				});
			});
		});
	});

	it('should remove KNN', () => {
		element.all(by.className('removeAssociate')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					console.log('displayed: ', displayed);
					if (option === options[elementIndex]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(3000);
		});
	});

	it('should save the record again', () => {
		element(by.id('saveProviderButton')).click();
		browser.driver.sleep(2000);
	});

	// run tests on locations
	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should select locations', () => {
		element(by.id('menu-locations')).click();
		browser.driver.sleep(1000);
	});

	it('should open filter component', () => {
		element(by.id('locationFilterIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should run a search', () => {
		let search = 'Delta9';
		element(by.id('filterInput1')).sendKeys(search);
		browser.driver.sleep(3000);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1500);
	});


	// find Delta9
	it('should return data', () => {
		element(by.id('location-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('Delta9') > -1)) {
						elementIndex = count;
						return;
					}
					count += 1;
				});
			});
		});
	});


	it('should click on Delta9', () => {
		element(by.id('location-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('locationEditIcon')).click();
		browser.driver.sleep(2000);
	});

	it('should deactivate the location', () => {
		element(by.id('locationActiveToggle')).click();
		browser.driver.sleep(1000);
	});

	it('should click the overlay', () => {
		element(by.className('drawer-overlay show')).click();
		browser.driver.sleep(1000);
	});

	it('should click no', () => {
		element(by.className('btn-alert-ok btn-alert-no')).click();
		browser.driver.sleep(1000);
	});

	// run tests on labs
	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should select labs', () => {
		element(by.id('menu-labs')).click();
		browser.driver.sleep(1000);
	});

	it('should open filter component', () => {
		element(by.id('labFilterIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should run a search', () => {
		let search = 'XP4';
		element(by.id('filterInput1')).sendKeys(search);
		browser.driver.sleep(3000);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1500);
	});


	// find XP4
	it('should return data', () => {
		element(by.id('lab-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('XP4') > -1)) {
						elementIndex = count;
						return;
					}
					count += 1;
				});
			});
		});
	});


	it('should click on XP4', () => {
		element(by.id('lab-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('labEditIcon')).click();
		browser.driver.sleep(2000);
	});

	it('should deactivate the lab', () => {
		element(by.id('labActiveToggle')).click();
		browser.driver.sleep(1000);
	});

	it('should click the overlay', () => {
		element(by.className('drawer-overlay show')).click();
		browser.driver.sleep(1000);
	});

	it('should click no', () => {
		element(by.className('btn-alert-ok btn-alert-no')).click();
		browser.driver.sleep(1000);
	});

	it('should click configurator icon', () => {
		element(by.id('labConfiguratorIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should remove columns', () => {
		element(by.id('configurator1')).click();
		browser.driver.sleep(500);
		element(by.id('configurator2')).click();
		browser.driver.sleep(500);
		element(by.id('configurator3')).click();
		browser.driver.sleep(500);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(2000);
	});

	it('should restore configurator settings', () => {
		element(by.id('labConfiguratorIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('configurator1')).click();
		browser.driver.sleep(500);
		element(by.id('configurator2')).click();
		browser.driver.sleep(500);
		element(by.id('configurator3')).click();
		browser.driver.sleep(500);
		element(by.id('configuratorSaveButton')).click();
		browser.driver.sleep(1500);
	});

	// run tests in hubs
	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should select hubs', () => {
		element(by.id('menu-hubs')).click();
		browser.driver.sleep(1000);
	});

	it('should open filter component', () => {
		element(by.id('hubFilterIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should run a search', () => {
		let search = 'CB4';
		element(by.id('filterInput1')).sendKeys(search);
		browser.driver.sleep(3000);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1500);
	});


	// find CB4
	it('should return data', () => {
		element(by.id('hub-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('CB4') > -1)) {
						elementIndex = count;
						return;
					}
					count += 1;
				});
			});
		});
	});


	it('should click on CB4', () => {
		element(by.id('hub-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('hubEditIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should add a user', () => {
		element(by.id('hubAddUser')).click();
		browser.driver.sleep(2000);
	});


	it('should search a user', () => {
		element.all(by.id('userSelectorFilterIcon')).then((filterButtons) => {
			filterButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						console.log('clicked the button');
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
		element.all(by.id('userSelectorFilterInput')).then((filterInputs) => {
			filterInputs.forEach(input => {
				input.isDisplayed().then((displayed) => {
					if (displayed === true) {
						browser.driver.sleep(500);
						input.sendKeys('josh jancula');
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});

	it('should select josh', () => {
		element(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).click();
		browser.driver.sleep(1000);
	});

	it('should click the save button', () => {
		element.all(by.id('userSelectorSaveButton')).then((buttons) => {
			buttons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						button.click();
					}
				});
			});
			browser.driver.sleep(2000);
		});
	});


	it('should click the overlay', () => {
		element(by.className('drawer-overlay show')).click();
		browser.driver.sleep(2000);
	});

	it('should click no', () => {
		element(by.className('btn-alert-ok btn-alert-no')).click();
		browser.driver.sleep(3000);
	});

	// run tests in clients
	it('should open menu', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(2000);
	});

	it('should select clients', () => {
		element(by.id('menu-clients')).click();
		browser.driver.sleep(1000);
	});

	// find oh
	it('should return data', () => {
		element(by.id('client-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('OH') > -1)) {
						elementIndex = count;
						return;
					}
					count += 1;
				});
			});
		});
	});


	it('should click on OH', () => {
		element(by.id('client-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('clientEditIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should add a lab', () => {
		element(by.id('clientAddLab')).click();
		browser.driver.sleep(2000);
	});


	it('should search for KNN', () => {
		element.all(by.className('filter-icon')).then((filterButtons) => {
			filterButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						console.log('clicked the button');
						button.click();
					}
				});
			});
			browser.driver.sleep(1000);
		});
		element.all(by.className('labSelectorFilterInput')).then((filterInputs) => {
			filterInputs.forEach(input => {
				input.isDisplayed().then((displayed) => {
					if (displayed === true) {
						browser.driver.sleep(500);
						input.sendKeys('KNN');
					}
				});
			});
			browser.driver.sleep(1000);
		});
	});

	it('should select KNN', () => {
		element(by.className('checkBoxDiv selectorCheckbox mat-icon material-icons')).click();
		browser.driver.sleep(500);
		element.all(by.id('labSelectorSaveButton')).then((buttons) => {
			buttons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						button.click();
					}
				});
			});
			browser.driver.sleep(3000);
		});
	});

	it('should save the record', () => {
		element(by.id('saveClientButton')).click();
		browser.driver.sleep(2000);
	});

	it('should open filter component', () => {
		element(by.id('clientFilterIcon')).click();
		browser.driver.sleep(1000);
	});

	it('should run a search', () => {
		let search = 'OH';
		element(by.id('filterInput1')).sendKeys(search);
		browser.driver.sleep(3000);
		element(by.id('submitFilter')).click();
		browser.driver.sleep(1500);
	});

	it('should find OH again', () => {
		elementIndex = 0;
		element(by.id('client-maintenance-table')).$$('tr').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('OH') > -1)) {
						elementIndex = count;
						return;
					}
					count += 1;
				});
			});
		});
	});

	it('should click on OH again', () => {
		element(by.id('client-maintenance-table')).$$('tr').get(elementIndex).click();
		browser.driver.sleep(1000);
	});

	it('should open the drawer', () => {
		element(by.id('clientEditIcon')).click();
		browser.driver.sleep(1000);
	});

	// it should remove KNN
	it('should return data', () => {
		element.all(by.className('labsCard')).$$('.selectorRow').then((rows) => {
			let count = 0;
			rows.forEach(row => {
				row.getText().then((text) => {
					console.log('row text', text);
					if ((text.indexOf('KNN') > -1)) {
						elementIndex = count;
						return;
					}
					count += 1;
				});
			});
		});
	});

	it('should remove KNN', () => {
		element.all(by.className('removeAssociate')).then((options) => {
			options.forEach(option => {
				option.isDisplayed().then((displayed) => {
					console.log('displayed: ', displayed);
					if (option === options[elementIndex]) {
						option.click();
					}
				});
			});
			browser.driver.sleep(3000);
		});
	});

	it('should save the record again', () => {
		element(by.id('saveClientButton')).click();
		browser.driver.sleep(2000);
	});

	// run tests in workload
	it('should edit first record', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(1000);
		element(by.id('listPanel')).click();
		browser.driver.sleep(2000);
		element(by.id('menu-workload')).isDisplayed().then((displayed) => {
			if (!displayed) {
				element.all(by.className('menu-group-icon')).then((icons) => {
					icons[0].click();
				});
				browser.driver.sleep(1000);
			}
		});

		element(by.id('menu-workload')).click();
		browser.driver.sleep(1000);
		element(by.className('mat-row')).click();
		browser.driver.sleep(1000);
		element(by.id('editIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('descriptionField')).sendKeys(' (Changed)');
		browser.driver.sleep(1000);
		element(by.id('workloadSaveButton')).click();
		browser.driver.sleep(2000);
	});

	// Reactivate this once we go to run thru and video as to we can only create the entry once //////////////////////
	// it('should add record and check record count', () => {
	// 	 recordCount = 0;
	// 	const bs = Key.BACK_SPACE;
	// 	element(by.tagName('mat-paginator')).getText().then((text) => {
	// 		recordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
	// 	});
	// 	browser.driver.sleep(2000);
	// 	element(by.id('workloadAddButton')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('firstField')).sendKeys('TI');
	// 	browser.driver.sleep(500);
	// 	element(by.id('descriptionField')).sendKeys(bs, bs, 'Tube inventory');
	// 	browser.driver.sleep(1000);
	// 	element(by.id('labSelect')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('labSelect')).sendKeys(Key.ENTER);
	// 	browser.driver.sleep(1000);
	// 	element(by.id('workloadSaveButton')).click();
	// 	browser.driver.sleep(2000);

	// 	element(by.tagName('mat-paginator')).getText().then((text) => {
	// 		const newRecordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
	// 		expect(newRecordCount).toEqual(recordCount + 1);
	// 	});
	// });

	// Run test on test maintenance
	it('should edit first record', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(1000);

		element(by.id('menu-tests')).isDisplayed().then((displayed) => {
			if (!displayed) {
				element.all(by.className('menu-group-icon')).then((icons) => {
					icons[0].click();
				});
				browser.driver.sleep(1000);
			}
		});

		element(by.id('menu-tests')).click();
		browser.driver.sleep(1000);
		element(by.className('mat-row')).click();
		browser.driver.sleep(1000);
		element(by.id('editIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('descriptionField')).sendKeys(' (Changed)');
		browser.driver.sleep(1000);
		element(by.id('testSaveButton')).click();
		browser.driver.sleep(1000);
	});

	// // Reactivate this once we go to do a complete run thru of system as to we cannot recreate the entry ////////
	// it('should add record and check record count', () => {
	// 	 recordCount = 0;
	// 	const bs = Key.BACK_SPACE;
	// 	element(by.tagName('mat-paginator')).getText().then((text) => {
	// 		recordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
	// 	});
	// 	element(by.id('testAddButton')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('firstField')).sendKeys('51020366_FOL');
	// 	browser.driver.sleep(500);
	// 	element(by.id('descriptionField')).sendKeys(bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, bs, 'Vitamin B9 (Folate) levels');
	// 	browser.driver.sleep(1000);
	// 	element(by.id('handlingInstructions')).sendKeys('Maintain room temperature');
	// 	browser.driver.sleep(1000);
	// 	element(by.id('labSelect')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('labSelect')).sendKeys(Key.ENTER);
	// 	browser.driver.sleep(1000);
	// 	element(by.id('labDepartment')).sendKeys('CLAB');
	// 	browser.driver.sleep(1000);
	// 	element(by.id('volume')).sendKeys('10ml');
	// 	browser.driver.sleep(1000);
	// 	element(by.id('destination')).sendKeys('Store room');
	// 	browser.driver.sleep(1000);
	// 	element(by.id('defaultContainer')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('defaultContainer')).sendKeys(Key.ENTER);
	// 	browser.driver.sleep(1000);
	// 	element(by.id('testSaveButton')).click();
	// 	browser.driver.sleep(1000);

	// 	element(by.tagName('mat-paginator')).getText().then((text) => {
	// 		const newRecordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
	// 		expect(newRecordCount).toEqual(recordCount + 1);
	// 	});
	// });

	// Run test in priority maintenance
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

	// Reactivate when we go to run thru entire system for show ///////////////////////////////////
	// it('should add record and check record count', () => {
	// 	 recordCount = 0;
	// 	const bs = Key.BACK_SPACE;
	// 	element(by.tagName('mat-paginator')).getText().then((text) => {
	// 		recordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
	// 	});
	// 	element(by.id('priorityAddButton')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('firstField')).sendKeys('Low');
	// 	browser.driver.sleep(500);
	// 	element(by.id('descriptionField')).sendKeys(bs, bs, bs, 'Collect when all other tasks are complete');
	// 	browser.driver.sleep(1000);
	// 	element(by.id('prioritySelect')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('prioritySelect')).sendKeys(Key.ENTER);
	// 	browser.driver.sleep(1000);
	// 	element(by.id('colorToggle')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('prioritySaveButton')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.tagName('mat-paginator')).getText().then((text) => {
	// 		const newRecordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
	// 		expect(newRecordCount).toEqual(recordCount + 1);
	// 	});
	// });

	// run tests in label maintenance
	it('should edit first record', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(1000);

		element(by.id('menu-labels')).isDisplayed().then((displayed) => {
			if (!displayed) {
				element.all(by.className('menu-group-icon')).then((icons) => {
					icons[0].click();
				});
				browser.driver.sleep(1000);
			}
		});

		element(by.id('menu-labels')).click();
		browser.driver.sleep(1000);
		element(by.className('mat-row')).click();
		browser.driver.sleep(1000);
		element(by.id('editIcon')).click();
		browser.driver.sleep(1000);
		element(by.id('descriptionField')).sendKeys(' (Changed)');
		browser.driver.sleep(1000);
		element(by.id('labelSaveButton')).click();
		browser.driver.sleep(1000);
	});

	// Reactivate when we go for final run thru and record
	// it('should add record and check record count', () => {
	// 	 recordCount = 0;
	// 	const bs = Key.BACK_SPACE;
	// 	element(by.tagName('mat-paginator')).getText().then((text) => {
	// 		recordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
	// 	});
	// 	element(by.id('labelAddButton')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('firstField')).sendKeys('Label 25');
	// 	browser.driver.sleep(500);
	// 	element(by.id('descriptionField')).sendKeys(bs, bs, bs, bs, bs, bs, bs, bs, 'Description of Label 25');
	// 	browser.driver.sleep(1000);
	// 	element(by.id('labSelect')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('labSelect')).sendKeys(Key.ENTER);
	// 	browser.driver.sleep(1000);
	// 	element(by.id('labelSaveButton')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.tagName('mat-paginator')).getText().then((text) => {
	// 		const newRecordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
	// 		expect(newRecordCount).toEqual(recordCount + 1);
	// 	});
	// });

	// Run test in container maintenance
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

	// Reactivate once we go thru final run //////////////////////////////////////////////
	// it('should add record and check record count', () => {
	// 	recordCount = 0;
	// 	element(by.tagName('mat-paginator')).getText().then((text) => {
	// 		recordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
	// 	});
	// 	browser.driver.sleep(3000);
	// });

	// it('should add record', () => {
	// 	element(by.id('containerAddButton')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('firstField')).sendKeys('PT');
	// 	browser.driver.sleep(500);
	// 	element(by.id('nameField')).sendKeys('PT');
	// 	browser.driver.sleep(500);
	// 	element(by.id('colorPickerIcon')).click();
	// 	browser.driver.sleep(500);
	// 	const bs = Key.BACK_SPACE;
	// 	element(by.id('colorCode')).sendKeys(bs, bs, bs, bs, bs, bs, '942192');
	// 	browser.driver.sleep(2000);
	// 	element(by.id('colorConfirmButton')).click();
	// 	element(by.id('descriptionField')).sendKeys(bs, bs, 'Purple tube');
	// 	browser.driver.sleep(500);
	// 	element(by.id('containerVolume')).sendKeys('20ml');
	// 	browser.driver.sleep(500);
	// 	element(by.id('containerType')).sendKeys('Aluminum');
	// 	browser.driver.sleep(1000);
	// 	element(by.id('containerRank')).click();
	// 	browser.driver.sleep(1000);
	// 	element(by.id('containerRank')).sendKeys(Key.ENTER);
	// 	browser.driver.sleep(1000);
	// 	element(by.id('specimenCode')).sendKeys('|BB|');
	// 	browser.driver.sleep(500);
	// 	element(by.id('drawOrder')).sendKeys('3');
	// 	browser.driver.sleep(500);
	// 	element(by.id('storageCode')).sendKeys('12b');
	// 	browser.driver.sleep(2000);
	// 	element(by.id('containerSaveButton')).click();
	// 	browser.driver.sleep(2000);

	// 	element(by.tagName('mat-paginator')).getText().then((text) => {
	// 		const newRecordCount = parseInt(text.substring(text.length - 2).trimLeft(), 10);
	// 		expect(newRecordCount).toEqual(recordCount + 1);
	// 	});
	// });


});
