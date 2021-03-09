import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ServiceToChoose } from '../models/service_to_choose';
import { User } from '../models/user';

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

  /**
   * Services with human readable labels and routes to service's configuration
   * Used below for routes and in services-choose component (method below)
   */
  private _possibleServicesAndRoutes: { key: string, label: string, route: string, timeEntriesSyncHint: string }[] =
    [
      { key: 'Redmine', label: 'Redmine', route: 'config-steps/redmine-configuration', timeEntriesSyncHint: 'No special action needed.', },
      {
        key: 'TogglTrack', label: 'Toggl Track', route: 'config-steps/toggl-track-configuration',
        timeEntriesSyncHint: `Project or issue is required for the time entry to sync.<br />Optionally, choose an issue from the tags (if not chosen, time entry will be added to the project without the issue).<br />Optionally, choose an activity from the tags (if not chosen, default will be set).`,
      },
    ];

  public populateServicesMap(): Map<string, ServiceToChoose> {
    const res = new Map();
    this._possibleServicesAndRoutes.forEach(service => {
      res.set(service.key, new ServiceToChoose(service.label));
    });
    return res;
  }

  public getServiceLabel(key: string): string {
    return this._possibleServicesAndRoutes.find(service => service.key === key)?.label ?? '';
  }

  public get userValue(): User {
    return this._userSource.value;
  }

  public setUser(user: User): void {
    this._userSource.next(user);
    this.setStepsCount(user?.serviceDefinitions?.length ?? 0);
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

  public getStepsForCurrentRoute(currentRoute: string, servicesToChooseMap?: Map<string, ServiceToChoose>): { nextRoute: string | null, prevRoute: string | null, currentStepNumber: number } {
    const stepsRoutes = ['config-steps/services-choose'];
    // if servicesToChooseMap provided (=> called from config-steps/services-choose)
    if (servicesToChooseMap) {
      this._possibleServicesAndRoutes.forEach(service => {
        if (servicesToChooseMap.has(service.key)) {
          stepsRoutes.push(service.route);
        }
      });
    } else if (this.userValue.serviceDefinitions) {
      // if not, try to ask for real serviceDefinitions
      this._possibleServicesAndRoutes.forEach(service => {
        if (this.userValue.serviceDefinitions.findIndex(serviceDefinition => serviceDefinition.name === service.key) !== -1) {
          stepsRoutes.push(service.route);
        }
      });
    }
    stepsRoutes.push('config-steps/schedule');
    stepsRoutes.push('config-steps/confirmation');
    this._stepsRoutesSource.next(stepsRoutes);

    let currentRouteIndex = stepsRoutes.findIndex(route => route === currentRoute);
    switch (currentRouteIndex) {
      case -1:
        return { nextRoute: null, prevRoute: null, currentStepNumber: currentRouteIndex + 1 };
      case 0:
        return { nextRoute: stepsRoutes[1], prevRoute: null, currentStepNumber: currentRouteIndex + 1 };
      case stepsRoutes.length - 1:
        return { nextRoute: null, prevRoute: stepsRoutes[stepsRoutes.length - 2], currentStepNumber: currentRouteIndex + 1 };
      default:
        return { nextRoute: stepsRoutes[currentRouteIndex + 1], prevRoute: stepsRoutes[currentRouteIndex - 1], currentStepNumber: currentRouteIndex + 1 };
    }
  }

  /**
   * Used from overview only
   */
  public getAllReachableSteps(): { order: number, label: string, route: string, isService: boolean, serviceName: string, timeEntriesSyncHint: string }[] {
    const res = [];
    let order = 1;

    res.push({ order: order++, label: 'Service choose', route: 'config-steps/services-choose', isService: false, serviceName: '', timeEntriesSyncHint: '' });

    if (this.userValue.serviceDefinitions) {
      for (const service of this._possibleServicesAndRoutes) {
        if (this.userValue.serviceDefinitions.findIndex(serviceDefinition => serviceDefinition.name === service.key) !== -1) {
          res.push({
            order: order++,
            label: `${service.label} configuration`,
            route: service.route,
            isService: true,
            serviceName: service.label,
            timeEntriesSyncHint: service.timeEntriesSyncHint
          });
        }
      }
    }

    res.push({ order: order++, label: 'Synchronization schedule', route: 'config-steps/schedule', isService: false, serviceName: '', timeEntriesSyncHint: '' });

    return res;
  }
}