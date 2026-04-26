export type RiskLevel     = 'bajo' | 'medio' | 'alto';
export type CreditProfile = 'saludable' | 'moderado' | 'tenso';

// ── Financial Persona (Persona.md) ───────────────────────────
// Valores en inglés — matchean los clusters del backend (user_clusters.csv)
export type RiskProfile  = 'Conservative' | 'Moderate' | 'Aggressive' | 'Distressed';
export type WealthTier   = 'Entry' | 'Growing' | 'Established' | 'Affluent';
export type Lifestyle    = 'Essential spender' | 'Foodie/Social' | 'Tech/Digital native' | 'Traveler' | 'Family/Home' | 'Status spender';
export type Engagement   = 'Power user' | 'Casual' | 'At-risk' | 'Dormant';
export type ConvStyle    = 'Goal-driven' | 'Support-seeking' | 'Exploratory' | 'Passive';

export interface FinancialPersona {
  risk_profile:  RiskProfile;
  wealth_tier:   WealthTier;
  lifestyle:     Lifestyle;
  engagement:    Engagement;
  conv_style:    ConvStyle;
}

export interface TopicWeight {
  topic: string;
  weight: number;
}

export interface UserFeatures {
  edad: number;
  ingreso_mensual_mxn: number;
  score_buro: number;
  dias_sin_login: number;
  es_hey_pro: boolean;
  num_productos_activos: number;
  satisfaccion: number;
  antiguedad_dias: number;
}

export interface SpendingCategory {
  category: string;
  amount: number