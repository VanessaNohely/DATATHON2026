import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../../../core/services/user-context.service';
import { Alert } from '../../../../core/models/user-profile.model';

@Component({
  selector: 'app-alerts-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts-banner.html',
  styleUrl: './alerts-banner.scss'
})
export class AlertsBannerComponent {
  ctx = inject(UserContextService);
  dismissed = signal<Set<string>>(new Set());

  dismiss(id: string): void {
    const s = new Set(this.dismissed());
    s.add(id);
    this.dismissed.set(s);
  }

  visible(alert: Alert): boolean {
    return !this.dismissed().has(alert.id);
  }

  iconFor(type: string): string {
    const icons: Record<string, string> = {
      warning: '⚠️', info: 'ℹ️', success: '✓', danger: '🔴'
    };
    return icons[type] ?? 'ℹ️';
  }
}
