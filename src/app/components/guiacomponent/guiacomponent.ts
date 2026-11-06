import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, RouterLink],
  template: `
    <section class="contenedor">
      <div class="encabezado">
        <div>
          <h1>Guía de estilos</h1>
          <p>Componentes y estados usados en FixCampus.</p>
        </div>
        <a mat-stroked-button routerLink="/">Volver al inicio</a>
      </div>
      <div class="muestras">
        <section class="tarjeta">
          <h2>Identidad y tipografía</h2>
          <img src="assets/logo-fixcampus.png" alt="Logo de FixCampus" width="64" height="64" />
          <p>Poppins para títulos y Open Sans para texto y controles.</p>
          <p><span class="color primario"></span> Verde principal <code>#0D6A62</code></p>
          <p><span class="color fondo"></span> Fondo <code>#F5F7F8</code></p>
          <p><span class="color texto"></span> Texto <code>#212529</code></p>
        </section>
        <section class="tarjeta">
          <h2>Controles</h2>
          <p>Los formularios y catálogos usan controles de Angular Material.</p>
          <mat-form-field appearance="outline">
            <mat-label>Nombre de categoría</mat-label>
            <input matInput value="Infraestructura" readonly />
          </mat-form-field>
          <div class="acciones">
            <button mat-flat-button type="button" disabled>Guardar</button>
            <a mat-stroked-button routerLink="/acceso">Iniciar sesión</a>
          </div>
        </section>
        <section class="tarjeta">
          <h2>Estados de la interfaz</h2>
          <p class="aviso exito">Se guardó el registro.</p>
          <p class="aviso">Aún no hay registros en este catálogo.</p>
          <p class="aviso error">No se pudo cargar el catálogo.</p>
        </section>
      </div>
    </section>
  `,
  styles: `
    .muestras {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
      gap: 16px;
    }
    .acciones {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .color {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 1px solid #d6dbde;
      border-radius: 4px;
      vertical-align: middle;
    }
    .primario {
      background: #0d6a62;
    }
    .fondo {
      background: #f5f7f8;
    }
    .texto {
      background: #212529;
    }
  `,
})
export class Guiacomponent {}
