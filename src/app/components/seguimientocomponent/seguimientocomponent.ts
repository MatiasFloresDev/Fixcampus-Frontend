import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Accesoservice } from '../../services/accesoservice';
@Component({
  selector: 'app-seguimientocomponent',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatButtonModule],
  templateUrl: './seguimientocomponent.html',
  styleUrl: './seguimientocomponent.css',
})
export class Seguimientocomponent implements OnInit {
  reporteId = 0;
  constructor(
    private acceso: Accesoservice,
    private ruta: ActivatedRoute,
    private router: Router,
  ) {}
  ngOnInit(): void {
    if (!this.acceso.validarSesion(true)) return;
    this.reporteId = Number(this.ruta.snapshot.paramMap.get('id'));
    if (this.ruta.snapshot.queryParamMap.get('pestana') === 'recomendaciones') {
      this.router.navigate(['recomendacion'], { relativeTo: this.ruta, replaceUrl: true });
    }
  }
}
