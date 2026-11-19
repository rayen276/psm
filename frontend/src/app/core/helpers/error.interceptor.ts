import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { SessionService } from '../services/session.service';
import { NotifyService } from '../services/notify.service';

export interface ApiError {
  status: number;
  message: string;
}

/**
 * 401 (token expire / invalide) -> deconnexion + redirection vers /auth/login
 * 403 (role insuffisant)        -> message "acces refuse"
 * Les composants recoivent toujours une erreur { status, message } lisible.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private session: SessionService, private router: Router, private notify: NotifyService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        const isLoginCall = request.url.endsWith('/auth/login') || request.url.endsWith('/auth/register');

        if (err.status === 401 && !isLoginCall) {
          this.session.clear();
          this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
          this.notify.warning('Session expiree, veuillez vous reconnecter');
        } else if (err.status === 403) {
          this.notify.error('Acces refuse : droits insuffisants');
        }

        let message = err.error?.message as string | undefined;
        if (!message) {
          message = err.status === 0 ? 'Serveur injoignable. Verifiez que le backend est demarre.' : 'Une erreur est survenue';
        }
        const apiError: ApiError = { status: err.status, message };
        return throwError(() => apiError);
      })
    );
  }
}
