import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Accesoservice } from '../../services/accesoservice';
import { Estadisticascomponent } from './estadisticascomponent';

describe('Estadísticas de mantenimiento', () => {
  const categoriasUrl = environment.base + '/api/categories/reporte-por-categoria';
  const prioridadesUrl =
    environment.base + '/api/recomendaciones/estadisticas/por-prioridad-reporte';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Estadisticascomponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.inject(Accesoservice).salir();
  });

  it('cuenta también las categorías sin reportes y compara las barras con el mayor valor', () => {
    const vista = TestBed.createComponent(Estadisticascomponent);
    const http = TestBed.inject(HttpTestingController);
    vista.detectChanges();
    http.expectOne(categoriasUrl).flush([
      { idCategoria: 1, nombre: 'Electricidad', totalReportes: 8 },
      { idCategoria: 2, nombre: 'Mobiliario', totalReportes: 4 },
      { idCategoria: 3, nombre: 'Limpieza', totalReportes: 0 },
    ]);
    http.expectOne(prioridadesUrl).flush([
      { prioridad: 'ALTA', cantidad: 4 },
      { prioridad: 'MEDIA', cantidad: 1 },
    ]);
    vista.detectChanges();
    const pagina: HTMLElement = vista.nativeElement;
    const valores = Array.from(pagina.querySelectorAll('.kpi-valor')).map((item) =>
      item.textContent?.trim(),
    );
    expect(valores).toEqual(['12', 'Electricidad', '3', '4.0']);
    expect(pagina.textContent).toContain('Total de categorías');
    expect(pagina.textContent).not.toContain('Categorías activas');
    const barras = Array.from(pagina.querySelectorAll<HTMLElement>('.relleno-barra'));
    expect(barras.map((item) => item.style.width)).toEqual(['100%', '50%', '0%', '100%', '25%']);
  });

  it('muestra un catálogo vacío sin promedios inválidos ni barras ficticias', () => {
    const vista = TestBed.createComponent(Estadisticascomponent);
    const http = TestBed.inject(HttpTestingController);
    vista.detectChanges();
    http.expectOne(categoriasUrl).flush([]);
    http.expectOne(prioridadesUrl).flush([]);
    vista.detectChanges();
    const pagina: HTMLElement = vista.nativeElement;
    expect(
      Array.from(pagina.querySelectorAll('.kpi-valor')).map((item) => item.textContent?.trim()),
    ).toEqual(['0', 'Ninguna', '0', '0']);
    expect(pagina.textContent).toContain('Todavía no hay categorías.');
    expect(pagina.textContent).toContain('Todavía no hay recomendaciones.');
    expect(pagina.querySelectorAll('.relleno-barra').length).toBe(0);
  });

  it('no destaca una categoría cuando todas tienen cero reportes', () => {
    const vista = TestBed.createComponent(Estadisticascomponent);
    const http = TestBed.inject(HttpTestingController);
    vista.detectChanges();
    http
      .expectOne(categoriasUrl)
      .flush([{ idCategoria: 1, nombre: 'Electricidad', totalReportes: 0 }]);
    http.expectOne(prioridadesUrl).flush([]);
    vista.detectChanges();
    expect(vista.componentInstance.categoriaMasFrecuente).toBe('Ninguna');
    expect(vista.nativeElement.querySelector('.relleno-barra').style.width).toBe('0%');
  });

  it('oculta estadísticas incompletas si falla la segunda consulta y permite reintentar', () => {
    const vista = TestBed.createComponent(Estadisticascomponent);
    const http = TestBed.inject(HttpTestingController);
    vista.detectChanges();
    http
      .expectOne(categoriasUrl)
      .flush([{ idCategoria: 1, nombre: 'Electricidad', totalReportes: 8 }]);
    http.expectOne(prioridadesUrl).flush(null, { status: 500, statusText: 'Server Error' });
    vista.detectChanges();
    const pagina: HTMLElement = vista.nativeElement;
    expect(pagina.querySelector('[role="alert"]')?.textContent).toContain(
      'No se pudieron consultar',
    );
    expect(pagina.querySelector('.kpi-grid')).toBeNull();
    pagina.querySelector<HTMLButtonElement>('button')!.click();
    http.expectOne(categoriasUrl).flush([]);
    http.expectOne(prioridadesUrl).flush([]);
    vista.detectChanges();
    expect(pagina.querySelector('[role="alert"]')).toBeNull();
    expect(pagina.querySelector('.kpi-grid')).not.toBeNull();
  });
});
