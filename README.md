# Datathon Hey Banco 2026 🏦

> **Motor de Inteligencia & Atención Personalizada** — DSC × Hey Banco  
> Pipeline de IA que integra datos conversacionales y transaccionales para generar bots dinámicos con atención proactiva y personalizada.

---

## Equipo

| Rol | Responsabilidad |
|-----|----------------|
| Backend / ML | Pipeline de segmentación, generación de perfiles, API FastAPI + LLM |
| Frontend | App Angular — Vista Usuario (Havi chat + dashboard) |

---

## Arquitectura general

```
Datos crudos (transacciones + conversaciones)
        │
        ▼ [ML Pipeline — offline/batch]
        │  · Topic modeling (TF-IDF + NMF) sobre 50k conversaciones
        │  · Feature engineering: 73 features por usuario
        │  · Clustering K-Means (K=6, silhouette 0.1825)
        │  · Clasificación en Financial Persona (5 dimensiones)
        ▼
  Markdown de Perfil por usuario
  (risk_profile · wealth_tier · lifestyle · engagement · conv_style)
        │
        ▼ [FastAPI — 2 endpoints]
        │
   ┌────┴────────────────────┐
   │  GET /api/user/{id}/    │  → perfil + persona + greeting Havi
   │        context          │
   │  POST /api/chat         │  → LLM call con perfil como contexto
   └────────────────────────┘
        │
        ▼ [Angular 21 — Zoneless]
   App Vista Usuario
   · Hero card con cashback y score
   · Chat con Havi (LLM personalizado por segmento)
   · Alertas proactivas · Gastos · Perfil Financial Persona
   · Dark / Light mode · Responsive (mobile + desktop)
```

---

## Estructura del repositorio

```
DATATHON2026/
├── analysis/                    # Pipeline ML completo
│   └── analisis_hey_datathon.py # EDA + NLP + clustering + segmentos
├── backend/                     # API FastAPI (ver backend/README.md)
├── frontend/                    # App Angular (ver frontend/README.md)
│   └── hey-havi/                # Proyecto Angular 21
├── Persona.md                   # Taxonomía de Financial Persona
└── README.md                    # Este archivo
```

> Los datasets **no están incluidos** en el repositorio por tamaño y confidencialidad. Contactar al equipo para acceso.

---

## Financial Persona

Basado en `Persona.md`, cada usuario recibe un perfil de 5 dimensiones derivadas del análisis ML:

| Dimensión | Valores |
|-----------|---------|
| **Perfil de riesgo** | Conservador · Moderado · Emprendedor · Estresado |
| **Ingreso y estrato** | Bajo · Crecimiento · Establecido · Afluente |
| **Spending lifestyle** | Essential spender · Foodie/Social · Tech/Digital native · Traveler · Family/Home · Status spender |
| **Digital engagement** | Power user · Casual · At-risk · Dormant |
| **Perfil conversacional** | Goal-driven · Support-seeking · Exploratory · Passive |

Este perfil se serializa como Markdown y se inyecta como contexto en el LLM para personalizar cada interacción con Havi.

---

## Segmentos descubiertos

| Segmento | Usuarios | Riesgo |
|----------|----------|--------|
| 💎 Inversor Digital Premium | 1,762 (11.7%) | Bajo |
| 🏢 Asalariado Fiel | 2,923 (19.5%) | Bajo-Medio |
| 📱 Millennial / Gen Z Digital | 2,261 (15.0%) | Bajo |
| 💼 Independiente Alto Gasto | 1,486 (9.9%) | Bajo |
| ⚠️ Tensión Financiera | 2,766 (18.4%) | Alto |
| 😴 Durmiente Insatisfecho | 3,827 (25.5%) | Churn alto |

---

## Datasets (no incluidos en el repo)

| Archivo | Descripción | Registros |
|---------|-------------|-----------|
| `hey_clientes.csv` | Demografía y señales de comportamiento | 15,025 |
| `hey_productos.csv` | Portafolio de productos por usuario | 38,909 |
| `hey_transacciones.csv` | Historial de movimientos | 802,384 |
| `dataset_50k_anonymized.parquet` | Conversaciones con Havi (chatbot) | 49,999 |

---

## Rúbrica de evaluación

