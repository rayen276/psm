import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientsComponent } from './clients/clients.component';
import { ProjetsComponent } from './projets/projets.component';
import { UsersComponent } from './users/users.component';
import { RoleGuard } from '../core/guards/role.guard';
import { ROLE_ADMIN } from '../core/models/psm.models';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'projets', component: ProjetsComponent },
  // Reserve a l'ADMIN (RoleGuard)
  { path: 'users', component: UsersComponent, canActivate: [RoleGuard], data: { roles: [ROLE_ADMIN] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PsmRoutingModule { }
