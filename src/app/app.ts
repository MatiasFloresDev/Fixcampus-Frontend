import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Accesoservice } from './services/accesoservice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(
    public acceso: Accesoservice,
    private router: Router,
  ) {}

  salir(ventana: HTMLDialogElement): void {
    ventana.close();
    this.acceso.salir();
    this.router.navigate(['/acceso']);
  }
}
