import { AuditingService } from './auditing.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';
import * as moment from 'moment';

let authService: AuthService;
let auditingService: AuditingService;

describe('AuditingService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({ imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, AuditingService,
			{ provide: Router, useValue: mockRouter },
			{ provide: MatDialog, useValue: mockMatDialog }] });

		authService = TestBed.get(AuthService);
		auditingService = TestBed.get(AuditingService);
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

	it('wait for login to complete', done => {
		setTimeout(() => { done(); }, 8000);
	});

	it('should get auditing filter results', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		const filterObject = { Action: 'Logged in', EventDate: moment().format('MM/DD/YY'), Users: {0: 'tsauser'} };
		auditingService.searchAuditing(JSON.stringify(filterObject)).subscribe(response => {
			const results = response.json();
			expect(response.status).toBe(200);
			expect(results.length).toBeGreaterThan(0);
			done();
		}, error => {
			fail(error);
		});
	});
});

class MockRouter {
	navigate = jasmine.createSpy('navigate');
}
class MockMatDialog {

}
