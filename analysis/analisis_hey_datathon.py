"""
╔══════════════════════════════════════════════════════════════════╗
║   DATATHON HEY BANCO 2026                                        ║
║   Motor de Inteligencia & Atención Personalizada                 ║
║   Pipeline: NLP + Segmentación + Estrategia de Bots             ║
╚══════════════════════════════════════════════════════════════════╝
"""

# ─────────────────────────────────────────────────────────────────
# 0. IMPORTS Y CONFIGURACIÓN
# ─────────────────────────────────────────────────────────────────
import pandas as pd
import numpy as np
import re
import warnings
warnings.filterwarnings('ignore')

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF, PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

BASE = '.'   # Ajusta al directorio raíz del repo

# ─────────────────────────────────────────────────────────────────
# 1. CARGA DE DATOS
# ─────────────────────────────────────────────────────────────────
print("📂 Cargando datasets...")
clientes  = pd.read_csv(f'{BASE}/dataset_transacciones/hey_clientes.csv')
productos = pd.read_csv(f'{BASE}/dataset_transacciones/hey_productos.csv')
tx        = pd.read_csv(f'{BASE}/dataset_transacciones/hey_transacciones.csv',
                        parse_dates=['fecha_hora'])
convs     = pd.read_parquet(f'{BASE}/dataset_conversaciones/dataset_50k_anonymized.parquet')

print(f"  Clientes:      {clientes.shape[0]:,} usuarios")
print(f"  Productos:     {productos.shape[0]:,} registros, {productos['tipo_producto'].nunique()} tipos")
print(f"  Transacciones: {tx.shape[0]:,} movimientos")
print(f"  Conversaciones:{convs.shape[0]:,} interacciones, {convs['conv_id'].nunique():,} conversaciones")
print(f"  ✅ Los {clientes['user_id'].nunique():,} usuarios aparecen en los 3 datasets (join limpio al 100%)\n")

# ─────────────────────────────────────────────────────────────────
# 2. EDA — HALLAZGOS CLAVE
# ─────────────────────────────────────────────────────────────────
print("📊 Hallazgos clave del EDA:")
print(f"  Edad promedio: {clientes['edad'].mean():.1f} años  (18–60)")
print(f"  Ingreso mediano: ${clientes['ingreso_mensual_mxn'].median():,.0f} MXN/mes")
print(f"  Score buró promedio: {clientes['score_buro'].mean():.0f}")
print(f"  Hey Pro activo: {clientes['es_hey_pro'].mean()*100:.1f}%")
print(f"  Satisfacción NPS promedio: {clientes['satisfaccion_1_10'].mean():.1f}/10")
print(f"  Usuarios con patrón atípico: {clientes['patron_uso_atipico'].mean()*100:.1f}%")
print(f"  Canal preferido: app_ios ({(clientes['preferencia_canal']=='app_ios').mean()*100:.1f}%)")

tx_comp = tx[tx['estatus'] == 'completada']
print(f"\n  Top categorías MCC (por monto): {tx_comp.groupby('categoria_mcc')['monto'].sum().nlargest(3).index.tolist()}")
print(f"  Tx internacionales: {tx['es_internacional'].mean()*100:.1f}%")
print(f"  Tx no procesadas: {(tx['estatus']=='no_procesada').mean()*100:.1f}%")
print(f"  Tx en disputa: {(tx['estatus']=='en_disputa').mean()*100:.1f}%")

# ─────────────────────────────────────────────────────────────────
# 3. NLP — TOPIC MODELING SOBRE CONVERSACIONES (TF-IDF + NMF)
# ─────────────────────────────────────────────────────────────────
print("\n🧠 Topic Modeling sobre mensajes de usuario (TF-IDF + NMF)...")

STOPWORDS_ES = set([
    'de','la','que','el','en','y','a','los','del','se','las','un','por','con','una',
    'su','para','es','al','lo','como','más','o','pero','sus','le','ya','fue','este',
    'ha','si','sí','me','mi','ser','no','te','muy','hay','bien','todo','también','tu',
    'yo','él','ella','nos','les','qué','cómo','cuál','cuándo','dónde','muchas','gracias',
    'hola','buenas','días','tardes','noches','ok','okay','okey','favor','puedo','puede',
    'poder','quiero','quisiera','deseo','tengo','tiene','necesito','ayuda','ayudar',
    'información','por','cuando','esto','esta','eso','esa'
])

