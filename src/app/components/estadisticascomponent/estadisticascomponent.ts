import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Accesoservice } from '../../services/accesoservice';

interface TotalCategoria {
  idCategoria: number;
  nombre: string;
  totalReportes: number;
}

interface TotalPrioridad {
  prioridad: string | null;
  cantidad: number;
}

@Component({
  imports: [MatButtonModule],
  template: `
    <section class="contenedor">
      <div class="encabezado">
        <div>
          <h1>Estadísticas de mantenimiento</h1>
          <p>Consulta la distribución de reportes y recomendaciones.</p>
        </div>
      </div>
      @if (cargando()) {
        <p role="status">Cargando estadísticas…</p>
      } @else if (error()) {
        <p role="alert" class="aviso error">No se pudieron consultar las estadísticas.</p>
        <button mat-stroked-button type="button" (click)="cargar()">Volver a intentar</button>
      } @else {
        <div class="grupos">
          <section class="tarjeta">
            <h2>Reportes por categoría</h2>
            <ul>
              @for (item of categorias(); track item.idCategoria) {
                <li>
                  <span>{{ item.nombre }}</span
                  ><strong>{{ item.totalReportes }}</strong>
                </li>
              } @empty {
                <li>Todavía no hay categorías.</li>
              }
            </ul>
          </section>
          <section class="tarjeta">
            <h2>Recomendaciones por prioridad del reporte</h2>
            <ul>
              @for (item of prioridades(); track item.prioridad) {
                <li>
                  <span>{{ item.prioridad?.replace('_', ' ') || 'Sin prioridad' }}</span
                  ><strong>{{ item.cantidad }}</strong>
                </li>
              } @empty {
                <li>Todavía no hay recomendaciones.</li>
              }
            </ul>
          </section>
        </div>
      }
    </section>
  `,
  styles: `
    .grupos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
      gap: 16px;
      align-items: start;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 8px 0;
      border-block-end: 1px solid #d6dbe0;
    }
  `,
})
export class Estadisticascomponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly acceso = inject(Accesoservice);
  protected readonly categorias = signal<TotalCategoria[]>([]);
  protected readonly prioridades = signal<TotalPrioridad[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    const headers = this.acceso.obtenerCabeceras();
    this.cargando.set(true);
    this.error.set(false);
    forkJoin({
      categorias: this.http.get<TotalCategoria[]>(
        environment.base + '/api/categories/reporte-por-categoria',
        { headers },
      ),
      prioridades: this.http.get<TotalPrioridad[]>(
        environment.base + '/api/recomendaciones/estadisticas/por-prioridad-reporte',
        { headers },
      ),
    }).subscribe({
      next: ({ categorias, prioridades }) => {
        this.categorias.set(categorias);
        this.prioridades.set(prioridades);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
}
