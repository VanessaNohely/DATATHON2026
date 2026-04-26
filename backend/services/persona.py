"""
services/persona.py
Construye el Markdown del Financial Persona y el ContextResponse
que devuelve GET /api/user/{user_id}/context.
"""

# ── Mapeos de display ──────────────────────────────────────────
SPENDING_COLS = {
    "pct_restaurante":        ("Restaurantes",         "🍽️"),
    "pct_tecnologia":         ("Tecnología",           "💻"),
    "pct_viajes":             ("Viajes",               "✈️"),
    "pct_supermercado":       ("Supermercado",         "🛒"),
    "pct_entretenimiento":    ("Entretenimiento",      "🎬"),
    "pct_servicios_digitales":("Servicios digitales",  "📱"),
}

LIFESTYLE_EMOJI = {
    "Tech/Digital native": "📱",
    "Traveler":            "✈️",
    "Foodie/Social":       "🍽️",
    "Family/Home":         "🏠",
    "Essential spender":   "🛒",
    "Status spender":      "✨",
}

RISK_LEVEL = {
    "Conservative": "bajo",
    "Moderate":     "bajo",
    "Aggressive":   "medio",
    "Distressed":   "alto",
}


# ── Markdown del perfil — irá como system prompt al LLM ────────
def build_markdown(row: dict) -> str:
    cashback = float(row.get("cashback_total", 0) or 0)
    ingreso  = float(row.get("ingreso_mensual_mxn", 0) or 0)
    score    = int(row.get("score_buro", 0) or 0)
    invest   = float(row.get("investment_balance", 0) or 0)
    hey_pro  = bool(row.get("es_hey_pro", False))
    login    = int(row.get("dias_desde_ultimo_login", 0) or 0)

    # Calcular gastos principales para incluir en contexto
    monthly = float(row.get("monthly_avg_spend", 0) or 0)
    top_cats = []
    for col, (label, icon) in SPENDING_COLS.items():
        pct = float(row.get(col, 0) or 0)
        if pct > 0.05:
            top_cats.append(f"{label} ({round(pct*100)}%)")
    gastos_txt = ", ".join(top_cats[:3]) if top_cats else "sin datos suficientes"

    score_label = "excelente" if score >= 750 else "muy bueno" if score >= 700 else "bueno" if score >= 650 else "regular, con oportunidad de mejora" if score >= 550 else "en proceso de mejora"

    return f"""Eres Havi, el asistente financiero de Hey Banco. Ayudas con finanzas de forma amigable.

DATOS DEL USUARIO (para responder cuando te pregunten):
- Cashback acumulado: ${cashback:,.0f} MXN {'— Hey Pro activo ✓' if hey_pro else '— sin Hey Pro aún'}
- Score buró: {score} ({score_label})
- Inversión: {'$' + f'{invest:,.0f} MXN activa' if invest > 0 else 'sin inversión activa aún'}
- Principales gastos del mes: {gastos_txt}
- Gasto mensual promedio: ${monthly:,.0f} MXN

REGLAS:
1. NUNCA menciones el ingreso, nivel socioeconómico ni juzgues la situación del usuario.
2. NUNCA digas "riesgo bajo/alto" refiriéndote al score — usa "score buró de X" o "{score_label}".
3. NUNCA uses bullets, asteriscos ni negritas. Solo texto natural conversacional.
4. NUNCA des recomendaciones de vida personal (dieta, ejercicio, transporte).
5. Cuando el usuario pida ver sus gastos, mencionas las categorías principales y le sugieres la pestaña Gastos.
6. Cuando pregunte por su perfil o preferencias, responde con sus datos reales de forma natural.
7. Respuestas cortas: máximo 2-3 oraciones. Directo y amigable.
8. Si no tienes un dato específico, di que puede verlo en la app o con un asesor.
9. Si el mensaje no tiene sentido o es un error, responde amigablemente y pregunta en qué puedes ayudar.

TONO: amigo que trabaja en el banco, sin condescendencia. Idioma: español mexicano casual."""