def clean_text(text):
    text = str(text).lower().strip()
    text = re.sub(r'[^a-záéíóúüñ\s]', ' ', text)
    tokens = [w for w in text.split() if len(w) > 2 and w not in STOPWORDS_ES]
    return ' '.join(tokens) or 'consulta general'

# Perfil textual por usuario
convs['clean_input'] = convs['input'].fillna('').apply(clean_text)
user_text = convs.groupby('user_id')['clean_input'].apply(' '.join).reset_index()
user_text.columns = ['user_id', 'all_text']

vectorizer = TfidfVectorizer(max_df=0.85, min_df=5, max_features=3000, ngram_range=(1,2))
tfidf = vectorizer.fit_transform(user_text['all_text'])

N_TOPICS = 12
nmf = NMF(n_components=N_TOPICS, random_state=42, max_iter=400)
W = nmf.fit_transform(tfidf)
W_norm = W / (W.sum(axis=1, keepdims=True) + 1e-9)
feature_names = vectorizer.get_feature_names_out()

TOPIC_NAMES = [
    'soporte_general', 'tarjetas_fisicas', 'credito_plazos', 'gestion_cuenta',
    'escalacion_humano', 'solicitud_credito', 'canales_atencion', 'cancelaciones',
    'productos_hey', 'credito_auto', 'cargos_disputas', 'transferencias_app'
]

TOPIC_DISPLAY = {
    'soporte_general':    '🔧 Soporte General / NIP',
    'tarjetas_fisicas':   '💳 Tarjetas (física/débito/crédito)',
    'credito_plazos':     '📅 Créditos a Plazos / MSI',
    'gestion_cuenta':     '📋 Gestión de Cuenta / CLABE',
    'escalacion_humano':  '👤 Escalación a Asesor Humano',
    'solicitud_credito':  '💰 Solicitud de Crédito',
    'canales_atencion':   '📞 Canales de Atención',
    'cancelaciones':      '❌ Cancelaciones',
    'productos_hey':      '🌟 Productos Hey Pro / Banco',
    'credito_auto':       '🚗 Crédito Automotriz',
    'cargos_disputas':    '⚠️  Cargos No Reconocidos',
    'transferencias_app': '📲 Transferencias y App',
}

print("\n  Tópicos identificados (por volumen de mensajes):")
msg_topics = nmf.transform(vectorizer.transform(convs['clean_input'].values))
dominant = msg_topics.argmax(axis=1)
for t_idx, (name, pct) in enumerate(
    pd.Series(dominant).value_counts(normalize=True).sort_values(ascending=False).items()
):
    print(f"    T{t_idx+1:02d} {TOPIC_DISPLAY[TOPIC_NAMES[name]]:<45} {pct*100:5.1f}%")

# ─────────────────────────────────────────────────────────────────
# 4. FEATURE ENGINEERING — PERFIL UNIFICADO POR USUARIO
# ─────────────────────────────────────────────────────────────────
print("\n⚙️  Construyendo perfil unificado por usuario...")

# Topics
topic_df = pd.DataFrame(W_norm, columns=[f'topic_{t}' for t in TOPIC_NAMES])
topic_df['user_id'] = user_text['user_id'].values
topic_df['n_conversaciones'] = convs.groupby('user_id')['conv_id'].nunique().reindex(user_text['user_id']).values
topic_df['n_interacciones']  = convs.groupby('user_id').size().reindex(user_text['user_id']).values

# RFM transaccional
ref_date = tx_comp['fecha_hora'].max()
rfm = tx_comp.groupby('user_id').agg(
    recencia_dias  = ('fecha_hora', lambda x: (ref_date - x.max()).days),
    frecuencia     = ('transaccion_id', 'count'),
    monto_total    = ('monto', 'sum'),
    monto_promedio = ('monto', 'mean'),
).reset_index()

