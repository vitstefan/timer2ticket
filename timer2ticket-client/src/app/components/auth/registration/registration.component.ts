import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { RegistrationService } from 'src/app/services/registration.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnDestroy {

  public preRegistratedUser = {
    username: '',
    password: '',
    passwordAgain: '',
  };

  private $_isRegistrationOkSubscription: Subscription;

  constructor(
    private _registrationService: RegistrationService,
    private _router: Router,
    public app: AppComponent,
  ) { }

  ngOnDestroy(): void {
    this.$_isRegistrationOkSubscription?.unsubscribe();
  }

  registrate(): void {
    if (this.preRegistratedUser.password !== this.preRegistratedUser.passwordAgain) {
      this.app.buildNotification('Passwords are not same.');
    } else {
      this.app.showLoading();
      this.$_isRegistrationOkSubscription = this._registrationService.registrate(
        this.preRegistratedUser.username,
        this.preRegistratedUser.password,
        this.preRegistratedUser.passwordAgain,
      ).subscribe(() => {

        localStorage.rememberCredentials = true;
        localStorage.username = this.preRegistratedUser.username;

        this.redirect();
        this.app.hideLoading();
        this.app.buildNotification('Successfully registrated. Please log in to continue.');
      }, (errorStatus) => {
        console.log(errorStatus);
        if (errorStatus === 409) {
          this.app.buildNotification('User with this email already exists.');
        } else if (errorStatus === 400) {
          this.app.buildNotification('Passwords are not same.');
        } else {
          this.app.buildNotification('Server did not respond. Try again please.');
        }
        this.app.hideLoading();
      });
    }
  }

  private redirect(): void {
    this._router.navigate(['login']);
  }
}
