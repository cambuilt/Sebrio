import { LabService } from './lab.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';

let authService: AuthService;
let labService: LabService;

describe('LabService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({
			imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, LabService,
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialog, useValue: mockMatDialog }]
		});

		authService = TestBed.get(AuthService);
		labService = TestBed.get(LabService);
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

	it('should create lab', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		const body = {
			Code: 'TRIC', DefaultCollectionList: {CanCancelOrder: true, CanRescheduleOrder: true, CanIdentifyCollectionSite: true,
				CanTriggerExceptionReport: true, CanWorkloadCodeEntry: true, LabelNumberDefault: '1', CanGenerateCommunicationLabel: true,
				LabelNumberMaximum: '7', MinimumPatientIdentifiersRequired: 3 }, Label: '',
			Description: 'TRIC Medical', Email: 'lab@tricore.com', IsActive: true,
			Location: {StreetAddress1: '200 Broad Street', StreetAddress2: '5th Floor', City: 'Charleston', Country: 'USA',
			County: 'Berkeley', PostalCode: '29466', State: 'SC'}, Phone: '(843) 652-7849'
		};

		labService.createLab(JSON.stringify(body)).subscribe(response => {
			expect(response.status).toBe(200);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get, edit and delete lab', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		labService.getLabs().subscribe(response => {
			expect(response.status).toBe(200);
			const groups = response.json();
			const id = groups[groups.length - 1]['Id'];
			const body = {
				Code: 'BIC', DefaultCollectionList: {CanCancelOrder: true, CanRescheduleOrder: true, CanIdentifyCollectionSite: true,
					CanTriggerExceptionReport: true, CanWorkloadCodeEntry: true, LabelNumberDefault: '1', CanGenerateCommunicationLabel: false,
					LabelNumberMaximum: '7', MinimumPatientIdentifiersRequired: 3 },
				Description: 'BIC Medical', Email: 'lab@tricore.com', IsActive: true, Label: '',
				Location: {StreetAddress1: '200 Broad Street', StreetAddress2: '5th Floor', City: 'Charleston', Country: 'USA',
				County: 'Berkeley', PostalCode: '29466', State: 'SC'}, Phone: '(843) 652-7849'
			};

			labService.updateLab(id, JSON.stringify(body)).subscribe(responseUpdate => {
				expect(responseUpdate.status).toBe(200);
				labService.deleteLab(id).subscribe(responseDelete => {
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
