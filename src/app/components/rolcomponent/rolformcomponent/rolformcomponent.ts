import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RolDTO } from '../../../models/RolDTO';
import { RolFormularioDTO } from '../../../models/RolFormularioDTO';
import { Accesoservice } from '../../../services/accesoservice';
import { Rolservice } from '../../../services/rolservice';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-rolformcomponent',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './rolformcomponent.html',
  styleUrl: './rolformcomponent.css',
})
export class Rolformcomponent implements OnInit {
  formulario: FormGroup;
  modo = 'nuevo';
  idEditado = 0;
  ocupado = false;
  cargando = false;
  errorAccion = '';
  constructor(
    private servicio: Rolservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ruta: ActivatedRoute,
    private router: Router,
  ) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      nivelAcceso: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(255)]],
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
          nivelAcceso: datos.nivelAcceso,
          descripcion: datos.descripcion ?? '',
        });
        this.idEditado = datos.idRol;
        this.formulario.enable();
        if (this.modo === 'detalle') this.formulario.disable();
        else if (this.rolBase(datos)) this.formulario.controls['nombre'].disable();

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
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    const datos = new RolFormularioDTO();
    datos.nombre = valores.nombre.trim();
    datos.nivelAcceso = valores.nivelAcceso.trim();
    datos.descripcion = valores.descripcion.trim() || null;
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
    this.router.navigate(['/administracion/roles/listar']);
  }
  private finalizar(mensaje: string): void {
    this.aviso.open(mensaje, 'Cerrar', { duration: 4000 });
    this.cerrar();
  }
  rolBase(registro: RolDTO): boolean {
    return registro.nombre === 'ADMIN' || registro.nombre === 'USUARIO';
  }
}
