import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { UbicacionDTO } from '../../../models/UbicacionDTO';
import { Ubicacionservice } from '../../../services/ubicacionservice';

@Component({
  selector: 'app-listarubicacioncomponent',
  imports: [MatTableModule, MatButtonModule, RouterLink],
  templateUrl: './listarubicacioncomponent.html',
  styleUrl: './listarubicacioncomponent.css',
})
export class Listarubicacioncomponent implements OnInit {
  displayedColumns: string[] = ['idUbicacion', 'campus', 'edificio', 'piso', 'zona', 'tipo'];
  dataSource: UbicacionDTO[] = [];
  cargando = true;
  mensaje = '';
  necesitaAcceso = false;

  constructor(
    private servicio: Ubicacionservice,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.cargando = true;
    this.mensaje = '';
    this.necesitaAcceso = false;
    this.dataSource = [];
    this.servicio.listar().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;
        this.necesitaAcceso = error.status === 401;
        if (error.status === 401) this.mensaje = 'Inicia sesión para consultar la lista.';
        else if (error.status === 403)
          this.mensaje = 'Tu cuenta no tiene permiso para consultar esta lista.';
        else this.mensaje = 'No se pudo cargar la lista. Revisa la conexión e inténtalo de nuevo.';
        this.cdr.detectChanges();
      },
    });
  }
}
