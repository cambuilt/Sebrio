import { ProviderService } from './provider.service';
import { AuthService } from './auth.service';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';

let authService: AuthService;
let providerService: ProviderService;

describe('ProviderService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({
			imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, ProviderService,
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialog, useValue: mockMatDialog }]
		});

		authService = TestBed.get(AuthService);
		providerService = TestBed.get(ProviderService);
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

	it('should create priority', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		const body = {
			CellPhone: '(201) 567-8904', Code: '1874460257', Comments: 'These are the comments', CompanyName: 'Contact One',
			Email: 'mwinckleford@contactone.com', Extension1: '23', Extension2: '', Fax: '(201) 567-8901',
			FirstName: 'Morris', IsActive: true, Laboratory: { Id: 'TRI' }, Id: 'TRI', LastName: 'Winckleford',
			License: 'LIC #122984839', Location: {
				City: 'Charleston', Country: 'USA', County: 'Berkeley', PostalCode: '29469', State: 'SC',
				StreetAddress1: '15 Rutledge Avenue', StreetAddress2: 'First Floor'
			},
			MiddleName: '', NPI: 'NPI 3490985', Phone1: '(980) 419-2877', Phone2: '(980) 307-2423', ProviderType: 'Doctor',
			SourceSystemId: 'SS 8e3328', Speciality: 'Cytopathology', Suffix: '', Title: 'AH', UPIN: 'UPIN 449231'
		};

		providerService.createProvider(JSON.stringify(body)).subscribe(response => {
			expect(response.status).toBe(200);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get, edit and delete priority', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		providerService.getProviders().subscribe(response => {
			expect(response.status).toBe(200);
			const groups = response.json();
			const id = groups[groups.length - 1]['Id'];
			const body = {
				CellPhone: '(201) 567-8904', Code: '1874460257', Comments: 'These are the comments', CompanyName: 'Contact One',
				Email: 'mwinckle@contactone.com', Extension1: '23', Extension2: '', Fax: '(201) 567-8901',
				FirstName: 'Morris', IsActive: true, Laboratory: { Id: 'TRI' }, Id: 'TRI', LastName: 'Winckle',
				License: 'LIC #122984839', Location: {
					City: 'Charleston', Country: 'USA', County: 'Berkeley', PostalCode: '29469', State: 'SC',
					StreetAddress1: '15 Rutledge Avenue', StreetAddress2: 'First Floor'
				},
				MiddleName: '', NPI: 'NPI 3490985', Phone1: '(980) 419-2877', Phone2: '(980) 307-2423', ProviderType: 'Doctor',
				SourceSystemId: 'SS 8e3328', Speciality: 'Cytopathology', Suffix: '', Title: 'AH', UPIN: 'UPIN 449231'
			};

			providerService.updateProvider(id, JSON.stringify(body)).subscribe(responseUpdate => {
				expect(responseUpdate.status).toBe(200);
				providerService.deleteProvider(id).subscribe(responseDelete => {
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
