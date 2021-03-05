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

  private _$userSubscription: Subscription;

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

    // TODO delete - login automatically
    // this.testLogin();
  }

  ngOnDestroy(): void {
    if (this._$userSubscription) {
      this._$userSubscription.unsubscribe();
    }
  }

  changeRememberCredentials(): void {
    localStorage.rememberCredentials = this.rememberCredentials;

    if (this.rememberCredentials === false) {
      localStorage.username = '';
    }
  }

  authenticate(): void {
    this._$userSubscription = this._authenticationService
      .authenticate(this.preAuthenticatedUser.username, this.preAuthenticatedUser.password)
      .subscribe((user) => {
        if (user) {
          this._appData.setUser(user);
          if (this.rememberCredentials) {
            localStorage.username = user.username;
          }
          this.redirect();
        }
      }, (error) => {
        this.app.buildNotification('Wrong email or password.');
      });
  }

  private redirect(): void {
    const user = this._appData.getUser();
    if (user) {
      if (user.status === 'registrated') {
        this._router.navigate(['main-view/services-choose'], { replaceUrl: true });
      } else {
        // TODO navigate to overview
        this._router.navigate(['main-view/services-choose'], { replaceUrl: true });
      }
    }
  }

  private testLogin(): void {
    this.preAuthenticatedUser.username = 'test@test.test';
    this.preAuthenticatedUser.password = 'password123';
    this.authenticate();
  }
}
