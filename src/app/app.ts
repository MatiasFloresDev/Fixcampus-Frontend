import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Accesoservice } from './services/accesoservice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(
    public acceso: Accesoservice,
    private router: Router,
  ) {}
  salir(): void {
    this.acceso.salir();
    this.router.navigate(['/acceso']);
  }
}
