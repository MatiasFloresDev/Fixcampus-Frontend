import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Rolservice } from '../../../services/rolservice';
import { RolDTOList } from '../../../models/RolDTOList';

@Component({
  selector: 'app-rdetallecomponent',
  standalone: true,
  imports: [MatButtonModule, RouterLink],
  templateUrl: './rdetallecomponent.html',
  styleUrl: './rdetallecomponent.css',
})
export class Rdetallecomponent implements OnInit {
  registro: RolDTOList | null = null;
  cargando = true;
  eliminando = false;
  mensaje = '';

  constructor(
    private service: Rolservice,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.cargando = false;
      this.mensaje = 'El ID del registro no es válido.';
      return;
    }
    this.service.buscarPorId(id).subscribe({
      next: (data) => {
        this.registro = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.mensaje = 'No se pudo cargar el registro.';
        this.cdr.markForCheck();
      },
    });
  }

  eliminar(): void {
    if (!this.registro || this.eliminando) {
      return;
    }

    const confirmado = confirm('¿Eliminar este rol? Esta acción no se puede deshacer.');

    if (!confirmado) {
      return;
    }

    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(this.registro.idRol).subscribe({
      next: () => {
        this.router.navigate(['/roles/listar']);
      },
      error: () => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar el registro.';
        this.cdr.markForCheck();
      },
    });
  }
}
