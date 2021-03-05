import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var buildNotification: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    //redirect to login right away
    this.redirectToLogin();
  }

  private redirectToLogin(): void {
    this.router.navigate(['login'], { replaceUrl: true });
  }

  public buildNotification(content: String) {
    new buildNotification(content, 0, 0, 3, 0, 2);
  }
}
