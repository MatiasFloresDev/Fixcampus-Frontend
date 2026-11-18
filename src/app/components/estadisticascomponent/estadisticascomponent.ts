import { Component } from '@angular/core';
import { Categoriasgraficocomponent } from '../categoriasgraficocomponent/categoriasgraficocomponent';
import { Prioridadesgraficocomponent } from '../prioridadesgraficocomponent/prioridadesgraficocomponent';
@Component({
  selector: 'app-estadisticascomponent',
  imports: [Categoriasgraficocomponent, Prioridadesgraficocomponent],
  templateUrl: './estadisticascomponent.html',
  styleUrl: './estadisticascomponent.css',
})
export class Estadisticascomponent {}
