import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoriaDTO } from '../../models/CategoriaDTO';
import { ReporteDTO } from '../../models/ReporteDTO';
import { ReporteFormularioDTO } from '../../models/ReporteFormularioDTO';
import { UbicacionDTO } from '../../models/UbicacionDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Categoriaservice } from '../../services/categoriaservice';
import { Reporteservice } from '../../services/reporteservice';
import { Ubicacionservice } from '../../services/ubicacionservice';
import { Sugerenciacategoriacomponent } from '../sugerenciacategoriacomponent/sugerenciacategoriacomponent';

@Component({
  selector: 'app-reporteformcomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    Sugerenciacategoriacomponent,
  ],
  templateUrl: './reporteformcomponent.html',
  styleUrl: './reporteformcomponent.css',
})
export class Reporteformcomponent implements OnInit {
  esAdmin: boolean;
  editando: boolean;
  prioridades = ['MUY_BAJA', 'BAJA', 'MEDIA', 'ALTA', 'MUY_ALTA'];
  estados = ['ABIERTO', 'EN_REVISION', 'ASIGNADO', 'EN_ATENCION', 'RESUELTO', 'CERRADO'];
  cargando = true;
  guardando = false;
  listo = false;
  mensaje = '';
  categoriasFiltradas: CategoriaDTO[] | null = null;
  buscandoCategorias = false;
  errorCategorias = '';
  consultaCategorias = '';
  mostrarResultados = false;
  private numeroBusqueda = 0;
  categorias: CategoriaDTO[] = [];
  ubicaciones: UbicacionDTO[] = [];
  original: ReporteDTO | null = null;
  formulario: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ruta: ActivatedRoute,
    private router: Router,
    private servicio: Reporteservice,
    private categoriasApi: Categoriaservice,
    private ubicacionesApi: Ubicacionservice,
    private acceso: Accesoservice,
    private aviso: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.esAdmin = this.acceso.rol() === 'ADMIN';
    this.editando = this.ruta.snapshot.paramMap.has('id');
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.pattern(/\S/)]],
      detalleUbicacion: ['', Validators.maxLength(255)],
      categoriaId: [null, [Validators.required, Validators.min(1)]],
      ubicacionId: [null, [Validators.required, Validators.min(1)]],
      estado: [
        'ABIERTO',
        [
          Validators.required,
          Validators.pattern(/^(ABIERTO|EN_REVISION|ASIGNADO|EN_ATENCION|RESUELTO|CERRADO)$/),
        ],
      ],
      prioridad: [null, Validators.pattern(/^(MUY_BAJA|BAJA|MEDIA|ALTA|MUY_ALTA)$/)],
    });
  }

  ngOnInit(): void {
    if (!this.acceso.validarSesion()) return;
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    if (this.editando && (!Number.isSafeInteger(id) || id < 1)) {
      this.mensaje = 'El identificador del reporte no es válido.';
      this.cargando = false;
      return;
    }
    this.categoriasApi.listar().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.cargarUbicaciones(id);
      },
      error: (error: HttpErrorResponse) => {
        this.falloCarga(error);
      },
    });
  }

  opcionesCategoria(): CategoriaDTO[] {
    const filtradas = this.categoriasFiltradas;
    if (!filtradas) return this.categorias;
    const seleccionada = this.categorias.find(
      (c) => c.idCategoria === this.formulario.controls['categoriaId'].value,
    );
    const opciones: CategoriaDTO[] = [];
    if (
      seleccionada &&
      !filtradas.some((categoria) => categoria.idCategoria === seleccionada.idCategoria)
    ) {
      opciones.push(seleccionada);
    }
    for (const categoria of filtradas) opciones.push(categoria);
    return opciones;
  }

  buscarCategorias(texto: string): void {
    const numero = ++this.numeroBusqueda;
    const palabra = texto.trim();
    this.errorCategorias = '';
    if (!palabra) {
      this.mostrarTodasCategorias();
      return;
    }
    this.consultaCategorias = palabra;
    this.mostrarResultados = true;
    this.buscandoCategorias = true;
    this.categoriasApi.buscarDescripcion(palabra).subscribe({
      next: (datos) => {
        if (numero !== this.numeroBusqueda) return;
        const porNombre = this.categorias.filter((categoria) =>
          categoria.nombre.toLocaleLowerCase().includes(palabra.toLocaleLowerCase()),
        );
        this.categoriasFiltradas = porNombre;
        for (const categoria of datos) {
          if (
            !this.categoriasFiltradas.some((item) => item.idCategoria === categoria.idCategoria)
          ) {
            this.categoriasFiltradas.push(categoria);
          }
        }
        this.buscandoCategorias = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        if (numero !== this.numeroBusqueda) return;
        this.acceso.revisarError(error);
        this.errorCategorias = 'No se pudieron buscar categorías. Puedes usar el listado completo.';
        this.categoriasFiltradas = null;
        this.buscandoCategorias = false;
        this.cdr.detectChanges();
      },
    });
  }

  mostrarTodasCategorias(): void {
    this.numeroBusqueda += 1;
    this.buscandoCategorias = false;
    this.errorCategorias = '';
    this.consultaCategorias = '';
    this.categoriasFiltradas = null;
    this.mostrarResultados = true;
  }

  resultadosCategoria(): CategoriaDTO[] {
    return this.categoriasFiltradas ?? this.categorias;
  }

  seleccionarCategoria(categoria: CategoriaDTO): void {
    this.formulario.controls['categoriaId'].setValue(categoria.idCategoria);
    this.formulario.controls['categoriaId'].markAsDirty();
  }

  aplicarSugerencia(categoria: CategoriaDTO): void {
    this.categoriasFiltradas = null;
    this.seleccionarCategoria(categoria);
  }

  guardar(): void {
    if (!this.listo || this.guardando || this.formulario.invalid) return;
    const valores = this.formulario.getRawValue();
    if (valores.categoriaId === null || valores.ubicacionId === null) return;
    const datos = new ReporteFormularioDTO();
    datos.titulo = valores.titulo.trim();
    datos.descripcion = valores.descripcion.trim();
    datos.detalleUbicacion = valores.detalleUbicacion.trim() || null;
    datos.categoriaId = valores.categoriaId;
    datos.ubicacionId = valores.ubicacionId;
    datos.estado = valores.estado;
    datos.prioridad = valores.prioridad;
    datos.tecnicoAsignadoId = this.original?.tecnicoAsignadoId ?? null;
    this.guardando = true;
    this.mensaje = '';
    const peticion = this.original
      ? this.servicio.actualizar(this.original.idReporte, datos)
      : this.servicio.registrar(datos);
    peticion.subscribe({
      next: (resultado) => {
        this.guardando = false;
        this.aviso.open(
          this.editando ? 'Se actualizó la incidencia.' : 'Se registró la incidencia.',
          'Cerrar',
          { duration: 4000 },
        );
        void this.router.navigate(['/reportes', resultado.idReporte]);
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.mostrarError(error, 'No se pudo guardar la incidencia.');
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private mostrarError(error: unknown, mensaje: string): void {
    if (error instanceof HttpErrorResponse) {
      this.acceso.revisarError(error);
      if (error.status === 403) mensaje = 'No tienes permiso para acceder a este reporte.';
      if (error.status === 404)
        mensaje = 'El reporte o uno de los datos seleccionados ya no existe.';
      if (error.status === 400) mensaje = 'Revisa los datos del formulario.';
    }
    this.mensaje = mensaje;
  }

  private cargarUbicaciones(id: number): void {
    this.ubicacionesApi.listar().subscribe({
      next: (ubicaciones) => {
        this.ubicaciones = ubicaciones;
        if (this.editando) this.cargarReporte(id);
        else this.prepararFormulario(null);
      },
      error: (error: HttpErrorResponse) => {
        this.falloCarga(error);
      },
    });
  }

  private cargarReporte(id: number): void {
    this.servicio.obtener(id).subscribe({
      next: (reporte) => {
        this.prepararFormulario(reporte);
      },
      error: (error: HttpErrorResponse) => {
        this.falloCarga(error);
      },
    });
  }

  private prepararFormulario(reporte: ReporteDTO | null): void {
    this.original = reporte;
    if (reporte) {
      this.formulario.setValue({
        titulo: reporte.titulo,
        descripcion: reporte.descripcion,
        detalleUbicacion: reporte.detalleUbicacion ?? '',
        categoriaId: reporte.categoriaId,
        ubicacionId: reporte.ubicacionId,
        estado: reporte.estado,
        prioridad: reporte.prioridad,
      });
    }
    this.listo = true;
    this.cargando = false;
    this.cdr.detectChanges();
  }

  private falloCarga(error: HttpErrorResponse): void {
    this.mostrarError(error, 'No se pudo cargar el formulario.');
    this.cargando = false;
    this.cdr.detectChanges();
  }
}
