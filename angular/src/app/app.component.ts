import { Component, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

@Injectable()

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
		iconRegistry.addSvgIcon(
			'lock',
			sanitizer.bypassSecurityTrustResourceUrl('assets/iconLoginLock.svg')
		);
		iconRegistry.addSvgIcon(
			'guy',
			sanitizer.bypassSecurityTrustResourceUrl('assets/iconLoginUser.svg')
		);
		iconRegistry.addSvgIcon(
			'reports',
			sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/outline-description-24px.svg'))
			.addSvgIcon(
				'security',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/vpn_key_outline.svg'))
			.addSvgIcon(
				'relationship',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/how_to_reg_outline.svg'))
			.addSvgIcon(
				'list',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/view_list_outline.svg'))
			.addSvgIcon(
				'logout',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/exit_to_app.svg'))
			.addSvgIcon(
				'change-pass',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/lock.svg'))
			.addSvgIcon(
				'landing_page',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/web.svg'))
			.addSvgIcon(
				'ellipsis',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/vertical_ellipsis.svg'))
			.addSvgIcon(
				'library_books',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/outline-library_books-24px.svg'))
			.addSvgIcon(
				'edit_profile',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/edit_profile_outline.svg'))
			.addSvgIcon(
				'locked',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/outline-lock-24px.svg'))
			.addSvgIcon(
				'other_reserved',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/baseline-check_circle_outline-24px.svg'))
			.addSvgIcon(
				'blocked',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/baseline-block-24px.svg'))
			.addSvgIcon(
				'message_outline',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/outline-message-24px.svg'))
			.addSvgIcon(
				'portrait_outline',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/outline-portrait-24px.svg'))
			.addSvgIcon(
				'delete_sweep_outline',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/outline-delete_sweep.svg'))
			.addSvgIcon(
				'highlight_outline',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/outline-highlight-24px.svg'))
			.addSvgIcon(
				'filter_applied',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/filter-used2.svg'))
			.addSvgIcon(
				'eye_outline',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/outline-remove_red_eye-24px.svg'))
			.addSvgIcon(
				'list_outline',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/outline-list-24px.svg'))
			.addSvgIcon(
				'center_focus',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/baseline-center_focus_strong-24px.svg'))
			.addSvgIcon(
				'disabled_collection',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/No_check_box-24px.svg'))
			.addSvgIcon(
				'gps',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/baseline-gps_fixed-24px.svg'))
			.addSvgIcon(
				'problem_list',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/outline-report_problem-24px.svg'))
			.addSvgIcon(
				'new_record',
				sanitizer.bypassSecurityTrustResourceUrl('assets/icon-registry/baseline-save_alt-24px.svg'))
			;
	}
}
