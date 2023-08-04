import { LocationService } from './location.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';

let authService: AuthService;
let locationService: LocationService;

describe('LocationService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({
			imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, LocationService,
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialog, useValue: mockMatDialog }]
		});

		authService = TestBed.get(AuthService);
		locationService = TestBed.get(LocationService);
	});

	it('should login', () => {
		const desktopJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXAiOiJEZXNrdG9wIn0=.zT3I6hOak90xH5VEhSzLtVMHeBeaSnn0PD4rNBC1dRM=';
		authService.login('tsa', 'tsauser', 'Password1!', desktopJWT, '').subscribe(response => {
			expect(response.status).toBe(200);
			const json = response.json();
			authService.currentUser.sessionToken = json.SessionToken;
			const role = 'RMP_TSA';
			authService.currentUser.avatarURL = json.AvatarURL;
			authService.currentUser.role = role;
			authService.currentUser.landingPage = json.LandingPage;
			authService.currentUser.name = `${json.FirstName} ${json.LastName}`;
			authService.currentUser.email = json.Email;
			authService.currentUser.tenantId = json.TenantId;
			authService.currentUser.username = this.username;
			authService.currentUser.sessionToken = json.SessionToken;
			localStorage.setItem('currentUser', JSON.stringify(authService.currentUser));
			localStorage.setItem('token', json.SessionToken);
			expect(authService.currentUser.sessionToken).toBeTruthy();
		}, error => {
			fail(error);
		});
	});

	it('wait for login', done => {
		setTimeout(() => { done(); }, 3000);
	});

	it('should create location', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		const body = {
			Code: 'GB', Description: 'Great Bay', IsActive: true, LabId: 'RHODES',
			Location: {
				City: 'Charleston', Country: 'USA', County: 'Berkeley', PostalCode: '20958',
				State: 'SC', StreetAddress1: '40 East Bay Street', StreetAddress2: '4th Floor'
			},
			Phone: '(843) 658-7144'
		};

		locationService.createLocation(JSON.stringify(body)).subscribe(response => {
			expect(response.status).toBe(200);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get, edit and delete location', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		locationService.getLocations().subscribe(response => {
			expect(response.status).toBe(200);
			const groups = response.json();
			const id = groups[groups.length - 1]['Id'];
			const body = {
				Code: 'GB', Description: 'Little Bay', IsActive: true, LabId: 'RHODES',
				Location: {
					City: 'Charleston', Country: 'USA', County: 'Berkeley', PostalCode: '20958',
					State: 'SC', StreetAddress1: '40 East Bay Street', StreetAddress2: '4th Floor'
				},
				Phone: '(843) 658-7144'
				};

			locationService.updateLocation(id, JSON.stringify(body)).subscribe(responseUpdate => {
				expect(responseUpdate.status).toBe(200);
				locationService.deleteLocation(id).subscribe(responseDelete => {
					expect(responseDelete.status).toBe(200);
					done();
				}, error => {
					fail(error);
				});
			}, error => {
				fail(error);
			});
		}, error => {
			fail(error);
		});
	});
});

class MockRouter {
	//noinspection TypeScriptUnresolvedFunction
	navigate = jasmine.createSpy('navigate');
}
class MockMatDialog {

}
