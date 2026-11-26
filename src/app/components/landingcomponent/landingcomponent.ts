import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Loginservice } from '../../services/loginservice';

@Component({
  selector: 'app-landingcomponent',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './landingcomponent.html',
  styleUrl: './landingcomponent.css',
})
export class Landingcomponent implements OnInit {
  constructor(
    private readonly loginService: Loginservice,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    if (this.loginService.isAuthenticated()) {
      void this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }
}