import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { Accesoservice } from './services/accesoservice';

const casos = [
  {
    ruta: '/categorias/listar',
    api: '/api/categories',
    dato: { idCategoria: 1, nombre: 'Electricidad', descripcion: 'Luces del campus' },
    texto: 'Electricidad',
  },
  {
    ruta: '/ubicaciones/listar',
    api: '/api/locations',
    dato: {
      idUbicacion: 2,
      campus: 'Monterrico',
      edificio: 'A',
      piso: 3,
      zona: 'Pasillo',
      tipo: 'Interior',
    },
    texto: 'Monterrico',
  },
  {
    ruta: '/roles/listar',
    api: '/api/roles',
    dato: {
      idRol: 3,
      nombre: 'Administrador',
      nivelAcceso: 'ADMIN',
      descripcion: 'Gestión del sistema',
    },
    texto: 'Administrador',
  },
];

describe('Listados de entidades independientes', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  for (const caso of casos) {
    it('consulta y muestra datos en ' + caso.ruta, async () => {
      const fixture = TestBed.createComponent(App);
      TestBed.inject(Accesoservice).guardarToken('token-de-prueba');
      await TestBed.inject(Router).navigateByUrl(caso.ruta);
      fixture.detectChanges();
      const http = TestBed.inject(HttpTestingController);
      const solicitud = http.expectOne(caso.api);
      expect(solicitud.request.method).toBe('GET');
      expect(solicitud.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
      expect(fixture.nativeElement.textContent).toContain('Cargando');
      solicitud.flush([caso.dato]);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('table').textContent).toContain(caso.texto);
      expect(fixture.nativeElement.textContent).toContain('Registros: 1');
      expect(fixture.nativeElement.textContent).not.toContain('Cargando');
      http.verify();
    });

    it('muestra lista vacía en ' + caso.ruta, async () => {
      const fixture = TestBed.createComponent(App);
      await TestBed.inject(Router).navigateByUrl(caso.ruta);
      fixture.detectChanges();
      const http = TestBed.inject(HttpTestingController);
      http.expectOne(caso.api).flush([]);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('table').textContent).toContain('No hay');
      expect(fixture.nativeElement.textContent).toContain('Registros: 0');
      http.verify();
    });
  }

  for (const caso of [
    { status: 401, mensaje: 'Inicia sesión para consultar la lista.' },
    { status: 403, mensaje: 'Tu cuenta no tiene permiso' },
    { status: 500, mensaje: 'No se pudo cargar la lista' },
  ]) {
    it('explica el error HTTP ' + caso.status, async () => {
      const fixture = TestBed.createComponent(App);
      await TestBed.inject(Router).navigateByUrl('/categorias/listar');
      fixture.detectChanges();
      const http = TestBed.inject(HttpTestingController);
      http.expectOne('/api/categories').flush({}, { status: caso.status, statusText: 'Error' });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
        caso.mensaje,
      );
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
      if (caso.status === 401)
        expect(fixture.nativeElement.querySelector('main a').getAttribute('href')).toBe('/acceso');
      http.verify();
    });
  }

  it('reintenta cargar después de un error', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/categorias/listar');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/categories').flush({}, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('main .error button').click();
    fixture.detectChanges();
    http.expectOne('/api/categories').flush([casos[0].dato]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table').textContent).toContain('Electricidad');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    http.verify();
  });

  it('inicia sesión con el contrato del backend y carga categorías', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/acceso');
    fixture.detectChanges();
    await fixture.whenStable();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    inputs[0].value = 'demo@fixcampus.test';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'clave-de-prueba';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const http = TestBed.inject(HttpTestingController);
    const login = http.expectOne('/login');
    expect(login.request.body).toEqual({
      correo: 'demo@fixcampus.test',
      password: 'clave-de-prueba',
    });
    login.flush({ token: 'token-de-prueba', correo: 'demo@fixcampus.test', idUsuario: 1 });
    await fixture.whenStable();
    fixture.detectChanges();
    const lista = http.expectOne('/api/categories');
    expect(lista.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    lista.flush([]);
    fixture.detectChanges();
    TestBed.inject(Accesoservice).salir();
    expect(TestBed.inject(Accesoservice).obtenerCabeceras().has('Authorization')).toBe(false);
    http.verify();
  });
});
