import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<Theme>('dark'); // siempre oscuro por defecto para el demo

  theme = this._theme.asReadonly();
  isDark = () => this._theme() === 'dark';

  constructor() {
    // Apply theme to <html> on every change
    effect(() => {
      const t = this._theme();
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('hey-theme', t);
    });
    // Apply immediately on init
    document.documentElement.setAttribute('data-theme', this._theme());
  }

  toggle(): void {
    this._theme.set(this._theme() === 'dark' ? 'light' : 'dark');
  }
}
