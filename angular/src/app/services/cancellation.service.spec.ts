import { CancellationService } from './cancellation.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';

let authService: AuthService;
let cancellationService: CancellationService;

describe('CancellationService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({
			imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, CancellationService,
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialog, useValue: mockMatDialog }]
		});

		authService = TestBed.get(AuthService);
		cancellationService = TestBed.get(CancellationService);
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
		setTimeout(() => { done(); }, 3000);
	});

	it('should create cancellation', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		const cancellationBody = { Code: 'RB', Description: 'Rhett Butlet', IsActive: true, Laboratory: { Id: 'BK' } };
		cancellationService.createCancellation(JSON.stringify(cancellationBody)).subscribe(response => {
			expect(response.status).toBe(200);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get, edit and delete cancellation', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		cancellationService.getCancellations().subscribe(response => {
			expect(response.status).toBe(200);
			const groups = response.json();
			const id = groups[groups.length - 1]['Id'];
			const cancellationBody = { Code: 'RB', Description: 'Rocky and Bullwinkle', IsActive: true, Laboratory: { Id: 'BK' } };
			cancellationService.updateCancellation(id, JSON.stringify(cancellationBody)).subscribe(responseUpdate => {
				expect(responseUpdate.status).toBe(200);
				console.log('Now try to delete again');
				cancellationService.deleteCancellation(id).subscribe(responseDelete => {
					expect(responseDelete.status).toBe(200);
					done();
				}, error => {
					console.log('delete failed with', error);
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
