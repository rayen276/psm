import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, RegisterPayload, UserDto } from '../models/psm.models';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  private readonly api = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private session: SessionService, private router: Router) { }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, { email, password })
      .pipe(tap(res => this.session.save(res)));
  }

  register(payload: RegisterPayload): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.api}/register`, payload);
  }

  logout(): void {
    this.session.clear();
    this.router.navigate(['/auth/login']);
  }
}
