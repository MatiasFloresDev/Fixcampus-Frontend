import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormRecord,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CampoCatalogo, DefinicionCatalogo, RegistroCatalogoDTO } from '../../models/CatalogoDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Catalogoservice } from '../../services/catalogoservice';

@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './catalogocomponent.html',
  styleUrl: './catalogocomponent.css',
})
export class Catalogocomponent implements OnInit {
  private readonly servicio = inject(Catalogoservice);
  private readonly acceso = inject(Accesoservice);
  private readonly aviso = inject(MatSnackBar);
  protected readonly catalogo: DefinicionCatalogo =
    inject(ActivatedRoute).snapshot.data['catalogo'];
  protected readonly columnas = ['id', ...this.catalogo.columnas, 'acciones'];
  protected readonly formulario = new FormRecord<FormControl<string | number | null>>({});
  protected readonly registros = signal<RegistroCatalogoDTO[]>([]);
  protected readonly cargando = signal(false);
  protected readonly ocupado = signal(false);
  protected readonly errorLista = signal('');
  protected readonly errorAccion = signal('');
  protected readonly modo = signal<'nuevo' | 'editar' | 'detalle' | null>(null);
  protected readonly idEditado = signal<number | null>(null);
  protected readonly pendiente = signal<number | null>(null);
  protected readonly pagina = signal(0);
  protected readonly porPagina = signal(5);
  protected readonly filas = computed(() => {
    const inicio = this.pagina() * this.porPagina();
    return this.registros().slice(inicio, inicio + this.porPagina());
  });

  constructor() {
    const paginador = inject(MatPaginatorIntl);
    paginador.itemsPerPageLabel = 'Filas por página';
    paginador.nextPageLabel = 'Página siguiente';
    paginador.previousPageLabel = 'Página anterior';
    paginador.getRangeLabel = (pagina, limite, total) =>
      total
        ? pagina * limite + 1 + '–' + Math.min((pagina + 1) * limite, total) + ' de ' + total
        : '0 de 0';

    for (const campo of this.catalogo.campos) {
      const validadores: ValidatorFn[] = [];
      if (campo.obligatorio) validadores.push(Validators.required, Validators.pattern(/\S/));
      if (campo.longitud) validadores.push(Validators.maxLength(campo.longitud));
      if (campo.minimo) validadores.push(Validators.minLength(campo.minimo));
      if (campo.rango)
        validadores.push(Validators.min(campo.rango[0]), Validators.max(campo.rango[1]));
      if (campo.entero)
        validadores.push((control) =>
          control.value === null || Number.isInteger(control.value) ? null : { entero: true },
        );
      this.formulario.addControl(
        campo.clave,
        new FormControl<string | number | null>(null, validadores),
      );
    }
  }

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.errorLista.set('');
    this.cargando.set(true);
    this.servicio.listar(this.catalogo.recurso).subscribe({
      next: (datos) => {
        this.registros.set(datos);
        this.pagina.update((pagina) =>
          Math.min(pagina, Math.max(0, Math.ceil(datos.length / this.porPagina()) - 1)),
        );
        this.cargando.set(false);
      },
      error: (error) => {
        this.errorLista.set(this.mensajeError(error, 'No se pudo cargar el catálogo.'));
        this.cargando.set(false);
      },
    });
  }

  protected cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.porPagina.set(evento.pageSize);
  }

  protected etiqueta(clave: CampoCatalogo): string {
    return this.catalogo.campos.find((campo) => campo.clave === clave)?.etiqueta ?? clave;
  }

  protected rolBase(registro: RegistroCatalogoDTO): boolean {
    return (
      this.catalogo.id === 'idRol' && (registro.nombre === 'ADMIN' || registro.nombre === 'USUARIO')
    );
  }

  protected nuevo(): void {
    this.cerrar();
    this.formulario.enable();
    this.modo.set('nuevo');
  }

  protected abrir(registro: RegistroCatalogoDTO, modo: 'editar' | 'detalle'): void {
    const id = registro[this.catalogo.id];
    if (id === undefined || this.ocupado()) return;
    this.cerrar();
    this.ocupado.set(true);
    this.servicio.obtener(this.catalogo.recurso, id).subscribe({
      next: (datos) => {
        for (const campo of this.catalogo.campos) {
          this.formulario.controls[campo.clave].reset(datos[campo.clave] ?? null);
        }
        this.idEditado.set(id);
        this.formulario.enable();
        if (modo === 'detalle') this.formulario.disable();
        else if (this.rolBase(datos)) this.formulario.controls['nombre'].disable();
        this.modo.set(modo);
        this.ocupado.set(false);
      },
      error: (error) => {
        this.errorAccion.set(this.mensajeError(error, 'No se pudo abrir el registro.'));
        this.ocupado.set(false);
      },
    });
  }

  protected cerrar(): void {
    this.modo.set(null);
    this.idEditado.set(null);
    this.pendiente.set(null);
    this.formulario.reset();
    this.errorAccion.set('');
  }

  protected guardar(): void {
    if (this.ocupado() || this.modo() === 'detalle' || !this.modo()) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const datos = this.formulario.getRawValue();
    for (const campo of this.catalogo.campos) {
      const valor = datos[campo.clave];
      if (typeof valor === 'string') datos[campo.clave] = valor.trim() || null;
    }
    if ((datos['latitud'] == null) !== (datos['longitud'] == null)) {
      this.errorAccion.set('Ingresa latitud y longitud juntas.');
      return;
    }
    this.errorAccion.set('');
    this.ocupado.set(true);
    const id = this.idEditado();
    const peticion =
      id === null
        ? this.servicio.registrar(this.catalogo.recurso, datos)
        : this.servicio.actualizar(this.catalogo.recurso, id, datos);
    peticion.subscribe({
      next: () => this.finalizar('Se guardó el registro.'),
      error: (error) => this.fallar(error, 'No se pudo guardar el registro.'),
    });
  }

  protected pedirEliminar(registro: RegistroCatalogoDTO): void {
    this.cerrar();
    this.pendiente.set(registro[this.catalogo.id] ?? null);
  }

  protected eliminar(): void {
    const id = this.pendiente();
    if (id === null || this.ocupado()) return;
    this.ocupado.set(true);
    this.errorAccion.set('');
    this.servicio.eliminar(this.catalogo.recurso, id).subscribe({
      next: () => this.finalizar('Se eliminó el registro.'),
      error: (error) => this.fallar(error, 'No se pudo eliminar el registro.'),
    });
  }

  private finalizar(mensaje: string): void {
    this.cerrar();
    this.ocupado.set(false);
    this.aviso.open(mensaje, 'Cerrar', { duration: 4000 });
    this.cargar();
  }

  private fallar(error: HttpErrorResponse, mensaje: string): void {
    this.errorAccion.set(this.mensajeError(error, mensaje));
    this.ocupado.set(false);
  }

  private mensajeError(error: HttpErrorResponse, respaldo: string): string {
    this.acceso.revisarError(error);
    if (error.status === 403) return 'Esta acción requiere una cuenta administradora.';
    if ([400, 404, 409].includes(error.status) && typeof error.error?.message === 'string')
      return error.error.message;
    return respaldo;
  }
}
