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
  constructor(private readonly loginService: Loginservice) {}

  get isAuthenticated(): boolean {
    return this.loginService.isAuthenticated();
  }

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }
}