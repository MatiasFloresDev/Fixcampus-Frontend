import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { Map as MapaLeaflet } from 'leaflet';
import { Subscription } from 'rxjs';
import { UbicacionDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Reporteservice } from '../../services/reporteservice';

@Component({
  imports: [MatButtonModule, RouterLink],
  templateUrl: './mapacomponent.html',
  styleUrl: './mapacomponent.css',
})
export class Mapacomponent implements OnInit, OnDestroy {
  @ViewChild('mapa') contenedorMapa?: ElementRef<HTMLDivElement>;
  id: number;
  ubicacion: UbicacionDTO | null = null;
  cargando = false;
  error = '';
  errorMapa = '';
  private mapa?: MapaLeaflet;
  private suscripciones = new Subscription();
  private destruido = false;
  private navegador: boolean;

  constructor(
    private reportes: Reporteservice,
    private acceso: Accesoservice,
    private ruta: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) plataforma: object,
  ) {
    this.id = Number(this.ruta.snapshot.paramMap.get('id'));
    this.navegador = isPlatformBrowser(plataforma);
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (!Number.isSafeInteger(this.id) || this.id <= 0) {
      this.error = 'El número de reporte no es válido.';
      return;
    }
    this.error = '';
    this.errorMapa = '';
    this.cargando = true;
    this.suscripciones.add(
      this.reportes.obtener(this.id).subscribe({
        next: (reporte) => this.cargarUbicacion(reporte.ubicacionId),
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      }),
    );
  }

  private cargarUbicacion(id: number): void {
    this.suscripciones.add(
      this.reportes.ubicacion(id).subscribe({
        next: (datos) => {
          this.ubicacion = datos;
          this.cargando = false;
          this.cdr.detectChanges();
          if (this.navegador && datos.latitud != null && datos.longitud != null) {
            void this.mostrarMapa([datos.latitud, datos.longitud]);
          }
        },
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      }),
    );
  }

  private mostrarError(error: HttpErrorResponse): void {
    this.acceso.revisarError(error);
    this.error =
      error.status === 403
        ? 'No tienes permiso para consultar este reporte.'
        : 'No se pudo consultar la ubicación.';
    this.cargando = false;
    this.cdr.detectChanges();
  }

  private async mostrarMapa(punto: [number, number]): Promise<void> {
    try {
      const {
        default: { map, tileLayer, circleMarker },
      } = await import('leaflet');
      if (this.destruido || !this.contenedorMapa) return;
      this.mapa?.remove();
      this.mapa = map(this.contenedorMapa.nativeElement, { scrollWheelZoom: false }).setView(
        punto,
        17,
      );
      tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
        .on('tileerror', () => {
          if (!this.destruido) {
            this.errorMapa = 'Algunas imágenes del mapa no están disponibles.';
            this.cdr.detectChanges();
          }
        })
        .addTo(this.mapa);
      circleMarker(punto, { color: '#0d6a62', fillOpacity: 0.8, radius: 9 }).addTo(this.mapa);
    } catch {
      if (!this.destruido) {
        this.errorMapa = 'No se pudo abrir el mapa.';
        this.cdr.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.suscripciones.unsubscribe();
    this.mapa?.remove();
  }
}
