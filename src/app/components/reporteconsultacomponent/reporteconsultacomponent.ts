import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { CategoriaDTO } from '../../models/CategoriaDTO';
import { ReporteDTO } from '../../models/ReporteDTO';
import { Accesoservice } from '../../services/accesoservice';
import { Categoriaservice } from '../../services/categoriaservice';
import { Reporteservice } from '../../services/reporteservice';

@Component({
  selector: 'app-reporteconsultacomponent',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    RouterLink,
  ],
  templateUrl: './reporteconsultacomponent.html',
  styleUrl: './reporteconsultacomponent.css',
})
export class Reporteconsultacomponent implements OnInit {
  formulario: FormGroup;
  tipoConsulta = 'estado';
  estados = ['ABIERTO', 'EN_REVISION', 'ASIGNADO', 'EN_ATENCION', 'RESUELTO', 'CERRADO'];
  prioridades = ['MUY_BAJA', 'BAJA', 'MEDIA', 'ALTA', 'MUY_ALTA'];
  categorias: CategoriaDTO[] = [];
  resultados: ReporteDTO[] = [];
  columnas = ['titulo', 'usuario', 'categoria', 'estado', 'prioridad', 'fecha', 'detalle'];
  cargando = false;
  cargandoCategorias = false;
  errorCategorias = '';
  mensaje = '';
  consultado = false;
  pagina = 0;
  porPagina = 5;

  constructor(
    private fb: FormBuilder,
    private servicio: Reporteservice,
    private categoriasApi: Categoriaservice,
    private acceso: Accesoservice,
    private cdr: ChangeDetectorRef,
  ) {
    this.formulario = this.fb.group({
      tipo: ['estado'],
      estado: ['ABIERTO'],
      categoriaId: [null],
      correo: ['', [Validators.email, Validators.maxLength(150)]],
      prioridad: ['ALTA'],
    });
  }

  ngOnInit(): void {
    if (!this.acceso.validarSesion(true)) return;
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    if (this.cargandoCategorias) return;
    this.cargandoCategorias = true;
    this.errorCategorias = '';
    this.categoriasApi.listar().subscribe({
      next: (datos) => {
        this.categorias = datos;
        this.cargandoCategorias = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.acceso.revisarError(error);
        this.errorCategorias = 'No se pudieron cargar las categorías.';
        this.cargandoCategorias = false;
        this.cdr.detectChanges();
      },
    });
  }

  cambiarConsulta(tipo: string): void {
    this.tipoConsulta = tipo;
    this.resultados = [];
    this.mensaje = '';
    this.consultado = false;
    this.pagina = 0;
  }

  consultar(): void {
    if (this.cargando || !this.acceso.validarSesion(true)) return;
    this.mensaje = '';
    this.resultados = [];
    this.consultado = false;
    this.pagina = 0;
    const datos = this.formulario.value;
    if (this.tipoConsulta === 'categoria') {
      if (!datos.categoriaId || this.cargandoCategorias || this.errorCategorias) {
        this.mensaje = 'Selecciona una categoría disponible.';
        return;
      }
      this.cargando = true;
      this.formulario.disable();
      this.servicio.buscarPorCategoria(datos.categoriaId).subscribe({
        next: (reportes) => this.mostrar(reportes),
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      });
    } else if (this.tipoConsulta === 'correo') {
      const correo = datos.correo.trim();
      this.formulario.controls['correo'].setValue(correo);
      if (!correo || this.formulario.controls['correo'].invalid) {
        this.mensaje = 'Ingresa un correo electrónico válido.';
        return;
      }
      this.cargando = true;
      this.formulario.disable();
      this.servicio.buscarPorCorreo(correo).subscribe({
        next: (reportes) => this.mostrar(reportes),
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      });
    } else if (this.tipoConsulta === 'prioridad') {
      this.cargando = true;
      this.formulario.disable();
      this.servicio.listar(datos.prioridad).subscribe({
        next: (reportes) => this.mostrar(reportes),
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      });
    } else {
      this.cargando = true;
      this.formulario.disable();
      this.servicio.buscarPorEstado(datos.estado).subscribe({
        next: (reportes) => this.mostrar(reportes),
        error: (error: HttpErrorResponse) => this.mostrarError(error),
      });
    }
  }

  mostrar(reportes: ReporteDTO[]): void {
    this.resultados = reportes;
    this.consultado = true;
    this.cargando = false;
    this.formulario.enable();
    this.cdr.detectChanges();
  }

  mostrarError(error: HttpErrorResponse): void {
    this.acceso.revisarError(error);
    this.mensaje = 'No se pudieron consultar los reportes. Vuelve a intentarlo.';
    this.cargando = false;
    this.formulario.enable();
    this.cdr.detectChanges();
  }

  limpiar(): void {
    this.formulario.reset({
      tipo: 'estado',
      estado: 'ABIERTO',
      categoriaId: null,
      correo: '',
      prioridad: 'ALTA',
    });
    this.cambiarConsulta('estado');
  }

  filas(): ReporteDTO[] {
    return this.resultados.slice(this.pagina * this.porPagina, (this.pagina + 1) * this.porPagina);
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex;
    this.porPagina = evento.pageSize;
  }
}
