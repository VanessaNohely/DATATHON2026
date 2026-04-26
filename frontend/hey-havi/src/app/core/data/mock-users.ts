import { ContextResponse } from '../models/user-profile.model';

// ─────────────────────────────────────────────────────────────
// 6 perfiles representativos — uno por segmento
// Basados en los clusters reales del análisis ML
// ─────────────────────────────────────────────────────────────

export interface UserOption {
  user_id:      string;
  display_name: string;
  segment_emoji: string;
  segment_name:  string;
  risk_badge:    string;
  risk_class:    'success' | 'warning' | 'danger';
  context:       ContextResponse;
}

// ── Segmento 1: Inversor Digital Premium ─────────────────────
const CARLOS: ContextResponse = {
  profile: {
    user_id: 'USR-00042', name: 'Carlos',
    segment_name: 'Inversor Digital Premium', segment_emoji: '💎',
    risk_level: 'bajo', credit_profile: 'saludable',
    score_compuesto: 0.82, cluster_id: 1,
    persona: { risk_profile: 'Moderate', wealth_tier: 'Established',
               lifestyle: 'Tech/Digital native', engagement: 'Power user', conv_style: 'Goal-driven' },
    features: { edad: 38, ingreso_mensual_mxn: 45000, score_buro: 740,
                dias_sin_login: 3, es_hey_pro: true, num_productos_activos: 4,
                satisfaccion: 9.0, antiguedad_dias: 963 },
    top_topics: [{ topic: 'productos_hey', weight: 0.31 }, { topic: 'solicitud_credito', weight: 0.22 }],
    spending_summary: [
      { category: 'Servicios digitales', amount: 3200, percentage: 34, icon: '📱' },
      { category: 'Restaurantes',        amount: 2100, percentage: 22, icon: '🍽️' },
      { category: 'Viajes',              amount: 1150, percentage: 12, icon: '✈️' },
      { category: 'Supermercado',        amount: 950,  percentage: 10, icon: '🛒' },
      { category: 'Entretenimiento',     amount: 720,  percentage: 8,  icon: '🎬' },
    ],
    cashback_acumulado: 294, productos_activos: ['cuenta_debito', 'tarjeta_credito_hey', 'inversion_hey', 'seguro_vida'],
  },
  alerts: [
    { id: 'a1', type: 'info', title: 'Rendimiento de inversión', message: 'Tu inversión Hey generó $1,240 este mes. GAT actual: 10.5%' },
    { id: 'a2', type: 'warning', title: 'Cargos recurrentes', message: '3 suscripciones digitales sin usar. Podrías ahorrar $849/mes.' },
  ],
  havi_greeting: '¡Hola Carlos! 💎 Tu inversión creció 2.1% este mes y tienes $294 en cashback acumulado. ¿En qué te puedo ayudar hoy?',
  recommendations: [
    { id: 'r1', product: 'Seguro de Vida', icon: '🛡️', title: 'Amplía tu cobertura', description: 'Basado en tu patrimonio acumulado, te recomendamos revisar tu seguro.', cta: 'Cotizar' },
    { id: 'r2', product: 'Hey Pro', icon: '⭐', title: 'Maximiza tu cashback', description: 'Con Hey Pro ganas 1% en cada compra. Este mes: $95 adicionales.', cta: 'Ver beneficios' },
  ],
};

