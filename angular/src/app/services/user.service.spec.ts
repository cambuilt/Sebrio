import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { async as _async } from 'rxjs/scheduler/async';

let authService: AuthService;
let userService: UserService;

describe('UserService', () => {
	let mockRouter;
	let mockMatDialog;
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

	beforeEach(() => {
		mockRouter = new MockRouter(); mockMatDialog = new MockMatDialog();

		TestBed.configureTestingModule({
			imports: [HttpModule, HttpClientModule],
			providers: [BluetoothSerial, AuthService, UserService,
				{ provide: Router, useValue: mockRouter },
				{ provide: MatDialog, useValue: mockMatDialog }]
		});

		authService = TestBed.get(AuthService);
		userService = TestBed.get(UserService);
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

	// it('should create a new user', done => {
	// 	authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
	// 	const user = {
	// 		BadgeID: '8675309',
	// 		Code: '288829937',
	// 		FirstName: 'Bill',
	// 		LastName: 'Paxton',
	// 		Email: 'josh.jancula@sebrio.com',
	// 		IsActive: true,
	// 		Password: '',
	// 		Username: 'billypax',
	// 		PhoneNumber: '(555) 555-5555',
	// 		Role: {
	// 			Name: 'rhodes_tsa',
	// 			Id: '4'
	// 		},
	// 		ResetPassword: false
	// 	};
	// 	userService.createUser(JSON.stringify(user)).subscribe(response => {
	// 		expect(response.status).toBe(200);
	// 		userService.getUsers();
	// 		done();
	// 	}, error => {
	// 		fail(error);
	// 	});
	// });

	it('should get users', done => {
		authService.currentUser.role = 'RMP_TSA';
		userService.getUsers();
		done();
	});

	it('should get and edit the user', done => {
		setTimeout(() => {
		authService.currentUser.role = 'RMP_TSA';  // Somehow, role gets lost.
		userService.users.subscribe(response => {
			console.log('response from users: ', response as any[]);
			// expect(response.length).toBeGreaterThan(0);
			// const users = response;
			// let id;
			// users.forEach(u => {
			// 	if (u.Username === 'billypax') {
			// 		id = u.Id;
			// 	}
			// });
			// const user = {
			// 	BadgeID: '8675309',
			// 	Code: '288829937',
			// 	FirstName: 'Bill',
			// 	LastName: 'Paxton',
			// 	Email: 'josh.jancula@sebrio.com',
			// 	IsActive: false,
			// 	Password: '',
			// 	Username: 'billypax',
			// 	PhoneNumber: '(555) 555-5522',
			// 	Role: {
			// 		Name: 'rhodes_tsa',
			// 		Id: '4'
			// 	},
			// 	ResetPassword: false
			// };
			// userService.updateUser(id, JSON.stringify(user)).subscribe(responseUpdate => {
			// 	expect(responseUpdate.status).toBe(200);
			// }, error => {
			// 	fail(error);
			// });
			done();
		}, error => {
			console.log('error getting users: ', error);
			fail(error);
		});
	}, 4000);
	});
});

class MockRouter {
	//noinspection TypeScriptUnresolvedFunction
	navigate = jasmine.createSpy('navigate');
}
class MockMatDialog {

}
