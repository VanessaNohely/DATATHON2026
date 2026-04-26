import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Importante para navegar
import { AuthService } from '../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  passwordValue: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (this.authService.login(this.passwordValue)) {
      // Esta ruta debe coincidir con la que tienes en app.routes.ts
      this.router.navigate(['/user-view']); 
    } else {
      alert('Contraseña incorrecta. Intenta con "password"');
    }
  }
}