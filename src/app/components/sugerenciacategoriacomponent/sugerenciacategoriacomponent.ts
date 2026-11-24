import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { CategoriaDTOList } from '../../models/CategoriaDTOList';
import { Iaservice } from '../../services/iaservice';

@Component({
  selector: 'app-sugerencia-categoria',
  imports: [MatButtonModule],
  templateUrl: './sugerenciacategoriacomponent.html',
  styleUrl: './sugerenciacategoriacomponent.css',
})
export class Sugerenciacategoriacomponent implements OnChanges, OnDestroy {
  @Input() descripcion = '';
  @Input() categorias: CategoriaDTOList[] = [];
  @Input() guardando = false;
  @Output() seleccionar = new EventEmitter<CategoriaDTOList>();
  limiteDescripcionIA = 1000;
  consultandoIA = false;
  mensajeIA = '';
  sugerencia: CategoriaDTOList | null = null;
  private consultaIA?: Subscription;
  private activo = true;

  constructor(
    private servicio: Iaservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['descripcion']) {
      this.consultaIA?.unsubscribe();
      this.consultandoIA = false;
      this.sugerencia = null;
      this.mensajeIA = '';
    }
  }

  descripcionIA(): string {
    return (this.descripcion || '').trim();
  }

  sugerirCategoria(): void {
    const descripcion = this.descripcionIA();
    if (
      this.guardando ||
      this.consultandoIA ||
      !this.categorias.length ||
      !descripcion ||
      descripcion.length > this.limiteDescripcionIA
    )
      return;
    this.consultandoIA = true;
    this.sugerencia = null;
    this.mensajeIA = '';
    this.consultaIA = this.servicio.sugerirCategoria(descripcion).subscribe({
      next: ({ categoriaId }) => {
        if (!this.activo) return;
        this.consultandoIA = false;
        if (descripcion !== this.descripcionIA()) {
          this.cdr.detectChanges();
          return;
        }
        const categoria = this.categorias.find((item) => item.idCategoria === categoriaId);
        if (categoria) this.sugerencia = categoria;
        else
          this.mensajeIA =
            'No se encontró una categoría para esa descripción. Describe el daño con más detalle o elige una categoría en el formulario.';
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        if (!this.activo) return;
        this.consultandoIA = false;
        if (descripcion !== this.descripcionIA()) {
          this.cdr.detectChanges();
          return;
        }
        const mensaje =
          error.status === 429
            ? 'Se alcanzó el límite de consultas de IA.'
            : error.status === 503
              ? 'El servicio de IA no está disponible en este momento.'
              : 'No se pudo consultar la sugerencia. Revisa la conexión y vuelve a intentarlo.';
        this.mensajeIA = mensaje + ' Puedes elegir la categoría en el formulario.';
        this.cdr.detectChanges();
      },
    });
  }

  usarSugerencia(): void {
    if (!this.sugerencia || this.guardando) return;
    this.seleccionar.emit(this.sugerencia);
    this.sugerencia = null;
    this.mensajeIA = 'Categoría seleccionada. Puedes cambiarla antes de guardar.';
  }

  ngOnDestroy(): void {
    this.activo = false;
    this.consultaIA?.unsubscribe();
  }
}
