import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServiceObject } from '../models/service_object';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private _jobsApiUrl: string = 'api/jobs';

  constructor(
    private _http: HttpClient,
  ) { }

  start(userId: string): Observable<{ started: boolean }> {
    console.log("***** JOBS ***** stop");

    // empty body
    return this._http.post<{ started: boolean }>(`${this._jobsApiUrl}/start/${userId}`, {})
      .pipe(
        catchError((error) => {
          console.error(error);
          // rethrow status back to the component
          return throwError(error);
        })
      );
  }

  stop(userId: string): Observable<{ stopped: boolean }> {
    console.log("***** JOBS ***** stop");

    // empty body
    return this._http.post<{ stopped: boolean }>(`${this._jobsApiUrl}/stop/${userId}`, {})
      .pipe(
        catchError((error) => {
          console.error(error);
          // rethrow status back to the component
          return throwError(error);
        })
      );
  }

  scheduled(userId: string): Observable<{ scheduled: boolean }> {
    console.log("***** JOBS ***** scheduled");

    // empty body
    return this._http.post<{ scheduled: boolean }>(`${this._jobsApiUrl}/scheduled/${userId}`, {})
      .pipe(
        catchError((error) => {
          console.error(error);
          // rethrow status back to the component
          return throwError(error);
        })
      );
  }
}
