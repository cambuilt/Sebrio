import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { MatCardModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatSliderModule, MatRadioModule, MatAutocompleteModule } from '@angular/material';
import { MatSidenavModule, MatButtonModule, MatDialogModule, MatExpansionModule, MatListModule, MatGridListModule, MatSnackBarModule, MatIconModule, MatTabsModule } from '@angular/material';
import { MatMenuModule, MatToolbarModule, MatTableModule, MatSortModule, MatPaginatorModule, MatPaginatorIntl, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TenantMaintenanceComponent } from './tenant-maintenance/tenant-maintenance.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { HttpModule } from '@angular/http';
import { AuthService, LocalizedPaginator } from './services/auth.service';
import { TenantAddComponent } from './tenant-add/tenant-add.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { UserMaintenanceComponent } from './user-maintenance/user-maintenance.component';
import { UserAddComponent } from './user-add/user-add.component';
import { RoleMaintenanceComponent } from './role-maintenance/role-maintenance.component';
import { HttpClientModule } from '@angular/common/http';
import { UtilsService } from './services/utils.service';
import { TenantService } from './services/tenant.service';
import { HubMaintenanceComponent } from './hub-maintenance/hub-maintenance.component';
import { HubAddComponent } from './hub-add/hub-add.component';
import { CancellationMaintenanceComponent } from './cancellation-maintenance/cancellation-maintenance.component';
import { CancellationAddComponent } from './cancellation-add/cancellation-add.component';
import { PriorityMaintenanceComponent } from './priority-maintenance/priority-maintenance.component';
import { PriorityAddComponent } from './priority-add/priority-add.component';
import { PhonePipe } from './phone.pipe';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { TestAddComponent } from './test-add/test-add.component';
import { TestMaintenanceComponent } from './test-maintenance/test-maintenance.component';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { TableConfigurationComponent } from './table-configuration/table-configuration.component';
import { LocationMaintenanceComponent } from './location-maintenance/location-maintenance.component';
import { LocationAddComponent } from './location-add/location-add.component';
import { ContainerMaintenanceComponent } from './container-maintenance/container-maintenance.component';
import { ContainerAddComponent } from './container-add/container-add.component';
import { UserSelectorComponent } from './user-selector/user-selector.component';
import { LabAddComponent } from './lab-add/lab-add.component';
import { LabMaintenanceComponent } from './lab-maintenance/lab-maintenance.component';
import { ChangePasswordDrawerComponent } from './change-password-drawer/change-password-drawer.component';
import { DeviceMaintenanceComponent } from './device-maintenance/device-maintenance.component';
import { DeviceAddComponent } from './device-add/device-add.component';
import { ClientMaintenanceComponent } from './client-maintenance/client-maintenance.component';
import { ClientAddComponent } from './client-add/client-add.component';
import { RoleSelectorComponent } from './role-selector/role-selector.component';
import { RoleAddComponent } from './role-add/role-add.component';
import { ProviderMaintenanceComponent } from './provider-maintenance/provider-maintenance.component';
import { ProviderAddComponent } from './provider-add/provider-add.component';
import { SystemSettingsComponent } from './system-settings/system-settings.component';
import { LabSelectorComponent } from './lab-selector/lab-selector.component';
import { UserChipComponent } from './user-chip/user-chip.component';
import { CollectionListMaintenanceComponent } from './collection-list-maintenance/collection-list-maintenance.component';
import { CollectionListAddComponent } from './collection-list-add/collection-list-add.component';
import { NumericDirective } from './collection-list-add/numeric.directive';
import { PrioritySelectorComponent } from './priority-selector/priority-selector.component';
import { ProviderSelectorComponent } from './provider-selector/provider-selector.component';
import { ClientSelectorComponent } from './client-selector/client-selector.component';
import { LocationSelectorComponent } from './location-selector/location-selector.component';
import { UnsavedChangesDialogComponent } from './unsaved-changes-dialog/unsaved-changes-dialog.component';
import { EmailValidationDirective } from './validation/email-validation.directive';
import { PostalCodeValidationDirective } from './validation/postal-code-validation.directive';
import { FormatFileValidationDirective } from './validation/format-file-validation.directive';
import { PhoneValidationDirective } from './validation/phone-validation.directive';
import { FaxValidationDirective } from './validation/fax-validation.directive';
import { GenericRequiredValidationDirective } from './validation/generic-required-validation.directive';
import { ErrorGenerateDirective } from './validation/error-generate.directive';
import { HubSelectorComponent } from './hub-selector/hub-selector.component';
import { CurrentPasswordDirective } from './validation/current-password.directive';
import { PasswordConfirmDirective } from './validation/password-confirm.directive';
import { FillTimeDirective } from './collection-list-add/fill-time.directive';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { WorkListBuilderComponent } from './work-list-builder/work-list-builder.component';
import { WorkListCreateComponent } from './work-list-create/work-list-create.component';
import { ManualRefreshDirective } from './work-list-builder/manual-refresh.directive';
import { WorkListComponent } from './work-list/work-list.component';
import { WorkListCollectionComponent } from './work-list-collection/work-list-collection.component';
import { RedirectDialogComponent } from './redirect-dialog/redirect-dialog.component';
import { SubdomainValidationDirective } from './validation/subdomain-validation.directive';
import { SubdomainFormDirective } from './validation/subdomain-form.directive';
import { WorkListRequestDialogComponent } from './work-list-request-dialog/work-list-request-dialog.component';
import { IgxSliderModule, IgxInputGroupModule } from 'igniteui-angular';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { SubdomainDialogComponent } from './subdomain-dialog/subdomain-dialog.component';
import { WorkListGridComponent } from './work-list-builder/work-list-grid/work-list-grid.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { AuditingComponent } from './auditing/auditing.component';
import { FilterComponent } from './filter/filter.component';
import { UserModeComponent } from './user-mode/user-mode.component';
import { CodeValidationDirective } from './validation/code-validation.directive';
import { ConfirmReserveDialogComponent } from './work-list-builder/confirm-reserve-dialog/confirm-reserve-dialog.component';
import { CollectionSiteComponent } from './collection-site/collection-site.component';
import { CollectionSiteAddComponent } from './collection-site-add/collection-site-add.component';
import { WorkloadComponent } from './workload/workload.component';
import { WorkloadAddComponent } from './workload-add/workload-add.component';
import { RestrictByWidthDirective } from './validation/restrict-by-width.directive';
import {
	L10nConfig,
	L10nLoader,
	LocalizationModule,
	LocaleValidationModule,
	StorageStrategy,
	ProviderType
} from 'angular-l10n';
import { WorkListFilterComponent } from './work-list/work-list-filter/work-list-filter.component';
import { LabelMaintenanceComponent } from './label-maintenance/label-maintenance.component';
import { LabelAddComponent } from './label-add/label-add.component';
import { CharacterLimitValidatorDirective } from './validation/character-limit-validator.directive';
import { DateRangeLimitDirective } from './validation/date-range-limit.directive';
import { MessagingComponent } from './messaging/messaging.component';
import { FilterPhoneValidatorDirective } from './validation/filter-phone-validator.directive';
import { FilterEmailValidatorDirective } from './validation/filter-email-validator.directive';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { TimeRangeValidatorDirective } from './validation/time-range-validator.directive';
import { MessagingListAddDialogComponent } from './messaging-list-add-dialog/messaging-list-add-dialog.component';
import { SelectPrinterDialogComponent } from './select-printer-dialog/select-printer-dialog.component';
import { CollectionPeriodValidatorDirective } from './collection-list-add/collection-period-validator.directive';
import { TenantSelectorComponent } from './tenant-selector/tenant-selector.component';
import { MessagingChatComponent } from './messaging-chat/messaging-chat.component';
import { MessagingListAddComponent } from './messaging-list-add/messaging-list-add.component';
import { MccColorPickerModule } from 'material-community-components';
import { NotificationMessageComponent } from './notification-message/notification-message.component';
import { WorkListBuilderMobileComponent } from './work-list-builder/work-list-builder-mobile/work-list-builder-mobile.component';
import { WorkListBuilderMobileListComponent } from './work-list-builder/work-list-builder-mobile-list/work-list-builder-mobile-list.component';
import { WorkListBuilderDesktopComponent } from './work-list-builder/work-list-builder-desktop/work-list-builder-desktop.component';
import { WorkListMobileComponent } from './work-list/work-list-mobile/work-list-mobile.component';
import { WorkListDesktopComponent } from './work-list/work-list-desktop/work-list-desktop.component';
import { ColorPickerComponent } from './container-add/color-picker/color-picker.component';
import { ColorSliderComponent } from './container-add/color-picker/color-slider/color-slider.component';
import { ColorPaletteComponent } from './container-add/color-picker/color-palette/color-palette.component';
import { HexCodeDirective } from './container-add/color-picker/hex-code.directive';
import { MessagingService } from './services/messaging.service';
import { UtilizationComponent } from './utilization/utilization.component';
import { CollectionDurationComponent } from './collection-duration/collection-duration.component';
import { CollectionDataComponent } from './collection-data/collection-data.component';
import { TimeNumericDirective } from './collection-list-add/time-numeric.directive';
import { WorkListPreviewComponent } from './work-list/work-list-preview/work-list-preview.component';
import { WorkListPreviewTestComponent } from './work-list/work-list-preview/work-list-preview-test/work-list-preview-test.component';
import { WorkListLegendComponent } from './work-list/work-list-legend/work-list-legend.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WorkListCollectComponent } from './work-list/work-list-collect/work-list-collect.component';
import { WorkListIdentifyComponent } from './work-list/work-list-collect/work-list-identify/work-list-identify.component';
import { WorkListMenuComponent } from './work-list/work-list-collect/work-list-menu/work-list-menu.component';
import { WorkListPatientComponent } from './work-list/work-list-collect/work-list-patient/work-list-patient.component';
import { WorkListSelectComponent } from './work-list/work-list-collect/work-list-select/work-list-select.component';
import { WorkListLocationComponent } from './work-list/work-list-collect/work-list-location/work-list-location.component';
import { WorkListCentralLineComponent } from './work-list/work-list-collect/work-list-central-line/work-list-central-line.component';
import { WorkListPrintFormsComponent } from './work-list/work-list-collect/work-list-print-forms/work-list-print-forms.component';
import { WorkListProblemListComponent } from './work-list/work-list-collect/menu-items/work-list-problem-list/work-list-problem-list.component';
import { WorkListCancelComponent } from './work-list/work-list-collect/menu-items/work-list-cancel/work-list-cancel.component';
import { WorkListPrintCommComponent } from './work-list/work-list-collect/menu-items/work-list-print-comm/work-list-print-comm.component';
import { WorkListPrintPatientComponent } from './work-list/work-list-collect/menu-items/work-list-print-patient/work-list-print-patient.component';
import { WorkListRescheduleComponent } from './work-list/work-list-collect/menu-items/work-list-reschedule/work-list-reschedule.component';
import { WorkListTransferComponent } from './work-list/work-list-collect/menu-items/work-list-transfer/work-list-transfer.component';
import { CollectionMaintenanceComponent } from './collection-maintenance/collection-maintenance.component';
import { WorkListMenuSlideoutComponent } from './work-list/work-list-collect/work-list-menu-slideout/work-list-menu-slideout.component';
import { SlideoutDirective } from './work-list/work-list-collect/work-list-menu-slideout/slideout.directive';
import { WorkListCancelledComponent } from './work-list-builder/work-list-cancelled/work-list-cancelled.component';
import { CollectionTransferDrawerComponent } from './collection-transfer-drawer/collection-transfer-drawer.component';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { DocumentViewer } from '@ionic-native/document-viewer/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SignaturePadModule } from 'angular2-signaturepad';
import { CollectionLabelPrintComponent } from './work-list/work-list-collect/menu-items/collection-label-print/collection-label-print.component';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { PreviousTimeDirective } from './validation/previous-time.directive';
import { DeactivateRecordPopupComponent } from './deactivate-record-popup/deactivate-record-popup.component';
import { BarcodeSegmentDirective } from './validation/barcode-segment.directive';
import { CharLimitDirective } from './validation/char-limit.directive';
import { TwoStepVerificationComponent } from './two-step-verification/two-step-verification.component';
import { VolumeDirective } from './validation/volume.directive';
import { UsernameDirective } from './validation/username.directive';
import { SessionExpireDirective } from './validation/session-expire.directive';
import { FinancialResponsibilityFormComponent } from './financial-responsibility-form/financial-responsibility-form.component';
import { SignaturePadComponent } from './signature-pad/signature-pad.component';
import { LoginTwofactorComponent } from './login-twofactor/login-twofactor.component';
import { RequisitionFormComponent } from './requisition-form/requisition-form.component';
import { SecurityCodeValidationDirective } from './validation/security-code-validation.directive';
import { CodeLabValidationDirective } from './validation/code-lab-validation.directive';
import { DollarSignDirective } from './validation/dollar-sign.directive';
import { PrintService } from './services/print.service';
import { AbnFormComponent } from './abn-form/abn-form.component';
import { Printer } from '@ionic-native/printer/ngx';
import { SearchTimeDirective } from './validation/search-time.directive';

