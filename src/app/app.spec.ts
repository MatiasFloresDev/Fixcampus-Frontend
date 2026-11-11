import { environment } from '../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { App } from './app';
import { routes } from './app.routes';
import { Registrocomponent } from './components/registrocomponent/registrocomponent';
import { Accesocomponent } from './components/accesocomponent/accesocomponent';
import { Evidenciascomponent } from './components/evidenciascomponent/evidenciascomponent';
import { Accesoservice } from './services/accesoservice';

function tokenDePrueba(roles: string, segundos = 60): string {
  return (
    'prueba.' +
    btoa(JSON.stringify({ roles, exp: Math.floor(Date.now() / 1000) + segundos })) +
    '.prueba'
  );
}

describe('Acceso y reportes de FixCampus', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.inject(Accesoservice).salir();
  });

  async function abrir(ruta: string, rol = '') {
    const app = TestBed.createComponent(App);
    if (rol) TestBed.inject(Accesoservice).guardarToken(tokenDePrueba(rol));
    await TestBed.inject(Router).navigateByUrl(ruta);
    app.detectChanges();
    return app;
  }

  async function abrirReporteNuevo() {
    const app = await abrir('/reportar', 'ROLE_USUARIO');
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(environment.base + '/api/categories')
      .flush([{ idCategoria: 7, nombre: 'Electricidad' }]);
    http
      .expectOne(environment.base + '/api/locations')
      .flush([{ idUbicacion: 4, campus: 'Prueba', edificio: 'A', piso: null, zona: null }]);
    app.detectChanges();
    const pagina: HTMLElement = app.nativeElement;
    const descripcion = pagina.querySelector<HTMLTextAreaElement>('textarea')!;
    const escribir = (valor: string) => {
      descripcion.value = valor;
      descripcion.dispatchEvent(new Event('input'));
      app.detectChanges();
    };
    const boton = (texto: string) =>
      Array.from(pagina.querySelectorAll('button')).find(
        (item) => item.textContent.trim() === texto,
      );
    return { app, http, pagina, escribir, boton };
  }

  it('aplica una categoría de IA solo después de confirmarla', async () => {
    const { app, http, pagina, escribir, boton } = await abrirReporteNuevo();
    const endpoint = environment.base + '/api/reports/sugerir-categoria';
    expect(boton('Sugerir categoría con IA')?.disabled).toBe(true);
    escribir('  Falló una lámpara del pasillo.  ');
    http.expectNone(endpoint);
    boton('Sugerir categoría con IA')!.click();
    const peticion = http.expectOne(endpoint);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual({ descripcion: 'Falló una lámpara del pasillo.' });
    expect(peticion.request.headers.get('Authorization')).toMatch(/^Bearer /);
    peticion.flush({ categoriaId: 7 });
    app.detectChanges();
    const selector = pagina.querySelector('mat-select[formcontrolname="categoriaId"]')!;
    expect(pagina.textContent).toContain('Sugerencia: Electricidad');
    expect(selector.textContent).not.toContain('Electricidad');
    boton('Usar categoría sugerida')!.click();
    app.detectChanges();
    expect(selector.textContent).toContain('Electricidad');
    http.expectNone(environment.base + '/api/reports');
  });

  it('descarta una respuesta de IA si cambió la descripción y permite continuar ante un fallo', async () => {
    const { app, http, pagina, escribir, boton } = await abrirReporteNuevo();
    const endpoint = environment.base + '/api/reports/sugerir-categoria';
    escribir('Falló una lámpara.');
    boton('Sugerir categoría con IA')!.click();
    const anterior = http.expectOne(endpoint);
    escribir('Se rompió una silla.');
    anterior.flush({ categoriaId: 7 });
    app.detectChanges();
    expect(boton('Usar categoría sugerida')).toBeUndefined();
    boton('Sugerir categoría con IA')!.click();
    http.expectOne(endpoint).flush(null, { status: 503, statusText: 'Service Unavailable' });
    app.detectChanges();
    expect(pagina.textContent).toContain('Puedes elegir la categoría en el formulario.');
  });

  it('valida el registro y envía únicamente los datos de la cuenta', async () => {
    const app = await abrir('/crear-cuenta');
    const vista = app.debugElement.query(By.directive(Registrocomponent))
      .componentInstance as Registrocomponent;
    const http = TestBed.inject(HttpTestingController);
    vista.formulario.setValue({
      nombre: 'Ana',
      apellido: 'Torres',
      correo: 'ana@fixcampus.test',
      password: '123',
      terminos: true,
    });
    vista.registrar();
    http.expectNone(environment.base + '/registro');
    vista.formulario.controls.password.setValue('ClavePrueba');
    vista.formulario.controls.terminos.setValue(false);
    vista.registrar();
    http.expectNone(environment.base + '/registro');
    vista.formulario.controls.terminos.setValue(true);
    vista.registrar();
    const solicitud = http.expectOne(environment.base + '/registro');
    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual({
      nombre: 'Ana',
      apellido: 'Torres',
      correo: 'ana@fixcampus.test',
      password: 'ClavePrueba',
    });
    solicitud.flush({}, { status: 201, statusText: 'Created' });
    app.detectChanges();
    expect(app.nativeElement.textContent).toContain('Cuenta creada');
  });

  it('mantiene el acceso ante credenciales inválidas y luego entra con el rol recibido', async () => {
    const app = await abrir('/acceso');
    const vista = app.debugElement.query(By.directive(Accesocomponent))
      .componentInstance as Accesocomponent;
    const http = TestBed.inject(HttpTestingController);
    vista.formulario.setValue({ correo: 'ana@fixcampus.test', password: 'ClavePrueba' });
    vista.ingresar();
    http
      .expectOne(environment.base + '/login')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(app.nativeElement.textContent).toContain('El correo o la contraseña no son correctos.');
    vista.ingresar();
    const token = tokenDePrueba('ROLE_USUARIO');
    http
      .expectOne(environment.base + '/login')
      .flush({ token, correo: 'ana@fixcampus.test', idUsuario: 1 });
    await app.whenStable();
    const reportes = http.expectOne(environment.base + '/api/reports/mis-reportes');
    expect(reportes.request.headers.get('Authorization')).toBe('Bearer ' + token);
    reportes.flush([]);
    app.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/panel');
    expect(app.nativeElement.querySelector('h1').textContent).toBe('Mi panel');
    expect(app.nativeElement.textContent).toContain('Todavía no hay incidencias para mostrar.');
    expect(app.nativeElement.querySelector('nav').textContent).toContain('Mis reportes');
    expect(app.nativeElement.querySelector('.indicadores').textContent).not.toContain('Usuarios');
    http.expectNone(environment.base + '/api/users/count');
  });

  it('muestra el aviso si vence la sesión al consultar el panel personal', async () => {
    const app = await abrir('/panel', 'USUARIO');
    const http = TestBed.inject(HttpTestingController);
    expect(TestBed.inject(Router).url).toBe('/panel');
    http.expectNone(environment.base + '/api/reports/estadisticas/por-usuario-mes');
    http
      .expectOne(environment.base + '/api/reports/mis-reportes')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    await app.whenStable();
    app.detectChanges();
    expect(app.nativeElement.textContent).toContain('Tu sesión venció');
    expect(sessionStorage.getItem('fixcampus-token')).toBeNull();
  });

  it('agrupa por mes solo los reportes del usuario y evita consultas administrativas', async () => {
    const app = await abrir('/panel', 'USUARIO');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(environment.base + '/api/reports/mis-reportes').flush([
      { estado: 'ABIERTO', fechaCreacion: '2026-11-01T00:05:00' },
      { estado: 'CERRADO', fechaCreacion: '2026-11-03T08:00:00' },
      { estado: 'RESUELTO', fechaCreacion: '2026-10-31T23:59:00' },
    ]);
    app.detectChanges();
    const filas = app.nativeElement.querySelectorAll('.grafico li');
    expect(filas.length).toBe(2);
    expect(filas[0].textContent).toContain('11/2026');
    expect(filas[0].querySelector('strong').textContent).toBe('2');
    http.expectNone(environment.base + '/api/reports');
    http.expectNone(environment.base + '/api/users/count');
    http.expectNone(environment.base + '/api/reports/estadisticas/por-usuario-mes');
  });

  it('dibuja las incidencias con los datos de la consulta de administrador', async () => {
    const app = await abrir('/panel', 'ADMIN');
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(environment.base + '/api/reports/estadisticas/por-usuario-mes')
      .flush([
        { usuarioId: 1, nombre: 'Ana', apellido: 'Torres', anio: 2026, mes: 10, cantidad: 4 },
      ]);
    http.expectOne(environment.base + '/api/reports').flush([{ estado: 'ABIERTO' }]);
    http.expectOne(environment.base + '/api/users/count').flush(2);
    app.detectChanges();
    expect(app.nativeElement.querySelector('.grafico').textContent).toContain('Ana Torres');
    expect(app.nativeElement.querySelector('.grafico strong').textContent).toBe('4');
    expect(app.nativeElement.querySelector('.indicadores').textContent).toContain('Usuarios');
  });

  it('abre la pestaña de recomendaciones desde la accion de editar de la tabla', async () => {
    const app = await abrir('/administracion/recomendaciones', 'ADMIN');
    const http = TestBed.inject(HttpTestingController);
    const recomendacion = {
      idRecomendacion: 3,
      reporteId: 12,
      tituloSugerido: 'Revisar la tubería',
      resumen: 'Reparar la fuga del baño.',
      prioridadSugerida: 'ALTA',
      justificacion: 'El piso está mojado.',
      fechaRecomendacion: '2026-11-10T09:00:00',
    };
    http.expectOne(environment.base + '/api/recomendaciones').flush([recomendacion]);
    http.expectOne(environment.base + '/api/reports').flush([
      { idReporte: 12, titulo: 'Fuga de agua' },
    ]);
    app.detectChanges();
    const enlace: HTMLAnchorElement = app.nativeElement.querySelector(
      'a[aria-label="Editar recomendación"]',
    );

    await TestBed.inject(Router).navigateByUrl(enlace.getAttribute('href')!);
    app.detectChanges();
    http.expectOne(environment.base + '/api/reports/12').flush({ idReporte: 12, titulo: 'Fuga de agua' });
    http.expectOne(environment.base + '/api/comments/reporte/12').flush([]);
    http.expectOne(environment.base + '/api/recomendaciones/reporte/12').flush(recomendacion);
    app.detectChanges();

    const secciones = app.nativeElement.querySelectorAll('.seguimiento > section');
    expect(secciones[0].hidden).toBe(true);
    expect(secciones[1].hidden).toBe(false);
    expect(secciones[1].querySelector('input').value).toBe('Revisar la tubería');
  });

  it('avisa al volver a abrir una ruta con un token vencido', async () => {
    sessionStorage.setItem('fixcampus-token', tokenDePrueba('USUARIO', -1));
    const app = await abrir('/evidencias');
    expect(TestBed.inject(Router).url).toBe('/acceso');
    expect(app.nativeElement.textContent).toContain('Tu sesión venció');
    TestBed.inject(HttpTestingController).expectNone(
      environment.base + '/api/reports/mis-reportes',
    );
  });

  it('reintenta las evidencias y abre los enlaces válidos en otra pestaña', async () => {
    const app = await abrir('/evidencias', 'USUARIO');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(environment.base + '/api/reports/mis-reportes').flush([
      {
        idReporte: 12,
        titulo: 'Fuga de agua',
        estado: 'ABIERTO',
        prioridad: 'ALTA',
        fechaCreacion: '2026-10-27T09:14:00',
      },
    ]);
    const vista = app.debugElement.query(By.directive(Evidenciascomponent))
      .componentInstance as Evidenciascomponent;
    vista.seleccionar('12');
    http
      .expectOne(environment.base + '/api/attachments/reporte/12')
      .flush({}, { status: 500, statusText: 'Error' });
    expect(app.nativeElement.textContent).toContain('No se pudieron cargar las evidencias.');
    vista.cargarAdjuntos();
    http.expectOne(environment.base + '/api/attachments/reporte/12').flush([]);
    expect(app.nativeElement.textContent).toContain('no tiene evidencias adjuntas');
    vista.cargarAdjuntos();
    http.expectOne(environment.base + '/api/attachments/reporte/12').flush([
      { idAdjunto: 1, nombreArchivo: 'foto.jpg', urlArchivo: 'https://example.com/foto.jpg' },
      { idAdjunto: 2, nombreArchivo: 'Enlace inválido', urlArchivo: 'javascript:alert(1)' },
    ]);
    const enlaces = app.nativeElement.querySelectorAll('.evidencias a');
    expect(enlaces.length).toBe(1);
    expect(enlaces[0].getAttribute('target')).toBe('_blank');
    expect(enlaces[0].getAttribute('href')).toBe('https://example.com/foto.jpg');
  });
});
