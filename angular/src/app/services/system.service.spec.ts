import { SystemService } from './system.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';

let authService: AuthService;
let systemService: SystemService;

describe('SystemService', () => {
	let mockRouter;
	let mockMatDialog;
	let settings = {
		IdleActive: false,
		IdleTime: 0,
		ThemeColor: '',
		URLLoginPage: '',
		URLLoginPageFile: '',
		URLNavigationBar: '',
		URLNavigationBarFile: '',
		URLWatermark: '',
		URLWatermarkFile: ''
	};
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({
			imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, SystemService,
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialog, useValue: mockMatDialog }]
		});

		authService = TestBed.get(AuthService);
		authService.subdomain = 'rhodes';
		systemService = TestBed.get(SystemService);
	});

	it('should get settings unauthenticated', done => {
		systemService.getTenantSettingsUnauthenticated().subscribe(response => {
			expect(response.status).toBe(200);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get subdomain', done => {
		systemService.getSubdomainUnauthenticated('Rhodes').subscribe(response => {
			expect(response.status).toBe(200);
			done();
		}, error => {
			fail(error);
		});
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

	it('should get tenant settings', done => {
		systemService.getTenantSettings().subscribe(response => {
			expect(response.status).toBe(200);
			settings = response.json();
			console.log('got these settings', settings);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should update settings', done => {
		settings.ThemeColor = 'strong-yellow-theme';
		console.log('setting...', settings);
		systemService.setTenantSettings(JSON.stringify(settings)).subscribe(response => {
			expect(response.status).toBe(200);
			done();
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
