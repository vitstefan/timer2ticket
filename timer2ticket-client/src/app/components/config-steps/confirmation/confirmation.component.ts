import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { AppData } from 'src/app/singletons/app-data';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit, OnDestroy {

  constructor(
    private _appData: AppData,
    public app: AppComponent,
    private _router: Router,
    private _userService: UserService,
  ) { }

  private _route = 'config-steps/confirmation';

  private $_userSubscription: Subscription;
  private $_stepsCountSubscription: Subscription;

  public user: User;
  public stepsCount: number;

  public steps;

  public allServices: string[];
  public primaryService: string;
  public otherServices: string[];

  ngOnInit(): void {
    this.$_userSubscription = this._appData.user.subscribe(user => {
      this.user = user;

      this.allServices = [];
      this.otherServices = [];

      this.user.serviceDefinitions.forEach(serviceDefinition => {
        const label = this._appData.getServiceLabel(serviceDefinition.name);
        if (serviceDefinition.isPrimary) {
          this.primaryService = label;
        } else {
          this.otherServices.push(label);
        }
        this.allServices.push(label);
      });
    });
    this.$_stepsCountSubscription = this._appData.stepsCount.subscribe(stepsCount => this.stepsCount = stepsCount);

    this.steps = this._appData.getStepsForCurrentRoute(this._route);
  }

  ngOnDestroy(): void {
    this.$_userSubscription?.unsubscribe();
    this.$_stepsCountSubscription?.unsubscribe();
  }

  public confirm(): void {
    // send request to t2t API to update user
    // if everything ok and saved in db, then send another request to start syncing
    this.app.showLoading();
    this._userService.update(this.user).subscribe(user => {
      this.user = user;
      this._appData.setUser(this.user);
      this._router.navigate(['overview']);
      this.app.hideLoading();
      this.app.buildNotification('Your configuration was successfully saved. However something went wrong with syncing. Try to sync manually.');
      // this.app.buildNotification('You\'re synced! Your configuration was successfully saved.');
      // TODO send another request
    }, (error) => {
      this.app.hideLoading();
      this.app.buildNotification('Something went wrong. Try to confirm once again please.');
    });


    // this.app.showLoading();
    // this._syncedServicesConfigService
    //   .redmineTimeEntryActivities(this.serviceDefinition.apiKey, this.serviceDefinition.config.apiPoint)
    //   .subscribe(data => {
    //     this.serviceDefinition.config.userId = data.user_id;

    //     this.timeEntryActivities = data.time_entry_activities;
    //     if (this.serviceDefinition.config.defaultTimeEntryActivityId) {
    //       this.defaultTimeEntryActivity = this.timeEntryActivities.find(tea => tea.id === this.serviceDefinition.config.defaultTimeEntryActivityId) ?? null;
    //     } else if (this.timeEntryActivities.length > 0) {
    //       this.defaultTimeEntryActivity = this.timeEntryActivities[0];
    //     }

    //     this.showTimeEntryActivities = true;
    //     this.app.hideLoading();
    //     this.app.buildNotification('It seems OK! Choose your default activity and continue with next step.');
    //   }, (error) => {
    //     this.app.hideLoading();
    //     this.app.buildNotification('Something went wrong. Check the fields again please.');
    //   });
  }

}
