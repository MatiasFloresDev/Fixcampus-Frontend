import { Component, OnInit } from '@angular/core';
import { Accesoservice } from '../../services/accesoservice';
import { Categoriasgraficocomponent } from '../categoriasgraficocomponent/categoriasgraficocomponent';
import { Prioridadesgraficocomponent } from '../prioridadesgraficocomponent/prioridadesgraficocomponent';
import { Usuariosgraficocomponent } from '../usuariosgraficocomponent/usuariosgraficocomponent';
import { Reporteconsultacomponent } from '../reporteconsultacomponent/reporteconsultacomponent';
@Component({
  selector: 'app-estadisticascomponent',
  imports: [
    Categoriasgraficocomponent,
    Prioridadesgraficocomponent,
    Usuariosgraficocomponent,
    Reporteconsultacomponent,
  ],
  templateUrl: './estadisticascomponent.html',
  styleUrl: './estadisticascomponent.css',
})
export class Estadisticascomponent implements OnInit {
  constructor(private acceso: Accesoservice) {}
  ngOnInit(): void {
    this.acceso.validarSesion(true);
  }
}
