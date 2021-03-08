import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServiceObject } from '../models/service_object';

@Injectable({
  providedIn: 'root'
})
export class SyncedServicesConfigService {
  private _syncedServicesConfigApiUrl: string = 'api/synced_services_config';

  constructor(
    private _http: HttpClient,
  ) { }

  redmineTimeEntryActivities(apiKey: string, apiPoint: string): Observable<{ user_id: number, time_entry_activities: ServiceObject[] }> {
    console.log("***** SYNCED SERVICES CONFIG ***** Toggl Track workspaces");
    const params = new HttpParams().set('api_key', apiKey).set('api_point', apiPoint);

    return this._http.get<{ user_id: number, time_entry_activities: ServiceObject[] }>
      (`${this._syncedServicesConfigApiUrl}/redmine_time_entry_activities`, { params })
      .pipe(
        catchError((error) => {
          console.error(error);
          // rethrow status back to the component
          return throwError(error);
        })
      );
  }

  togglTrackWorkspaces(apiKey: string): Observable<ServiceObject[]> {
    console.log("***** SYNCED SERVICES CONFIG ***** Toggl Track workspaces");
    const params = new HttpParams().set('api_key', apiKey);

    return this._http.get<[]>(`${this._syncedServicesConfigApiUrl}/toggl_track_workspaces`,
      { params })
      .pipe(
        catchError((error) => {
          console.error(error);
          // rethrow status back to the component
          return throwError(error);
        })
      );
  }
}
