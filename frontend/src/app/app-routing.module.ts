import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layouts/layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  // Pages publiques : login / register
  { path: 'auth', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },

  // Application protegee par le AuthGuard (layout Velzon + pages Clients / Projets / Users)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('./psm/psm.module').then(m => m.PsmModule)
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
