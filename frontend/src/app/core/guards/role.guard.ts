import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { SessionService } from '../services/session.service';
import { NotifyService } from '../services/notify.service';

/** Usage : { path: 'users', canActivate: [RoleGuard], data: { roles: ['ADMIN'] } } */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private session: SessionService, private router: Router, private notify: NotifyService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const roles: string[] = route.data['roles'] ?? [];
    if (roles.length === 0 || this.session.hasAnyRole(roles)) {
      return true;
    }
    this.notify.error('Acces refuse : droits insuffisants');
    return this.router.createUrlTree(['/dashboard']);
  }
}
