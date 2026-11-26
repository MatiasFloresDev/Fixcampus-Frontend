import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Categoriaservice } from '../../../services/categoriaservice';
import { Loginservice } from '../../../services/loginservice';
import { CategoriaDTOList } from '../../../models/CategoriaDTOList';

@Component({
  selector: 'app-cdetallecomponent',
  standalone: true,
  imports: [MatButtonModule, RouterLink],
  templateUrl: './cdetallecomponent.html',
  styleUrl: './cdetallecomponent.css',
})
export class Cdetallecomponent implements OnInit {
  registro: CategoriaDTOList | null = null;
  cargando = true;
  eliminando = false;
  mensaje = '';

  constructor(
    private service: Categoriaservice,
    private loginService: Loginservice,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

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

    const confirmado = confirm('¿Eliminar esta categoría? Esta acción no se puede deshacer.');

    if (!confirmado) {
      return;
    }

    this.eliminando = true;
    this.mensaje = '';
    this.service.eliminar(this.registro.idCategoria).subscribe({
      next: () => {
        this.router.navigate(['/categorias/listar']);
      },
      error: () => {
        this.eliminando = false;
        this.mensaje = 'No se pudo eliminar el registro.';
        this.cdr.markForCheck();
      },
    });
  }
}