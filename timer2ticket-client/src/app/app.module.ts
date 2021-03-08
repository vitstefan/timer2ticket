import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { UserService } from './services/user.service';
import { LoginComponent } from './components/auth/login/login.component';
import { LogoutComponent } from './components/auth/logout/logout.component';
import { RegistrationComponent } from './components/auth/registration/registration.component';
import { AppData } from './singletons/app-data';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { RegistrationService } from './services/registration.service';
import { AuthenticationService } from './services/authentication.service';
import { ServicesChooseComponent } from './components/config-steps/services-choose/services-choose.component';
import { OverviewComponent } from './components/overview/overview.component';
import { RedmineConfigurationComponent } from './components/config-steps/redmine-configuration/redmine-configuration.component';
import { TogglTrackConfigurationComponent } from './components/config-steps/toggl-track-configuration/toggl-track-configuration.component';
import { ScheduleComponent } from './components/config-steps/schedule/schedule.component';
import { ConfirmationComponent } from './components/config-steps/confirmation/confirmation.component';
import { HttpHeaderInterceptor } from './interceptors/http-header.interceptor';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { SyncedServicesConfigService } from './services/synced-services-config.service';
import { JobService } from './services/job.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LogoutComponent,
    RegistrationComponent,
    ConfirmDialogComponent,
    ServicesChooseComponent,
    OverviewComponent,
    RedmineConfigurationComponent,
    TogglTrackConfigurationComponent,
    ScheduleComponent,
    ConfirmationComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpHeaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    AppData,
    RegistrationService,
    AuthenticationService,
    UserService,
    SyncedServicesConfigService,
    JobService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
