import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Adjuntoservice } from '../../../services/adjuntoservice';
import { AdjuntoDTOList } from '../../../models/AdjuntoDTOList';

@Component({
  selector: 'app-adjuntos-reporte',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './adjuntosreportecomponent.html',
  styleUrl: './adjuntosreportecomponent.css',
})
export class Adjuntosreportecomponent implements OnChanges {
  @Input() reporteId: number = 0;

  adjuntos: AdjuntoDTOList[] = [];
  cargandoAdjuntos = false;
  mensajeAdjuntos = '';

  constructor(
    private adjuntoService: Adjuntoservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reporteId']) {
      this.listarAdjuntos();
    }
  }

  listarAdjuntos(): void {
    if (!Number.isInteger(this.reporteId) || this.reporteId <= 0) {
      this.mensajeAdjuntos = 'El ID del reporte no es válido.';
      return;
    }
    this.cargandoAdjuntos = true;
    this.mensajeAdjuntos = '';
    this.adjuntoService.listarPorReporte(this.reporteId).subscribe({
      next: (data) => {
        this.adjuntos = data;
        this.cargandoAdjuntos = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoAdjuntos = false;
        this.mensajeAdjuntos = 'No se pudieron cargar los adjuntos.';
        this.cdr.markForCheck();
      },
    });
  }
}
