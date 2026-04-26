import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-profile-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-tab.html',
  styleUrl: './profile-tab.scss'
})
export class ProfileTabComponent {
  ctx = inject(UserContextService);

  dimensions = [
    { key: 'risk_profile',  label: 'Perfil de riesgo',         icon: '🎯', colorClass: 'info'    },
    { key: 'wealth_tier',   label: 'Estrato de riqueza',        icon: '💰', colorClass: 'success' },
    { key: 'lifestyle',     label: 'Spending lifestyle',        icon: '🛒', colorClass: 'coral'   },
    { key: 'engagement',    label: 'Engagement digital',        icon: '⚡', colorClass: 'warning' },
    { key: 'conv_style',    label: 'Perfil conversacional',     icon: '💬', colorClass: 'muted'   },
  ] as const;

  // Traducciones de valores en inglés (backend) a español (UI)
  private readonly LABELS: Record<str