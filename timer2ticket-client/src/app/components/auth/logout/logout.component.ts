import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { AppData } from 'src/app/singletons/app-data';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(
    private appData: AppData,
    public app: AppComponent,
  ) { }

  ngOnInit() {
    this.appData.setUser(null);
    this.app.buildNotification('Logged out.');
  }
}
