import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { ServiceDefinition } from 'src/app/models/service_definition/service_definition';
import { ServiceObject } from 'src/app/models/service_object';
import { User } from 'src/app/models/user';
import { SyncedServicesConfigService } from 'src/app/services/synced-services-config.service';
import { AppData } from 'src/app/singletons/app-data';

@Component({
  selector: 'app-redmine-configuration',
  templateUrl: './redmine-configuration.component.html',
  styleUrls: ['./redmine-configuration.component.css']
})
export class RedmineConfigurationComponent implements OnInit, OnDestroy {

  constructor(
    private _appData: AppData,
    private _syncedServicesConfigService: SyncedServicesConfigService,
    public app: AppComponent,
  ) { }

  private _route = 'config-steps/redmine-configuration';

  private $_userSubscription: Subscription;
  private $_stepsCountSubscription: Subscription;

  public user: User;
  public stepsCount: number;

  public steps;

  public defaultTimeEntryActivity: ServiceObject;

  public showTimeEntryActivities: boolean;

  public timeEntryActivities: ServiceObject[];

  public serviceDefinition: ServiceDefinition;

  ngOnInit(): void {
    this.$_userSubscription = this._appData.user.subscribe(user => {
      this.user = user;

      const redmineServiceDefinition = this.user.serviceDefinitions.find(sd => sd.name === 'Redmine');
      if (redmineServiceDefinition) {
        this.serviceDefinition = redmineServiceDefinition;
      } else {
        // for now Redmine is primary
        this.serviceDefinition = new ServiceDefinition('Redmine', true);
      }
      this.defaultTimeEntryActivity = null;
    });
    this.$_stepsCountSubscription = this._appData.stepsCount.subscribe(stepsCount => this.stepsCount = stepsCount);

    this.steps = this._appData.getStepsForCurrentRoute(this._route);

    this.timeEntryActivities = [];

    this.showTimeEntryActivities = false;
  }

  ngOnDestroy(): void {
    this.$_userSubscription?.unsubscribe();
    this.$_stepsCountSubscription?.unsubscribe();
  }

  public checkIfCorrect(): void {
    this.app.showLoading();
    this._syncedServicesConfigService
      .redmineTimeEntryActivities(this.serviceDefinition.apiKey, this.serviceDefinition.config.apiPoint)
      .subscribe(data => {
        this.serviceDefinition.config.userId = data.user_id;

        this.timeEntryActivities = data.time_entry_activities;
        if (this.serviceDefinition.config.defaultTimeEntryActivityId) {
          this.defaultTimeEntryActivity = this.timeEntryActivities.find(tea => tea.id === this.serviceDefinition.config.defaultTimeEntryActivityId) ?? null;
        } else if (this.timeEntryActivities.length > 0) {
          this.defaultTimeEntryActivity = this.timeEntryActivities[0];
        }

        // this correction is also made on API's side
        // add last / if not provided by user
        this.serviceDefinition.config.apiPoint
          = this.serviceDefinition.config.apiPoint.endsWith('/')
            ? this.serviceDefinition.config.apiPoint
            : `${this.serviceDefinition.config.apiPoint}/`;
        // add https:// if not provided by user
        this.serviceDefinition.config.apiPoint
          = (this.serviceDefinition.config.apiPoint.startsWith('https://') || this.serviceDefinition.config.apiPoint.startsWith('http://'))
            ? this.serviceDefinition.config.apiPoint
            : `https://${this.serviceDefinition.config.apiPoint}`;

        this.showTimeEntryActivities = true;
        this.app.hideLoading();
        this.app.buildNotification('It seems OK! Choose your default activity and continue with next step.');
      }, (error) => {
        this.app.hideLoading();
        this.app.buildNotification('Something went wrong. Check the fields again please.');
      });
  }

  public changeDefaultTimeEntryActivity(): void {
    this.serviceDefinition.config.defaultTimeEntryActivityId = Number(this.defaultTimeEntryActivity.id);
  }

  public nextStep(): void {
    this.serviceDefinition.config.defaultTimeEntryActivityId = Number(this.defaultTimeEntryActivity.id);
    const index = this.user.serviceDefinitions.findIndex(serviceDefinition => serviceDefinition.name === 'Redmine');
    if (index !== -1) {
      this.user.serviceDefinitions.splice(index, 1);
    }
    this.user.serviceDefinitions.push(this.serviceDefinition);
  }

}