def _credit_label(score: int) -> str:
    if score >= 750: return "excelente"
    if score >= 650: return "bueno"
    if score >= 550: return "regular"
    return "bajo"


# ── Spending summary ───────────────────────────────────────────
def build_spending_summary(row: dict) -> list[dict]:
    monthly = float(row.get("monthly_avg_spend", 0) or 0)
    cats = []
    for col, (label, icon) in SPENDING_COLS.items():
        pct = float(row.get(col, 0) or 0)
        if pct > 0.01:
            cats.append({
                "category":   label,
                "amount":     round(monthly * pct),
                "percentage": round(pct * 100),
                "icon":       icon,
            })
    return sorted(cats, key=lambda x: x["percentage"], reverse=True)[:5]


# ── Alertas proactivas ─────────────────────────────────────────
def build_alerts(row: dict) -> list[dict]:
    alerts = []
    eng     = row.get("axis4_kmeans_label", "Casual")
    risk    = row.get("axis1_kmeans_label", "Conservative")
    credit  = row.get("credit_health", "fair")
    cashback = float(row.get("cashback_total", 0) or 0)
    invest   = float(row.get("investment_balance", 0) or 0)
    login    = int(row.get("dias_desde_ultimo_login", 0) or 0)

    if eng == "Dormant":
        alerts.append({"id": "dormant", "type": "warning",
            "title": "Te hemos extrañado",
            "message": f"Llevas {login} días sin abrir la app. Tu cuenta está segura."})
    if risk == "Distressed" or credit == "poor":
        alerts.append({"id": "credit_risk", "type": "danger",
            "title": "Utilización de crédito alta",
            "message": "Tu crédito está cerca del límite. Tenemos un plan para reducirlo."})
    if cashback > 50:
        alerts.append({"id": "cashback", "type": "success",
            "title": "Cashback disponible",
            "message": f"Tienes ${cashback:,.0f} en cashback listo para usar."})
    if invest > 0:
        alerts.append({"id": "invest", "type": "info",
            "title": "Rendimiento de inversión",
            "message": f"Tu inversión Hey tiene ${invest:,.0f}. GAT actual: 10.5%"})
    if not alerts:
        alerts.append({"id": "ok", "type": "info",
            "title": "Todo en orden",
            "message": "Tu cuenta está al día. ¿En qué te puedo ayudar?"})
    return alerts[:2]


# ── Recomendaciones ────────────────────────────────────────────
def build_recommendations(row: dict) -> list[dict]:
    recs    = []
    risk    = row.get("axis1_kmeans_label", "Conservative")
    wealth  = row.get("axis2_kmeans_label", "Entry")
    lifestyle = row.get("axis3_kmeans_label", "Essential spender")
    eng     = row.get("axis4_kmeans_label", "Casual")
    hey_pro = bool(row.get("es_hey_pro", False))

    if not hey_pro:
        recs.append({"id": "pro", "product": "Hey Pro", "icon": "⭐",
            "title": "Activa Hey Pro",
            "description": "Gana 1% de cashback en todas tus compras.",
            "cta": "Ver beneficios"})
    if risk == "Distressed":
        recs.append({"id": "edu", "product": "Educación financiera", "icon": "📚",
            "title": "Mejora tu score en 90 días",
            "description": "Guía personalizada basada en tu historial.",
            "cta": "Ver guía"})
    if wealth in ("Established", "Affluent"):
        recs.append({"id": "inv", "product": "Inversión Hey", "icon": "📈",
            "title": "Haz crecer tu dinero",
            "description": "Rendimientos desde el primer día. GAT: 10.5%.",
            "cta": "Invertir"})
    if lifestyle == "Traveler":
        recs.append({"id": "msi", "product": "MSI Viajes", "icon": "✈️",
            "title": "Hasta 24 MSI en viajes",
            "description": "Paga tu próximo viaje a meses sin intereses.",
            "cta": "Ver comercios"})
    if eng in ("At-risk", "Dormant"):
        recs.append({"id": "reac", "product": "Oferta especial", "icon": "🎁",
            "title": "Bono de reactivación",
            "description": "Realiza 3 compras este mes y recibe $200 de bonificación.",
            "cta": "Activar"})
    if not recs:
        recs.append({"id": "seg", "product": "Seguro de Compras", "icon": "🛡️",
            "title": "Protege tus compras",
            "description": "Seguro automático en todas tus compras Hey.",
            "cta": "Ver cobertura"})
    return recs[:2]


