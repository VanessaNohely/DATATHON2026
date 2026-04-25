import { Component } from '@angular/core';
import { UserViewPageComponent } from './features/user-view/pages/user-view.page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UserViewPageComponent],
  template: '<app-user-view-page />',
  styles: [':host { display: block; min-height: 100vh; }']
})
export class AppComponent {}
