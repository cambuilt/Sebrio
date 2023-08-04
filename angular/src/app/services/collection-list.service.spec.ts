import { CollectionListService } from './collection-list.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';

let authService: AuthService;
let collectionListService: CollectionListService;

describe('CollectionListService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({
			imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, CollectionListService,
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialog, useValue: mockMatDialog }]
		});

		authService = TestBed.get(AuthService);
		collectionListService = TestBed.get(CollectionListService);
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

	it('wait for login to collection list', done => {
		setTimeout(() => { done(); }, 3000);
	});

	it('should create collection list', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.

		const collectionListBody = {
			Code: 'BRB', Description: 'Be Right Back', Note: 'Sent when leaving the desk.', Hub: { 'Id': '4' },
			Laboratory: { Id: 'RG' }, IsActive: true, RefreshTimeAutomatic: '00:03', RefreshTimeManual: '05: 00',
			CleanCollectionListTimer: '07:00', CollectionPeriodStartSelect: '+', CollectionPeriodStartDays: '5',
			CollectionPeriodStartTime: '12:00', CollectionPeriodEndSelect: '+', CollectionPeriodEndDays: '7',
			CollectionPeriodEndTime: '15: 00', ReservationExpireTime: '14: 00', ReservationIsSuperseded: true,
			CollectStaff: 'Nurse to collect', AssociatedCollectionLocations: [{Code: 'OE', Description: 'OE', Id: '2237'}],
			AssociatedClients: [{Code: 'SC', Name: 'S Client', Id: '6813'}], AssociatedProviders:
			[{Code: 'SP', Id: '113618', CompanyName: 'S Provider'}], AssociatedPriorities:
			[{Code: 'R', Id: '12', Description: 'Routine'}], DisplayClient: true,  DisplayClientAddressAndPhone: false,
			DisplayCollectionLocation: false, DisplayHomeDrawAddress: true, DisplayPatientAddressAndPhone: false,
			DisplayPatientRoomBed: true, PatientIdentifier: '', PatientScanWristband: true, PatientWristbandCount: '2',
			PatientWristband1: 'Account Number', PatientWristbandBarcodeSegment1: '123', 'PatientWristband2': 'Driver\'s License',
			PatientWristbandBarcodeSegment2: '456', PatientWristbandBarcodeDelimiter: '~',
			PatientIdDocCount: '2', PatientIdDoc1: 'Patient Name', PatientIdDoc2: 'DOB', PatientScanId: true,
			PatientManualId: true, CanCancelOrder: true, CanRescheduleOrder: false, CanTransferToProblemList: true,
			CanIdentifyCollectionSite: false, CanAddCollectionNote: true, CanWorkloadCodeEntry: true, CanEnableGPSSupport: false,
			CanTriggerExceptionReport: true, CanGenerateCommunicationLabel: true, CanGroupByLocation: true, LabelNumberDefault: '10',
			LabelNumberMaximum: '15', CanUpdateCentralLineStatus: true, CentralLineDuration: '6', RequiredFormABN: true,
			RequiredFormFinancialResponsibility: true, RequiredFormRequisition: true
		};

		collectionListService.createCollectionList(JSON.stringify(collectionListBody)).subscribe(response => {
			expect(response.status).toBe(200);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get, edit and delete collection list', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		collectionListService.getCollectionLists().subscribe(response => {
			expect(response.status).toBe(200);
			const groups = response.json();
			const id = groups[groups.length - 1]['Id'];

			const collectionListBody = {
				Code: 'LOB', Description: 'Left Over Blood', Note: 'When there is a little too much.', Hub: { 'Id': '4' },
				Laboratory: { Id: 'RG' }, IsActive: true, RefreshTimeAutomatic: '00:03', RefreshTimeManual: '05: 00',
				CleanCollectionListTimer: '07:00', CollectionPeriodStartSelect: '+', CollectionPeriodStartDays: '5',
				CollectionPeriodStartTime: '12:00', CollectionPeriodEndSelect: '+', CollectionPeriodEndDays: '7',
				CollectionPeriodEndTime: '15: 00', ReservationExpireTime: '14: 00', ReservationIsSuperseded: true,
				CollectStaff: 'Nurse to collect', AssociatedCollectionLocations: [{Code: 'OE', Description: 'OE', Id: '2237'}],
				AssociatedClients: [{Code: 'SC', Name: 'S Client', Id: '6813'}], AssociatedProviders:
				[{Code: 'SP', Id: '113618', CompanyName: 'S Provider'}], AssociatedPriorities:
				[{Code: 'R', Id: '12', Description: 'Routine'}], DisplayClient: true,  DisplayClientAddressAndPhone: false,
				DisplayCollectionLocation: false, DisplayHomeDrawAddress: true, DisplayPatientAddressAndPhone: false,
				DisplayPatientRoomBed: true, PatientIdentifier: '', PatientScanWristband: true, PatientWristbandCount: '2',
				PatientWristband1: 'Account Number', PatientWristbandBarcodeSegment1: '123', 'PatientWristband2': 'Driver\'s License',
				PatientWristbandBarcodeSegment2: '456', PatientWristbandBarcodeDelimiter: '~',
				PatientIdDocCount: '2', PatientIdDoc1: 'Patient Name', PatientIdDoc2: 'DOB', PatientScanId: true,
				PatientManualId: true, CanCancelOrder: true, CanRescheduleOrder: false, CanTransferToProblemList: true,
				CanIdentifyCollectionSite: false, CanAddCollectionNote: true, CanWorkloadCodeEntry: true, CanEnableGPSSupport: false,
				CanTriggerExceptionReport: true, CanGenerateCommunicationLabel: true, CanGroupByLocation: true, LabelNumberDefault: '10',
				LabelNumberMaximum: '15', CanUpdateCentralLineStatus: true, CentralLineDuration: '6', RequiredFormABN: true,
				RequiredFormFinancialResponsibility: true, RequiredFormRequisition: true
			};

			collectionListService.updateCollectionList(id, JSON.stringify(collectionListBody)).subscribe(responseUpdate => {
				expect(responseUpdate.status).toBe(200);
				console.log('Now try to delete...');
				collectionListService.deleteCollectionList(id).subscribe(responseDelete => {
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
