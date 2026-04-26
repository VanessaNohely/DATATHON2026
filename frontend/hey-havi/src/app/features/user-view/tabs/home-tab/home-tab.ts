import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../../../core/services/user-context.service';
import { AlertsBannerComponent } from '../../components/alerts-banner/alerts-banner';
import { RecommendationsComponent } from '../../components/recommendations/recommendations';

@Component({
  selector: 'app-home-tab',
  standalone: true,
  imports: [CommonModule, AlertsBannerComponent, RecommendationsComponent],
  templateUrl: './home-tab.html',
  styleUrl: './home-tab.scss'
})
export class HomeTabComponent {
  ctx = inject(UserContextService);

  prodIcon(p: string): string {
    const m: Record<string, string> = {
      cuenta_debito: '💳', tarjeta_credito_hey: '💳', tarjeta_credito_garantizada: '🔒',
      tarjeta_credito_negocios: '🏢', credito_personal: '💵', credito_auto: '🚗',
      credito_nomina: '📋', inversion_hey: '📈', seguro_vida: '🛡️',
      seguro_compras: '🛍️', cuenta_negocios: '🏦',
    };
    return m[p] ?? '💳';
  }

  prodLabel(p: string): string {
    return p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