| Criterio | Peso |
|----------|------|
| Innovación y creatividad (arquitectura, IA, visualizaciones) | 35 pts |
| Viabilidad de negocio e impacto | 35 pts |
| Definición y alcance de objetivos | 15 pts |
| Presentación y comunicación | 15 pts |
| **Total** | **100 pts** |

# Documentación de Nuevas Características

Este documento lista las nuevas características ingenierizadas en `Feature_Engineering.ipynb`, excluyendo las características originales del conjunto de datos.

## Características del Conjunto de Datos de Clientes
- `age_band`: Agrupa la edad en categorías (18-25, 26-35, 36-50, 51+).
- `income_tier`: Grupos basados en cuantiles del ingreso en Q1-Q4.
- `engagement_score`: Promedio normalizado de frecuencia de login, satisfacción, estatus Hey Pro y bandera de depósito directo.
- `digital_maturity`: Promedio de puntuación de canal, puntuación de preferencia y frecuencia de login normalizada.
- `vulnerability_flag`: Bandera booleana para remesas, desempleo o estrato de ingreso bajo.
- `financial_sophistication`: Promedio de educación normalizada, proxy de inversión y puntuación crediticia.

## Características del Conjunto de Datos de Productos
- `product_diversity_score`: Conteo de tipos únicos de productos por usuario.
- `has_credit`: Booleano si el usuario tiene productos de crédito (tarjeta_credito_hey, credito_personal, etc.).
- `avg_credit_utilization`: Promedio del porcentaje de utilización de crédito para productos de crédito.
- `max_credit_limit`: Límite máximo de crédito a través de productos.
- `has_investment`: Booleano si el usuario tiene producto de inversión con saldo > 0.
- `has_insurance`: Booleano si el usuario tiene productos de seguro.
- `secured_card_flag`: Booleano si el usuario tiene tarjeta de crédito garantizada.
- `portfolio_age_days`: Días desde la fecha de apertura más temprana del producto.
- `credit_product_count`: Conteo de productos de crédito.
- `investment_balance`: Suma de saldos en productos de inversión.

## Características del Conjunto de Datos de Transacciones
- `monthly_avg_spend`: Promedio de gastos totales mensuales.
- `txn_frequency`: Frecuencia promedio mensual de transacciones.
- `avg_ticket_size`: Monto promedio de transacción.
- `spend_volatility`: Coeficiente de variación de gastos mensuales.
- `failed_txn_rate`: Proporción de transacciones fallidas.
- `retry_rate`: Proporción de reintentos (intento_numero > 1).
- `dispute_rate`: Proporción de transacciones disputadas.
- `pct_supermercado`: Porcentaje de gasto en categoría de supermercado.
- `pct_restaurante`: Porcentaje de gasto en categoría de restaurante.
- `pct_entretenimiento`: Porcentaje de gasto en categoría de entretenimiento.
- `pct_viajes`: Porcentaje de gasto en categoría de viajes.
- `pct_educacion`: Porcentaje de gasto en categoría de educación.
- `pct_salud`: Porcentaje de gasto en categoría de salud.
- `pct_tecnologia`: Porcentaje de gasto en categoría de tecnología.
- `pct_servicios_digitales`: Porcentaje de gasto en categoría de servicios digitales.
- `pct_ropa_accesorios`: Porcentaje de gasto en categoría de ropa/accesorios.
- `pct_transporte`: Porcentaje de gasto en categoría de transporte.
- `pct_hogar`: Porcentaje de gasto en categoría de hogar.
- `msi_usage_rate`: Proporción de compras con mensualidades.
- `avg_msi_months`: Meses promedio de mensualidades para aquellos con MSI.
- `cashback_total`: Suma de cashback generado.
- `recurring_charge_count`: Conteo de cargos recurrentes.
- `night_owl_score`: Proporción de transacciones por la noche (22-5).
- `weekend_spend_ratio`: Gasto en fin de semana / gasto total.
- `peak_hour`: Hora más frecuente de transacción.
- `recency_days`: Días desde la última transacción completada.
- `international_txn_rate`: Proporción de transacciones internacionales.
- `city_diversity`: Número de ciudades únicas de transacción.
- `cash_dependency`: Proporción de transacciones relacionadas con efectivo.
- `digital_payment_rate`: Proporción a través de canales digitales.
- `atypical_txn_rate`: Proporción de transacciones atípicas.
- `large_txn_count`: Conteo de transacciones por encima del percentil 95 de los montos del usuario.