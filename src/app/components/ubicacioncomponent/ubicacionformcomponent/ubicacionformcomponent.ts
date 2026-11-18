import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UbicacionFormularioDTO } from '../../../models/UbicacionFormularioDTO';
import { Accesoservice } from '../../../services/accesoservice';
import { Ubicacionservice } from '../../../services/ubicacionservice';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-ubicacionformcomponent',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './ubicacionformcomponent.html',
  styleUrl: './ubicacionformcomponent.css',
})
export class Ubicacionformcomponent implements OnInit {
  formulario: FormGroup;
  modo = 'nuevo';
  idEditado = 0;
  ocupado = false;
  cargando = false;
  errorAccion = '';
  constructor(
    private servicio: Ubicacionservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ruta: ActivatedRoute,
    private router: Router,
  ) {
    this.formulario = this.fb.group({
      campus: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      edificio: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      piso: [
        null,
        [Validators.min(-2147483648), Validators.max(2147483647), Validators.pattern(/^-?\d+$/)],
      ],
      zona: ['', [Validators.maxLength(150)]],
      tipo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]],
      latitud: [null, [Validators.min(-90), Validators.max(90)]],
      longitud: [null, [Validators.min(-180), Validators.max(180)]],
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
          campus: datos.campus,
          edificio: datos.edificio,
          piso: datos.piso,
          zona: datos.zona ?? '',
          tipo: datos.tipo,
          latitud: datos.latitud,
          longitud: datos.longitud,
        });
        this.idEditado = datos.idUbicacion;
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
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    if ((valores.latitud == null) !== (valores.longitud == null)) {
      this.errorAccion = 'Ingresa latitud y longitud juntas.';
      return;
    }
    const datos = new UbicacionFormularioDTO();
    datos.campus = valores.campus.trim();
    datos.edificio = valores.edificio.trim();
    datos.piso = valores.piso;
    datos.zona = valores.zona.trim() || null;
    datos.tipo = valores.tipo.trim();
    datos.latitud = valores.latitud;
    datos.longitud = valores.longitud;
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
    this.router.navigate(['/administracion/ubicaciones/listar']);
  }
  private finalizar(mensaje: string): void {
    this.aviso.open(mensaje, 'Cerrar', { duration: 4000 });
    this.cerrar();
  }
}
