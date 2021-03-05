import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from './models/user.model';
import { AppData } from './singletons/app-data';

declare var buildNotification: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  public user: User;

  private $_userSubscription: Subscription;

  constructor(
    private _router: Router,
    private _appData: AppData,
  ) { }

  ngOnInit(): void {
    //redirect to login right away
    this.redirectToLogin();

    this.$_userSubscription = this._appData.user.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.$_userSubscription?.unsubscribe();
  }

  private redirectToLogin(): void {
    this._router.navigate(['login'], { replaceUrl: true });
  }

  public buildNotification(content: String) {
    new buildNotification(content, 0, 0, 3, 0, 2);
  }
}
