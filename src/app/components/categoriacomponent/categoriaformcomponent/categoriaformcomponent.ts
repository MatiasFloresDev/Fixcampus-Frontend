import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoriaFormularioDTO } from '../../../models/CategoriaFormularioDTO';
import { Accesoservice } from '../../../services/accesoservice';
import { Categoriaservice } from '../../../services/categoriaservice';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-categoriaformcomponent',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './categoriaformcomponent.html',
  styleUrl: './categoriaformcomponent.css',
})
export class Categoriaformcomponent implements OnInit {
  formulario: FormGroup;
  modo = 'nuevo';
  idEditado = 0;
  ocupado = false;
  cargando = false;
  errorAccion = '';
  constructor(
    private servicio: Categoriaservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ruta: ActivatedRoute,
    private router: Router,
  ) {
    this.formulario = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.pattern(/\S/),
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      descripcion: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
    });
  }
  ngOnInit(): void {
    if (!this.acceso.validarSesion(true)) return;
    const valor = this.ruta.snapshot.paramMap.get('id');
    this.modo = this.ruta.snapshot.data['detalle'] ? 'detalle' : valor ? 'editar' : 'nuevo';
    if (!valor) return;
    const id = Number(valor);
    if (!Number.isSafeInteger(id) || id < 1) {
      this.errorAccion = 'El identificador no es válido.';
      this.modo = '';
      return;
    }
    this.ocupado = true;
    this.cargando = true;
    this.servicio.obtener(id).subscribe({
      next: (datos) => {
        this.formulario.reset({
          nombre: datos.nombre,
          descripcion: datos.descripcion,
        });
        this.idEditado = datos.idCategoria;
        this.formulario.enable();
        if (this.modo === 'detalle') this.formulario.disable();

        this.ocupado = false;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.modo = '';
        this.cargando = false;
        this.fallar(error, 'No se pudo abrir el registro.');
      },
    });
  }
  guardar(): void {
    if (this.ocupado || this.modo === 'detalle' || !this.modo) return;
    this.normalizarNombre();
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    const datos = new CategoriaFormularioDTO();
    datos.nombre = valores.nombre.trim();
    datos.descripcion = valores.descripcion.trim();
    this.errorAccion = '';
    this.ocupado = true;
    const peticion = this.idEditado
      ? this.servicio.actualizar(this.idEditado, datos)
      : this.servicio.registrar(datos);
    peticion.subscribe({
      next: () => {
        this.finalizar('Se guardó el registro.');
      },
      error: (error: HttpErrorResponse) => {
        this.fallar(error, 'No se pudo guardar el registro.');
      },
    });
  }
  private fallar(error: HttpErrorResponse, mensaje: string): void {
    this.errorAccion = this.mensajeError(error, mensaje);
    this.ocupado = false;
    this.cdr.detectChanges();
  }
  private mensajeError(error: HttpErrorResponse, respaldo: string): string {
    this.acceso.revisarError(error);
    if (error.status === 403) return 'Esta acción requiere una cuenta administradora.';
    if ([400, 404, 409].includes(error.status) && typeof error.error?.message === 'string')
      return error.error.message;
    return respaldo;
  }
  cerrar(): void {
    this.router.navigate(['/administracion/categorias/listar']);
  }
  private finalizar(mensaje: string): void {
    this.aviso.open(mensaje, 'Cerrar', { duration: 4000 });
    this.cerrar();
  }
  normalizarNombre(): void {
    const nombre = this.formulario.controls['nombre'];
    nombre.setValue((nombre.value || '').trim());
  }
}
