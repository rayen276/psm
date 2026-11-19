import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Projet } from '../models/psm.models';

@Injectable({ providedIn: 'root' })
export class ProjetService {

  private readonly api = `${environment.apiUrl}/projets`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Projet[]> { return this.http.get<Projet[]>(this.api); }
  create(p: Projet): Observable<Projet> { return this.http.post<Projet>(this.api, p); }
  update(id: number, p: Projet): Observable<Projet> { return this.http.put<Projet>(`${this.api}/${id}`, p); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
}