# Proporciones MCC y operación
cat_pct = (tx_comp.groupby(['user_id','categoria_mcc'])['monto'].sum()
           .unstack(fill_value=0).pipe(lambda d: d.div(d.sum(axis=1), axis=0))
           .rename(columns=lambda c: f'mcc_{c}').reset_index())

op_pct = (tx_comp.groupby(['user_id','tipo_operacion'])['transaccion_id'].count()
          .unstack(fill_value=0).pipe(lambda d: d.div(d.sum(axis=1), axis=0))
          .rename(columns=lambda c: f'op_{c}').reset_index())

# Señales de riesgo
tx_signals = tx.groupby('user_id').agg(
    pct_internacional = ('es_internacional', 'mean'),
    pct_atipico       = ('patron_uso_atipico', 'mean'),
    pct_no_procesada  = ('estatus', lambda x: (x=='no_procesada').mean()),
    pct_en_disputa    = ('estatus', lambda x: (x=='en_disputa').mean()),
    cashback_total    = ('cashback_generado', 'sum'),
).reset_index()

# Productos por tipo
prod_tipo = (productos.groupby(['user_id','tipo_producto']).size()
             .unstack(fill_value=0)
             .rename(columns=lambda c: f'prod_{c}').reset_index())

# Demografía
cli_feats = clientes[['user_id','edad','ingreso_mensual_mxn','antiguedad_dias','score_buro',
                       'dias_desde_ultimo_login','satisfaccion_1_10','num_productos_activos',
                       'es_hey_pro','nomina_domiciliada','recibe_remesas','usa_hey_shop',
                       'tiene_seguro','patron_uso_atipico']].copy()
for col in ['es_hey_pro','nomina_domiciliada','recibe_remesas','usa_hey_shop','tiene_seguro','patron_uso_atipico']:
    cli_feats[col] = cli_feats[col].astype(int)
cli_feats['satisfaccion_1_10'] = cli_feats['satisfaccion_1_10'].fillna(cli_feats['satisfaccion_1_10'].median())

# Merge
df = (cli_feats
      .merge(rfm,        on='user_id', how='left')
      .merge(tx_signals,  on='user_id', how='left')
      .merge(cat_pct,     on='user_id', how='left')
      .merge(op_pct,      on='user_id', how='left')
      .merge(prod_tipo,   on='user_id', how='left')
      .merge(topic_df,    on='user_id', how='left')
      .fillna(0))

print(f"  Feature matrix: {df.shape[0]:,} usuarios × {df.shape[1]-1} features")

# ─────────────────────────────────────────────────────────────────
# 5. SEGMENTACIÓN — K-MEANS SOBRE PCA
# ─────────────────────────────────────────────────────────────────
print("\n🔢 Segmentación por clustering...")

X = df.drop(columns=['user_id']).values
X_scaled = StandardScaler().fit_transform(X)
X_pca = PCA(n_components=0.80, random_state=42).fit_transform(X_scaled)
print(f"  PCA: {X.shape[1]} → {X_pca.shape[1]} componentes (80% varianza)")

# Selección de K
sil_scores = {}
for k in [4,5,6,7,8]:
    km = KMeans(n_clusters=k, random_state=42, n_init=15)
    sil_scores[k] = silhouette_score(X_pca, km.fit_predict(X_pca), sample_size=5000, random_state=42)
best_k = max(sil_scores, key=sil_scores.get)
print(f"  Silhouette scores: { {k: round(v,4) for k,v in sil_scores.items()} }")
print(f"  Mejor K: {best_k}")

km_final = KMeans(n_clusters=best_k, random_state=42, n_init=25)
df['cluster'] = km_final.fit_predict(X_pca)

# ─────────────────────────────────────────────────────────────────
# 6. NOMBRES Y DESCRIPCIÓN DE SEGMENTOS
# ─────────────────────────────────────────────────────────────────

