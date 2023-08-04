import { RoleService } from './role.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';

let authService: AuthService;
let roleService: RoleService;

describe('RoleService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({
			imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, RoleService,
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialog, useValue: mockMatDialog }]
		});

		authService = TestBed.get(AuthService);
		roleService = TestBed.get(RoleService);
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

	it('should create role', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		const body = {
			AuthenticationFactor: {Code: '', Description: '', Id: ''},
			Description: 'Kaiser', Id: '', Is2FAEnabled: false, IsActive: true,
			Name: 'KR', Permissions: [
			{Code: 'rmp_auditmaintenance', Description: 'User can maintain Audit Logs'},
			{Code: 'rmp_broadcastgroupmaintenance', Description: 'User can maintain Broadcast Groups'},
			{Code: 'rmp_cancelreasonmaintenance', Description: 'User can maintain Cancellations'},
			{Code: 'rmp_clientmaintenance', Description: 'User can maintain Clients'},
			{Code: 'rmp_collectiondatamaintenance', Description: 'User can maintain Collection Data'},
			{Code: 'rmp_collectiondurationmaintenance', Description: 'User can maintain Collection Duration'},
			{Code: 'rmp_collectionlistmaintenance', Description: 'User can maintain Collection Lists'},
			{Code: 'rmp_collectionmaintenance', Description: 'User can maintain Collections'},
			{Code: 'rmp_collectionsitemaintenance', Description: 'User can maintain Collection Sites'},
			{Code: 'rmp_containermaintenance', Description: 'User can maintain Containers'},
			{Code: 'rmp_devicemaintenance', Description: 'User can maintain Devices'},
			{Code: 'rmp_hubmaintenance', Description: 'User can maintain HUBs'},
			{Code: 'rmp_labelmaintenance', Description: 'User can maintain Labels'},
			{Code: 'rmp_labmaintenance', Description: 'User can maintain Labs'},
			{Code: 'rmp_locationmaintenance', Description: 'User can maintain Locations'},
			{Code: 'rmp_prioritymaintenance', Description: 'User can maintain Priorities'},
			{Code: 'rmp_providermaintenance', Description: 'User can maintain Providers'},
			{Code: 'rmp_rolemaintenance', Description: 'User can maintain Roles'},
			{Code: 'rmp_systemmaintenance', Description: 'User can maintain System Settings'},
			{Code: 'rmp_testmaintenance', Description: 'User can maintain Tests'},
			{Code: 'rmp_usermaintenance', Description: 'User can maintain Users'},
			{Code: 'rmp_usermode', Description: 'User can monitor User Modes'},
			{Code: 'rmp_utilizationmaintenance', Description: 'User can maintain Utilizations'},
			{Code: 'rmp_worklistmaintenance', Description: 'User can maintain Work Lists'},
			{Code: 'rmp_workloadmaintenance', Description: 'User can maintain Work Loads'}],
			Users: [{Username: 'barrytsa'}, {Username: 'barrymessage'}]
		};

		roleService.createRole(JSON.stringify(body)).subscribe(response => {
			expect(response.status).toBe(200);
			done();
		}, error => {
			fail(error);
		});
	});

	it('should get, edit and delete role', done => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		roleService.getRoles().subscribe(response => {
			expect(response.status).toBe(200);
			const groups = response.json();
			const id = groups[groups.length - 1]['Id'];
			const body = {
				AuthenticationFactor: {Code: '', Description: '', Id: ''},
				Description: 'Dinner', Id: '', Is2FAEnabled: false, IsActive: true,
				Name: 'DR', Permissions: [
				{Code: 'rmp_auditmaintenance', Description: 'User can maintain Audit Logs'},
				{Code: 'rmp_broadcastgroupmaintenance', Description: 'User can maintain Broadcast Groups'},
				{Code: 'rmp_cancelreasonmaintenance', Description: 'User can maintain Cancellations'},
				{Code: 'rmp_clientmaintenance', Description: 'User can maintain Clients'},
				{Code: 'rmp_collectiondatamaintenance', Description: 'User can maintain Collection Data'},
				{Code: 'rmp_collectiondurationmaintenance', Description: 'User can maintain Collection Duration'},
				{Code: 'rmp_collectionlistmaintenance', Description: 'User can maintain Collection Lists'},
				{Code: 'rmp_collectionmaintenance', Description: 'User can maintain Collections'},
				{Code: 'rmp_collectionsitemaintenance', Description: 'User can maintain Collection Sites'},
				{Code: 'rmp_containermaintenance', Description: 'User can maintain Containers'},
				{Code: 'rmp_devicemaintenance', Description: 'User can maintain Devices'},
				{Code: 'rmp_hubmaintenance', Description: 'User can maintain HUBs'},
				{Code: 'rmp_labelmaintenance', Description: 'User can maintain Labels'},
				{Code: 'rmp_labmaintenance', Description: 'User can maintain Labs'},
				{Code: 'rmp_locationmaintenance', Description: 'User can maintain Locations'},
				{Code: 'rmp_prioritymaintenance', Description: 'User can maintain Priorities'},
				{Code: 'rmp_providermaintenance', Description: 'User can maintain Providers'},
				{Code: 'rmp_rolemaintenance', Description: 'User can maintain Roles'},
				{Code: 'rmp_systemmaintenance', Description: 'User can maintain System Settings'},
				{Code: 'rmp_testmaintenance', Description: 'User can maintain Tests'},
				{Code: 'rmp_usermaintenance', Description: 'User can maintain Users'},
				{Code: 'rmp_usermode', Description: 'User can monitor User Modes'},
				{Code: 'rmp_utilizationmaintenance', Description: 'User can maintain Utilizations'},
				{Code: 'rmp_worklistmaintenance', Description: 'User can maintain Work Lists'},
				{Code: 'rmp_workloadmaintenance', Description: 'User can maintain Work Loads'}],
				Users: [{Username: 'barrytsa'}, {Username: 'barrymessage'}]
			};

			roleService.updateRole(id, JSON.stringify(body)).subscribe(responseUpdate => {
				expect(responseUpdate.status).toBe(200);
				roleService.deleteRole(id).subscribe(responseDelete => {
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
