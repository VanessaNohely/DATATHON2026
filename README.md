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
