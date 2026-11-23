import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOList } from '../../../models/RolDTOList';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuarioDTOUpdate } from '../../../models/UsuarioDTOUpdate';

@Component({
  selector: 'app-usuupdatecomponent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './usuupdatecomponent.html',
  styleUrl: './usuupdatecomponent.css',
})
export class Usuupdatecomponent implements OnInit {
  form: FormGroup;
  guardando = false;
  mensaje = '';
  id = 0;
  cargando = true;
  encontrado = false;
  roles: RolDTOList[] = [];
  rolesCargados = false;
  mensajeRoles = '';

  constructor(
    private fb: FormBuilder,
    private service: Usuarioservice,
    private rolService: Rolservice,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      contrasena: ['', [Validators.minLength(6)]],
      rolId: [null as number | null, Validators.required],
      estado: ['', [Validators.required, Validators.maxLength(30)]],
    });
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.cargando = false;
      this.mensaje = 'El ID del usuario no es válido.';
      return;
    }
    this.service.buscarPorId(this.id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.correo,
          rolId: data.rolId,
          estado: data.estado,
          contrasena: '',
        });
        this.encontrado = true;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudo cargar el usuario.';
        this.cdr.markForCheck();
      },
    });
    this.rolService.listar().subscribe({
      next: (data) => {
        this.roles = data;
        this.rolesCargados = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeRoles = 'No se pudieron cargar los roles.';
        this.cdr.markForCheck();
      },
    });
  }

  guardar(): void {
    if (this.guardando || !this.encontrado || !this.rolesCargados) return;
    if (this.form.invalid) {
      this.mensaje = 'Revise los campos del formulario.';
      return;
    }
    const dto: UsuarioDTOUpdate = {
      nombre: this.form.value.nombre.trim(),
      apellido: this.form.value.apellido.trim(),
      correo: this.form.value.correo.trim(),
      contrasena: this.form.value.contrasena || null,
      rolId: this.form.value.rolId,
      estado: this.form.value.estado,
    };
    this.guardando = true;
    this.mensaje = '';
    this.service.actualizar(this.id, dto).subscribe({
      next: () => {
        this.router.navigate(['/usuarios/listar']);
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
