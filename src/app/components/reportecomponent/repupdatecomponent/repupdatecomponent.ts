import { Loginservice } from '../../../services/loginservice';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Reporteservice } from '../../../services/reporteservice';
import { Categoriaservice } from '../../../services/categoriaservice';
import { Ubicacionservice } from '../../../services/ubicacionservice';
import { CategoriaDTOList } from '../../../models/CategoriaDTOList';
import { UbicacionDTOList } from '../../../models/UbicacionDTOList';
import { ReporteDTOUpdate } from '../../../models/ReporteDTOUpdate';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Rolservice } from '../../../services/rolservice';
import { UsuarioDTOList } from '../../../models/UsuarioDTOList';

@Component({
  selector: 'app-repupdatecomponent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './repupdatecomponent.html',
  styleUrl: './repupdatecomponent.css',
})
export class Repupdatecomponent implements OnInit {
  form: FormGroup;
  categorias: CategoriaDTOList[] = [];
  ubicaciones: UbicacionDTOList[] = [];
  categoriasCargadas = false;
  ubicacionesCargadas = false;
  guardando = false;
  mensaje = '';
  mensajeOpciones = '';
  id = 0;
  cargando = true;
  encontrado = false;
  tecnicos: UsuarioDTOList[] = [];
  tecnicosCargados = false;

  esAdmin = false;
  constructor(
    private fb: FormBuilder,
    private login: Loginservice,
    private service: Reporteservice,
    private categoriaService: Categoriaservice,
    private ubicacionService: Ubicacionservice,
    private usuarioService: Usuarioservice,
    private rolService: Rolservice,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.esAdmin = this.login.hasAnyRole(['ADMIN']);
    this.form = this.fb.group({
      categoriaId: [null as number | null, Validators.required],
      ubicacionId: [null as number | null, Validators.required],
      titulo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.pattern(/\S/)]],
      detalleUbicacion: ['', Validators.maxLength(255)],
      tecnicoAsignadoId: [null as number | null],
      prioridad: [null as string | null],
      estado: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.cargando = false;
      this.mensaje = 'El ID del reporte no es válido.';
      return;
    }
    this.service.buscarPorId(this.id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.encontrado = true;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.cargando = false;
        this.mensaje =
          error.status === 404 ? 'No se encontró el reporte.' : 'No se pudo cargar el reporte.';
        this.cdr.markForCheck();
      },
    });
    this.cargarOpciones();
    this.cargarTecnicos();
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

  cargarTecnicos(): void {
    if (!this.esAdmin) {
      this.tecnicosCargados = true;
      return;
    }
    this.rolService.listar().subscribe({
      next: (roles) => {
        const rolesTecnicos = roles.filter(
          (rol) => rol.nombre.toUpperCase().replace('ROLE_', '') === 'TECNICO',
        );
        this.usuarioService.listar().subscribe({
          next: (usuarios) => {
            this.tecnicos = usuarios.filter((usuario) =>
              rolesTecnicos.some((rol) => rol.idRol === usuario.rolId),
            );
            this.tecnicosCargados = true;
            this.cdr.markForCheck();
          },
          error: () => {
            this.mensajeOpciones = 'No se pudieron cargar los técnicos.';
            this.cdr.markForCheck();
          },
        });
      },
      error: () => {
        this.mensajeOpciones = 'No se pudieron cargar los roles de los técnicos.';
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
    if (this.guardando || !this.encontrado) return;
    if (!this.categoriasCargadas || !this.ubicacionesCargadas || !this.tecnicosCargados) {
      this.mensaje = 'Espere a que se carguen las opciones del formulario.';
      return;
    }
    if (this.form.invalid) {
      this.mensaje = 'Revise los campos del formulario.';
      return;
    }
    if (
      this.esAdmin &&
      this.form.value.tecnicoAsignadoId !== null &&
      !this.tecnicos.some((tecnico) => tecnico.idUsuario === this.form.value.tecnicoAsignadoId)
    ) {
      this.mensaje = 'Seleccione un técnico disponible o deje el reporte sin asignar.';
      return;
    }
    const dto: ReporteDTOUpdate = {
      categoriaId: this.form.value.categoriaId,
      ubicacionId: this.form.value.ubicacionId,
      titulo: this.form.value.titulo.trim(),
      descripcion: this.form.value.descripcion.trim(),
      detalleUbicacion: this.form.value.detalleUbicacion?.trim() || null,
      tecnicoAsignadoId: this.form.value.tecnicoAsignadoId ?? null,
      prioridad: this.form.value.prioridad ?? null,
      estado: this.form.value.estado,
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.actualizar(this.id, dto).subscribe({
      next: (reporte) => {
        this.router.navigate(['/reportes/listar'], {
          state: { aviso: 'Reporte actualizado. ' + (reporte.notificacionMensaje || '') },
        });
      },
      error: () => {
        this.guardando = false;
        this.mensaje = 'No se pudo guardar el reporte.';
        this.cdr.markForCheck();
      },
    });
  }
}
