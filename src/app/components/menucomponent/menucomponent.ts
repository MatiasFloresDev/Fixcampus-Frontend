import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
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
    private loginService: Loginservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.navSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  isAuthenticated(): boolean {
    return this.loginService.isAuthenticated();
  }

  username(): string {
    return this.loginService.getUsername();
  }

  roles(): string {
    return this.loginService.getRoles().join(', ');
  }

  esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  cerrarSesion(): void {
    this.loginService.logout();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
