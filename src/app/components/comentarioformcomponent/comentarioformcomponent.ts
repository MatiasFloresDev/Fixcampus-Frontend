import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComentarioDTO } from '../../models/ComentarioDTO';
import { ReporteDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Comentarioservice } from '../../services/comentarioservice';
import { Reporteservice } from '../../services/reporteservice';
@Component({
  selector: 'app-comentarioformcomponent',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './comentarioformcomponent.html',
  styleUrl: './comentarioformcomponent.css',
})
export class Comentarioformcomponent implements OnInit {
  reporteId: number;
  reporte: ReporteDTO | null = null;
  editado: ComentarioDTO | null = null;
  cargando = false;
  guardando = false;
  error = '';
  aviso = '';
  comentarioForm: FormGroup;

  constructor(
    private acceso: Accesoservice,
    private comentariosApi: Comentarioservice,
    private reportesApi: Reporteservice,
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.reporteId = Number(this.ruta.parent?.snapshot.paramMap.get('id'));
    this.comentarioForm = this.fb.group({
      textoComentario: [
        '',
        [Validators.required, Validators.pattern(/\S/), Validators.maxLength(2000)],
      ],
    });
  }

  guardarBloqueado(): boolean {
    return (
      (!!this.ruta.snapshot.paramMap.get('comentarioId') && !this.editado) ||
      this.guardando ||
      this.cargando ||
      !this.reporte
    );
  }
  private falloOperacion(error: HttpErrorResponse): void {
    this.mostrarError(error, 'No se pudo completar la operación.');
    this.guardando = false;
    this.cdr.detectChanges();
  }
  private mostrarError(error: HttpErrorResponse, respaldo: string): void {
    this.acceso.revisarError(error);
    this.error =
      [400, 404, 409].includes(error.status) && typeof error.error?.message === 'string'
        ? error.error.message
        : respaldo;
  }
  cancelarComentario(): void {
    this.editado = null;
    this.comentarioForm.reset({ textoComentario: '' });
  }
  guardarComentario(): void {
    this.comentarioForm.markAllAsTouched();
    if (this.guardarBloqueado() || this.comentarioForm.invalid) return;
    const texto = this.comentarioForm.getRawValue().textoComentario.trim();
    const anterior = this.editado;
    const peticion = anterior
      ? this.comentariosApi.actualizar(anterior, texto)
      : this.comentariosApi.registrar(this.reporteId, texto);
    this.guardando = true;
    this.error = '';
    this.aviso = '';
    peticion.subscribe({
      next: (comentario) => {
        this.cancelarComentario();
        this.router.navigate(['/reportes', this.reporteId, 'seguimiento', 'comentarios']);
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.falloOperacion(error);
      },
    });
  }
  ngOnInit(): void {
    if (!this.acceso.validarSesion(true)) return;
    this.cargando = true;
    this.reportesApi.obtener(this.reporteId).subscribe({
      next: (reporte) => {
        this.reporte = reporte;
        const valor = this.ruta.snapshot.paramMap.get('comentarioId');
        if (!valor) {
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }
        const id = Number(valor);
        this.comentariosApi.listar(this.reporteId).subscribe({
          next: (datos) => {
            this.editado = datos.find((item) => item.idComentario === id) ?? null;
            if (!this.editado) {
              this.error = 'El comentario ya no existe.';
            } else this.comentarioForm.setValue({ textoComentario: this.editado.textoComentario });
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: (error: HttpErrorResponse) => this.falloCarga(error),
        });
      },
      error: (error: HttpErrorResponse) => this.falloCarga(error),
    });
  }
  private falloCarga(error: HttpErrorResponse): void {
    this.mostrarError(error, 'No se pudo cargar el seguimiento.');
    this.cargando = false;
    this.cdr.detectChanges();
  }
}
