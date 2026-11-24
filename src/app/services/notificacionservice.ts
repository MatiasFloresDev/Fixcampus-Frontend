import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NotificacionReporte {
  destinatario: string;
  asunto: string;
  tituloReporte: string;
  estado: string;
  detalle: string;
}

@Injectable({ providedIn: 'root' })
export class Notificacionservice {
  constructor(private http: HttpClient) {}

  notificar(datos: NotificacionReporte): Observable<string | null> {
    if (!environment.emailJsPublicKey || environment.emailJsPublicKey === 'TU_PUBLIC_KEY') {
      return of(null);
    }

    const body = {
      service_id: environment.emailJsServiceId,
      template_id: environment.emailJsTemplateId,
      user_id: environment.emailJsPublicKey,
      template_params: {
        to_email: datos.destinatario,
        subject: datos.asunto,
        reporte_titulo: datos.tituloReporte,
        reporte_estado: datos.estado,
        reporte_detalle: datos.detalle,
      },
    };

    return this.http.post(environment.emailJsUrl, body, { responseType: 'text' }).pipe(
      catchError((err) => {
        console.warn('No se pudo enviar la notificación por correo:', err);
        return of(null);
      }),
    );
  }
}