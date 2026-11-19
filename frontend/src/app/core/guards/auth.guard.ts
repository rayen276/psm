import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SessionService } from '../services/session.service';

/** Bloque l'acces aux pages si l'utilisateur n'est pas connecte (ou si le JWT a expire). */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private session: SessionService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (this.session.isLoggedIn()) {
      return true;
    }
    return this.router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
  }
}
