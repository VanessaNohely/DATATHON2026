import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Redirige la raíz al login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Login — acceso libre
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login').then(m => m.LoginComponent),
  },

  // App principal — protegida por AuthGuard
  {
    path: 'app',
    loadComponent: () =>
      import('./features/user-view/pages/user-view.page')
        .then(m => m.UserViewPageComponent),
    canActivate: [authGuard],
  },

  // Cualquier otra ruta → login
  { path: '**', redirectTo: '/login' },
];
