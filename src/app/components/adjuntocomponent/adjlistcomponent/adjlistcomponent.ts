import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Adjuntoservice } from '../../../services/adjuntoservice';
import { AdjuntoDTOList } from '../../../models/AdjuntoDTOList';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { Loginservice } from '../../../services/loginservice';

@Component({
  selector: 'app-adjlistcomponent',
  standalone: true,
  imports: [DatePipe, RouterLink, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule],
  templateUrl: './adjlistcomponent.html',
  styleUrl: './adjlistcomponent.css',
})
export class Adjlistcomponent implements OnInit {
  displayedColumns: string[] = [
    'idAdjunto',
    'reporteId',
    'nombreArchivo',
    'tipoArchivo',
    'fechaSubida',
    'acciones',
  ];
  dataSource = new MatTableDataSource<AdjuntoDTOList>([]);
  reportes: ReporteDTOList[] = [];
  cargando = true;
  eliminando = false;
  mensaje = '';
  mensajeReportes = '';

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private service: Adjuntoservice,
    private reporteService: Reporteservice,
    private loginService: Loginservice,
    private cdr: ChangeDetectorRef,
  ) {}

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  get puedeRegistrar(): boolean {
    return this.loginService.hasAnyRole(['ADMIN', 'REPORTANTE']);
  }

  ngOnInit(): void {
    this.listar();
    this.cargarRelaciones();
  }

  listar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.service.listar().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudieron cargar los registros de adjuntos.';
        this.cdr.markForCheck();
      },
    });
  }

  cargarRelaciones(): void {
    this.reporteService.listar().subscribe({
      next: (data) => {
        this.reportes = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeReportes = 'No se pudieron cargar los títulos de los reportes.';
        this.cdr.markForCheck();
      },
    });
  }

  nombreReporte(id: number): string {
    const reporte = this.reportes.find((reporte) => reporte.idReporte === id);
    return reporte ? reporte.titulo : 'Reporte no disponible';
  }

  eliminar(registro: AdjuntoDTOList): void {
    if (this.eliminando) return;
    const confirmado = confirm('¿Eliminar este adjunto? Esta acción no se puede deshacer.');
    if (!confirmado) {
      return;
    }
    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(registro.idAdjunto).subscribe({
      next: () => {
        this.eliminando = false;
        this.listar();
      },
      error: () => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar el adjunto.';
        this.cdr.markForCheck();
      },
    });
  }
}