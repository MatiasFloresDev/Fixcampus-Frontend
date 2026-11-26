import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Comentarioservice } from '../../../services/comentarioservice';
import { Loginservice } from '../../../services/loginservice';
import { ComentarioDTOList } from '../../../models/ComentarioDTOList';
import { ComentarioDTOInsert } from '../../../models/ComentarioDTOInsert';
import { UsuarioDTOList } from '../../../models/UsuarioDTOList';

@Component({
  selector: 'app-comentarios-reporte',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  templateUrl: './comentariosreportecomponent.html',
  styleUrl: './comentariosreportecomponent.css',
})
export class Comentariosreportecomponent implements OnInit {
  @Input() reporteId: number = 0;
  @Input() usuarios: UsuarioDTOList[] = [];
  @Input() eliminando = false;
  @Output() guardandoChange = new EventEmitter<boolean>();

  comentarios: ComentarioDTOList[] = [];
  form: FormGroup;
  cargandoComentarios = false;
  guardandoComentario = false;
  mostrarFormularioComentario = false;
  mensajeComentarios = '';
  mensajeComentario = '';

  constructor(
    private comentarioService: Comentarioservice,
    private loginService: Loginservice,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      textoComentario: ['', [Validators.required, Validators.pattern(/\S/)]],
    });
  }

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  ngOnInit(): void {
    this.listarComentarios();
  }

  nombreUsuario(id: number): string {
    const usuario = this.usuarios.find((usuario) => usuario.idUsuario === id);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'No disponible';
  }

  listarComentarios(): void {
    if (!Number.isInteger(this.reporteId) || this.reporteId <= 0) {
      this.mensajeComentarios = 'El ID del reporte no es válido.';
      return;
    }
    this.cargandoComentarios = true;
    this.mensajeComentarios = '';
    this.comentarioService.listarPorReporte(this.reporteId).subscribe({
      next: (data) => {
        this.comentarios = data;
        this.cargandoComentarios = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoComentarios = false;
        this.mensajeComentarios = 'No se pudieron cargar los comentarios.';
        this.cdr.markForCheck();
      },
    });
  }

  comentar(): void {
    if (
      !Number.isInteger(this.reporteId) ||
      this.reporteId <= 0 ||
      this.guardandoComentario ||
      this.eliminando
    ) {
      return;
    }
    if (this.form.invalid) {
      this.mensajeComentario = 'Ingrese un comentario.';
      return;
    }
    const dto: ComentarioDTOInsert = {
      reporteId: this.reporteId,
      textoComentario: this.form.value.textoComentario.trim(),
    };
    this.guardandoComentario = true;
    this.guardandoChange.emit(true);
    this.mensajeComentario = '';
    this.comentarioService.registrar(dto).subscribe({
      next: () => {
        this.guardandoComentario = false;
        this.guardandoChange.emit(false);
        this.form.reset({ textoComentario: '' });
        this.mostrarFormularioComentario = false;
        this.listarComentarios();
        this.cdr.markForCheck();
      },
      error: () => {
        this.guardandoComentario = false;
        this.guardandoChange.emit(false);
        this.mensajeComentario = 'No se pudo guardar el comentario.';
        this.cdr.markForCheck();
      },
    });
  }
}