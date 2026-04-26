export type RiskLevel     = 'bajo' | 'medio' | 'alto';
export type CreditProfile = 'saludable' | 'moderado' | 'tenso';

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

export interface TopicWeight { topic: string; weight: number; }

export interface UserFeatures {
  edad: number; ingreso_mensual_mxn: number; score_buro: number;
  dias_sin_login: number; es_hey_pro: boolean; num_productos_activos: number;
  satisfaccion: number; antiguedad_dias: number;
}

export interface SpendingCategory {
  category: string; amount: number; percentage: number; icon: string;
}

export interface UserProfile {
  user_id: string; name: string; segment_name: string; segment_emoji: string;
  risk_level: RiskLevel; credit_profile: CreditProfile;
  score_compuesto: number; cluster_id: number;
  persona: FinancialPersona; features: UserFeatures;
  top_topics: TopicWeight[]; spending_summary: SpendingCategory[];
  cashback_acumulado: number; productos_activos: string[];
}

export interface Alert {
  id: string; type: 'warning' | 'info' | 'success' | 'danger';
  title: string; message: string; action?: string;
}

export interface Recommendation {
  id: string; product: string; title: string;
  description: string; cta: string; icon: string;
}

export interface ContextResponse {
  profile: UserProfile; alerts: Alert[];
  havi_greeting: string; recommendations: Recommendation[];
}
