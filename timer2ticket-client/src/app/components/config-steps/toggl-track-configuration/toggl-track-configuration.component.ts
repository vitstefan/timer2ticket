import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { ServiceDefinition } from 'src/app/models/service_definition/service_definition';
import { ServiceObject } from 'src/app/models/service_object';
import { User } from 'src/app/models/user';
import { SyncedServicesConfigService } from 'src/app/services/synced-services-config.service';
import { AppData } from 'src/app/singletons/app-data';

@Component({
  selector: 'app-toggl-track-configuration',
  templateUrl: './toggl-track-configuration.component.html',
  styleUrls: ['./toggl-track-configuration.component.css']
})
export class TogglTrackConfigurationComponent implements OnInit, OnDestroy {

  constructor(
    private _appData: AppData,
    private _syncedServicesConfigService: SyncedServicesConfigService,
    public app: AppComponent,
  ) { }

  private _route = 'config-steps/toggl-track-configuration';

  private $_userSubscription: Subscription;
  private $_stepsCountSubscription: Subscription;

  public user: User;
  public stepsCount: number;

  public steps;

  public chosenWorkspace: ServiceObject;

  public showWorkspaceField: boolean;

  public workspaces: ServiceObject[];

  public serviceDefinition: ServiceDefinition;

  public isWorkspaceChangeEnabled: boolean;

  ngOnInit(): void {
    this.$_userSubscription = this._appData.user.subscribe(user => {
      this.user = user;

      const togglTrackServiceDefinition = this.user.serviceDefinitions.find(sd => sd.name === 'TogglTrack');
      if (togglTrackServiceDefinition) {
        this.serviceDefinition = togglTrackServiceDefinition;
      } else {
        this.serviceDefinition = new ServiceDefinition('TogglTrack');
      }
      this.chosenWorkspace = null;

      // do not allow workspace change when already chosen before
      this.isWorkspaceChangeEnabled = this.user.status === 'registrated';
    });
    this.$_stepsCountSubscription = this._appData.stepsCount.subscribe(stepsCount => this.stepsCount = stepsCount);

    this.steps = this._appData.getStepsForCurrentRoute(this._route);

    this.workspaces = [];

    this.showWorkspaceField = false;
  }

  ngOnDestroy(): void {
    this.$_userSubscription?.unsubscribe();
    this.$_stepsCountSubscription?.unsubscribe();
  }

  public checkIfCorrect(): void {
    this.app.showLoading();
    this._syncedServicesConfigService
      .togglTrackWorkspaces(this.serviceDefinition.apiKey)
      .subscribe(data => {
        this.workspaces = data;
        if (this.serviceDefinition.config.workspaceId) {
          this.chosenWorkspace = this.workspaces.find(workspace => workspace.id === this.serviceDefinition.config.workspaceId) ?? null;
        } else if (this.workspaces.length > 0) {
          this.chosenWorkspace = this.workspaces[0];
        }

        this.showWorkspaceField = true;
        this.app.hideLoading();
        this.app.buildNotification('It seems OK! Choose your workspace and continue with next step.');
      }, (error) => {
        this.app.hideLoading();
        this.app.buildNotification('Something went wrong. Check the API key again please.');
      });
  }

  public changeWorkspace(): void {
    this.serviceDefinition.config.workspaceId = Number(this.chosenWorkspace.id);
  }

  public nextStep(): void {
    this.serviceDefinition.config.workspaceId = Number(this.chosenWorkspace.id);
    const index = this.user.serviceDefinitions.findIndex(serviceDefinition => serviceDefinition.name === 'TogglTrack');
    if (index !== -1) {
      this.user.serviceDefinitions.splice(index, 1);
    }
    this.user.serviceDefinitions.push(this.serviceDefinition);
  }

}