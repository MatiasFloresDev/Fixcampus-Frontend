import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOList } from '../../../models/RolDTOList';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuarioDTOInsert } from '../../../models/UsuarioDTOInsert';

@Component({
  selector: 'app-usuinsertcomponent',
  standalone: true,
  imports: [
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  templateUrl: './usuinsertcomponent.html',
  styleUrl: './usuinsertcomponent.css',
})
export class Usuinsertcomponent implements OnInit {
  esPublico = false;
  roles: RolDTOList[] = [];
  ngOnInit(): void {
    if (!this.esPublico) this.rolService.listar().subscribe({next: datos => {this.roles = datos; this.cdr.detectChanges();}, error: () => {this.mensaje = 'No se pudieron cargar los roles.'; this.cdr.detectChanges();}});
  }
  form: FormGroup;
  guardando = false;
  mensaje = '';

  constructor(
    private ruta: ActivatedRoute,
    private rolService: Rolservice,
    private fb: FormBuilder,
    private service: Usuarioservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.esPublico = this.ruta.snapshot.data['publico'] === true;
    this.form = this.fb.group({
      rolId: [null, this.esPublico ? [] : [Validators.required]],
      estado: ['ACTIVO'],
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      contrasena: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(6)]],
    });
  }

  guardar(): void {
    if (this.guardando) return;
    if (this.form.invalid) {
      this.mensaje = 'Revise los campos del formulario.';
      return;
    }
    const dto: UsuarioDTOInsert = {
      rolId: this.form.value.rolId,
      estado: this.form.value.estado,
      nombre: this.form.value.nombre.trim(),
      apellido: this.form.value.apellido.trim(),
      correo: this.form.value.correo.trim(),
      contrasena: this.form.value.contrasena,
    };
    this.guardando = true;
    this.mensaje = '';
    const peticion = this.esPublico ? this.service.registrarPublico(dto) : this.service.registrar(dto);
    peticion.subscribe({
      next: () => {
        this.router.navigate([this.esPublico ? '/login' : '/usuarios/listar']);
      },
      error: (error) => {
        this.guardando = false;
        this.mensaje = 'No se pudo guardar el usuario.';
        if (error.error?.message === 'El correo ya está registrado') {
          this.mensaje = 'El correo electrónico ya está registrado. Utilice otro correo.';
        }
        this.cdr.markForCheck();
      },
    });
  }
}
