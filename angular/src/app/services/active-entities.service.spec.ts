import { ActiveEntitiesService } from './active-entities.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import {async as _async} from 'rxjs/scheduler/async';

let authService: AuthService;
let activeEntitiesService: ActiveEntitiesService;

describe('ActiveEntitiesService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();
		TestBed.configureTestingModule({ imports: [HttpModule], providers: [BluetoothSerial, AuthService, ActiveEntitiesService, { provide: Router, useValue: mockRouter }, { provide: MatDialog, useValue: mockMatDialog }] });
		authService = TestBed.get(AuthService);
		activeEntitiesService = TestBed.get(ActiveEntitiesService);
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

	it('should get active roles', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		activeEntitiesService.getActiveRoles().subscribe(response => {
			const roles = response.json();
			expect(roles.length).toBeGreaterThan(0);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get active users', done => {
		activeEntitiesService.getActiveUsers().subscribe(response => {
			const users = response.json();
			expect(response.status).toBe(200);
			expect(users.length).toBeGreaterThan(0);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get active cancellations', done => {
		activeEntitiesService.getActiveCancellations().subscribe(response => {
			const items = response.json();
			expect(response.status).toBe(200);
			expect(items.length).toBeGreaterThan(0);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get active collection sites', done => {
		activeEntitiesService.getActiveCollectionSites().subscribe(response => {
			const items = response.json();
			expect(response.status).toBe(200);
			expect(items.length).toBeGreaterThan(0);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get active containers', done => {
		activeEntitiesService.getActiveContainers().subscribe(response => {
			const items = response.json();
			expect(response.status).toBe(200);
			expect(items.length).toBeGreaterThan(0);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get active hubs', done => {
		activeEntitiesService.getActiveHubs().subscribe(response => {
			const items = response.json();
			expect(response.status).toBe(200);
			expect(items.length).toBeGreaterThan(0);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get active labs', done => {
		activeEntitiesService.getActiveLabs().subscribe(response => {
			const items = response.json();
			expect(response.status).toBe(200);
			expect(items.length).toBeGreaterThan(0);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get active locations', done => {
		activeEntitiesService.getActiveLocations().subscribe(response => {
			const items = response.json();
			expect(response.status).toBe(200);
			expect(items.length).toBeGreaterThan(0);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get active providers', done => {
		activeEntitiesService.getActiveProviders().subscribe(response => {
			const items = response.json();
			expect(response.status).toBe(200);
			expect(items.length).toBeGreaterThan(0);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get active priorities', done => {
		activeEntitiesService.getActivePriorities().subscribe(response => {
			const items = response.json();
			expect(response.status).toBe(200);
			expect(items.length).toBeGreaterThan(0);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get active workloads', done => {
		activeEntitiesService.getActiveWorkloads().subscribe(response => {
			const items = response.json();
			expect(response.status).toBe(200);
			expect(items.length).toBeGreaterThan(0);
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
