import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ContextResponse, Lifestyle } from '../models/user-profile.model';
import { ChatRequest, ChatResponse } from '../models/chat.model';

const LIFESTYLE_EMOJI: Record<string, string> = {
  'Tech/Digital native': '📱', 'Traveler': '✈️', 'Foodie/Social': '🍽️',
  'Family/Home': '🏠', 'Essential spender': '🛒', 'Status spender': '✨',
};
const RISK_LEVEL: Record<string, 'bajo' | 'medio' | 'alto'> = {
  'Conservative': 'bajo', 'Moderate': 'bajo', 'Aggressive': 'medio', 'Distressed': 'alto',
};

@Injectable({ providedIn: 'root' })
export class HeyApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getUserContext(userId: string): Observable<ContextResponse> {
    return this.http.get<ContextResponse>(`${this.base}/user/${userId}/context`).pipe(
      map(res => this.normalizeContext(res))
    );
  }

  chat(req: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.base}/chat`, req);
  }

  private normalizeContext(res: ContextResponse): ContextResponse {
    const p = res.profile;
    const lifestyle = p.persona?.lifestyle as string;
    return {
      ...res,
      profile: {
        ...p,
        name: p.name?.startsWith('USR-') ? 'Usuario' : (p.name || 'Usuario'),
        segment_emoji: LIFESTYLE_EMOJI[lifestyle] ?? '💳',
        segment_name: lifestyle || p.segment_name,
        risk_level: RISK_LEVEL[p.persona?.risk_profile] ?? p.risk_level ?? 'bajo',
        productos_activos: p.productos_activos?.length ? p.productos_activos : ['cuenta_debito'],
        spending_summary: p.spending_summary ?? [],
        top_topics: p.top_topics ?? [],
      }
    };
  }
}
