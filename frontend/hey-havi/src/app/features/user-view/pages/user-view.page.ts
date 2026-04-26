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
import { UserSelectorComponent } from '../../../shared/components/user-selector/user-selector';
import { Lifestyle } from '../../../core/models/user-profile.model';
import { DEMO_USERS } from '../../../core/data/mock-users';

export type Tab = 'home' | 'chat' | 'spending' | 'profile';

@Component({
  selector: 'app-user-view-page',
  standalone: true,
  imports: [
    CommonModule,
    HomeTabComponent, ChatTabComponent,
    SpendingTabComponent, ProfileTabComponent,
    LoadingSpinnerComponent, UserSelectorComponent,
  ],
  templateUrl: './user-view.page.html',
  styleUrl: './user-view.page.scss'
})
export class UserViewPageComponent implements OnInit {
  private api = inject(HeyApiService);
  ctx   = inject(UserContextService);
  theme = inject(ThemeService);

  activeTab     = signal<Tab>('home');
  showSelector  = signal(false);

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
    this.ctx.setContext(DEMO_USERS[0].context);  // Carlos por default
    this.ctx.setLoading(false);
    this.api.getUserContext(this.ctx.userId()).subscribe({
      next: (res) => this.ctx.setContext(res),
      error: () => {}
    });
  }
}
