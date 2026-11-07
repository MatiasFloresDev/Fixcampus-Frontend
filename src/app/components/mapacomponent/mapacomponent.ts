import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { Map as MapaLeaflet } from 'leaflet';
import { switchMap } from 'rxjs';
import { UbicacionDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Reporteservice } from '../../services/reporteservice';

@Component({
  imports: [MatButtonModule, RouterLink],
  templateUrl: './mapacomponent.html',
  styles: `
    .mapa {
      width: 100%;
      height: clamp(240px, 55vh, 480px);
      border: 1px solid #d6dbde;
      border-radius: 12px;
      margin: 12px 0;
    }
  `,
})
export class Mapacomponent implements OnInit {
  private readonly reportes = inject(Reporteservice);
  private readonly acceso = inject(Accesoservice);
  private readonly destruccion = inject(DestroyRef);
  private readonly inyector = inject(Injector);
  private readonly vista = viewChild<ElementRef<HTMLDivElement>>('mapa');
  private mapa?: MapaLeaflet;
  protected readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  protected readonly ubicacion = signal<UbicacionDTO | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly errorMapa = signal('');

  constructor() {
    this.destruccion.onDestroy(() => this.mapa?.remove());
  }

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    if (!Number.isSafeInteger(this.id) || this.id <= 0) {
      this.error.set('El número de reporte no es válido.');
      return;
    }

    this.error.set('');
    this.cargando.set(true);
    this.reportes
      .obtener(this.id)
      .pipe(
        switchMap((reporte) => this.reportes.ubicacion(reporte.ubicacionId)),
        takeUntilDestroyed(this.destruccion),
      )
      .subscribe({
        next: (datos) => {
          this.ubicacion.set(datos);
          this.cargando.set(false);
          if (datos.latitud != null && datos.longitud != null) {
            const punto: [number, number] = [datos.latitud, datos.longitud];
            afterNextRender(() => void this.mostrarMapa(punto), { injector: this.inyector });
          }
        },
        error: (error: HttpErrorResponse) => {
          this.acceso.revisarError(error);
          this.error.set(
            error.status === 403
              ? 'No tienes permiso para consultar este reporte.'
              : 'No se pudo consultar la ubicación.',
          );
          this.cargando.set(false);
        },
      });
  }

  private async mostrarMapa(punto: [number, number]): Promise<void> {
    try {
      const { default: { map, tileLayer, circleMarker } } = await import('leaflet');
      const contenedor = this.vista()?.nativeElement;
      if (this.destruccion.destroyed || !contenedor) return;

      this.mapa = map(contenedor, { scrollWheelZoom: false }).setView(punto, 17);
      tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
        .on('tileerror', () =>
          this.errorMapa.set('Algunas imágenes del mapa no están disponibles.'),
        )
        .addTo(this.mapa);
      circleMarker(punto, { color: '#0d6a62', fillOpacity: 0.8, radius: 9 }).addTo(this.mapa);
    } catch {
      if (!this.destruccion.destroyed) this.errorMapa.set('No se pudo abrir el mapa.');
    }
  }
}
