import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AppData } from 'src/app/singletons/app-data';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  public preAuthenticatedUser = {
    username: '',
    password: ''
  };
  public rememberCredentials: Boolean = true;
  public displayPassword: Boolean = false;

  private $_userSubscription: Subscription;

  constructor(
    private _appData: AppData,
    private _authenticationService: AuthenticationService,
    private _router: Router,
    public app: AppComponent,
  ) { }

  ngOnInit(): void {
    this.rememberCredentials = localStorage?.rememberCredentials === 'true' ?? true;

    if (this.rememberCredentials) {
      this.preAuthenticatedUser.username = localStorage.username ?? '';
    }
  }

  ngOnDestroy(): void {
    this.$_userSubscription?.unsubscribe();
  }

  changeRememberCredentials(): void {
    localStorage.rememberCredentials = this.rememberCredentials;

    if (this.rememberCredentials === false) {
      localStorage.username = '';
    }
  }

  authenticate(): void {
    this.app.showLoading();
    this.$_userSubscription = this._authenticationService
      .authenticate(this.preAuthenticatedUser.username, this.preAuthenticatedUser.password)
      .subscribe((user) => {
        if (user) {
          this._appData.setUser(user);
          if (this.rememberCredentials) {
            localStorage.username = user.username;
          }
          this._redirect();
        }
        this.app.hideLoading();
      }, (errorStatus) => {
        console.log(errorStatus);
        if (errorStatus < 500) {
          this.app.buildNotification('Wrong email or password.');
        } else {
          this.app.buildNotification('Server did not respond. Try again please.');
        }
        this.app.hideLoading();
      });
  }

  private _redirect(): void {
    const user = this._appData.userValue;
    if (user) {
      if (user.status === 'registrated') {
        this._router.navigate(['config-steps/services-choose'], { replaceUrl: true });
      } else {
        this._router.navigate(['overview'], { replaceUrl: true });
      }
    }
  }
}
