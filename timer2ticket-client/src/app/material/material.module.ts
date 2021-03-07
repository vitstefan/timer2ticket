import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';

const MaterialComponents = [
  MatIconModule,
  MatCheckboxModule,
  MatSidenavModule,
  MatDialogModule,
  MatCardModule,
  MatSelectModule,
  MatDatepickerModule,
  MatTooltipModule,
]

@NgModule({
  imports: [
    MaterialComponents
  ],
  exports: [
    MaterialComponents
  ]
})

export class MaterialModule { }
