# Frontend — Hey Havi 📱

App Angular 21 para la Vista Usuario del Motor de Inteligencia & Atención Personalizada de Hey Banco.

---

## Stack

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Angular | 21.2 | Framework principal |
| TypeScript | 5.x | Lenguaje |
| SCSS | — | Estilos con CSS variables |
| Angular Signals | built-in | State management (zoneless) |
| Angular HTTP Client | built-in | Consumo de API |

> **Zoneless mode** — la app usa `provideZonelessChangeDetection()`. Todo el estado se maneja con signals, sin Zone.js.

---

## Arrancar el proyecto

```bash
cd hey-havi
npm install
ng serve --open
# → http://localhost:4200
```

La app carga **datos mock** automáticamente si el backend no está disponible — útil para desarrollo de UI en paralelo.

Para apuntar al backend real, editar `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'   // URL del backend FastAPI
};
```

---

## Estructura del proyecto

```
hey-havi/src/app/
├── core/
│   ├── models/
│   │   ├── user-profile.model.ts   # Tipos: UserProfile, FinancialPersona, Alert...
│   │   └── chat.model.ts           # ChatMessage, ChatRequest, ChatResponse
│   └── services/
│       ├── hey-api.service.ts      # HTTP: /context y /chat
│       ├── user-context.service.ts # Estado global con signals
│       └── theme.service.ts        # Dark/Light mode + localStorage
│
├── features/user-view/
│   ├── pages/
│   │   └── user-view.page.*        # Shell principal: hero + nav + tabs
│   ├── tabs/
│   │   ├── home-tab/               # Alertas + productos + recomendaciones
│   │   ├── chat-tab/               # Chat full-screen con Havi
│   │   ├── spending-tab/           # Gastos por categoría + insight LLM
│   │   └── profile-tab/            # Financial Persona expandida
│   └── components/
│       ├── havi-chat/              # Componente central del chat
│       ├── message-bubble/         # Burbujas user/assistant
│       ├── suggested-chips/        # Preguntas sugeridas por segmento
│       ├── profile-header/         # Header con segmento + persona tags
│       ├── alerts-banner/          # Alertas proactivas dismissibles
│       ├── spending-summary/       # Barras de gasto por categoría MCC
│       └── recommendations/        # Cards de productos recomendados
│
└── shared/
    └── components/loading-spinner/ # Spinner de carga inicial
```

---

## API — 2 endpoints (MVP)

### `GET /api/user/{user_id}/context`
Se llama **una vez** al abrir la app. Retorna todo lo necesario para pintar la UI inicial.

```ts
// ContextResponse
{
  profile: {
    user_id, name, segment_name, segment_emoji,
    score_compuesto, cashback_acumulado,
    persona: {               // ← Persona.md
      risk_profile,          // Conservador | Moderado | Emprendedor | Estresado
      wealth_tier,           // Bajo | Crecimiento | Establecido | Afluente
      lifestyle,             // Essential spender | Foodie/Social | Tech/Digital native | ...
      engagement,            // Power user | Casual | At-risk | Dormant
      conv_style             // Goal-driven | Support-seeking | Exploratory | Passive
    },
    features: { edad, ingreso_mensual_mxn, score_buro, ... },
    spending_summary: [{ category, amount, percentage, icon }],
    productos_activos: string[]
  },
  alerts: [{ id, type, title, message }],
  havi_greeting: string,       // Generado por LLM
  recommendations: [{ id, product, title, description, cta, icon }]
}
```

### `POST /api/chat`
Una llamada al LLM por mensaje del usuario.

```ts
// Request
{ user_id: string, message: string }

// Response
{ message: string, suggestions: string[] }
```

---

## Diseño

**Paleta de colores (dark mode)**

| Token | Valor | Uso |
|-------|-------|-----|
| `--hey-coral` | `#FF3D55` | Color primario Hey Banco |
| `--bg-base` | `#0C0C0E` | Fondo principal |
| `--bg-card` | `#1C1C21` | Cards y superficies |
| `--success` | `#1DB87E` | Positivo / cashback |
| `--warning` | `#F5A623` | Alertas / moderado |

**Paleta light mode** — se activa con `[data-theme="light"]` en el `<html>`. La preferencia se persiste en `localStorage`.

**Responsive**

| Viewport | Layout |
|----------|--------|
| < 768px | Bottom tab navigation |
| ≥ 768px | Sidebar izquierda + contenido principal |

---

## Estado de desarrollo

- [x] Scaffold Angular 21 con zoneless mode
- [x] Modelos TypeScript (UserProfile, FinancialPersona, Chat)
- [x] HeyApiService + UserContextService + ThemeService
- [x] Layout con hero card + bottom nav (mobile) + sidebar (desktop)
- [x] Tab: Inicio (alertas + productos + recomendaciones)
- [x] Tab: Havi (chat full-screen con LLM)
- [x] Tab: Gastos (spending summary + insight)
- [x] Tab: Perfil (Financial Persona + métricas + tópicos)
- [x] Dark / Light mode con persistencia
- [x] Mock data para desarrollo sin backend
- [ ] Integración con backend real (pendiente backend)
- [ ] Animaciones de transición entre tabs
