import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserDto, UserUpdatePayload } from '../models/psm.models';

/** Gestion des utilisateurs (reserve a l'ADMIN). */
@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<UserDto[]> { return this.http.get<UserDto[]>(this.api); }
  getRoles(): Observable<string[]> { return this.http.get<string[]>(`${environment.apiUrl}/roles`); }
  update(id: number, u: UserUpdatePayload): Observable<UserDto> { return this.http.put<UserDto>(`${this.api}/${id}`, u); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
}
