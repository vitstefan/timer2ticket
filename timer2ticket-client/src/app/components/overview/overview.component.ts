import { Component, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
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
    private _router: Router,
    private sanitizer: DomSanitizer,
  ) { }

  private _route = 'overview';

  private $_userSubscription: Subscription;
  private $_stepsCountSubscription: Subscription;

  public user: User;
  public stepsCount: number;

  public reachableSteps;
  public serviceHints: { serviceName: string, timeEntriesSyncHint: SafeHtml }[];

  ngOnInit(): void {
    this.$_userSubscription = this._appData.user.subscribe(user => this.user = user);
    this.$_stepsCountSubscription = this._appData.stepsCount.subscribe(stepsCount => this.stepsCount = stepsCount);

    this.reachableSteps = this._appData.getAllReachableSteps();
    this.serviceHints = [];
    this.reachableSteps.forEach(step => {
      if (step.isService) {
        this.serviceHints.push({
          serviceName: step.serviceName,
          timeEntriesSyncHint: this.sanitizer.sanitize(SecurityContext.HTML, step.timeEntriesSyncHint),
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.$_userSubscription?.unsubscribe();
    this.$_stepsCountSubscription?.unsubscribe();
  }

  public changeSync() {

  }

}
