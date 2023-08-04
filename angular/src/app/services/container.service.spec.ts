import { ContainerService } from './container.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';

let authService: AuthService;
let containerService: ContainerService;

describe('ContainerService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({
			imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, ContainerService,
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialog, useValue: mockMatDialog }]
		});

		authService = TestBed.get(AuthService);
		containerService = TestBed.get(ContainerService);
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

	it('should create container', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		const containerBody = {
			Code: 'S6', ContainerRank: 'P', ContainerType: 'Gold Top Tube (SST)',
			Description: 'Gold Top Tube (SST)', DrawOrder: '1', IsActive: true,
			Laboratory: { Id: 'TRL' }, Name: 'Gold Top Tube (SST)', SpecimenCode: 'WHBLD',
			StorageCode: 'RF', TopColor: '#f8d200', Volume: '5ml'
		};

		containerService.createContainer(JSON.stringify(containerBody)).subscribe(response => {
			expect(response.status).toBe(200);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get, edit and delete container', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		containerService.getContainers().subscribe(response => {
			expect(response.status).toBe(200);
			const groups = response.json();
			const id = groups[groups.length - 1]['Id'];
			const containerBody = {
				Code: 'S6', ContainerRank: 'P', ContainerType: 'Red Top Tube (SST)',
				Description: 'Red Top Tube (SST)', DrawOrder: '1', IsActive: true,
				Laboratory: { Id: 'TRL' }, Name: 'Red Top Tube (SST)', SpecimenCode: 'WHBLD',
				StorageCode: 'RF', TopColor: '#f8d200', Volume: '5ml'
			};

			containerService.updateContainer(id, JSON.stringify(containerBody)).subscribe(responseUpdate => {
				expect(responseUpdate.status).toBe(200);
				containerService.deleteContainer(id).subscribe(responseDelete => {
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
