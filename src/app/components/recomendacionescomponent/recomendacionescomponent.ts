import { forkJoin } from 'rxjs';
import { ReporteDTO } from '../../models/ReporteDTO';
import { Reporteservice } from '../../services/reporteservice';
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
  .encabezado h1 {
    font-size: 26px;
    font-weight: 700;
    color: #263238;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
  }

  .encabezado p {
    font-size: 13px;
    color: #7B8790;
    margin-top: 0;
  }

  .buscador {
    margin: 16px 0 20px;
  }

  .buscador input {
    width: 100%;
    max-width: 260px;
    padding: 12px 18px;
    border: 1px solid #E1E6E8;
    border-radius: 30px;
    background: #FFFFFF;
    color: #263238;
    font-size: 13px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .buscador input::placeholder {
    color: #98A5AC;
  }

  .buscador input:focus {
    outline: none;
    border-color: #0D6A62;
    box-shadow: 0 0 0 3px rgba(13, 106, 98, 0.08);
  }

  .tabla-contenedor {
    width: 100%;
    overflow-x: auto;
    border-radius: 12px;
  }

  .tabla-recomendaciones {
    width: 100%;
    min-width: 800px;
    border-collapse: separate;
    border-spacing: 0;
    text-align: left;
  }

  .tabla-recomendaciones th {
    padding: 14px 12px;
    background: #F8F9FA;
    border-bottom: 1px solid #E1E6E8;
    font-size: 12px;
    font-weight: 600;
    color: #718087;
  }

  .tabla-recomendaciones td {
    padding: 18px 12px;
    background: #FFFFFF;
    border-bottom: 1px solid #EDF0F1;
    font-size: 13px;
    color: #35434A;
    vertical-align: middle;
  }

  .tabla-recomendaciones td strong {
    font-weight: 500;
  }

  .tabla-recomendaciones td p {
    margin: 5px 0 0;
    font-size: 12px;
    color: #89969C;
  }

  .tabla-recomendaciones tbody tr:hover td {
    background: #F4F9F8;
  }

  .tabla-recomendaciones tbody tr:last-child td {
    border-bottom: none;
  }

  .tabla-recomendaciones tbody tr:last-child td:first-child {
    border-bottom-left-radius: 12px;
  }

  .tabla-recomendaciones tbody tr:last-child td:last-child {
    border-bottom-right-radius: 12px;
  }

  .acciones-tabla {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .acciones-tabla a {
    white-space: nowrap;
    font-size: 12px;
    border-radius: 8px;
  }

  .acciones-tabla a:hover {
    background: #EAF5F3;
    color: #0D6A62;
  }

  @media (max-width: 768px) {
    .encabezado h1 {
      font-size: 22px;
    }

    .tabla-recomendaciones td {
      padding: 14px 10px;
    }
  }

  
.prioridad-chip {
  display: inline-block;
  padding: 6px 13px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;
}

.prioridad-chip.alta {
  background: #FDE8E8;
  color: #E53935;
}

.prioridad-chip.media {
  background: #FFF3CD;
  color: #A66B00;
}

.prioridad-chip.baja {
  background: #FFF7DB;
  color: #B8860B;
}

/* Botones de acciones */
.acciones-tabla {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: nowrap;
}

.acciones-tabla .mat-mdc-icon-button {
  width: 30px;
  height: 30px;
  padding: 0;
  flex: 0 0 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #E1E6E8;
  border-radius: 8px;
  background: #FFFFFF;
  color: #0D6A62;
  transition: background 0.2s, border-color 0.2s;
}

.acciones-tabla svg {
  width: 16px;
  height: 16px;
}

.acciones-tabla .mat-mdc-icon-button:hover {
  background: #EAF5F3;
  border-color: #0D6A62;
}

.acciones-tabla .boton-eliminar {
  color: #E74C3C;
}

.acciones-tabla .boton-eliminar:hover {
  background: #FFF0F0;
  border-color: #E74C3C;
}


/* Barra de búsqueda y filtros */
.barra-filtros {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin: 18px 0 20px;
  padding-bottom: 8px;
}

.barra-filtros .buscador {
  flex: 1;
  min-width: 220px;
  margin: 0;
}

.barra-filtros .buscador input {
  width: 100%;
  max-width: 260px;
  height: 40px;
  border-radius: 24px;
}

.barra-filtros mat-form-field {
  width: 190px;
}

/* Adaptación para pantallas pequeñas */
@media (max-width: 600px) {
  .barra-filtros {
    flex-direction: column;
    align-items: stretch;
  }

  .barra-filtros .buscador {
    min-width: 0;
  }

  .barra-filtros .buscador input,
  .barra-filtros mat-form-field {
    width: 100%;
    max-width: 100%;
  }
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
  private readonly reportesApi = inject(Reporteservice);
protected readonly reportes = signal<ReporteDTO[]>([]);
protected readonly busqueda = signal('');

protected tituloReporte(id: number): string {
  return this.reportes().find(r => r.idReporte === id)?.titulo ?? `Reporte #${id}`;
}


protected recomendacionesFiltradas(): RecomendacionDTO[] {
  const texto = this.busqueda().toLowerCase().trim();

  return this.recomendaciones().filter(item =>
    item.tituloSugerido.toLowerCase().includes(texto) ||
    this.tituloReporte(item.reporteId).toLowerCase().includes(texto) ||
    String(item.reporteId).includes(texto)
  );
}

  
protected cargar(prioridad = this.prioridad()): void {
  this.prioridad.set(prioridad);
  this.error.set('');
  this.cargando.set(true);

  forkJoin({
    recomendaciones: this.servicio.listar(prioridad),
    reportes: this.reportesApi.listar()
  }).subscribe({
    next: ({ recomendaciones, reportes }) => {
      this.recomendaciones.set(recomendaciones);
      this.reportes.set(reportes);
      this.cargando.set(false);
    },
    error: (error: HttpErrorResponse) => {
      this.acceso.revisarError(error);
      this.error.set('No se pudieron cargar las recomendaciones.');
      this.cargando.set(false);
    }
  });
}


protected eliminarRecomendacion(item: RecomendacionDTO): void {
  const confirmar = window.confirm('¿Deseas eliminar esta recomendación?');

  if (!confirmar) return;

  this.cargando.set(true);
  this.servicio.eliminar(item.idRecomendacion).subscribe({
    next: () => {
      this.recomendaciones.update(lista =>
        lista.filter(r => r.idRecomendacion !== item.idRecomendacion)
      );
      this.cargando.set(false);
    },
    error: (error: HttpErrorResponse) => {
      this.acceso.revisarError(error);
      this.error.set('No se pudo eliminar la recomendación.');
      this.cargando.set(false);
    }
  });
}

}
