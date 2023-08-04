import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MessagingComponent } from './messaging/messaging.component';

const appRoutes: Routes = [
  { path: 'messaging', component: MessagingComponent },
  { path: '', redirectTo: 'messaging', pathMatch: 'full' },
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
