import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, retry } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SugerenciaRecomendacionIA {
  tituloSugerido: string;
  resumen: string;
  prioridadSugerida: 'ALTA' | 'MEDIA' | 'BAJA';
  justificacion: string;
}

@Injectable({ providedIn: 'root' })
export class Iarecomendacionservice {
  constructor(private http: HttpClient) {}

  generarSugerencia(titulo: string, descripcion: string): Observable<SugerenciaRecomendacionIA> {
    const prompt = `Eres un especialista en mantenimiento de infraestructura universitaria en FixCampus.
Analiza la siguiente incidencia y responde ÚNICAMENTE con un objeto JSON válido (sin markdown ni texto adicional) con esta estructura exacta:
{
  "tituloSugerido": "acción técnica breve (máx 120 caracteres)",
  "resumen": "pasos técnicos concretos para resolverlo (2 a 3 líneas)",
  "prioridadSugerida": "ALTA" | "MEDIA" | "BAJA",
  "justificacion": "motivo técnico de la prioridad asignada (1 a 2 líneas)"
}

Incidencia:
- Título: ${titulo}
- Descripción: ${descripcion}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-goog-api-key': environment.geminiApiKey,
    });

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    };

    return this.http.post<any>(environment.geminiUrl, body, { headers }).pipe(
      retry({ count: 2, delay: 1500 }),
      map((res) => {
        const rawText: string = res?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        const limpio = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(limpio);

        const prioridadValida = ['ALTA', 'MEDIA', 'BAJA'].includes(parsed.prioridadSugerida)
          ? parsed.prioridadSugerida
          : 'MEDIA';

        return {
          tituloSugerido: String(parsed.tituloSugerido || '').slice(0, 200),
          resumen: String(parsed.resumen || ''),
          prioridadSugerida: prioridadValida,
          justificacion: String(parsed.justificacion || ''),
        };
      }),
    );
  }
}