import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ContextResponse, Lifestyle } from '../models/user-profile.model';
import { ChatRequest, ChatResponse } from '../models/chat.model';

// Emoji por lifestyle (valores en inglés del backend)
const LIFESTYLE_EMOJI: Record<string, string> = {
  'Tech/Digital native': '📱',
  'Traveler':            '✈️',
  'Foodie/Social':       '🍽️',
  'Family/Home':         '🏠',
  'Essential spender':   '🛒',
  'Status spender':      '✨',
};

// Etiqueta de riesgo para mostrar al usuario
const RISK_LABEL: Record<string, string> = {
  'Conservative': 'Perfil sano',
  'Moderate':     'Perfil sano',
  'Aggressive':   'Monitoreo',
  'Distressed':   'Atención',
};

const RISK_LEVEL: Record<string, 'bajo' | 'medio' | 'alto'> = {
  'Conservative': 'bajo',
  'Moderate':     'bajo',
  'Aggressive':   'medio',
  'Distressed':   'alto',
};

@Injectable({ providedIn: 'root' })
export class HeyApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  /** Carga perfil + alertas + greeting de Havi. Llamar al iniciar la app. */
  getUserContext(userId: string): Observable<ContextResponse> {
    return this.http.get<ContextResponse>(`${this.base}/user/${userId}/context`).pipe(
      map(res => this.normalizeContext(res))
    );
  }

  /** Envía mensaje del usuario a Havi. */
  chat(req: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.base}/chat`, req);
  }

  /** Normaliza la respuesta del backend — completa campos opcionales */
  private normalizeContext(res: ContextResponse): ContextResponse {
    const p = res.profile;
    const lifestyle = p.persona?.lifestyle as string;

    return {
      ...res,
      profile: {
        ...p,
        // Si el nombre es un user_id (USR-XXXXX), mostrarlo genérico
        name: p.name?.startsWith('USR-') ? 'Usuario' : (p.name || 'Usuario'),
        // Emoji dinámico según lifestyle
        segment_emoji: LIFESTYLE_EMOJI[lifestyle] ?? '💳',
        // segment_name legible basado en lifestyle
        segment_name: lifestyle || p.segment_name,
        // Mapear risk_level desde el cluster
        risk_level: RISK_LEVEL[p.persona?.risk_profile] ?? p.risk_level ?? 'bajo',
        // Productos activos — placeholder si el backend no los incluye
        productos_activos: p.productos_activos?.length
          ? p.productos_activos
          : ['cuenta_debito'],
        // spending_summary — proteger si viene vacío
        spending_summary: p.spending_summary ?? [],
        // top_topics — proteger si viene vacío
        top_topics: p.top_topics ?? [],
      }
    };
  }
}
