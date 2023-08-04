import { ClientService } from './client.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';

let authService: AuthService;
let clientService: ClientService;

describe('ClientService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({
			imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, ClientService,
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialog, useValue: mockMatDialog }]
		});

		authService = TestBed.get(AuthService);
		clientService = TestBed.get(ClientService);
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

	it('should create client', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.

		const clientBody = { Code: 'BB', Comments: 'Just some comments', ContactPerson1: 'Sashay Sally',
							 ContactPerson2: 'Waltzing William', Email: 'bbob@stuff.com', Fax: '(908) 307-2424',
							 IsActive: true, Laboratory: { Id: 'ST' },  Location: { StreetAddress1: '12 Main St', StreetAddress2: '4th Floor',
							 City: 'Madison', Country: 'USA', County: 'Fairfield', PostalCode: '05148', State: 'CT' },
							 Name: 'Buckeroo Bob', Phone: '(908) 307-4323', Specialities: 'Measurements and collections' };

		clientService.createClient(JSON.stringify(clientBody)).subscribe(response => {
			expect(response.status).toBe(200);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get, edit and delete client', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		clientService.getClients().subscribe(response => {
			expect(response.status).toBe(200);
			const groups = response.json();
			const id = groups[groups.length - 1]['Id'];

			const clientBody = { Code: 'BB', Comments: 'Just some more comments', ContactPerson1: 'FoxTrot Frank',
			ContactPerson2: 'Jitterbug Jonesy', Email: 'bbob@stuff.com', Fax: '(908) 307-2424',
			IsActive: true, Laboratory: { Id: 'ST' },  Location: { StreetAddress1: '120 Main St', StreetAddress2: '3rd Floor',
			City: 'Madison', Country: 'USA', County: 'Fairfield', PostalCode: '06148', State: 'CT' },
			Name: 'Bucko Bob', Phone: '(908) 307-4323', Specialities: 'Measurements and collections' };

			clientService.updateClient(id, JSON.stringify(clientBody)).subscribe(responseUpdate => {
				expect(responseUpdate.status).toBe(200);
				console.log('Now try to delete...');
				clientService.deleteClient(id).subscribe(responseDelete => {
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
