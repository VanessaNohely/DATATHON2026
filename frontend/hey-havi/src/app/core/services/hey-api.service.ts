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
  'Distressed':   'A