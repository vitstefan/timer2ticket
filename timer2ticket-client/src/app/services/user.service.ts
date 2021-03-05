import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _usersApiUrl: string = 'api/users';

  constructor(private http: HttpClient) { }

  update(user: User): Observable<User> {
    console.log("***** USER ***** update");
    return this.http.put<User>(this._usersApiUrl, user).pipe(
      catchError(this.handleError<User>('userUpdate', undefined))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
  */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(`${operation} error: ${error}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
