import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner" [class.spinner--fullscreen]="fullscreen()">
      <div class="spinner__ring"></div>
      @if (label()) { <p class="spinner__label">{{ label() }}</p> }
    </div>
  `,
  styles: [`
    .spinner {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 12px;
      &--fullscreen {
        position: fixed; inset: 0; background: var(--bg-base); z-index: 100;
      }
      &__ring {
        width: 36px; height: 36px;
        border: 3px solid var(--border-strong);
        border-top-color: var(--hey-coral);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      &__label { font-size: 13px; color: var(--text-muted); }
    }
  `]
})
export class LoadingSpinnerComponent {
  fullscreen = input(false);
  label      = input('');
}
