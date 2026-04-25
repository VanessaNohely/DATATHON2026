import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../../core/services/user-context.service';
import { HeyApiService } from '../../../core/services/hey-api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { HomeTabComponent } from '../tabs/home-tab/home-tab';
import { ChatTabComponent } from '../tabs/chat-tab/chat-tab';
import { SpendingTabComponent } from '../tabs/spending-tab/spending-tab';
import { ProfileTabComponent } from '../tabs/profile-tab/profile-tab';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { Lifestyle } from '../../../core/models/user-profile.model';

export type Tab = 'home' | 'chat' | 'spending' | 'profile';

@Component({
  selector: 'app-user-view-page',
  standalone: true,
  imports: [
    CommonModule,
    HomeTabComponent, ChatTabComponent,
    SpendingTabComponent, ProfileTabComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './user-view.page.html',
  styleUrl: './user-view.page.scss'
})
export class UserViewPageComponent implements OnInit {
  private api = inject(HeyApiService);
  ctx   = inject(UserContextService);
  theme = inject(ThemeService);

  activeTab = signal<Tab>('home');

  tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'home',     icon: '🏠', label: 'Inicio'  },
    { id: 'chat',     icon: '💬', label: 'Havi'    },
    { id: 'spending', icon: '📊', label: 'Gastos'  },
    { id: 'profile',  icon: '👤', label: 'Perfil'  },
  ];

  lifestyleEmoji(l: Lifestyle): string {
    const m: Record<Lifestyle, string> = {
      'Essential spender':   '🛒',
      'Foodie/Social':       '🍽️',
      'Tech/Digital native': '📱',
      'Traveler':            '✈️',
      'Family/Home':         '🏠',
      'Status spender':      '✨',
    };
    return m[l] ?? '💳';
  }

  ngOnInit(): void {
    this.ctx.setContext(MOCK_CONTEXT);
    this.ctx.setLoading(false);
    this.api.getUserContext(this.ctx.userId()).subscribe({
      next: (res) => this.ctx.setContext(res),
      error: () => {}
    });
  }
}

// ── MOCK ─────────────────────────────────────────────────────
const MOCK_CONTEXT = {
  profile: {
    user_id: 'USR-00042',
    name: 'Carlos',
    segment_name: 'Inversor Digital Premium',
    segment_emoji: '💎',
    risk_level: 'bajo' as const,
    credit_profile: 'saludable' as const,
    score_compuesto: 0.82,
    cluster_id: 1,
    persona: {
      risk_profile:  'Moderado'            as const,
      wealth_tier:   'Establecido'         as const,
      lifestyle:     'Tech/Digital native' as const,
      engagement:    'Power user'          as const,
      conv_style:    'Goal-driven'         as const,
    },
    features: {
      edad: 38, ingreso_mensual_mxn: 45000, score_buro: 740,
      dias_sin_login: 3, es_hey_pro: true, num_productos_activos: 4,
      satisfaccion: 9.0, antiguedad_dias: 963,
    },
    top_topics: [
      { topic: 'transferencias_app', weight: 0.31 },
      { topic: 'productos_hey',      weight: 0.22 },
      { topic: 'solicitud_credito',  weight: 0.15 },
    ],
    spending_summary: [
      { category: 'Servicios digitales', amount: 3200, percentage: 34, icon: '📱' },
      { category: 'Restaurantes',        amount: 2100, percentage: 22, icon: '🍽️' },
      { category: 'Viajes',              amount: 1150, percentage: 12, icon: '✈️' },
      { category: 'Supermercado',        amount: 950,  percentage: 10, icon: '🛒' },
      { category: 'Entretenimiento',     amount: 720,  percentage: 8,  icon: '🎬' },
    ],
    cashback_acumulado: 294,
    productos_activos: ['cuenta_debito', 'tarjeta_credito_hey', 'inversion_hey', 'seguro_vida'],
  },
  alerts: [
    { id: 'a1', type: 'info' as const,
      title: 'Rendimiento de inversión',
      message: 'Tu inversión Hey generó $1,240 este mes. GAT actual: 10.5%' },
    { id: 'a2', type: 'warning' as const,
      title: 'Cargos recurrentes',
      message: '3 suscripciones digitales sin usar. Podrías ahorrar $849/mes.' },
  ],
  havi_greeting: '¡Hola Carlos! 👋 Tu inversión creció 2.1% y tienes $294 en cashback. ¿En qué te ayudo hoy?',
  recommendations: [
    { id: 'r1', product: 'Hey Pro', icon: '⭐',
      title: 'Maximiza tu cashback',
      description: 'Con Hey Pro ganas 1% en todas tus compras. Este mes: $95 extra.',
      cta: 'Ver beneficios' },
    { id: 'r2', product: 'Seguro de Vida', icon: '🛡️',
      title: 'Protege lo que más importa',
      description: 'Basado en tu patrimonio, amplía tu cobertura.',
      cta: 'Cotizar' },
  ],
};
