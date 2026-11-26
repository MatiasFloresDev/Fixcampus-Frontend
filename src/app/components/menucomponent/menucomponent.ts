import { ChangeDetectorRef, Component, effect, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Loginservice } from '../../services/loginservice';

@Component({
  selector: 'app-menucomponent',
  standalone: true,
  imports: [MatToolbarModule, MatMenuModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './menucomponent.html',
  styleUrl: './menucomponent.css',
})
export class Menucomponent implements OnInit, OnDestroy {
  private navSub?: Subscription;

  constructor(
    private readonly loginService: Loginservice,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      this.loginService.sessionVersion();
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  get isAuthenticated(): boolean {
    return this.loginService.isAuthenticated();
  }

  get username(): string {
    return this.loginService.getUsername();
  }

  get roles(): string {
    return this.loginService.getRoles().join(', ');
  }

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  cerrarSesion(): void {
    this.loginService.logout();
    void this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
