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
    http.expectNone('/registro');
    vista.formulario.controls.password.setValue('ClavePrueba');
    vista.formulario.controls.terminos.setValue(false);
    vista.registrar();
    http.expectNone('/registro');
    vista.formulario.controls.terminos.setValue(true);
    vista.registrar();
    const solicitud = http.expectOne('/registro');
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
    http.expectOne('/login').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(app.nativeElement.textContent).toContain('El correo o la contraseña no son correctos.');
    vista.ingresar();
    const token = tokenDePrueba('ROLE_USUARIO');
    http.expectOne('/login').flush({ token, correo: 'ana@fixcampus.test', idUsuario: 1 });
    await app.whenStable();
    const reportes = http.expectOne('/api/reports/mis-reportes');
    expect(reportes.request.headers.get('Authorization')).toBe('Bearer ' + token);
    reportes.flush([]);
    app.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/evidencias');
    expect(app.nativeElement.querySelector('nav').textContent).toContain('Mis reportes');
    expect(app.nativeElement.querySelector('nav a[href="/panel"]')).toBeNull();
  });

  it('redirige a un usuario que intenta abrir el panel y muestra el aviso si la sesión vence', async () => {
    const app = await abrir('/panel', 'USUARIO');
    const http = TestBed.inject(HttpTestingController);
    expect(TestBed.inject(Router).url).toBe('/evidencias');
    http.expectNone('/api/reports/estadisticas/por-usuario-mes');
    http
      .expectOne('/api/reports/mis-reportes')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    await app.whenStable();
    app.detectChanges();
    expect(app.nativeElement.textContent).toContain('Tu sesión venció');
    expect(sessionStorage.getItem('fixcampus-token')).toBeNull();
  });

  it('dibuja las incidencias con los datos de la consulta de administrador', async () => {
    const app = await abrir('/panel', 'ADMIN');
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/reports/estadisticas/por-usuario-mes')
      .flush([
        { usuarioId: 1, nombre: 'Ana', apellido: 'Torres', anio: 2026, mes: 10, cantidad: 4 },
      ]);
    http.expectOne('/api/reports').flush([{ estado: 'ABIERTO' }]);
    http.expectOne('/api/users/count').flush(2);
    app.detectChanges();
    expect(app.nativeElement.querySelector('.grafico').textContent).toContain('Ana Torres');
    expect(app.nativeElement.querySelector('.grafico strong').textContent).toBe('4');
    expect(app.nativeElement.querySelector('.indicadores').textContent).toContain('Usuarios');
  });

  it('avisa al volver a abrir una ruta con un token vencido', async () => {
    sessionStorage.setItem('fixcampus-token', tokenDePrueba('USUARIO', -1));
    const app = await abrir('/evidencias');
    expect(TestBed.inject(Router).url).toBe('/acceso');
    expect(app.nativeElement.textContent).toContain('Tu sesión venció');
    TestBed.inject(HttpTestingController).expectNone('/api/reports/mis-reportes');
  });

  it('reintenta las evidencias y abre los enlaces válidos en otra pestaña', async () => {
    const app = await abrir('/evidencias', 'USUARIO');
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/reports/mis-reportes')
      .flush([
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
    http.expectOne('/api/attachments/reporte/12').flush({}, { status: 500, statusText: 'Error' });
    expect(app.nativeElement.textContent).toContain('No se pudieron cargar las evidencias.');
    vista.cargarAdjuntos();
    http.expectOne('/api/attachments/reporte/12').flush([]);
    expect(app.nativeElement.textContent).toContain('no tiene evidencias adjuntas');
    vista.cargarAdjuntos();
    http.expectOne('/api/attachments/reporte/12').flush([
      { idAdjunto: 1, nombreArchivo: 'foto.jpg', urlArchivo: 'https://example.com/foto.jpg' },
      { idAdjunto: 2, nombreArchivo: 'Enlace inválido', urlArchivo: 'javascript:alert(1)' },
    ]);
    const enlaces = app.nativeElement.querySelectorAll('.evidencias a');
    expect(enlaces.length).toBe(1);
    expect(enlaces[0].getAttribute('target')).toBe('_blank');
    expect(enlaces[0].getAttribute('href')).toBe('https://example.com/foto.jpg');
  });
});
