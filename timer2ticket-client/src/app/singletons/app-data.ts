import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ServiceToChoose } from '../models/service_to_choose';
import { User } from '../models/user.model';

/**
 * Class representing app data, should be treated as singleton
 * When user logs in, the data should be filled
 * user representing logged user, all data for that user are accessible from services
 */
@Injectable({
  providedIn: 'root'
})
export class AppData {
  private _userSource = new BehaviorSubject<User>(null);
  public user: Observable<User> = this._userSource.asObservable();

  private _stepsCountSource = new BehaviorSubject<number>(5);
  public stepsCount: Observable<number> = this._stepsCountSource.asObservable();

  private _stepsRoutesSource = new BehaviorSubject<string[]>([]);
  public stepsRoutes: Observable<string[]> = this._stepsRoutesSource.asObservable();

  public get userValue(): User {
    return this._userSource.value;
  }

  public setUser(user: User): void {
    this._userSource.next(user);
    this.setStepsCount(user.serviceDefinitions.length);
  }

  public get stepsCountValue(): number {
    return this._stepsCountSource.value;
  }

  public setStepsCount(stepsCount: number): void {
    if (stepsCount < 5) {
      stepsCount = 5;
    }
    this._stepsCountSource.next(stepsCount);
  }

  public getStepsForCurrentRoute(currentRoute: string, servicesToChooseMap?: Map<string, ServiceToChoose>): { nextRoute: string | null, prevRoute: string | null } {
    const stepsRoutes = ['config-steps/services-choose'];
    // if servicesToChooseMap provided (=> called from config-steps/services-choose)
    if (servicesToChooseMap) {
      // beware: these keys are visible to user => means with space ('Toggl Track')
      if (servicesToChooseMap.has('Redmine')) {
        stepsRoutes.push('config-steps/redmine-configuration');
      }
      if (servicesToChooseMap.has('Toggl Track')) {
        stepsRoutes.push('config-steps/toggl-track-configuration');
      }
    } else if (this.userValue.serviceDefinitions) {
      // if not, try to ask for real serviceDefinitions
      // beware: these keys are hidden to user => means without space ('TogglTrack')
      if (this.userValue.serviceDefinitions.findIndex(serviceDefinition => serviceDefinition.name === 'Redmine') !== -1) {
        stepsRoutes.push('config-steps/redmine-configuration');
      }
      if (this.userValue.serviceDefinitions.findIndex(serviceDefinition => serviceDefinition.name === 'TogglTrack') !== -1) {
        stepsRoutes.push('config-steps/toggl-track-configuration');
      }
    }
    stepsRoutes.push('config-steps/schedule');
    stepsRoutes.push('config-steps/confirmation');
    stepsRoutes.push('overview');
    this._stepsRoutesSource.next(stepsRoutes);

    let currentRouteIndex = stepsRoutes.findIndex(route => route === currentRoute);
    switch (currentRouteIndex) {
      case -1:
        return { nextRoute: null, prevRoute: null };
      case 0:
        return { nextRoute: stepsRoutes[1], prevRoute: null };
      case stepsRoutes.length - 1:
        return { nextRoute: null, prevRoute: stepsRoutes[stepsRoutes.length - 2] };
      default:
        return { nextRoute: stepsRoutes[currentRouteIndex + 1], prevRoute: stepsRoutes[currentRouteIndex - 1] };
    }
  }
}