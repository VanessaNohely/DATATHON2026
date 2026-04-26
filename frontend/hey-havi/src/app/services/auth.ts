import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Persiste en sessionStorage — sobrevive recargas dentro de la misma sesión
  private _loggedIn = signal(sessionStorage.getItem('hey_auth') === 'true');

  isAuthenticated = this._loggedIn.asReadonly();

  login(password: string): boolean {
    // Contraseña fija para demo — cambiar por integración real cuando haya auth backend
    if (password === 'heybank2026') {
      sessionStorage.setItem('hey_auth', 'true');
      this._loggedIn.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem('hey_auth');
    this._loggedIn.set(false);
  }
}
