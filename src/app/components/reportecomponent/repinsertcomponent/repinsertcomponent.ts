import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Reporteservice } from '../../../services/reporteservice';
import { Categoriaservice } from '../../../services/categoriaservice';
import { Ubicacionservice } from '../../../services/ubicacionservice';
import { CategoriaDTOList } from '../../../models/CategoriaDTOList';
import { UbicacionDTOList } from '../../../models/UbicacionDTOList';
import { ReporteDTOInsert } from '../../../models/ReporteDTOInsert';
import { Adjuntoservice } from '../../../services/adjuntoservice';
import { AdjuntoDTOInsert } from '../../../models/AdjuntoDTOInsert';
import { Notificacionservice } from '../../../services/notificacionservice';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-repinsertcomponent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
    MatCheckboxModule,
  ],
  templateUrl: './repinsertcomponent.html',
  styleUrl: './repinsertcomponent.css',
})
export class Repinsertcomponent implements OnInit {
  form: FormGroup;
  categorias: CategoriaDTOList[] = [];
  ubicaciones: UbicacionDTOList[] = [];
  categoriasCargadas = false;
  ubicacionesCargadas = false;
  guardando = false;
  mensaje = '';
  mensajeOpciones = '';
  formAdjunto: FormGroup;
  incluirAdjunto = false;
  reporteCreadoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private service: Reporteservice,
    private categoriaService: Categoriaservice,
    private ubicacionService: Ubicacionservice,
    private adjuntoService: Adjuntoservice,
    private notificacionService: Notificacionservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      categoriaId: [null as number | null, Validators.required],
      ubicacionId: [null as number | null, Validators.required],
      titulo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.pattern(/\S/)]],
      detalleUbicacion: ['', Validators.maxLength(255)],
    });
    this.formAdjunto = this.fb.group({
      nombreArchivo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
      urlArchivo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]],
      tipoArchivo: ['', Validators.maxLength(100)],
    });
  }

  ngOnInit(): void {
    this.cargarOpciones();
  }

  cargarOpciones(): void {
    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias = data;
        this.categoriasCargadas = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeOpciones = 'No se pudieron cargar las categorías.';
        this.cdr.markForCheck();
      },
    });
    this.ubicacionService.listar().subscribe({
      next: (data) => {
        this.ubicaciones = data;
        this.ubicacionesCargadas = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeOpciones = 'No se pudieron cargar las ubicaciones.';
        this.cdr.markForCheck();
      },
    });
  }

  descripcionUbicacion(ubicacion: UbicacionDTOList): string {
    const partes = [ubicacion.campus, ubicacion.edificio];
    if (ubicacion.piso !== null) {
      partes.push('Piso ' + ubicacion.piso);
    }
    if (ubicacion.zona) partes.push(ubicacion.zona);
    if (ubicacion.tipo) partes.push(ubicacion.tipo);
    return partes.filter((parte) => parte).join(' · ');
  }

  guardar(): void {
    if (this.guardando || this.reporteCreadoId !== null) return;
    if (!this.categoriasCargadas || !this.ubicacionesCargadas) {
      this.mensaje = 'Espere a que se carguen las opciones del formulario.';
      return;
    }
    if (this.form.invalid || (this.incluirAdjunto && this.formAdjunto.invalid)) {
      this.mensaje = 'Revise los campos del formulario.';
      return;
    }
    const dto: ReporteDTOInsert = {
      categoriaId: this.form.value.categoriaId,
      ubicacionId: this.form.value.ubicacionId,
      titulo: this.form.value.titulo.trim(),
      descripcion: this.form.value.descripcion.trim(),
      detalleUbicacion: this.form.value.detalleUbicacion?.trim() || null,
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.registrar(dto).subscribe({
      next: (reporte) => {
        this.reporteCreadoId = reporte.idReporte;

        this.notificacionService
          .notificar({
            destinatario: environment.correoAdminNotificaciones,
            asunto: `Nuevo reporte #${reporte.idReporte}: ${reporte.titulo}`,
            tituloReporte: reporte.titulo,
            estado: reporte.estado,
            detalle: reporte.descripcion,
          })
          .subscribe();

        if (!this.incluirAdjunto) {
          this.router.navigate(['/reportes/listar']);
          return;
        }
        const evidencia: AdjuntoDTOInsert = {
          reporteId: reporte.idReporte,
          nombreArchivo: this.formAdjunto.value.nombreArchivo.trim(),
          urlArchivo: this.formAdjunto.value.urlArchivo.trim(),
          tipoArchivo: this.formAdjunto.value.tipoArchivo?.trim() || null,
        };
        this.adjuntoService.registrar(evidencia).subscribe({
          next: () => {
            this.router.navigate(['/reportes/listar']);
          },
          error: () => {
            this.guardando = false;
            this.mensaje = 'El reporte se creó correctamente, pero la evidencia no pudo registrarse.';
            this.cdr.markForCheck();
          },
        });
        this.cdr.markForCheck();
      },
      error: () => {
        this.guardando = false;
        this.mensaje = 'No se pudo guardar el reporte.';
        this.cdr.markForCheck();
      },
    });
  }
}