// ── Segmento 3: Asalariado Fiel ──────────────────────────────
const MARIA: ContextResponse = {
  profile: {
    user_id: 'USR-00301', name: 'María',
    segment_name: 'Asalariada Fiel', segment_emoji: '🏢',
    risk_level: 'bajo', credit_profile: 'moderado',
    score_compuesto: 0.65, cluster_id: 3,
    persona: { risk_profile: 'Conservative', wealth_tier: 'Growing',
               lifestyle: 'Essential spender', engagement: 'Casual', conv_style: 'Support-seeking' },
    features: { edad: 40, ingreso_mensual_mxn: 24500, score_buro: 631,
                dias_sin_login: 9, es_hey_pro: false, num_productos_activos: 3,
                satisfaccion: 8.0, antiguedad_dias: 944 },
    top_topics: [{ topic: 'gestion_cuenta', weight: 0.28 }, { topic: 'transferencias_app', weight: 0.24 }],
    spending_summary: [
      { category: 'Supermercado',        amount: 4200, percentage: 38, icon: '🛒' },
      { category: 'Servicios digitales', amount: 1800, percentage: 16, icon: '📱' },
      { category: 'Restaurantes',        amount: 1500, percentage: 14, icon: '🍽️' },
      { category: 'Salud',               amount: 1100, percentage: 10, icon: '💊' },
      { category: 'Transporte',          amount: 900,  percentage: 8,  icon: '🚌' },
    ],
    cashback_acumulado: 71, productos_activos: ['cuenta_debito', 'tarjeta_credito_hey', 'credito_nomina'],
  },
  alerts: [
    { id: 'a1', type: 'success', title: '¡Nómina recibida!', message: 'Tu nómina de $24,500 fue acreditada hoy. Saldo disponible actualizado.' },
    { id: 'a2', type: 'info',    title: 'Pago de TDC próximo', message: 'Tu fecha de pago es en 4 días. Monto mínimo: $680.' },
  ],
  havi_greeting: '¡Hola María! 🏢 Hoy llegó tu nómina. Te queda un pago de TDC en 4 días — ¿te ayudo a programarlo para que no se te olvide?',
  recommendations: [
    { id: 'r1', product: 'Crédito Nómina', icon: '📋', title: 'Crédito preferencial', description: 'Por tus 2.6 años con nómina domiciliada, tienes una tasa especial de 18% anual.', cta: 'Ver oferta' },
    { id: 'r2', product: 'Inversión Hey',  icon: '📈', title: 'Haz crecer tu nómina', description: 'Invierte desde $500 y gana rendimientos desde el primer día.', cta: 'Empezar' },
  ],
};

// ── Segmento 4: Millennial / Gen Z Digital ───────────────────
const DIEGO: ContextResponse = {
  profile: {
    user_id: 'USR-00789', name: 'Diego',
    segment_name: 'Millennial Digital', segment_emoji: '📱',
    risk_level: 'bajo', credit_profile: 'tenso',
    score_compuesto: 0.70, cluster_id: 4,
    persona: { risk_profile: 'Aggressive', wealth_tier: 'Growing',
               lifestyle: 'Foodie/Social', engagement: 'Power user', conv_style: 'Exploratory' },
    features: { edad: 25, ingreso_mensual_mxn: 18400, score_buro: 615,
                dias_sin_login: 1, es_hey_pro: true, num_productos_activos: 3,
                satisfaccion: 8.5, antiguedad_dias: 913 },
    top_topics: [{ topic: 'productos_hey', weight: 0.35 }, { topic: 'tarjetas_fisicas', weight: 0.18 }],
    spending_summary: [
      { category: 'Restaurantes',        amount: 3800, percentage: 32, icon: '🍽️' },
      { category: 'Entretenimiento',     amount: 2200, percentage: 18, icon: '🎬' },
      { category: 'Servicios digitales', amount: 1900, percentage: 16, icon: '📱' },
      { category: 'Ropa y accesorios',   amount: 1400, percentage: 12, icon: '👕' },
      { category: 'Transporte',          amount: 900,  percentage: 8,  icon: '🛵' },
    ],
    cashback_acumulado: 123, productos_activos: ['cuenta_debito', 'tarjeta_credito_hey', 'seguro_compras'],
  },
  alerts: [
    { id: 'a1', type: 'success', title: 'Cashback disponible', message: '¡Tienes $123 de cashback listo para usar! Úsalo en tu próxima compra.' },
    { id: 'a2', type: 'info',    title: 'Hey Shop',           message: '3 productos en tu wishlist tienen descuento esta semana.' },
  ],
  havi_greeting: '¡Hola Diego! 📱 Llevas 71 transacciones este mes — eres de los más activos. Tienes $123 en cashback y 3 ofertas en Hey Shop esperándote. ¿Qué necesitas?',
  recommendations: [
    { id: 'r1', product: 'Inversión Hey', icon: '📈', title: 'Empieza a invertir', description: 'Con tu cashback de $123 puedes abrir tu primera inversión hoy mismo.', cta: 'Invertir ahora' },
    { id: 'r2', product: 'Hey Shop',      icon: '🛍️', title: 'Compra con cashback',  description: 'Usa tus $123 en cualquier tienda de Hey Shop y gana más.', cta: 'Ver tiendas' },
  ],
};

