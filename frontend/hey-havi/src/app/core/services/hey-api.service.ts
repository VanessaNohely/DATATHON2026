import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContextResponse } from '../models/user-profile.model';
import { ChatRequest, ChatResponse } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class HeyApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  /** Carga perfil + alertas + greeting de Havi. Llamar al iniciar la app. */
  getUserContext(userId: string): Observable<ContextResponse> {
    return this.http.get<ContextResponse>(`${this.base}/user/${userId}/context`);
  }

  /** Envía mensaje del usuario a Havi. El backend mantiene el contexto. */
  chat(req: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.base}/chat`, req);
  }
}
