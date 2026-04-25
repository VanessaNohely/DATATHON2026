import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../../../core/services/user-context.service';
import { WealthTier, Lifestyle, Engagement } from '../../../../core/models/user-profile.model';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-header.html',
  styleUrl: './profile-header.scss'
})
export class ProfileHeaderComponent {
  ctx = inject(UserContextService);

  riskClass = computed(() => {
    const r = this.ctx.profile()?.risk_level;
    return r === 'bajo' ? 'success' : r === 'medio' ? 'warning' : 'danger';
  });

  riskLabel = computed(() => {
    const r = this.ctx.profile()?.risk_level;
    return r === 'bajo' ? 'Perfil sano' : r === 'medio' ? 'Monitoreo' : 'Atención';
  });

  scoreBar = computed(() =>
    Math.round((this.ctx.profile()?.score_compuesto ?? 0) * 100)
  );

  wealthIcon(tier: WealthTier): string {
    const map: Record<WealthTier, string> = {
      'Bajo': '🌱', 'Crecimiento': '📈', 'Establecido': '🏦', 'Afluente': '💰'
    };
    return map[tier] ?? '💳';
  }

  lifestyleIcon(lifestyle: Lifestyle): string {
    const map: Record<Lifestyle, string> = {
      'Essential spender':   '🛒',
      'Foodie/Social':       '🍽️',
      'Tech/Digital native': '📱',
      'Traveler':            '✈️',
      'Family/Home':         '🏠',
      'Status spender':      '✨',
    };
    return map[lifestyle] ?? '💳';
  }

  engagementIcon(eng: Engagement): string {
    const map: Record<Engagement, string> = {
      'Power user': '⚡', 'Casual': '😌', 'At-risk': '⚠️', 'Dormant': '😴'
    };
    return map[eng] ?? '👤';
  }
}
