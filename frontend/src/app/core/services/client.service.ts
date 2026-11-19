import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client } from '../models/psm.models';

@Injectable({ providedIn: 'root' })
export class ClientService {

  private readonly api = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Client[]> { return this.http.get<Client[]>(this.api); }
  create(c: Client): Observable<Client> { return this.http.post<Client>(this.api, c); }
  update(id: number, c: Client): Observable<Client> { return this.http.put<Client>(`${this.api}/${id}`, c); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
}