// ── Segmento 2: Independiente Alto Gasto ─────────────────────
const ANA: ContextResponse = {
  profile: {
    user_id: 'USR-00512', name: 'Ana',
    segment_name: 'Independiente Alto Gasto', segment_emoji: '💼',
    risk_level: 'bajo', credit_profile: 'saludable',
    score_compuesto: 0.75, cluster_id: 2,
    persona: { risk_profile: 'Aggressive', wealth_tier: 'Affluent',
               lifestyle: 'Traveler', engagement: 'Power user', conv_style: 'Goal-driven' },
    features: { edad: 42, ingreso_mensual_mxn: 59000, score_buro: 666,
                dias_sin_login: 7, es_hey_pro: true, num_productos_activos: 4,
                satisfaccion: 8.0, antiguedad_dias: 949 },
    top_topics: [{ topic: 'solicitud_credito', weight: 0.30 }, { topic: 'credito_plazos', weight: 0.20 }],
    spending_summary: [
      { category: 'Viajes',              amount: 12000, percentage: 36, icon: '✈️' },
      { category: 'Restaurantes',        amount: 5500,  percentage: 17, icon: '🍽️' },
      { category: 'Tecnología',          amount: 4000,  percentage: 12, icon: '💻' },
      { category: 'Servicios digitales', amount: 3200,  percentage: 10, icon: '📱' },
      { category: 'Ropa y accesorios',   amount: 2800,  percentage: 8,  icon: '👗' },
    ],
    cashback_acumulado: 635, productos_activos: ['cuenta_debito', 'tarjeta_credito_hey', 'credito_personal', 'cuenta_negocios'],
  },
  alerts: [
    { id: 'a1', type: 'info',    title: 'MSI disponibles',      message: 'Tienes 6 MSI disponibles en más de 200 comercios de tecnología y viajes.' },
    { id: 'a2', type: 'success', title: 'Cashback récord',       message: '¡$635 acumulados este mes! Tu mayor cashback histórico.' },
  ],
  havi_greeting: '¡Hola Ana! 💼 Este mes lograste tu mayor cashback histórico: $635. Veo que viajaste a 4 ciudades distintas. ¿Quieres revisar tus gastos de viaje o explorar algún crédito?',
  recommendations: [
    { id: 'r1', product: 'Cuenta Negocios', icon: '🏦', title: 'Separa tus finanzas', description: 'Como independiente, una cuenta de negocios te ayuda con tu contabilidad.', cta: 'Abrir cuenta' },
    { id: 'r2', product: 'Inversión Hey',   icon: '📈', title: 'Invierte tu excedente', description: 'Detectamos excedente mensual promedio de $8,200. Ponlo a trabajar.', cta: 'Ver rendimientos' },
  ],
};

// ── Segmento 5: Tensión Financiera ───────────────────────────
const ROBERTO: ContextResponse = {
  profile: {
    user_id: 'USR-01205', name: 'Roberto',
    segment_name: 'Usuario en Tensión Financiera', segment_emoji: '⚠️',
    risk_level: 'alto', credit_profile: 'tenso',
    score_compuesto: 0.32, cluster_id: 5,
    persona: { risk_profile: 'Distressed', wealth_tier: 'Entry',
               lifestyle: 'Essential spender', engagement: 'At-risk', conv_style: 'Support-seeking' },
    features: { edad: 37, ingreso_mensual_mxn: 15500, score_buro: 447,
                dias_sin_login: 12, es_hey_pro: false, num_productos_activos: 3,
                satisfaccion: 5.1, antiguedad_dias: 914 },
    top_topics: [{ topic: 'cargos_disputas', weight: 0.32 }, { topic: 'escalacion_humano', weight: 0.24 }],
    spending_summary: [
      { category: 'Supermercado',    amount: 4800, percentage: 42, icon: '🛒' },
      { category: 'Gobierno',        amount: 2100, percentage: 18, icon: '🏛️' },
      { category: 'Salud',           amount: 1500, percentage: 13, icon: '💊' },
      { category: 'Transporte',      amount: 1200, percentage: 10, icon: '🚌' },
      { category: 'Restaurantes',    amount: 800,  percentage: 7,  icon: '🍽️' },
    ],
    cashback_acumulado: 21, productos_activos: ['cuenta_debito', 'tarjeta_credito_hey', 'credito_personal'],
  },
  alerts: [
    { id: 'a1', type: 'danger',  title: 'Utilización de crédito alta', message: 'Tu TDC está al 87% de su límite. Esto puede afectar tu score buró.' },
    { id: 'a2', type: 'warning', title: 'Pago mínimo detectado',        message: 'Llevas 3 meses pagando solo el mínimo. Te estamos compartiendo un plan de reducción.' },
  ],
  havi_greeting: '¡Hola Roberto! Veo que has tenido un mes difícil. Tu crédito está al 87% — vamos a trabajar juntos para reducirlo. Tengo un plan de 3 pasos que puede ayudarte. ¿Empezamos?',
  recommendations: [
    { id: 'r1', product: 'Plan de pagos',           icon: '📅', title: 'Reestructura tu deuda', description: 'Podemos ajustar tu fecha de pago y reducir el mínimo mensual.', cta: 'Ver plan' },
    { id: 'r2', product: 'Educación financiera',    icon: '📚', title: 'Mejora tu score en 90 días', description: 'Guía personalizada basada en tu historial de pagos.', cta: 'Ver guía' },
  ],
};

