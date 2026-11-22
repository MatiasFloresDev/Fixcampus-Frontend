import { Component, OnInit } from '@angular/core';
import { Accesoservice } from '../../services/accesoservice';
import { Categoriasgraficocomponent } from '../categoriasgraficocomponent/categoriasgraficocomponent';
import { Prioridadesgraficocomponent } from '../prioridadesgraficocomponent/prioridadesgraficocomponent';
import { Resumencomponent } from '../resumencomponent/resumencomponent';
import { Usuariosgraficocomponent } from '../usuariosgraficocomponent/usuariosgraficocomponent';
@Component({
  selector: 'app-panelcomponent',
  imports: [
    Resumencomponent,
    Categoriasgraficocomponent,
    Prioridadesgraficocomponent,
    Usuariosgraficocomponent,
  ],
  templateUrl: './panelcomponent.html',
  styleUrl: './panelcomponent.css',
})
export class Panelcomponent implements OnInit {
  esAdmin = false;
  constructor(private acceso: Accesoservice) {}
  ngOnInit(): void {
    if (this.acceso.validarSesion()) this.esAdmin = this.acceso.rol() === 'ADMIN';
  }
}
