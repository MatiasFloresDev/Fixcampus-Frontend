import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Reporteservice } from '../../../services/reporteservice';
import { ReporteDTOList } from '../../../models/ReporteDTOList';
import { Comentarioservice } from '../../../services/comentarioservice';
import { ComentarioDTOInsert } from '../../../models/ComentarioDTOInsert';

@Component({
  selector: 'app-cominsertcomponent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './cominsertcomponent.html',
  styleUrl: './cominsertcomponent.css',
})
export class Cominsertcomponent implements OnInit {
  form: FormGroup;
  guardando = false;
  mensaje = '';
  reportes: ReporteDTOList[] = [];
  reportesCargados = false;
  mensajeReportes = '';

  constructor(
    private fb: FormBuilder,
    private service: Comentarioservice,
    private reporteService: Reporteservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      reporteId: [null as number | null, Validators.required],
      textoComentario: ['', [Validators.required, Validators.pattern(/\S/)]],
    });
  }

  ngOnInit(): void {
    this.reporteService.listar().subscribe({
      next: (data) => {
        this.reportes = data;
        this.reportesCargados = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeReportes = 'No se pudieron cargar los reportes.';
        this.cdr.markForCheck();
      },
    });
  }

  guardar(): void {
    if (this.guardando || !this.reportesCargados) return;
    if (this.form.invalid) {
      this.mensaje = 'Revise los campos del formulario.';
      return;
    }
    const dto: ComentarioDTOInsert = {
      reporteId: this.form.value.reporteId,
      textoComentario: this.form.value.textoComentario.trim(),
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.registrar(dto).subscribe({
      next: () => {
        this.router.navigate(['/comentarios/listar']);
      },
      error: () => {
        this.guardando = false;
        this.mensaje = 'No se pudo guardar el comentario.';
        this.cdr.markForCheck();
      },
    });
  }
}
