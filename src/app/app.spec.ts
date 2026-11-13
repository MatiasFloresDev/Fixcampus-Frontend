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
import { Panelcomponent } from './components/panelcomponent/panelcomponent';
import { FormGroupDirective } from '@angular/forms';
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

  it('cancela la consulta de IA al salir de la pantalla del reporte', async () => {
    const { app, http, escribir, boton } = await abrirReporteNuevo();
    escribir('El foco del pasillo no enciende.');
    boton('Sugerir categoría con IA')!.click();
    const consulta = http.expectOne(environment.base + '/api/reports/sugerir-categoria');
    await TestBed.inject(Router).navigateByUrl('/');
    app.detectChanges();
    expect(consulta.cancelled).toBe(true);
    expect(app.nativeElement.textContent).toContain('Reporta un problema en el campus');
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
    vista.formulario.controls['password'].setValue('ClavePrueba');
    vista.formulario.controls['terminos'].setValue(false);
    vista.registrar();
    http.expectNone(environment.base + '/registro');
    vista.formulario.controls['terminos'].setValue(true);
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
    const selector = app.debugElement.query(By.css('mat-select'));
    selector.triggerEventHandler('valueChange', '2026-10');
    selector.triggerEventHandler('selectionChange', { value: '2026-10' });
    app.detectChanges();
    expect(app.nativeElement.querySelectorAll('.grafico li').length).toBe(1);
    expect(app.nativeElement.querySelector('.indicadores .total strong').textContent).toBe('1');
    expect(app.nativeElement.querySelector('.indicadores .resueltos strong').textContent).toBe('1');
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

  it('filtra el panel por mes, limpia el filtro y actualiza los datos del administrador', async () => {
    const app = await abrir('/panel', 'ADMIN');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(environment.base + '/api/reports/estadisticas/por-usuario-mes').flush([
      { usuarioId: 1, nombre: 'Ana', apellido: 'Torres', anio: 2026, mes: 10, cantidad: 1 },
      { usuarioId: 2, nombre: 'Luis', apellido: 'Prueba', anio: 2026, mes: 11, cantidad: 2 },
    ]);
    http.expectOne(environment.base + '/api/reports').flush([
      { estado: 'EN_ATENCION', fechaCreacion: '2026-10-10T09:00:00' },
      { estado: 'ABIERTO', fechaCreacion: '2026-11-10T09:00:00' },
      { estado: 'RESUELTO', fechaCreacion: '2026-11-11T09:00:00' },
    ]);
    http.expectOne(environment.base + '/api/users/count').flush(7);
    app.detectChanges();
    const panel = app.debugElement.query(By.directive(Panelcomponent))
      .componentInstance as Panelcomponent;
    const selector = app.debugElement.query(By.css('mat-select'));
    selector.triggerEventHandler('valueChange', '2026-10');
    selector.triggerEventHandler('selectionChange', { value: '2026-10' });
    app.detectChanges();
    expect(app.nativeElement.querySelectorAll('.grafico li').length).toBe(1);
    expect(app.nativeElement.querySelector('.grafico').textContent).toContain('Ana Torres');
    expect(app.nativeElement.querySelector('.indicadores .total strong').textContent).toBe('1');
    expect(app.nativeElement.querySelector('.indicadores .atencion strong').textContent).toBe('1');
    expect(app.nativeElement.querySelector('.indicadores .usuarios strong').textContent).toBe('7');
    const boton = (texto: string) =>
      Array.from(
        app.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
      ).find((b) => b.textContent?.trim() === texto)!;
    boton('Limpiar filtro').click();
    app.detectChanges();
    expect(app.nativeElement.querySelectorAll('.grafico li').length).toBe(2);
    expect(app.nativeElement.querySelector('.indicadores .total strong').textContent).toBe('3');
    selector.triggerEventHandler('valueChange', '2026-10');
    selector.triggerEventHandler('selectionChange', { value: '2026-10' });
    boton('Actualizar').click();
    app.detectChanges();
    expect(boton('Actualizando…').disabled).toBe(true);
    http
      .expectOne(environment.base + '/api/reports/estadisticas/por-usuario-mes')
      .flush([
        { usuarioId: 2, nombre: 'Luis', apellido: 'Prueba', anio: 2026, mes: 11, cantidad: 1 },
      ]);
    http
      .expectOne(environment.base + '/api/reports')
      .flush([{ estado: 'ABIERTO', fechaCreacion: '2026-11-10T09:00:00' }]);
    http.expectOne(environment.base + '/api/users/count').flush(8);
    app.detectChanges();
    expect(panel.mesSeleccionado).toBe('');
    expect(app.nativeElement.querySelector('.indicadores .total strong').textContent).toBe('1');
    expect(app.nativeElement.querySelector('.indicadores .usuarios strong').textContent).toBe('8');
    expect(boton('Actualizar').disabled).toBe(false);
  });

  it('informa cuando fallan los totales del panel y permite volver a consultar', async () => {
    const app = await abrir('/panel', 'ADMIN');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(environment.base + '/api/reports/estadisticas/por-usuario-mes').flush([]);
    http
      .expectOne(environment.base + '/api/reports')
      .flush({}, { status: 500, statusText: 'Error' });
    http
      .expectOne(environment.base + '/api/users/count')
      .flush({}, { status: 500, statusText: 'Error' });
    app.detectChanges();
    expect(app.nativeElement.textContent).toContain('No se pudieron cargar los totales');
    expect(app.nativeElement.textContent).toContain('No se pudo consultar el total de usuarios');
    expect(app.nativeElement.querySelector('.indicadores')).toBeNull();
    const botones = app.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    Array.from(botones)
      .find((b) => b.textContent?.trim() === 'Actualizar')!
      .click();
    http.expectOne(environment.base + '/api/reports/estadisticas/por-usuario-mes').flush([]);
    http.expectOne(environment.base + '/api/reports').flush([]);
    http.expectOne(environment.base + '/api/users/count').flush(0);
    app.detectChanges();
    expect(app.nativeElement.querySelectorAll('[role="alert"]').length).toBe(0);
    expect(app.nativeElement.querySelector('.indicadores .total strong').textContent).toBe('0');
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
    http
      .expectOne(environment.base + '/api/reports')
      .flush([{ idReporte: 12, titulo: 'Fuga de agua' }]);
    app.detectChanges();
    const enlace: HTMLAnchorElement = app.nativeElement.querySelector(
      'a[aria-label="Editar recomendación"]',
    );

    await TestBed.inject(Router).navigateByUrl(enlace.getAttribute('href')!);
    app.detectChanges();
    http
      .expectOne(environment.base + '/api/reports/12')
      .flush({ idReporte: 12, titulo: 'Fuga de agua' });
    http.expectOne(environment.base + '/api/comments/reporte/12').flush([]);
    http.expectOne(environment.base + '/api/recomendaciones/reporte/12').flush(recomendacion);
    app.detectChanges();

    const secciones = app.nativeElement.querySelectorAll('.seguimiento > section');
    expect(secciones[0].hidden).toBe(true);
    expect(secciones[1].hidden).toBe(false);
    expect(secciones[1].querySelector('input').value).toBe('Revisar la tubería');
  });

  it('consulta las estadísticas mediante el servicio y presenta categorías sin reportes', async () => {
    const app = await abrir('/administracion/estadisticas', 'ADMIN');
    const http = TestBed.inject(HttpTestingController);
    const categorias = http.expectOne(environment.base + '/api/categories/reporte-por-categoria');
    expect(categorias.request.headers.get('Authorization')).toMatch(/^Bearer /);
    categorias.flush([{ idCategoria: 7, nombre: 'Electricidad', totalReportes: 0 }]);
    http
      .expectOne(environment.base + '/api/recomendaciones/estadisticas/por-prioridad-reporte')
      .flush([{ prioridad: 'ALTA', cantidad: 2 }]);
    app.detectChanges();
    const grupos = app.nativeElement.querySelectorAll('.grupos section');
    expect(grupos[0].textContent).toContain('Electricidad');
    expect(grupos[0].querySelector('strong').textContent).toBe('0');
    expect(grupos[1].textContent).toContain('ALTA');
    expect(grupos[1].querySelector('strong').textContent).toBe('2');
  });

  it('permite reintentar la ubicación e informa cuando aún no tiene coordenadas', async () => {
    const app = await abrir('/reportes/12/mapa', 'USUARIO');
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(environment.base + '/api/reports/12')
      .flush({}, { status: 404, statusText: 'No encontrado' });
    app.detectChanges();
    expect(app.nativeElement.textContent).toContain('No se pudo consultar la ubicación.');
    const botones = app.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    Array.from(botones)
      .find((b) => b.textContent?.trim() === 'Volver a intentar')!
      .click();
    http.expectOne(environment.base + '/api/reports/12').flush({ idReporte: 12, ubicacionId: 4 });
    http.expectOne(environment.base + '/api/locations/4').flush({
      idUbicacion: 4,
      campus: 'Campus de prueba',
      edificio: 'A',
      latitud: null,
      longitud: null,
    });
    app.detectChanges();
    expect(app.nativeElement.textContent).toContain('Campus de prueba');
    expect(app.nativeElement.textContent).toContain('aún no tiene coordenadas registradas');
    expect(app.nativeElement.querySelector('.mapa')).toBeNull();
  });

  it('registra, edita y elimina un comentario conservando su relación con el reporte', async () => {
    const app = await abrir('/reportes/12/seguimiento', 'ADMIN');
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(environment.base + '/api/reports/12')
      .flush({ idReporte: 12, titulo: 'Fuga de agua' });
    http.expectOne(environment.base + '/api/comments/reporte/12').flush([]);
    http
      .expectOne(environment.base + '/api/recomendaciones/reporte/12')
      .flush(null, { status: 204, statusText: 'Sin recomendación' });
    app.detectChanges();
    const escribir = (texto: string) => {
      const campo = app.nativeElement.querySelector('textarea[formcontrolname="textoComentario"]');
      campo.value = texto;
      campo.dispatchEvent(new Event('input'));
      app.detectChanges();
    };
    const boton = (texto: string) =>
      Array.from(
        app.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
      ).find((b) => b.textContent?.trim() === texto)!;
    escribir('Se revisó la tubería.');
    boton('Publicar comentario').click();
    const guardar = http.expectOne(environment.base + '/api/comments/reporte/12');
    expect(guardar.request.body).toEqual({ textoComentario: 'Se revisó la tubería.' });
    const comentario = {
      idComentario: 3,
      reporteId: 12,
      usuarioId: 9,
      textoComentario: 'Se revisó la tubería.',
      fechaComentario: '2026-11-12T10:00:00',
    };
    guardar.flush(comentario);
    app.detectChanges();
    boton('Editar comentario').click();
    app.detectChanges();
    escribir('Se cambió la tubería.');
    boton('Guardar comentario').click();
    const actualizar = http.expectOne(environment.base + '/api/comments/3');
    expect(actualizar.request.method).toBe('PUT');
    expect(actualizar.request.body.reporteId).toBe(12);
    actualizar.flush({ ...comentario, textoComentario: 'Se cambió la tubería.' });
    app.detectChanges();
    expect(app.nativeElement.querySelector('.seguimiento article').textContent).toContain(
      'Se cambió la tubería.',
    );
    boton('Eliminar comentario').click();
    app.detectChanges();
    boton('Confirmar eliminación').click();
    http
      .expectOne(environment.base + '/api/comments/3')
      .flush(null, { status: 204, statusText: 'Eliminado' });
    app.detectChanges();
    expect(app.nativeElement.querySelector('.seguimiento article')).toBeNull();
    expect(app.nativeElement.textContent).toContain('aún no tiene comentarios');
  });

  it('pagina y busca usuarios y conserva la contraseña al editar una cuenta', async () => {
    const app = await abrir('/administracion/usuarios', 'ADMIN');
    const http = TestBed.inject(HttpTestingController);
    const usuarios = Array.from({ length: 6 }, (_, i) => ({
      idUsuario: i + 1,
      nombre: 'Persona ' + (i + 1),
      apellido: 'Prueba',
      correo: 'persona' + i + '@example.com',
      rolId: 2,
      estado: 'ACTIVO',
      fechaRegistro: '2026-11-12T09:00:00',
    }));
    http.expectOne(environment.base + '/api/users').flush(usuarios);
    http.expectOne(environment.base + '/api/roles').flush([{ idRol: 2, nombre: 'USUARIO' }]);
    app.detectChanges();
    expect(app.nativeElement.querySelectorAll('.lista-tarjetas article').length).toBe(5);
    app.nativeElement.querySelector('button[aria-label="Página siguiente"]').click();
    app.detectChanges();
    expect(app.nativeElement.querySelectorAll('.lista-tarjetas article').length).toBe(1);
    const busqueda = app.nativeElement.querySelector('input[type="search"]');
    busqueda.value = 'Persona 1';
    busqueda.dispatchEvent(new Event('input'));
    app.detectChanges();
    const tarjeta = app.nativeElement.querySelector('.lista-tarjetas article');
    expect(tarjeta.textContent).toContain('Persona 1');
    const acciones: NodeListOf<HTMLButtonElement> = tarjeta.querySelectorAll('button');
    Array.from(acciones)
      .find((b) => b.textContent?.trim() === 'Editar')!
      .click();
    app.detectChanges();
    const formulario = app.debugElement
      .query(By.directive(FormGroupDirective))
      .injector.get(FormGroupDirective).form;
    formulario.patchValue({ nombre: 'Persona editada', password: '' });
    app.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    const guardar = http.expectOne(environment.base + '/api/users/1');
    expect(guardar.request.method).toBe('PUT');
    expect(guardar.request.body.password).toBeUndefined();
    expect(guardar.request.body.rolId).toBe(2);
    guardar.flush({ ...usuarios[0], nombre: 'Persona editada' });
    http.expectOne(environment.base + '/api/users').flush(usuarios);
    http.expectOne(environment.base + '/api/roles').flush([{ idRol: 2, nombre: 'USUARIO' }]);
  });

  it('muestra los campos obligatorios antes de crear una cuenta administrativa', async () => {
    const app = await abrir('/administracion/usuarios', 'ADMIN');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(environment.base + '/api/users').flush([]);
    http.expectOne(environment.base + '/api/roles').flush([{ idRol: 2, nombre: 'USUARIO' }]);
    app.detectChanges();
    const botones: NodeListOf<HTMLButtonElement> = app.nativeElement.querySelectorAll('button');
    Array.from(botones)
      .find((b) => b.textContent?.trim() === 'Crear cuenta')!
      .click();
    app.detectChanges();
    app.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    app.detectChanges();
    expect(app.nativeElement.querySelectorAll('mat-error').length).toBeGreaterThanOrEqual(4);
    http.expectNone((r) => r.method === 'POST');
  });

  it('descarta evidencias que llegan después de seleccionar otro reporte', async () => {
    const app = await abrir('/evidencias', 'USUARIO');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(environment.base + '/api/reports/mis-reportes').flush([
      { idReporte: 1, titulo: 'Primer reporte', estado: 'ABIERTO' },
      { idReporte: 2, titulo: 'Segundo reporte', estado: 'ABIERTO' },
    ]);
    const vista = app.debugElement.query(By.directive(Evidenciascomponent))
      .componentInstance as Evidenciascomponent;
    vista.seleccionar('1');
    vista.seleccionar('2');
    http
      .expectOne(environment.base + '/api/attachments/reporte/2')
      .flush([
        { idAdjunto: 2, nombreArchivo: 'correcta.jpg', urlArchivo: 'https://example.com/2.jpg' },
      ]);
    http
      .expectOne(environment.base + '/api/attachments/reporte/1')
      .flush([
        { idAdjunto: 1, nombreArchivo: 'anterior.jpg', urlArchivo: 'https://example.com/1.jpg' },
      ]);
    expect(vista.adjuntos[0].nombreArchivo).toBe('correcta.jpg');
    app.detectChanges();
    expect(app.nativeElement.querySelector('.editor-adjunto')).toBeNull();
  });

  it('valida el enlace de una evidencia y la guarda asociada al reporte seleccionado', async () => {
    const app = await abrir('/evidencias?id=12', 'ADMIN');
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(environment.base + '/api/reports')
      .flush([{ idReporte: 12, titulo: 'Fuga', estado: 'ABIERTO' }]);
    http.expectOne(environment.base + '/api/attachments/reporte/12').flush([]);
    app.detectChanges();
    const form = app.debugElement
      .query(By.directive(FormGroupDirective))
      .injector.get(FormGroupDirective).form;
    form.setValue({
      nombreArchivo: 'foto.jpg',
      urlArchivo: 'javascript:alert(1)',
      tipoArchivo: '',
    });
    app.nativeElement.querySelector('.editor-adjunto').dispatchEvent(new Event('submit'));
    http.expectNone((r) => r.method === 'POST');
    form.patchValue({ urlArchivo: 'https://example.com/foto.jpg' });
    app.nativeElement.querySelector('.editor-adjunto').dispatchEvent(new Event('submit'));
    const guardar = http.expectOne(environment.base + '/api/attachments');
    expect(guardar.request.body.reporteId).toBe(12);
    guardar.flush({ idAdjunto: 1 });
    http.expectOne(environment.base + '/api/attachments/reporte/12').flush([]);
  });

  it('exige nombre de tres caracteres y descripción al registrar categorías', async () => {
    const app = await abrir('/administracion/categorias', 'ADMIN');
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(environment.base + '/api/categories').flush([]);
    app.detectChanges();
    const botones: NodeListOf<HTMLButtonElement> = app.nativeElement.querySelectorAll('button');
    Array.from(botones)
      .find((b) => b.textContent?.trim() === 'Nuevo registro')!
      .click();
    app.detectChanges();
    const formulario = app.debugElement
      .query(By.directive(FormGroupDirective))
      .injector.get(FormGroupDirective).form;
    formulario.setValue({ nombre: 'ab', descripcion: '' });
    formulario.markAllAsTouched();
    app.detectChanges();
    expect(app.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    expect(app.nativeElement.textContent).toContain('al menos 3 caracteres');
    expect(app.nativeElement.textContent).toContain('El campo Descripción es obligatorio.');
    formulario.setValue({ nombre: 'Electricidad', descripcion: 'Instalaciones eléctricas' });
    app.detectChanges();
    expect(app.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
    app.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    const guardar = http.expectOne(environment.base + '/api/categories');
    expect(guardar.request.method).toBe('POST');
    expect(guardar.request.body.descripcion).toBe('Instalaciones eléctricas');
    guardar.flush({ idCategoria: 10 });
    http.expectOne(environment.base + '/api/categories').flush([]);
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
