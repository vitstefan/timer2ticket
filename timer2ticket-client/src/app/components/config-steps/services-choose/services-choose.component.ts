import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ServiceDefinition } from 'src/app/models/service_definition/service_definition';
import { ServiceToChoose } from 'src/app/models/service_to_choose';
import { User } from 'src/app/models/user';
import { AppData } from 'src/app/singletons/app-data';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-services-choose',
  templateUrl: './services-choose.component.html',
  styleUrls: ['./services-choose.component.css']
})
export class ServicesChooseComponent implements OnInit, OnDestroy {

  constructor(
    private _appData: AppData,
    public dialog: MatDialog,
    private _router: Router,
  ) { }

  private _route = 'config-steps/services-choose';

  private $_userSubscription: Subscription;
  private $_stepsCountSubscription: Subscription;

  public user: User;
  public stepsCount: number;

  // Map for fast and intuitive searching
  private _servicesToChooseMap: Map<string, ServiceToChoose>;

  // List for html template to render those
  public servicesToChooseList: ServiceToChoose[];

  public steps;

  ngOnInit() {
    this.$_userSubscription = this._appData.user.subscribe(user => this.user = user);
    this.$_stepsCountSubscription = this._appData.stepsCount.subscribe(stepsCount => this.stepsCount = stepsCount);

    this._servicesToChooseMap = this._appData.populateServicesMap();

    this.servicesToChooseList = [...this._servicesToChooseMap.values()];

    this.user.serviceDefinitions.forEach(serviceDefinition => {
      this._servicesToChooseMap.get(serviceDefinition.name).isChosen = true;
    });

    this.steps = null;
    this._determineNextStep();
  }

  ngOnDestroy(): void {
    this.$_userSubscription?.unsubscribe();
    this.$_stepsCountSubscription?.unsubscribe();
  }

  chooseService(service: ServiceToChoose): void {
    service.isChosen = !service.isChosen;

    this._determineNextStep();
  }

  private _determineNextStep(): void {
    const chosenCount = this.servicesToChooseList.reduce((total, service) => service.isChosen ? (total + 1) : total, 0);
    if (chosenCount >= 2) {
      this.steps = this._appData.getStepsForCurrentRoute(this._route, this._servicesToChooseMap);
    } else {
      this.steps = null;
    }
  }

  public nextStep() {
    if (this.user.serviceDefinitions.length === 0) {
      // add default servieDefinitions based on servicesToChooseMap
      this.user.serviceDefinitions = [];
      this.servicesToChooseList.forEach(serviceToChoose => {
        if (serviceToChoose.isChosen) {
          this.user.serviceDefinitions.push(new ServiceDefinition(serviceToChoose.key, serviceToChoose.name === 'Redmine'));
        }
      });
      this._appData.setUser(this.user);
    } else {
      let allServicesRemain = true;
      this.user.serviceDefinitions.forEach(serviceDefinition => {
        allServicesRemain &&= this._servicesToChooseMap.get(serviceDefinition.name).isChosen;
      });

      if (!allServicesRemain) {
        // some services that were previously in user.serviceDefinitions are not chosen now, confirm dialog to continue
        // (although changes to DB are made on final confirm step)

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '40em',
          data: {
            title: 'Some of your previously set service definitions are not chosen.',
            body: 'Your service configuration will be lost (and after confirming all changes in the final step lost forever). Continue?',
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === true) {
            this.servicesToChooseList.forEach(serviceToChoose => {
              const indexOfServiceDefinition = this.user.serviceDefinitions.findIndex(serviceDefinition => serviceDefinition.name === serviceToChoose.key);
              if (serviceToChoose.isChosen && indexOfServiceDefinition === -1) {
                this.user.serviceDefinitions.push(new ServiceDefinition(serviceToChoose.key, serviceToChoose.name === 'Redmine'));
              } else if (!serviceToChoose.isChosen && indexOfServiceDefinition >= 0) {
                this.user.serviceDefinitions.splice(indexOfServiceDefinition, 1);
              }
            });
            this._appData.setUser(this.user);
          } else {
            // go back to this route without changes (route changed due to clicking next step)
            this._router.navigate([this._route], { replaceUrl: true });
          }
        });
      }
    }
  }
}
