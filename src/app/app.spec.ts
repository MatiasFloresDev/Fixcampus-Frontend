import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

// Smoke test del arranque: comprueba que la ruta inicial monta el contenido.
describe('Inicio de FixCampus', () => {
  it('muestra la pantalla inicial a través del router', async () => {
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter(routes)] }).compileComponents();
    const router = TestBed.inject((await import('@angular/router')).Router);
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Un mejor campus');
    expect(fixture.nativeElement.querySelector('nav')?.getAttribute('aria-label')).toBe('Navegación principal');
  });
});
