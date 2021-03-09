import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private _authenticationApiUrl: string = 'api/authentication';

  constructor(
    private _http: HttpClient,
  ) { }

  authenticate(username: string, password: string): Observable<User> {
    console.log("***** USER ***** authenticate");
    return this._http.post<User>(this._authenticationApiUrl,
      {
        username: username,
        password: password,
      })
      .pipe(
        catchError((error) => {
          console.error(error);
          // rethrow status back to the component
          return throwError(error);
        })
      );
  }
}
