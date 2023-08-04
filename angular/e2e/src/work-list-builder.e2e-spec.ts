import { browser, element, by, Key } from 'protractor';
import * as moment from 'moment-timezone';

describe('Work List Builder Test', () => {
	browser.waitForAngularEnabled(false);
	browser.get('/');

	browser.driver.sleep(2000);
	element(by.className('input-username')).sendKeys('tsauser');
	element(by.className('input-password')).sendKeys('Password1!');
	browser.driver.sleep(1000);
	element(by.className('button-sign-in')).click();
	browser.driver.sleep(2000);

	it('should open work list builder', () => {
		element(by.className('btn-menu')).click();
		browser.driver.sleep(1000);

		element(by.id('menu-work-list-builder')).isDisplayed().then((displayed) => {
			if (!displayed) {
				element.all(by.className('menu-group-icon')).then((icons) => {
					icons[0].click();
				});
				browser.driver.sleep(1000);
			}
		});

		element(by.id('menu-work-list-builder')).click();
		browser.driver.sleep(1000);
	});

	it('should select search parameters', () => {
		const bs = Key.BACK_SPACE;
		element(by.id('workListBuilderSearchButton')).click();
		browser.driver.sleep(1000);
		element(by.id('hubSelect')).click();
		browser.driver.sleep(500);
		element(by.id('hubSelect')).sendKeys(Key.ENTER);
		browser.driver.sleep(1000);
		element(by.id('collectionListSelect')).click();
		browser.driver.sleep(500);
		element(by.id('collectionListSelect')).sendKeys(Key.ENTER);
		browser.driver.sleep(1000);
		element(by.id('dateFrom')).click();
		browser.driver.sleep(1000);
		element.all(by.css('.mat-calendar-period-button')).then((periodButtons) => {
			periodButtons.forEach(button => {
				button.isDisplayed().then((displayed) => {
					if (displayed === true) {
						button.click();
						browser.driver.sleep(1000);
						element.all(by.css('.mat-calendar-body-cell-content')).then((cells) => {
							cells[0].click();
							browser.driver.sleep(1000);
							element.all(by.css('.mat-calendar-body-cell-content')).then((monthCells) => {
								monthCells.forEach(cell => {
									cell.isPresent().then((monthPresent) => {
										if (monthPresent) {
											cell.getText().then((text) => {
												if (text === 'NOV') {
													cell.click();
													browser.driver.sleep(1000);
													element.all(by.className('mat-calendar-body-cell ng-star-inserted')).then((dayCells) => {
														dayCells.forEach(dayCell => {
															dayCell.isPresent().then((dayPresent) => {
																if (dayPresent) {
																	dayCell.getText().then((dayText) => {
																		if (dayText === '1') {
																			dayCell.click();
																			browser.driver.sleep(1000);
																			element(by.id('workListCreateSearchButton')).click();
																			browser.driver.sleep(1000);
																		}
																	});
																}
															});
														});
													});
												}
											});
										}
									});
								});
							});
						});
					}
				});
			});
		});
	});

	it('click expand icon', () => {
		element.all(by.className('expand-icon mat-icon material-icons collapsed showAddressIcon')).then((expandIcons) => {
			expandIcons.forEach(expandIcon => {
				expandIcon.isPresent().then((present) => {
					if (present) {
						expandIcon.click();
						browser.driver.sleep(6000);
					}
				});
			});
		});
	});

	it('should log out', () => {
	 	element(by.className('profile-button')).click();
	 	browser.driver.sleep(1000);
	 	element(by.id('signOutButton')).click();
	 	browser.driver.sleep(1000);
	});
});

