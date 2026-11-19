import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { PsmRoutingModule } from './psm-routing.module';
import { PageHeaderComponent } from './shared/page-header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientsComponent } from './clients/clients.component';
import { ProjetsComponent } from './projets/projets.component';
import { UsersComponent } from './users/users.component';

@NgModule({
  declarations: [
    PageHeaderComponent,
    DashboardComponent,
    ClientsComponent,
    ProjetsComponent,
    UsersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModalModule,
    NgbPaginationModule,
    PsmRoutingModule
  ]
})
export class PsmModule { }
