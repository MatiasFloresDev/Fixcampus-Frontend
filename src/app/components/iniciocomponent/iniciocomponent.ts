import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Accesoservice } from '../../services/accesoservice';

@Component({
  imports: [MatButtonModule, RouterLink],
  templateUrl: './iniciocomponent.html',
  styleUrl: './iniciocomponent.css',
})
export class Iniciocomponent {
  protected readonly acceso = inject(Accesoservice);
}
