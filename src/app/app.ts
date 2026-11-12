import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Accesoservice } from './services/accesoservice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatMenuModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(
    public acceso: Accesoservice,
    private router: Router,
    paginador: MatPaginatorIntl,
  ) {
    paginador.itemsPerPageLabel = 'Filas por página';
    paginador.nextPageLabel = 'Página siguiente';
    paginador.previousPageLabel = 'Página anterior';
    paginador.getRangeLabel = (pagina, limite, total) =>
      total
        ? pagina * limite + 1 + '–' + Math.min((pagina + 1) * limite, total) + ' de ' + total
        : '0 de 0';
  }

  salir(ventana: HTMLDialogElement): void {
    ventana.close();
    this.acceso.salir();
    this.router.navigate(['/acceso']);
  }
}
