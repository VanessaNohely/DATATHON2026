# Backend — Hey Havi API

API REST construida con **FastAPI** que sirve el Motor de Inteligencia & Atención Personalizada de Hey Banco. Expone los perfiles de usuario derivados del pipeline ML y orquesta las conversaciones con el LLM.

---

## Instalación y arranque

```bash
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Levantar en modo desarrollo
uvicorn main:app --reload --port 8000
```

La API queda disponible en `http://localhost:8000`.  
Documentación automática en `http://localhost:8000/docs`.

---

## Activar el LLM (Claude)

Sin API key el sistema funciona con respuestas basadas en reglas. Para activar Claude Haiku:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
uvicorn main:app --reload --port 8000
```

Para cambiar de modelo o proveedor, editar `config.py` o usar variables de entorno:

```bash
export LLM_MODEL="claude-sonnet-4-6"        # más capaz, más caro
export LLM_MAX_TOKENS=1024
export CHAT_HISTORY_MAX_TURNS=8
```

---

## Estructura del proyecto

```
backend/
├── main.py              # Rutas FastAPI + CORS + startup
├── config.py            # Paths, API keys y parámetros
├── requirements.txt
├── services/
│   ├── data.py          # Carga y merge de los 3 CSVs (singleton)
│   ├── persona.py       # Markdown del perfil + ContextResponse
│   └── llm.py           # Cliente LLM + historial de chat en memoria
└── README.md
```

---

## Endpoints

### `GET /`
Health check. Indica si el LLM está disponible.

```json
{ "status": "ok", "version": "1.0.0", "llm_ready": true }
```

---

### `GET /api/user/{user_id}/context`
Retorna el perfil completo del usuario, alertas proactivas, saludo de Havi y recomendaciones. Se llama **una sola vez** al abrir la app.

**Ejemplo:** `GET /api/user/USR-00042/context`

```json
{
  "profile": {
    "user_id": "USR-00042",
    "name": "Usuario",
    "segment_name": "Traveler",
    "segment_emoji": "✈️",
    "risk_level": "bajo",
    "credit_profile": "saludable",
    "score_compuesto": 0.82,
    "persona": {
      "risk_profile": "Conservative",
      "wealth_tier": "Established",
      "lifestyle": "Traveler",
      "engagement": "Power user",
      "conv_style": "Goal-driven"
    },
    "features": { "edad": 38, "ingreso_mensual_mxn": 45000, "score_buro": 740 },
    "spending_summary": [{ "category": "Viajes", "amount": 5400, "percentage": 36, "icon": "✈️" }],
    "cashback_acumulado": 294,
    "_persona_markdown": "# Financial Persona\n..."
  },
  "alerts": [{ "id": "cashback", "type": "success", "title": "Cashback disponible", "message": "..." }],
  "havi_greeting": "¡Hola! Tu inversión creció este mes...",
  "recommendations": [{ "id": "inv", "product": "Inversión Hey", "icon": "📈", "title": "...", "description": "...", "cta": "Invertir" }]
}
```

---

### `POST /api/chat`
Envía un mensaje del usuario a Havi. El backend mantiene el historial de conversación en memoria por `user_id`.

**Request:**
```json
{ "user_id": "USR-00042", "message": "¿Cuánto cashback tengo?" }
```

**Response:**
```json
{
  "message": "Tienes $294 en cashback acumulado...",
  "suggestions": ["¿Cómo usar mi cashback?", "Ver mis gastos del mes"]
}
```

---

### `DELETE /api/chat/{user_id}/history`
Limpia el historial de conversación de un usuario. Útil para testing.

---

### `GET /{user_id}/persona`
Retorna el Markdown del Financial Persona para un usuario. Útil para depuración e inspección del contexto que recibe el LLM.

---

## Datos requeridos

Los siguientes archivos deben existir en la **raíz del repositorio** (un nivel arriba de `backend/`):

| Archivo | Descripción |
|---------|-------------|
| `user_clusters.csv` | Clusters K-Means por usuario (4 ejes del Persona.md) |
| `merged_features.csv` | Features de clientes + productos + transacciones (83 cols) |
| `analysis/conversation_features.csv` | Tópicos NLP + conv_style por usuario |

Los paths se configuran en `config.py`.

---

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `LLM_PROVIDER` | `anthropic` | Proveedor LLM: `anthropic` u `openai` |
| `ANTHROPIC_API_KEY` | — | API key de Anthropic (Claude) |
| `OPENAI_API_KEY` | — | API key de OpenAI |
| `LLM_MODEL` | `claude-haiku-4-5-20251001` | Modelo a usar |
| `LLM_MAX_TOKENS` | `512` | Tokens máximos por respuesta |
| `CHAT_HISTORY_MAX_TURNS` | `8` | Turnos de historial a mantener |

---

## Flujo con LLM activo

```
GET /context
  → data.get_user(user_id)          # consulta CSV en memoria
  → persona.build_context(row)       # construye perfil + Markdown
  → llm.chat(system=markdown)        # genera saludo personalizado
  → retorna ContextResponse al frontend

POST /chat
  → data.get_user(user_id)
  → persona.build_markdown(row)      # Markdown como system prompt
  → llm.chat(historial + mensaje)    # Claude responde en contexto
  → retorna { message, suggestions }
```

---

## Costo estimado (Claude Haiku)

| Operación | Tokens aprox. | Costo por llamada |
|-----------|--------------|-------------------|
| `/context` (saludo) | ~600 entrada + 100 salida | ~$0.00008 |
| `/chat` por mensaje | ~700 entrada + 150 salida | ~$0.0001 |

Para una demo de 30 minutos con 5 usuarios activos: **< $0.10 USD**.
