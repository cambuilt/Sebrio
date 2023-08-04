import { WorkloadService } from './workload.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';

let authService: AuthService;
let workloadService: WorkloadService;

describe('WorkloadService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({
			imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, WorkloadService,
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialog, useValue: mockMatDialog }]
		});

		authService = TestBed.get(AuthService);
		workloadService = TestBed.get(WorkloadService);
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

	it('should create a workload', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		const workload = { Code: 'TM', Description: 'Too much', IsActive: true, LaboratoryId: 'BK' };
		workloadService.createWorkload(JSON.stringify(workload)).subscribe(response => {
			expect(response.status).toBe(200);
			console.log('create workload response: ', response);
			done();
		}, error => {
			console.log('error creating workload: ', error);
			fail(error);
		});
	});

	it('should get, edit and delete the workload', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		workloadService.getWorkloads().subscribe(response => {
			expect(response.status).toBe(200);
			const groups = response.json();
			console.log('response for getAll workloads: ', groups);
			const id = groups[groups.length - 1]['Id'];
			const workload = { Code: 'TM', Description: 'Tuesday morning', IsActive: true, LaboratoryId: 'BK' };
			workloadService.updateWorkload(id, JSON.stringify(workload)).subscribe(responseUpdate => {
				expect(responseUpdate.status).toBe(200);
				console.log('Now try to delete again');
				// workloadService.deleteWorkload(id).subscribe(responseDelete => {
				// 	expect(responseDelete.status).toBe(200);
				// 	done();
				// }, error => {
				// 	console.log('delete failed with', error);
				// 	fail(error);
				// });
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
