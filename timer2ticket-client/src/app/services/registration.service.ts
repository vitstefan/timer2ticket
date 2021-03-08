import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private _registrationApiUrl: string = '/api/registration';

  constructor(
    private _http: HttpClient,
  ) { }

  registrate(username: string, password: string, passwordAgain: string): Observable<{}> {
    console.log("***** USER ***** registrate");
    return this._http.post<{}>(this._registrationApiUrl,
      {
        username: username,
        password: password,
        passwordAgain: passwordAgain,
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
