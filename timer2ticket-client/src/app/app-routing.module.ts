import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { LogoutComponent } from './components/auth/logout/logout.component';
import { RegistrationComponent } from './components/auth/registration/registration.component';
import { ConfirmationComponent } from './components/config-steps/confirmation/confirmation.component';
import { RedmineConfigurationComponent } from './components/config-steps/redmine-configuration/redmine-configuration.component';
import { ScheduleComponent } from './components/config-steps/schedule/schedule.component';
import { ServicesChooseComponent } from './components/config-steps/services-choose/services-choose.component';
import { TogglTrackConfigurationComponent } from './components/config-steps/toggl-track-configuration/toggl-track-configuration.component';
import { OverviewComponent } from './components/overview/overview.component';
import { AuthGuard } from './guards/auth.guard';
import { OverviewGuard } from './guards/overview.guard';

const routes = [
  { path: 'registration', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent, canActivate: [AuthGuard] },
  { path: 'config-steps/services-choose', component: ServicesChooseComponent, canActivate: [AuthGuard] },
  { path: 'config-steps/redmine-configuration', component: RedmineConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'config-steps/toggl-track-configuration', component: TogglTrackConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'config-steps/schedule', component: ScheduleComponent, canActivate: [AuthGuard] },
  { path: 'config-steps/confirmation', component: ConfirmationComponent, canActivate: [AuthGuard] },
  { path: 'overview', component: OverviewComponent, canActivate: [AuthGuard, OverviewGuard] },

  //{ path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
