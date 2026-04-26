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
      'Conservative': 'Perfil sano',
      'Moderate':     'Perfil sano',
      'Aggressive':   'Monitoreo',
  