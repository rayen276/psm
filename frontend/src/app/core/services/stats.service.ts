import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Stats } from '../models/psm.models';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) { }
  get(): Observable<Stats> { return this.http.get<Stats>(`${environment.apiUrl}/stats`); }
}