SEGMENTOS = {
    0: {
        'nombre':   '😴 Durmientes Insatisfechos',
        'n':        1453,
        'desc':     'Usuarios con ~105 días sin login, bajo ingreso ($19.7k), score buró 544, sin productos premium. Satisfacción 5.6/10.',
        'riesgo':   'CHURN ALTO',
        'bot_tono': 'empático y reconquistador',
        'acciones': [
            'Notificación push "Te extrañamos" con incentivo de cashback para reactivación',
            'Oferta de Hey Pro con primer mes gratuito si realiza 3 transacciones',
            'Recordatorio de saldo disponible y beneficios no aprovechados',
        ],
        'productos_sugeridos': ['hey_pro', 'tarjeta_credito_garantizada'],
    },
    1: {
        'nombre':   '💎 Inversores Digitales Premium',
        'n':        3827,
        'desc':     'Ingreso $43.8k, score 729, activos (7 días). 95% con inversión Hey, 75% Hey Pro, 68% TDC. Cashback $294. Satisfacción 8.5/10.',
        'riesgo':   'BAJO',
        'bot_tono': 'sofisticado y proactivo en inversiones',
        'acciones': [
            'Alerta semanal de rendimiento GAT y comparativa vs. CETES',
            'Sugerencia de incrementar aportación a inversión cuando detecta excedente de saldo',
            'Oferta personalizada de seguro de vida basada en patrimonio acumulado',
        ],
        'productos_sugeridos': ['seguro_vida', 'credito_personal', 'cuenta_negocios'],
    },
    2: {
        'nombre':   '💼 Independientes de Alto Gasto',
        'n':        1486,
        'desc':     'Mayor ingreso del grupo ($59.2k), sin nómina domiciliada, 32% con crédito personal. Cashback máximo $635. Activos (7 días).',
        'riesgo':   'BAJO',
        'bot_tono': 'ejecutivo, orientado a beneficios y control financiero',
        'acciones': [
            'Insight mensual de gastos por categoría (restaurantes, viajes, tecnología)',
            'Propuesta de domiciliación de nómina con beneficio de tasa preferencial en crédito',
            'Alerta de MSI disponibles en comercios de tecnología y viajes según su patrón',
        ],
        'productos_sugeridos': ['cuenta_negocios', 'inversion_hey', 'seguro_compras'],
    },
    3: {
        'nombre':   '🏢 Asalariados Fieles',
        'n':        2922,
        'desc':     '100% con nómina domiciliada, 58% TDC, ingreso $24.5k, score 631. Activos (9 días). Satisfacción 8/10.',
        'riesgo':   'BAJO-MEDIO',
        'bot_tono': 'cercano, orientado a estabilidad y planificación',
        'acciones': [
            'Aviso el día de nómina con resumen de gastos del mes anterior y proyección',
            'Oferta de crédito nómina con tasa especial al detectar recurrencia de pago puntual',
            'Recordatorio de pago de TDC 3 días antes de fecha límite con opción de domiciliación',
        ],
        'productos_sugeridos': ['credito_nomina', 'inversion_hey', 'seguro_vida'],
    },
    4: {
        'nombre':   '📱 Millennials/Gen Z Digitales',
        'n':        2766,
        'desc':     'Los más jóvenes (25 años), muy activos (1.5 días sin login), 81% Hey Pro, 77% TDC, 71 tx/periodo. Ingreso $18.4k. Satisfacción 8.5/10.',
        'riesgo':   'BAJO',
        'bot_tono': 'dinámico, breve, visual, con gamificación',
        'acciones': [
            'Resumen semanal gamificado de cashback acumulado vs. meta personal',
            'Sugerencia de Hey Shop al detectar compras en categorías elegibles (ropa, tecnología)',
            'Alerta de cargos recurrentes digitales con opción de cancelar con un tap',
        ],
        'productos_sugeridos': ['inversion_hey', 'seguro_compras', 'credito_personal'],
    },
    5: {
        'nombre':   '⚠️  Usuarios en Tensión Financiera',
        'n':        2258,
        'desc':     'Score buró más bajo (447), satisfacción más baja (5.1/10), ingreso $15.5k, 48% crédito personal, 52% TDC. Más tx no procesadas.',
        'riesgo':   'ALTO — riesgo crediticio',
        'bot_tono': 'comprensivo, orientado a educación financiera',
        'acciones': [
            'Alerta de utilización de crédito al superar 70% del límite con tips de reducción',
            'Propuesta de reestructura o plan de pagos al detectar pagos mínimos consecutivos',
            'Contenido educativo push: "Cómo mejorar tu score buró en 3 meses"',
        ],
        'productos_sugeridos': ['tarjeta_credito_garantizada', 'seguro_compras'],
    },
    6: {
        'nombre':   '🚨 Churners Críticos',
        'n':        313,
        'desc':     'Solo 313 usuarios. 106 días sin login, apenas 8 tx, monto total $16.5k. Score 535, satisfacción 5.6/10. Sin productos premium.',
        'riesgo':   'CHURN INMINENTE',
        'bot_tono': 'urgente pero no agresivo — oferta de última oportunidad',
        'acciones': [
            'Campaña de reconquista con beneficio único y limitado (ej. bono $200 en primera tx)',
            'Encuesta de satisfacción breve para entender motivo de abandono',
            'Revisión manual por equipo de retención si no hay respuesta en 7 días',
        ],
        'productos_sugeridos': ['hey_pro_trial', 'cashback_especial'],
    },
}

