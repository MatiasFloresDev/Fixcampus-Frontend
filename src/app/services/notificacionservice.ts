import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificacionDTO } from '../models/NotificacionDTO';

@Injectable({ providedIn: 'root' })
export class Notificacionservice {
  private apiURL = environment.base + '/api/notificaciones';
  constructor(private http: HttpClient) {}
  listar(): Observable<NotificacionDTO[]> {
    return this.http.get<NotificacionDTO[]>(this.apiURL);
  }
  reintentar(id: number): Observable<NotificacionDTO> {
    return this.http.post<NotificacionDTO>(this.apiURL + '/' + id + '/reintentar', {});
  }
}
