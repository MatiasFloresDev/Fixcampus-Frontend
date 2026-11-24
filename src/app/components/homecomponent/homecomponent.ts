import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Loginservice } from '../../services/loginservice';

@Component({
  selector: 'app-homecomponent',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './homecomponent.html',
  styleUrl: './homecomponent.css',
})
export class Homecomponent {
  constructor(private loginService: Loginservice) {}

  isAuthenticated(): boolean {
    return this.loginService.isAuthenticated();
  }

  esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }
}
