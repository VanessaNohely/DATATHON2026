import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/user-view/pages/user-view.page')
        .then(m => m.UserViewPageComponent),
  },
  { path: '**', redirectTo: '' },
];