const l10nConfig: L10nConfig = {
	locale: {
		languages: [
			{ code: 'en', dir: 'ltr' },
			{ code: 'fr', dir: 'ltr' },
			{ code: 'es', dir: 'ltr' }
		],
		defaultLocale: { languageCode: 'en', countryCode: 'US', numberingSystem: 'latn' },
		currency: 'USD',
		storage: StorageStrategy.Cookie,
		cookieExpiration: 30
	},
	translation: {
		providers: [
			{ type: ProviderType.Static, prefix: './assets/locale-' }
		],
		caching: true,
		version: '5.2',
		composedKeySeparator: '.',
		missingValue: 'missing key',
		i18nPlural: true
	}
};

export function initL10n(l10nLoader: L10nLoader): Function {
	return () => l10nLoader.load();
}

@NgModule({
	entryComponents: [
		ChangePasswordComponent,
		TenantAddComponent,
		TestAddComponent,
		LandingPageComponent,
		UserAddComponent,
		HubAddComponent,
		CancellationAddComponent,
		PriorityAddComponent,
		ErrorDialogComponent,
		UnsavedChangesDialogComponent,
		RolePermissionComponent,
		LabAddComponent,
		DeviceAddComponent,
		RedirectDialogComponent,
		WorkListRequestDialogComponent,
		ConfirmReserveDialogComponent,
		DeleteDialogComponent,
		SubdomainDialogComponent,
		FilterComponent,
		CollectionSiteAddComponent,
		WorkloadAddComponent,
		LabelAddComponent,
		MessagingListAddDialogComponent,
		SelectPrinterDialogComponent,
		MessagingChatComponent,
		WorkListMenuSlideoutComponent,
		NotificationMessageComponent,
		PdfViewerComponent,
		CollectionLabelPrintComponent,
		DeactivateRecordPopupComponent,
		FinancialResponsibilityFormComponent,
		SignaturePadComponent,
		LoginTwofactorComponent,
		RequisitionFormComponent,
		AbnFormComponent
	],
	declarations: [
		AppComponent,
		LoginComponent,
		NotFoundComponent,
		TenantMaintenanceComponent,
		ChangePasswordComponent,
		TestMaintenanceComponent,
		TestAddComponent,
		TenantAddComponent,
		LandingPageComponent,
		NavBarComponent,
		UserAddComponent,
		UserMaintenanceComponent,
		RoleMaintenanceComponent,
		HubMaintenanceComponent,
		HubAddComponent,
		CancellationMaintenanceComponent,
		PreviousTimeDirective,
		CancellationAddComponent,
		PriorityMaintenanceComponent,
		PriorityAddComponent,
		PhonePipe,
		ErrorDialogComponent,
		TestAddComponent,
		TestMaintenanceComponent,
		RolePermissionComponent,
		TableConfigurationComponent,
		LocationMaintenanceComponent,
		LocationAddComponent,
		ContainerMaintenanceComponent,
		ContainerAddComponent,
		UserSelectorComponent,
		LabAddComponent,
		LabMaintenanceComponent,
		ChangePasswordDrawerComponent,
		DeviceMaintenanceComponent,
		DeviceAddComponent,
		ClientMaintenanceComponent,
		ClientAddComponent,
		RoleSelectorComponent,
		RoleAddComponent,
		ProviderMaintenanceComponent,
		ProviderAddComponent,
		SystemSettingsComponent,
		LabSelectorComponent,
		UserChipComponent,
		CollectionListMaintenanceComponent,
		CollectionListAddComponent,
		NumericDirective,
		PrioritySelectorComponent,
		ProviderSelectorComponent,
		ClientSelectorComponent,
		LocationSelectorComponent,
		UnsavedChangesDialogComponent,
		EmailValidationDirective,
		PostalCodeValidationDirective,
		PhoneValidationDirective,
		FaxValidationDirective,
		GenericRequiredValidationDirective,
		ErrorGenerateDirective,
		HubSelectorComponent,
		CurrentPasswordDirective,
		PasswordConfirmDirective,
		FillTimeDirective,
		WorkListBuilderComponent,
		WorkListCreateComponent,
		ManualRefreshDirective,
		WorkListComponent,
		WorkListCollectionComponent,
		RedirectDialogComponent,
		SubdomainValidationDirective,
		WorkListRequestDialogComponent,
		DeleteDialogComponent,
		SubdomainDialogComponent,
		WorkListGridComponent,
		NotificationsComponent,
		AuditingComponent,
		FilterComponent,
		UserModeComponent,
		SubdomainFormDirective,
		CodeValidationDirective,
		ConfirmReserveDialogComponent,
		CollectionSiteComponent,
		CollectionSiteAddComponent,
		WorkloadComponent,
		WorkloadAddComponent,
		RestrictByWidthDirective,
		WorkListFilterComponent,
		LabelMaintenanceComponent,
		LabelAddComponent,
		CharacterLimitValidatorDirective,
		CodeLabValidationDirective,
		DateRangeLimitDirective,
		MessagingComponent,
		FilterPhoneValidatorDirective,
		FilterEmailValidatorDirective,
		CollectionPeriodValidatorDirective,
		FormatFileValidationDirective,
		TimeRangeValidatorDirective,
		MessagingListAddDialogComponent,
		MessagingListAddDialogComponent,
		SelectPrinterDialogComponent,
		MessagingListAddDialogComponent,
		SelectPrinterDialogComponent,
		CollectionPeriodValidatorDirective,
		TenantSelectorComponent,
		MessagingChatComponent,
		MessagingListAddComponent,
		NotificationMessageComponent,
		WorkListBuilderMobileComponent,
		WorkListBuilderDesktopComponent,
		WorkListBuilderMobileListComponent,
		WorkListMobileComponent,
		WorkListDesktopComponent,
		ColorPickerComponent,
		ColorSliderComponent,
		ColorPaletteComponent,
		HexCodeDirective,
		UtilizationComponent,
		CollectionDurationComponent,
		CollectionDataComponent,
		TimeNumericDirective,
		WorkListPreviewComponent,
		WorkListPreviewTestComponent,
		WorkListLegendComponent,
		WorkListCollectComponent,
		WorkListIdentifyComponent,
		WorkListMenuComponent,
		WorkListPatientComponent,
		WorkListSelectComponent,
		WorkListLocationComponent,
		WorkListCentralLineComponent,
		WorkListPrintFormsComponent,
		WorkListProblemListComponent,
		WorkListCancelComponent,
		WorkListPrintCommComponent,
		WorkListPrintPatientComponent,
		WorkListRescheduleComponent,
		WorkListTransferComponent,
		CollectionMaintenanceComponent,
		WorkListMenuSlideoutComponent,
		SlideoutDirective,
		WorkListCancelledComponent,
		CollectionTransferDrawerComponent,
		PdfViewerComponent,
		CollectionLabelPrintComponent,
		DeactivateRecordPopupComponent,
		BarcodeSegmentDirective,
		CharLimitDirective,
		TwoStepVerificationComponent,
		VolumeDirective,
		UsernameDirective,
		SessionExpireDirective,
		FinancialResponsibilityFormComponent,
		SignaturePadComponent,
		LoginTwofactorComponent,
		RequisitionFormComponent,
		SecurityCodeValidationDirective,
		DollarSignDirective,
		AbnFormComponent,
		SearchTimeDirective,
	],
	imports: [
		BrowserAnimationsModule,
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatSlideToggleModule,
		MatSliderModule,
		MatButtonModule,
		MatDialogModule,
		MatExpansionModule,
		MatToolbarModule,
		MatSidenavModule,
		MatSelectModule,
		MatMenuModule,
		MatTableModule,
		MatSortModule,
		MatPaginatorModule,
		MatProgressSpinnerModule,
		MatCheckboxModule,
		MatRadioModule,
		MatListModule,
		MatGridListModule,
		MatSnackBarModule,
		MatChipsModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatIconModule,
		MatTabsModule,
		MatAutocompleteModule,
		MatMomentDateModule,
		MccColorPickerModule,
		IgxSliderModule,
		IgxInputGroupModule,
		BrowserAnimationsModule,
		HttpClientModule,
		HttpModule,
		PdfViewerModule,
		SignaturePadModule,
		DeviceDetectorModule.forRoot(),
		LocalizationModule.forRoot(l10nConfig),
		LocaleValidationModule.forRoot(),
		RouterModule.forRoot([
			{ path: '', component: LoginComponent },
			{ path: 'tenants', component: TenantMaintenanceComponent },
			{ path: 'auditing', component: AuditingComponent },
			{ path: 'users', component: UserMaintenanceComponent },
			{ path: 'roles', component: RoleMaintenanceComponent },
			{ path: 'hubs', component: HubMaintenanceComponent },
			{ path: 'cancellations', component: CancellationMaintenanceComponent },
			{ path: 'tests', component: TestMaintenanceComponent },
			{ path: 'priorities', component: PriorityMaintenanceComponent },
			{ path: 'locations', component: LocationMaintenanceComponent },
			{ path: 'labels', component: LabelMaintenanceComponent },
			{ path: 'labs', component: LabMaintenanceComponent },
			{ path: 'containers', component: ContainerMaintenanceComponent },
			{ path: 'clients', component: ClientMaintenanceComponent },
			{ path: 'providers', component: ProviderMaintenanceComponent },
			{ path: 'devices', component: DeviceMaintenanceComponent },
			{ path: 'collection-maintenance', component: CollectionMaintenanceComponent },
			{ path: 'collection-list', component: CollectionListMaintenanceComponent },
			{ path: 'collection-data', component: CollectionDataComponent },
			{ path: 'collection-duration', component: CollectionDurationComponent },
			{ path: 'collection-site', component: CollectionSiteComponent },
			{ path: 'work-list-builder', component: WorkListBuilderComponent },
			{ path: 'work-list', component: WorkListComponent },
			{ path: 'user-mode', component: UserModeComponent },
			{ path: 'workload', component: WorkloadComponent },
			{ path: 'utilization', component: UtilizationComponent },
			{ path: 'work-list-grid', component: WorkListGridComponent },
			{ path: '**', component: UserMaintenanceComponent }
		])
	],
	providers: [
		AuthService,
		UtilsService,
		TenantService,
		PhonePipe,
		MessagingService,
		BluetoothSerial,
		LaunchNavigator,
		DocumentViewer,
		InAppBrowser,
		BarcodeScanner,
		PrintService,
		Printer,
		{
			provide: APP_INITIALIZER,
			useFactory: initL10n,
			deps: [L10nLoader],
			multi: true
		},
		{
			provide: MatPaginatorIntl,
			useClass: LocalizedPaginator
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
