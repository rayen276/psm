import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthResponse, ROLE_ADMIN, UserDto } from '../models/psm.models';

/**
 * Garde le token JWT et l'utilisateur connecte (localStorage).
 * N'injecte volontairement ni HttpClient ni Router : il est utilise par les interceptors
 * (evite la dependance circulaire HttpClient -> interceptor -> HttpClient).
 */
@Injectable({ providedIn: 'root' })
export class SessionService {

  private readonly TOKEN_KEY = 'psm_token';
  private readonly USER_KEY = 'psm_user';

  private userSubject = new BehaviorSubject<UserDto | null>(this.readUser());
  readonly user$ = this.userSubject.asObservable();

  get token(): string | null {
    try { return localStorage.getItem(this.TOKEN_KEY); } catch { return null; }
  }

  get user(): UserDto | null {
    return this.userSubject.value;
  }

  save(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.userSubject.next(res.user);
  }

  clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }

  /** Connecte = un token present et non expire (claim `exp` du JWT). */
  isLoggedIn(): boolean {
    const t = this.token;
    if (!t) { return false; }
    const exp = this.decode(t)?.exp;
    if (!exp || exp * 1000 <= Date.now()) {
      this.clear();
      return false;
    }
    return true;
  }

  hasRole(role: string): boolean {
    return !!this.user?.roles?.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(r => this.hasRole(r));
  }

  get isAdmin(): boolean {
    return this.hasRole(ROLE_ADMIN);
  }

  private readUser(): UserDto | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) as UserDto : null;
    } catch {
      return null;
    }
  }

  private decode(token: string): { exp?: number } | null {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(atob(payload))));
    } catch {
      return null;
    }
  }
}
