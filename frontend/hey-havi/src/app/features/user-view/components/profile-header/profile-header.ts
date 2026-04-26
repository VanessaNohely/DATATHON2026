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

  scoreBar = computed(() =>
    Math.round((this.ctx.profile()?.score_compuesto ?? 0) * 100)
  );

  riskLabel(): string {
    const r = this.ctx.profile()?.persona?.risk_profile;
    const map: Record<string, string> = {
      'Conservative': 'Perfil sano', 'Moderate': 'Perfil sano',
      'Aggressive': 'Monitoreo', 'Distressed': 'Atención',
    };
    return map[r ?? ''] ?? 'Perfil sano';
  }

  riskBadgeClass(): string {
    const r = this.ctx.profile()?.persona?.risk_profile;
    if (r === 'Distressed') return 'danger';
    if (r === 'Aggressive') return 'warning';
    return 'success';
  }

  wealthIcon(tier: WealthTier): string {
    const map: Record<WealthTier, string> = {
      'Entry': '🌱', 'Growing': '📈', 'Established': '🏦', 'Affluent': '💰'
    };
    return map[tier] ?? '💳';
  }

  lifestyleIcon(lifestyle: Lifestyle): string {
    const map: Record<Lifestyle, string> = {
      'Essential spender': '🛒', 'Foodie/Social': '🍽️',
      'Tech/Digital native': '📱', 'Traveler': '✈️',
      'Family/Home': '🏠', 'Status spender': '✨',
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
