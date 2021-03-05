import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
// import { Task } from '../models/Task.model';
// import { Category } from '../models/Category.model';
// import { Friend } from '../models/Friend.model';

/**
 * Class representing app data, should be treated as singleton
 * When user logs in, the data should be filled
 * user representing logged user, all data for that user are accessible from services
 */
@Injectable({
  providedIn: 'root'
})
export class AppData {
  private _user: User;

  getUser(): User {
    return this._user;
  }

  setUser(user: User): void {
    this._user = user;
  }
}