# ── Arma el ContextResponse completo ──────────────────────────
def build_context(user_id: str, row: dict) -> dict:
    lifestyle = row.get("axis3_kmeans_label", "Essential spender")
    markdown  = build_markdown(row)
    cashback  = float(row.get("cashback_total", 0) or 0)
    invest    = float(row.get("investment_balance", 0) or 0)
    login     = int(row.get("dias_desde_ultimo_login", 0) or 0)
    eng       = row.get("axis4_kmeans_label", "Casual")

    # Saludo por regla (se reemplaza si el LLM está activo)
    if eng == "Dormant":
        greeting = f"¡Hola! 👋 Han pasado {login} días desde tu última visita. Tu cuenta está segura. ¿En qué te puedo ayudar?"
    elif invest > 10000:
        greeting = f"¡Hola! 💎 Tu inversión tiene ${invest:,.0f} y sigue creciendo. Tienes ${cashback:,.0f} en cashback. ¿Qué necesitas?"
    elif cashback > 100:
        greeting = f"¡Hola! 👋 Tienes ${cashback:,.0f} en cashback acumulado. ¿En qué te puedo ayudar hoy?"
    else:
        greeting = "¡Hola! 👋 Estoy aquí para ayudarte con tu cuenta Hey Banco. ¿En qué te puedo ayudar?"

    return {
        "profile": {
            "user_id":    user_id,
            "name":       "Usuario",
            "segment_name":  lifestyle,
            "segment_emoji": LIFESTYLE_EMOJI.get(lifestyle, "💳"),
            "risk_level":    RISK_LEVEL.get(row.get("axis1_kmeans_label", "Conservative"), "bajo"),
            "credit_profile": _map_credit_profile(row.get("credit_health", "fair")),
            "score_compuesto": round(float(row.get("engagement_score", 0.5) or 0.5), 2),
            "cluster_id":  0,
            "cashback_acumulado": round(cashback, 2),
            "num_productos_activos": int(row.get("num_productos_activos", 1) or 1),
            "persona": {
                "risk_profile": row.get("axis1_kmeans_label", "Conservative"),
                "wealth_tier":  row.get("axis2_kmeans_label", "Entry"),
                "lifestyle":    lifestyle,
                "engagement":   row.get("axis4_kmeans_label", "Casual"),
                "conv_style":   row.get("conv_style", "Passive"),
            },
            "features": {
                "edad":                int(row.get("edad", 30) or 30),
                "ingreso_mensual_mxn": float(row.get("ingreso_mensual_mxn", 15000) or 15000),
                "score_buro":          int(row.get("score_buro", 550) or 550),
                "dias_sin_login":      login,
                "es_hey_pro":          bool(row.get("es_hey_pro", False)),
                "num_productos_activos": int(row.get("num_productos_activos", 1) or 1),
                "satisfaccion":        float(row.get("satisfaccion_1_10", 7.0) or 7.0),
                "antiguedad_dias":     int(row.get("antiguedad_dias", 365) or 365),
            },
            "top_topics": [
                {"topic": row.get("conv_dominant_topic", "transferencias_app"), "weight": 0.35}
            ],
            "spending_summary":  build_spending_summary(row),
            "productos_activos": ["cuenta_debito"],
            "_persona_markdown": markdown,   # ← para el LLM
        },
        "alerts":          build_alerts(row),
        "havi_greeting":   greeting,
        "recommendations": build_recommendations(row),
    }


def _map_credit_profile(credit_health: str) -> str:
    return {
        "excellent": "saludable",
        "good":      "saludable",
        "fair":      "moderado",
        "poor":      "tenso",
    }.get(credit_health, "moderado")