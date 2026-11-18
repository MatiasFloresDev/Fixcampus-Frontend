import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RolDTO } from '../../../models/RolDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { UsuarioFormularioDTO } from '../../../models/UsuarioFormularioDTO';
import { Accesoservice } from '../../../services/accesoservice';
import { Usuarioservice } from '../../../services/usuarioservice';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-usuarioformcomponent',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './usuarioformcomponent.html',
  styleUrl: './usuarioformcomponent.css',
})
export class Usuarioformcomponent implements OnInit {
  roles: RolDTO[] = [];
  cargando = true;
  ocupado = false;
  error = '';
  modo = 'nuevo';
  seleccionado: UsuarioDTO | null = null;
  formulario: FormGroup;
  constructor(
    private servicio: Usuarioservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ruta: ActivatedRoute,
    private router: Router,
  ) {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      rolId: [null, [Validators.required, Validators.min(1)]],
      estado: ['ACTIVO', [Validators.required, Validators.pattern(/^(ACTIVO|INACTIVO)$/)]],
      password: [''],
    });
  }

  nombreRol(id: number): string {
    return this.roles.find((rol) => rol.idRol === id)?.nombre ?? 'Rol no disponible';
  }
  guardar(): void {
    if (this.ocupado || this.cargando || !this.modo || this.modo === 'detalle') return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    const datos = new UsuarioFormularioDTO();
    datos.nombre = valores.nombre.trim();
    datos.apellido = valores.apellido.trim();
    datos.correo = valores.correo.trim();
    datos.rolId = valores.rolId;
    datos.estado = valores.estado;
    datos.password = valores.password || undefined;
    const id = this.seleccionado?.idUsuario;
    const peticion = id ? this.servicio.actualizar(id, datos) : this.servicio.registrar(datos);
    this.ocupado = true;
    peticion.subscribe({
      next: () => {
        this.finalizar('Se guardó la cuenta.');
        this.ocupado = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.mostrarError(error);
        this.ocupado = false;
        this.cdr.detectChanges();
      },
    });
  }
  private mostrarError(error: HttpErrorResponse): void {
    this.acceso.revisarError(error);
    this.error =
      [400, 404, 409].includes(error.status) && typeof error.error?.message === 'string'
        ? error.error.message
        : 'No se pudo completar la consulta. Vuelve a intentarlo.';
  }
  ngOnInit(): void {
    if (!this.acceso.validarSesion(true)) return;
    const valor = this.ruta.snapshot.paramMap.get('id');
    this.modo = this.ruta.snapshot.data['detalle'] ? 'detalle' : valor ? 'editar' : 'nuevo';
    if (valor && (!Number.isSafeInteger(Number(valor)) || Number(valor) < 1)) {
      this.error = 'El identificador no es válido.';
      this.cargando = false;
      this.modo = '';
      return;
    }
    const clave = this.formulario.controls['password'];
    clave.setValidators(
      this.modo === 'nuevo'
        ? [Validators.required, Validators.minLength(6), Validators.pattern(/\S/)]
        : [Validators.minLength(6), Validators.pattern(/\S/)],
    );
    clave.updateValueAndValidity();
    this.servicio.roles().subscribe({
      next: (roles) => {
        this.roles = roles;
        if (!valor) {
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }
        this.servicio.obtener(Number(valor)).subscribe({
          next: (usuario) => {
            this.seleccionado = usuario;
            this.formulario.setValue({
              nombre: usuario.nombre,
              apellido: usuario.apellido,
              correo: usuario.correo,
              rolId: usuario.rolId,
              estado: usuario.estado,
              password: '',
            });
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: (error: HttpErrorResponse) => this.falloCarga(error),
        });
      },
      error: (error: HttpErrorResponse) => this.falloCarga(error),
    });
  }
  cerrar(): void {
    this.router.navigate(['/administracion/usuarios/listar']);
  }
  private finalizar(mensaje: string): void {
    this.aviso.open(mensaje, 'Cerrar', { duration: 4000 });
    this.cerrar();
  }
  private falloCarga(error: HttpErrorResponse): void {
    this.mostrarError(error);
    this.modo = '';
    this.cargando = false;
    this.cdr.detectChanges();
  }
}
