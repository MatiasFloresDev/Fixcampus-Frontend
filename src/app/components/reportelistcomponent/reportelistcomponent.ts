import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReporteDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Reporteservice } from '../../services/reporteservice';
@Component({
  selector: 'app-reportelistcomponent',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatPaginatorModule,
  ],
  templateUrl: './reportelistcomponent.html',
  styleUrl: './reportelistcomponent.css',
})
export class Reportelistcomponent implements OnInit {
  prioridades = ['MUY_BAJA', 'BAJA', 'MEDIA', 'ALTA', 'MUY_ALTA'];
  prioridad = '';
  pagina = 0;
  porPagina = 5;
  lista: ReporteDTO[] = [];
  cargandoLista = true;
  errorLista = '';
  constructor(
    public acceso: Accesoservice,
    private servicio: Reporteservice,
    private ruta: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    if (!this.acceso.validarSesion()) return;
    const id = Number(this.ruta.snapshot.queryParamMap.get('id'));
    if (Number.isSafeInteger(id) && id > 0) {
      this.router.navigate(['/reportes', id], { replaceUrl: true });
      return;
    }
    this.cargarReportes();
  }
  cargarReportes(prioridad = this.prioridad): void {
    if (this.cargandoLista && this.lista.length) return;
    if (prioridad !== this.prioridad) {
      this.prioridad = prioridad;
      this.pagina = 0;
    }
    this.cargandoLista = true;
    this.errorLista = '';
    this.servicio.listar(this.prioridad).subscribe({
      next: (datos) => {
        this.lista = datos;
        this.pagina = Math.min(
          this.pagina,
          Math.max(0, Math.ceil(datos.length / this.porPagina) - 1),
        );
        this.cargandoLista = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.errorLista = 'No se pudieron consultar los reportes.';
        this.cargandoLista = false;
        this.cdr.detectChanges();
      },
    });
  }
  filasReportes(): ReporteDTO[] {
    return this.lista.slice(this.pagina * this.porPagina, (this.pagina + 1) * this.porPagina);
  }
  cambiarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex;
    this.porPagina = evento.pageSize;
  }
}
