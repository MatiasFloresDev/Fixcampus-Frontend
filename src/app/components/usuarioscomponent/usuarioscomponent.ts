import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, forkJoin } from 'rxjs';
import { RolUsuarioDTO, UsuarioDTO } from '../../models/UsuarioDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Usuarioservice } from '../../services/usuarioservice';

@Component({
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './usuarioscomponent.html',
  styleUrl: './usuarioscomponent.css',
})
export class Usuarioscomponent implements OnInit {
  private readonly servicio = inject(Usuarioservice);
  private readonly acceso = inject(Accesoservice);
  private readonly destruccion = inject(DestroyRef);
  private readonly aviso = inject(MatSnackBar);
  protected readonly usuarios = signal<UsuarioDTO[]>([]);
  protected readonly roles = signal<RolUsuarioDTO[]>([]);
  protected readonly cargando = signal(false);
  protected readonly ocupado = signal(false);
  protected readonly error = signal('');
  protected readonly busqueda = signal('');
  protected readonly pagina = signal(0);
  protected readonly porPagina = signal(5);
  protected readonly modo = signal<'nuevo' | 'editar' | 'detalle' | null>(null);
  protected readonly seleccionado = signal<UsuarioDTO | null>(null);
  protected readonly pendiente = signal<UsuarioDTO | null>(null);
  protected readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLocaleLowerCase('es');
    return this.usuarios().filter((u) =>
      (u.nombre + ' ' + u.apellido + ' ' + u.correo).toLocaleLowerCase('es').includes(texto),
    );
  });
  protected readonly filas = computed(() =>
    this.filtrados().slice(
      this.pagina() * this.porPagina(),
      (this.pagina() + 1) * this.porPagina(),
    ),
  );
  protected readonly totales = computed(() =>
    this.roles().map((rol) => ({
      nombre: rol.nombre,
      cantidad: this.usuarios().filter((u) => u.rolId === rol.idRol).length,
    })),
  );
  protected readonly formulario = inject(FormBuilder).group({
    nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    rolId: [null as number | null, Validators.required],
    estado: ['ACTIVO', Validators.required],
    password: [''],
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    forkJoin({ usuarios: this.servicio.listar(), roles: this.servicio.roles() })
      .pipe(
        takeUntilDestroyed(this.destruccion),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: ({ usuarios, roles }) => {
          this.usuarios.set(usuarios);
          this.roles.set(roles);
          this.pagina.set(
            Math.min(
              this.pagina(),
              Math.max(0, Math.ceil(this.filtrados().length / this.porPagina()) - 1),
            ),
          );
        },
        error: (error) => this.mostrarError(error),
      });
  }

  protected nombreRol(id: number): string {
    return this.roles().find((rol) => rol.idRol === id)?.nombre ?? 'Rol no disponible';
  }

  protected buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(0);
  }

  protected cambiarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.porPagina.set(evento.pageSize);
  }

  protected abrir(usuario: UsuarioDTO | null, modo: 'nuevo' | 'editar' | 'detalle'): void {
    if (this.ocupado()) return;
    this.cerrar();
    this.seleccionado.set(usuario);
    this.modo.set(modo);
    this.formulario.reset({ ...usuario, estado: usuario?.estado ?? 'ACTIVO', password: '' });
    const clave = this.formulario.controls.password;
    clave.setValidators(
      modo === 'nuevo'
        ? [Validators.required, Validators.minLength(6), Validators.pattern(/\S/)]
        : [Validators.minLength(6), Validators.pattern(/\S/)],
    );
    clave.updateValueAndValidity();
  }

  protected cerrar(): void {
    this.modo.set(null);
    this.seleccionado.set(null);
    this.pendiente.set(null);
    this.error.set('');
  }

  protected guardar(): void {
    if (this.ocupado() || !this.modo() || this.modo() === 'detalle') return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    const datos = {
      nombre: valores.nombre!.trim(),
      apellido: valores.apellido!.trim(),
      correo: valores.correo!.trim(),
      rolId: valores.rolId!,
      estado: valores.estado!,
      password: valores.password || undefined,
    };
    const id = this.seleccionado()?.idUsuario;
    const peticion = id ? this.servicio.actualizar(id, datos) : this.servicio.registrar(datos);
    this.ocupado.set(true);
    peticion
      .pipe(
        takeUntilDestroyed(this.destruccion),
        finalize(() => this.ocupado.set(false)),
      )
      .subscribe({
        next: () => this.finalizar('Se guardó la cuenta.'),
        error: (error) => this.mostrarError(error),
      });
  }

  protected eliminar(): void {
    const usuario = this.pendiente();
    if (!usuario || this.ocupado()) return;
    this.ocupado.set(true);
    this.servicio
      .eliminar(usuario.idUsuario)
      .pipe(
        takeUntilDestroyed(this.destruccion),
        finalize(() => this.ocupado.set(false)),
      )
      .subscribe({
        next: () => this.finalizar('Se eliminó la cuenta.'),
        error: (error) => this.mostrarError(error),
      });
  }

  private finalizar(mensaje: string): void {
    this.cerrar();
    this.aviso.open(mensaje, 'Cerrar', { duration: 4000 });
    this.cargar();
  }

  private mostrarError(error: HttpErrorResponse): void {
    this.acceso.revisarError(error);
    this.error.set(
      [400, 404, 409].includes(error.status) && typeof error.error?.message === 'string'
        ? error.error.message
        : 'No se pudo completar la consulta. Vuelve a intentarlo.',
    );
  }
}
