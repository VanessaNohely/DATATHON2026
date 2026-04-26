import { Routes } from '@angular/router';
import { Login } from './login/login';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () =>
      import('./features/user-view/pages/user-view.page')
        .then(m => m.UserViewPageComponent),
  },
  { path: '**', redirectTo: '' },
];
