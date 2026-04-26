import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  password = signal('');
  error    = signal('');
  loading  = signal(false);

  onLogin(): void {
    if (!this.password().trim()) {
      this.error.set('Ingresa tu contraseña.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    // Simulamos un pequeño delay para que se vea más realista en el demo
    setTimeout(() => {
      if (this.auth.login(this.password())) {
        this.router.navigate(['/app']);
      } else {
        this.error.set('Contraseña incorrecta. Inténtalo de nuevo.');
        this.loading.set(false);
      }
    }, 600);
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.onLogin();
  }
}
