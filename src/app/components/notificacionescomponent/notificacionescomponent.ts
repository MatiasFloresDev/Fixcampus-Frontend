import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Notificacionservice } from '../../services/notificacionservice';
import { NotificacionDTO } from '../../models/NotificacionDTO';

@Component({
  imports: [DatePipe, RouterLink, MatTableModule, MatButtonModule],
  templateUrl: './notificacionescomponent.html',
  styleUrl: './notificacionescomponent.css',
})
export class Notificacionescomponent implements OnInit {
  registros: NotificacionDTO[] = [];
  columnas = ['reporte', 'tipo', 'destinatario', 'estado', 'fecha', 'mensaje', 'acciones'];
  cargando = false;
  enviandoId = 0;
  mensaje = '';
  constructor(
    private servicio: Notificacionservice,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.listar();
  }
  listar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.registros = datos;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensaje = 'No se pudieron cargar las notificaciones.';
        this.cargando = false;
        this.cdr.markForCheck();
      },
    });
  }
  reintentar(registro: NotificacionDTO): void {
    if (this.enviandoId || registro.estado === 'ENVIADA') return;
    this.enviandoId = registro.idNotificacion;
    this.servicio.reintentar(registro.idNotificacion).subscribe({
      next: () => {
        this.enviandoId = 0;
        this.listar();
      },
      error: () => {
        this.enviandoId = 0;
        this.mensaje = 'No se pudo reintentar el envío.';
        this.cdr.markForCheck();
      },
    });
  }
}