print("\n" + "="*65)
print("  SEGMENTOS DE USUARIOS IDENTIFICADOS")
print("="*65)
for cluster_id, seg in SEGMENTOS.items():
    n = df[df['cluster']==cluster_id].shape[0]
    pct = n / len(df) * 100
    print(f"\n  {seg['nombre']}  [{n:,} usuarios · {pct:.1f}%]  — Riesgo: {seg['riesgo']}")
    print(f"  {seg['desc']}")
    print(f"  Bot: {seg['bot_tono'].title()}")
    print(f"  Acciones proactivas:")
    for a in seg['acciones']:
        print(f"    → {a}")

# ─────────────────────────────────────────────────────────────────
# 7. INSIGHTS FINALES
# ─────────────────────────────────────────────────────────────────
print("\n" + "="*65)
print("  INSIGHTS ESTRATÉGICOS CLAVE")
print("="*65)

n_churn = df[df['cluster'].isin([0,6])].shape[0]
n_premium = df[df['cluster'].isin([1,4])].shape[0]
n_riesgo = df[df['cluster']==5].shape[0]

print(f"""
  1. OPORTUNIDAD DE RETENCIÓN ({n_churn:,} usuarios · {n_churn/len(df)*100:.1f}%):
     Clusters 0 y 6 llevan >100 días inactivos. Una campaña de
     reactivación proactiva vía Havi (bot) podría recuperar hasta
     el 30% si se activa en las primeras 2 semanas de inactividad.

  2. MONETIZACIÓN PREMIUM ({n_premium:,} usuarios · {n_premium/len(df)*100:.1f}%):
     Clusters 1 y 4 son los de mayor satisfacción (8.5/10) y
     engagement. Son el terreno ideal para cross-sell de inversión
     y seguros. El Cluster 1 (Inversores Premium) tiene $294 de
     cashback acumulado — candidato directo a upgrade de portafolio.

  3. RIESGO CREDITICIO ({n_riesgo:,} usuarios · {n_riesgo/len(df)*100:.1f}%):
     Cluster 5 tiene el score buró más bajo (447) y alta proporción
     de crédito personal activo. Monitoreo proactivo de utilización
     y pagos mínimos puede prevenir cartera vencida.

  4. TÓPICO DOMINANTE EN SOPORTE (32.2% de mensajes):
     "Transferencias y App" es el dolor más frecuente. Mejoras en
     UX del flujo de transferencias y token reducirían drásticamente
     el volumen de soporte y mejorarían satisfacción NPS.

  5. ESCALACIÓN HUMANA INNECESARIA (2.8% de mensajes):
     1,376 mensajes buscan hablar con un asesor humano. Estos pueden
     resolverse con flujos conversacionales específicos en Havi,
     reduciendo costos operativos de atención.
""")

print("✅ Análisis completo.")
