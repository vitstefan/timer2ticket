import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppData } from '../singletons/app-data';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private appData: AppData
    ) { }

    //inspiration: http://jasonwatmore.com/post/2018/11/16/angular-7-jwt-authentication-example-tutorial#jwt-interceptor-ts
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.appData.userValue) {
            return true; //logged in so return true
        }
        //not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}