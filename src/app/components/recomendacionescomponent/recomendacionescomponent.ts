import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { RecomendacionDTO } from '../../models/RecomendacionDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Recomendacionservice } from '../../services/recomendacionservice';

@Component({
  imports: [DatePipe, MatButtonModule, MatFormFieldModule, MatSelectModule, RouterLink],
  templateUrl: './recomendacionescomponent.html',
  styles: `
    .listado {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 310px), 1fr));
      gap: 16px;
    }
    dt {
      font-weight: 700;
    }
    dd {
      margin: 0 0 12px;
    }
  `,
})
export class Recomendacionescomponent implements OnInit {
  private readonly servicio = inject(Recomendacionservice);
  private readonly acceso = inject(Accesoservice);
  protected readonly prioridad = signal('');
  protected readonly recomendaciones = signal<RecomendacionDTO[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(prioridad = this.prioridad()): void {
    this.prioridad.set(prioridad);
    this.error.set('');
    this.cargando.set(true);
    this.servicio.listar(prioridad).subscribe({
      next: (datos) => {
        this.recomendaciones.set(datos);
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.error.set('No se pudieron consultar las recomendaciones.');
        this.cargando.set(false);
      },
    });
  }
}
