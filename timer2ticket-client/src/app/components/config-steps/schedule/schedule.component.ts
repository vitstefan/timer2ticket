import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { JobDefinition } from 'src/app/models/job_definition';
import { User } from 'src/app/models/user';
import { AppData } from 'src/app/singletons/app-data';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit, OnDestroy {

  constructor(
    private _appData: AppData,
  ) { }

  private _route = 'config-steps/schedule';

  private $_userSubscription: Subscription;
  private $_stepsCountSubscription: Subscription;

  public user: User;
  public stepsCount: number;

  public steps;

  public everySchedules: { label: string, schedule: string }[];

  public confChosenEveryday: boolean;
  public confChosenMonday: boolean;
  public confChosenTuesday: boolean;
  public confChosenWednesday: boolean;
  public confChosenThursday: boolean;
  public confChosenFriday: boolean;
  public confChosenSaturday: boolean;
  public confChosenSunday: boolean;

  public confEvery: { label: string, schedule: string };
  public confAt: string;
  public showConfEveryDetail: boolean;
  public showConfAt: boolean;

  public timeEntriesChosenEveryday: boolean;
  public timeEntriesChosenMonday: boolean;
  public timeEntriesChosenTuesday: boolean;
  public timeEntriesChosenWednesday: boolean;
  public timeEntriesChosenThursday: boolean;
  public timeEntriesChosenFriday: boolean;
  public timeEntriesChosenSaturday: boolean;
  public timeEntriesChosenSunday: boolean;

  public timeEntriesEvery: { label: string, schedule: string };
  public timeEntriesAt: string;
  public showTimeEntriesEveryDetail: boolean;
  public showTimeEntriesAt: boolean;

  ngOnInit(): void {
    this.everySchedules = [];
    this.everySchedules.push({ label: '24 hours', schedule: '0 */24 * * *' });
    this.everySchedules.push({ label: '12 hours', schedule: '0 */12 * * *' });
    this.everySchedules.push({ label: '6 hours', schedule: '0 */6 * * *' });
    this.everySchedules.push({ label: '3 hours', schedule: '0 */3 * * *' });
    this.everySchedules.push({ label: '2 hours', schedule: '0 */2 * * *' });
    this.everySchedules.push({ label: '1 hour', schedule: '0 */1 * * *' });
    this.everySchedules.push({ label: '30 minutes', schedule: '*/30 */1 * * *' });
    this.everySchedules.push({ label: '15 minutes', schedule: '*/15 */1 * * *' });
    this.everySchedules.push({ label: '5 minutes', schedule: '*/5 */1 * * *' });

    this.$_userSubscription = this._appData.user.subscribe(user => {
      this.user = user;

      // conf
      let configSchedule = this.user.configSyncJobDefinition?.schedule;
      if (configSchedule) {
        this._parseUserConfigSchedule(configSchedule);
      } else {
        // default
        this.confChosenEveryday = true;
        this.confChosenMonday = true;
        this.confChosenTuesday = true;
        this.confChosenWednesday = true;
        this.confChosenThursday = true;
        this.confChosenFriday = true;
        this.confChosenSaturday = true;
        this.confChosenSunday = true;

        this.confEvery = this.everySchedules[0];
        this.showConfEveryDetail = true;
        this.confAt = '18:00';
        this.showConfAt = false;
      }

      // time entries
      const timeEntriesSchedule = this.user.timeEntrySyncJobDefinition?.schedule;
      if (timeEntriesSchedule) {
        this._parseUserTimeEntriesSchedule(timeEntriesSchedule);
      } else {
        this.timeEntriesChosenEveryday = true;
        this.timeEntriesChosenMonday = true;
        this.timeEntriesChosenTuesday = true;
        this.timeEntriesChosenWednesday = true;
        this.timeEntriesChosenThursday = true;
        this.timeEntriesChosenFriday = true;
        this.timeEntriesChosenSaturday = true;
        this.timeEntriesChosenSunday = true;

        this.timeEntriesEvery = this.everySchedules[4];
        this.showTimeEntriesEveryDetail = true;
        this.timeEntriesAt = '18:00';
        this.showTimeEntriesAt = false;
      }
    });
    this.$_stepsCountSubscription = this._appData.stepsCount.subscribe(stepsCount => this.stepsCount = stepsCount);

    this.steps = this._appData.getStepsForCurrentRoute(this._route);
  }

  ngOnDestroy(): void {
    this.$_userSubscription?.unsubscribe();
    this.$_stepsCountSubscription?.unsubscribe();
  }

  // methods below probably could have been done nicer...
  public showNextStep(): boolean {
    return (this.confChosenEveryday
      || this.confChosenMonday
      || this.confChosenTuesday
      || this.confChosenWednesday
      || this.confChosenThursday
      || this.confChosenFriday
      || this.confChosenSaturday
      || this.confChosenSunday)
      &&
      (this.timeEntriesChosenEveryday
        || this.timeEntriesChosenMonday
        || this.timeEntriesChosenTuesday
        || this.timeEntriesChosenWednesday
        || this.timeEntriesChosenThursday
        || this.timeEntriesChosenFriday
        || this.timeEntriesChosenSaturday
        || this.timeEntriesChosenSunday);
  }

  // conf when clicking on everyday checkbox
  public changeConfEveryday(): void {
    this.confChosenMonday = this.confChosenEveryday;
    this.confChosenTuesday = this.confChosenEveryday;
    this.confChosenWednesday = this.confChosenEveryday;
    this.confChosenThursday = this.confChosenEveryday;
    this.confChosenFriday = this.confChosenEveryday;
    this.confChosenSaturday = this.confChosenEveryday;
    this.confChosenSunday = this.confChosenEveryday;

    this.showConfEveryDetail = this.confChosenEveryday;
    // do not show at even if all chosen or none chosen
    this.showConfAt = false;
  }

  // conf when clicking on week day checkbox
  public changeConfDay(): void {
    if (this.confChosenMonday
      && this.confChosenTuesday
      && this.confChosenWednesday
      && this.confChosenThursday
      && this.confChosenFriday
      && this.confChosenSaturday
      && this.confChosenSunday) {
      this.confChosenEveryday = true;
      this.showConfAt = false;
      this.showConfEveryDetail = true;
    } else {
      this.confChosenEveryday = false;
      this.showConfAt = true;
      this.showConfEveryDetail = false;
    }

    // do not show at when none chosen
    if (!(this.confChosenMonday
      || this.confChosenTuesday
      || this.confChosenWednesday
      || this.confChosenThursday
      || this.confChosenFriday
      || this.confChosenSaturday
      || this.confChosenSunday)) {
      this.showConfAt = false;
    }
  }

  // timeEntries when clicking on week day checkbox
  public changeTimeEntriesEveryday(): void {
    this.timeEntriesChosenMonday = this.timeEntriesChosenEveryday;
    this.timeEntriesChosenTuesday = this.timeEntriesChosenEveryday;
    this.timeEntriesChosenWednesday = this.timeEntriesChosenEveryday;
    this.timeEntriesChosenThursday = this.timeEntriesChosenEveryday;
    this.timeEntriesChosenFriday = this.timeEntriesChosenEveryday;
    this.timeEntriesChosenSaturday = this.timeEntriesChosenEveryday;
    this.timeEntriesChosenSunday = this.timeEntriesChosenEveryday;

    this.showTimeEntriesEveryDetail = this.timeEntriesChosenEveryday;
    // do not show at even if all chosen or none chosen
    this.showTimeEntriesAt = false;
  }

  // timeEntries when clicking on week day checkbox
  public changeTimeEntriesDay(): void {
    if (this.timeEntriesChosenMonday
      && this.timeEntriesChosenTuesday
      && this.timeEntriesChosenWednesday
      && this.timeEntriesChosenThursday
      && this.timeEntriesChosenFriday
      && this.timeEntriesChosenSaturday
      && this.timeEntriesChosenSunday) {
      this.timeEntriesChosenEveryday = true;
      this.showTimeEntriesAt = false;
      this.showTimeEntriesEveryDetail = true;
    } else {
      this.timeEntriesChosenEveryday = false;
      this.showTimeEntriesAt = true;
      this.showTimeEntriesEveryDetail = false;
    }

    // do not show at when none chosen
    if (!(this.timeEntriesChosenMonday
      || this.timeEntriesChosenTuesday
      || this.timeEntriesChosenWednesday
      || this.timeEntriesChosenThursday
      || this.timeEntriesChosenFriday
      || this.timeEntriesChosenSaturday
      || this.timeEntriesChosenSunday)) {
      this.showTimeEntriesAt = false;
    }
  }

  public nextStep(): void {
    // config schedule
    let confSchedule = '';
    if (this.confChosenEveryday) {
      confSchedule = this.confEvery.schedule;
    } else {
      let minutes = this.confAt.substr(3, 2);
      let hour = this.confAt.substr(0, 2);
      let days = '';
      // some of the days will be chosen
      days += this.confChosenMonday ? 'mon,' : '';
      days += this.confChosenTuesday ? 'tue,' : '';
      days += this.confChosenWednesday ? 'wed,' : '';
      days += this.confChosenThursday ? 'thu,' : '';
      days += this.confChosenFriday ? 'fri,' : '';
      days += this.confChosenSaturday ? 'sat,' : '';
      days += this.confChosenSunday ? 'sun,' : '';
      // remove last ','
      days = days.substr(0, days.length - 1);
      confSchedule = `${minutes} ${hour} * * ${days}`;
    }
    this.user.configSyncJobDefinition = new JobDefinition(confSchedule);

    // time entries schedule
    let timeEntriesSchedule = '';
    if (this.timeEntriesChosenEveryday) {
      timeEntriesSchedule = this.timeEntriesEvery.schedule;
    } else {
      let minutes = this.timeEntriesAt.substr(3, 2);
      let hour = this.timeEntriesAt.substr(0, 2);
      let days = '';
      // some of the days will be chosen
      days += this.timeEntriesChosenMonday ? 'mon,' : '';
      days += this.timeEntriesChosenTuesday ? 'tue,' : '';
      days += this.timeEntriesChosenWednesday ? 'wed,' : '';
      days += this.timeEntriesChosenThursday ? 'thu,' : '';
      days += this.timeEntriesChosenFriday ? 'fri,' : '';
      days += this.timeEntriesChosenSaturday ? 'sat,' : '';
      days += this.timeEntriesChosenSunday ? 'sun,' : '';
      // remove last ','
      days = days.substr(0, days.length - 1);
      timeEntriesSchedule = `${minutes} ${hour} * * ${days}`;
    }
    this.user.timeEntrySyncJobDefinition = new JobDefinition(timeEntriesSchedule);
  }

  private _parseUserConfigSchedule(configSchedule): void {
    if (configSchedule.endsWith('*')) {
      // means that every day is chosen, schedule should be same as one of the everySchedules above
      this.confChosenEveryday = true;
      this.confChosenMonday = true;
      this.confChosenTuesday = true;
      this.confChosenWednesday = true;
      this.confChosenThursday = true;
      this.confChosenFriday = true;
      this.confChosenSaturday = true;
      this.confChosenSunday = true;

      this.confEvery = this.everySchedules.find(schedule => schedule.schedule === configSchedule);
      this.showConfEveryDetail = true;
      this.confAt = '18:00';
      this.showConfAt = false;
    } else {
      // specific day (or more days) are chosen with specific time
      // for example: '45 18 * * mon,thu' [minutes hour * * days]
      let minutes = configSchedule.substr(0, 2);
      let hour = configSchedule.substr(3, 2);
      configSchedule = configSchedule.substr(10, configSchedule.length);
      let days = configSchedule.split(',');
      // some of the days will be chosen
      this.confChosenMonday = days.includes('mon');
      this.confChosenTuesday = days.includes('tue');
      this.confChosenWednesday = days.includes('wed');
      this.confChosenThursday = days.includes('thu');
      this.confChosenFriday = days.includes('fri');
      this.confChosenSaturday = days.includes('sat');
      this.confChosenSunday = days.includes('sun');
      this.confChosenEveryday = days.length === 7;

      this.confEvery = this.everySchedules[0];
      this.showConfEveryDetail = false;
      this.confAt = `${hour}:${minutes}`;
      this.showConfAt = true;
    }
  }

  private _parseUserTimeEntriesSchedule(timeEntriesSchedule): void {
    if (timeEntriesSchedule.endsWith('*')) {
      // means that every day is chosen, schedule should be same as one of the everySchedules above
      this.timeEntriesChosenEveryday = true;
      this.timeEntriesChosenMonday = true;
      this.timeEntriesChosenTuesday = true;
      this.timeEntriesChosenWednesday = true;
      this.timeEntriesChosenThursday = true;
      this.timeEntriesChosenFriday = true;
      this.timeEntriesChosenSaturday = true;
      this.timeEntriesChosenSunday = true;

      this.timeEntriesEvery = this.everySchedules.find(schedule => schedule.schedule === timeEntriesSchedule);
      this.showTimeEntriesEveryDetail = true;
      this.timeEntriesAt = '18:00';
      this.showTimeEntriesAt = false;
    } else {
      // specific day (or more days) are chosen with specific time
      // for example: '45 18 * * mon,thu' [minutes hour * * days]
      let minutes = timeEntriesSchedule.substr(0, 2);
      let hour = timeEntriesSchedule.substr(3, 2);
      timeEntriesSchedule = timeEntriesSchedule.substr(10, timeEntriesSchedule.length);
      let days = timeEntriesSchedule.split(',');
      // some of the days will be chosen
      this.timeEntriesChosenMonday = days.includes('mon');
      this.timeEntriesChosenTuesday = days.includes('tue');
      this.timeEntriesChosenWednesday = days.includes('wed');
      this.timeEntriesChosenThursday = days.includes('thu');
      this.timeEntriesChosenFriday = days.includes('fri');
      this.timeEntriesChosenSaturday = days.includes('sat');
      this.timeEntriesChosenSunday = days.includes('sun');
      this.timeEntriesChosenEveryday = days.length === 7;

      this.timeEntriesEvery = this.everySchedules[0];
      this.showTimeEntriesEveryDetail = false;
      this.timeEntriesAt = `${hour}:${minutes}`;
      this.showTimeEntriesAt = true;
    }
  }

}