// ── Segmento 0: Durmiente Insatisfecho ───────────────────────
const ELENA: ContextResponse = {
  profile: {
    user_id: 'USR-00998', name: 'Elena',
    segment_name: 'Durmiente Insatisfecha', segment_emoji: '😴',
    risk_level: 'alto', credit_profile: 'moderado',
    score_compuesto: 0.22, cluster_id: 0,
    persona: { risk_profile: 'Conservative', wealth_tier: 'Entry',
               lifestyle: 'Essential spender', engagement: 'Dormant', conv_style: 'Passive' },
    features: { edad: 41, ingreso_mensual_mxn: 19700, score_buro: 544,
                dias_sin_login: 105, es_hey_pro: false, num_productos_activos: 2,
                satisfaccion: 5.6, antiguedad_dias: 905 },
    top_topics: [{ topic: 'transferencias_app', weight: 0.40 }, { topic: 'gestion_cuenta', weight: 0.22 }],
    spending_summary: [
      { category: 'Supermercado', amount: 2800, percentage: 45, icon: '🛒' },
      { category: 'Gobierno',     amount: 1400, percentage: 22, icon: '🏛️' },
      { category: 'Salud',        amount: 900,  percentage: 14, icon: '💊' },
      { category: 'Transporte',   amount: 700,  percentage: 11, icon: '🚌' },
      { category: 'Restaurantes', amount: 400,  percentage: 6,  icon: '🍽️' },
    ],
    cashback_acumulado: 1, productos_activos: ['cuenta_debito', 'tarjeta_credito_garantizada'],
  },
  alerts: [
    { id: 'a1', type: 'warning', title: 'Te hemos extrañado', message: 'Llevas 105 días sin abrir la app. Tu cuenta sigue activa y segura.' },
    { id: 'a2', type: 'info',    title: 'Beneficio sin usar', message: 'Tienes $800 disponibles en tu tarjeta garantizada que no has usado.' },
  ],
  havi_greeting: '¡Hola Elena! 👋 Han pasado 105 días desde tu última visita — me alegra que estés aquí. Tu cuenta está segura y tienes $800 disponibles. ¿Hay algo en lo que te pueda ayudar o algo que no te haya gustado de la app?',
  recommendations: [
    { id: 'r1', product: 'Hey Pro', icon: '⭐', title: 'Primer mes gratis', description: 'Activa Hey Pro este mes sin costo y accede a cashback en todas tus compras.', cta: 'Activar gratis' },
    { id: 'r2', product: 'TDC Hey', icon: '💳', title: 'Mejora tu tarjeta', description: 'Con tu historial, ya calificas para pasar de garantizada a tarjeta clásica.', cta: 'Ver elegibilidad' },
  ],
};

// ── EXPORT ────────────────────────────────────────────────────
export const DEMO_USERS: UserOption[] = [
  { user_id: 'USR-00042', display_name: 'Carlos',  segment_emoji: '💎', segment_name: 'Inversor Premium',        risk_badge: 'Perfil sano',  risk_class: 'success', context: CARLOS  },
  { user_id: 'USR-00301', display_name: 'María',   segment_emoji: '🏢', segment_name: 'Asalariada Fiel',         risk_badge: 'Perfil sano',  risk_class: 'success', context: MARIA   },
  { user_id: 'USR-00789', display_name: 'Diego',   segment_emoji: '📱', segment_name: 'Millennial Digital',      risk_badge: 'Perfil sano',  risk_class: 'success', context: DIEGO   },
  { user_id: 'USR-00512', display_name: 'Ana',     segment_emoji: '💼', segment_name: 'Independiente Afluente',  risk_badge: 'Perfil sano',  risk_class: 'success', context: ANA     },
  { user_id: 'USR-01205', display_name: 'Roberto', segment_emoji: '⚠️', segment_name: 'Tensión Financiera',      risk_badge: 'Atención',     risk_class: 'danger',  context: ROBERTO },
  { user_id: 'USR-00998', display_name: 'Elena',   segment_emoji: '😴', segment_name: 'Durmiente',               risk_badge: 'Riesgo churn', risk_class: 'warning', context: ELENA   },
];
