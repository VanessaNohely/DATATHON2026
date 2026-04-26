import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;

  // El método para validar tu contraseña fija
  login(password: string): boolean {
    if (password === 'password') {
      this.loggedIn = true;
      return true;
    }
    return false;
  }

  isAuthenticated(): boolean {
    return this.loggedIn;
  }

  logout() {
    this.loggedIn = false;
  }
}