import { Component, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { User } from 'src/app/models/user.model';
import { JobService } from 'src/app/services/job.service';
import { AppData } from 'src/app/singletons/app-data';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {

  constructor(
    private _appData: AppData,
    public app: AppComponent,
    private _sanitizer: DomSanitizer,
    private _jobService: JobService,
  ) { }

  private $_userSubscription: Subscription;
  private $_stepsCountSubscription: Subscription;

  public user: User;
  public stepsCount: number;

  public reachableSteps;
  public serviceHints: { serviceName: string, timeEntriesSyncHint: SafeHtml }[];

  public isScheduled: boolean;
  private _askedForScheduled: boolean;

  ngOnInit(): void {
    this._askedForScheduled = false;

    this.$_userSubscription = this._appData.user.subscribe(user => {
      this.user = user;

      // ask for schedule only once after user's data were subscribed
      // if this check is not here => infinite calling (since there is _appData.setUser)
      if (!this._askedForScheduled) {
        this._askedForScheduled = true;
        this._jobService.scheduled(this.user._id).subscribe(res => {
          this.isScheduled = res.scheduled;

          if (this.isScheduled) {
            this.user.status = 'active';
          } else {
            this.user.status = 'inactive';
          }

          this._appData.setUser(this.user);
        }, (error) => {
          this._jobRequestError();
        });
      }
    });

    this.$_stepsCountSubscription = this._appData.stepsCount.subscribe(stepsCount => this.stepsCount = stepsCount);

    this.reachableSteps = this._appData.getAllReachableSteps();
    this.serviceHints = [];
    this.reachableSteps.forEach(step => {
      if (step.isService) {
        this.serviceHints.push({
          serviceName: step.serviceName,
          timeEntriesSyncHint: this._sanitizer.sanitize(SecurityContext.HTML, step.timeEntriesSyncHint),
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.$_userSubscription?.unsubscribe();
    this.$_stepsCountSubscription?.unsubscribe();
  }

  public changeSync(): void {
    // locally change user status (on API's side it is changed)
    if (this.isScheduled) {
      this._stopSync();
    } else {
      this._startSync();
    }
  }

  private _startSync(): void {
    this._jobService.start(this.user._id).subscribe(res => {
      this.isScheduled = res.started;

      if (this.isScheduled) {
        this.user.status = 'active';
        this.app.buildNotification('Jobs correctly started.');
      } else {
        this.user.status = 'inactive';
      }

      this._appData.setUser(this.user);
    }, (error) => {
      this._jobRequestError();
    });
  }

  private _stopSync(): void {
    this._jobService.stop(this.user._id).subscribe(res => {
      // if successfully stopped, then isNotScheduled
      this.isScheduled = !res.stopped;

      if (!this.isScheduled) {
        this.user.status = 'inactive';
        this.app.buildNotification('Jobs correctly stopped.');
      }

      this._appData.setUser(this.user);
    }, (error) => {
      this._jobRequestError();
    });
  }

  private _jobRequestError() {
    this.isScheduled = false;
    this.user.status = 'inactive';
    this._appData.setUser(this.user);
    this.app.buildNotification('Some error occured when communicating with the sync server. Please try again after a while.');
  }

}
