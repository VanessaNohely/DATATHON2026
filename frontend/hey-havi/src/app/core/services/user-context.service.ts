import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, Alert, Recommendation, ContextResponse } from '../models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class UserContextService {
  // State signals
  private _profile  = signal<UserProfile | null>(null);
  private _alerts   = signal<Alert[]>([]);
  private _recs     = signal<Recommendation[]>([]);
  private _greeting = signal<string>('');
  private _loading  = signal<boolean>(false);
  private _userId   = signal<string>('USR-00042'); // mock default

  // Public readonly
  profile   = this._profile.asReadonly();
  alerts    = this._alerts.asReadonly();
  recs      = this._recs.asReadonly();
  greeting  = this._greeting.asReadonly();
  loading   = this._loading.asReadonly();
  userId    = this._userId.asReadonly();

  // Computed
  isReady = computed(() => this._profile() !== null && !this._loading());

  setContext(ctx: ContextResponse): void {
    this._profile.set(ctx.profile);
    this._alerts.set(ctx.alerts);
    this._recs.set(ctx.recommendations);
    this._greeting.set(ctx.havi_greeting);
  }

  setLoading(v: boolean): void { this._loading.set(v); }
  setUserId(id: string): void  { th