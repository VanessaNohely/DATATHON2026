"""
services/llm.py
Cliente LLM + historial de conversación por usuario.

Soporta Anthropic (Claude) y OpenAI como proveedores.
Si no hay API key configurada, cae a respuestas por reglas.
"""
from __future__ import annotations
from collections import defaultdict
from config import (
    LLM_PROVIDER, ANTHROPIC_KEY, OPENAI_KEY,
    LLM_MODEL, LLM_MAX_TOKENS, CHAT_HISTORY_MAX_TURNS
)

# Historial en memoria: { user_id: [{"role": "user"|"assistant", "content": str}] }
_history: dict[str, list[dict]] = defaultdict(list)


def is_available() -> bool:
    """Retorna True si hay un API key configurado."""
    if LLM_PROVIDER == "anthropic":
        return bool(ANTHROPIC_KEY)
    if LLM_PROVIDER == "openai":
        return bool(OPENAI_KEY)
    return False


def chat(user_id: str, message: str, persona_markdown: str) -> tuple[str, list[str]]:
    """
    Envía un mensaje al LLM y retorna (respuesta, sugerencias).
    Si no hay LLM disponible, usa respuestas por reglas.
    """
    if not is_available():
        return _rule_based_response(message, persona_markdown)

    if LLM_PROVIDER == "anthropic":
        return _anthropic_chat(user_id, message, persona_markdown)
    if LLM_PROVIDER == "openai":
        return _openai_chat(user_id, message, persona_markdown)

    return _rule_based_response(message, persona_markdown)


def reset_history(user_id: str) -> None:
    """Limpia el historial de conversación de un usuario."""
    _history[user_id] = []


# ── Anthropic (Claude) ────────────────────────────────────────
def _anthropic_chat(user_id: str, message: str, system: str) -> tuple[str, list[str]]:
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

        # Agregar mensaje al historial
        _history[user_id].append({"role": "user", "content": message})

        # Mantener historial corto
        history = _history[user_id][-CHAT_HISTORY_MAX_TURNS * 2:]

        response = client.messages.create(
            model=LLM_MODEL,
            max_tokens=LLM_MAX_TOKENS,
            system=system,
            messages=history,
        )

        reply = response.content[0].text
        _history[user_id].append({"role": "assistant", "content": reply})

        return reply, _extract_suggestions(reply)

    except Exception as e:
        print(f"LLM error: {e}")
        return _rule_based_response(message, system)


# ── OpenAI ────────────────────────────────────────────────────
def _openai_chat(user_id: str, message: str, system: str) -> tuple[str, list[str]]:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_KEY)

        _history[user_id].append({"role": "user", "content": message})
        history = _history[user_id][-CHAT_HISTORY_MAX_TURNS * 2:]

        response = client.chat.completions.create(
            model=LLM_MODEL,
            max_tokens=LLM_MAX_TOKENS,
            messages=[{"role": "system", "content": system}] + history,
        )

        reply = response.choices[0].message.content
        _history[user_id].append({"role": "assistant", "content": reply})

        return reply, _extract_suggestions(reply)

    except Exception as e:
        print(f"LLM error: {e}")
        return _rule_based_response(message, system)


# ── Respuestas por reglas (fallback sin LLM) ──────────────────
def _rule_based_response(message: str, context: str) -> tuple[str, list[str]]:
    msg = message.lower()

    # Extraer datos del contexto markdown
    cashback = _extract_from_context(context, "Cashback acumulado: $", " MXN")
    score    = _extract_from_context(context, "Score buró: ", " (")
    invest   = _extract_from_context(context, "Saldo en inversión: $", " MXN")

    if any(w in msg for w in ["cashback", "recompensa"]):
        reply = f"Tienes ${cashback} en cashback acumulado. Puedes usarlo en tu próxima compra o transferirlo a tu cuenta. ¿Quieres que te explique cómo?"
        sugg  = ["¿Cómo usar mi cashback?", "Ver mis gastos del mes"]

    elif any(w in msg for w in ["inversión", "inversion", "invertir", "rendimiento"]):
        if invest and float(invest.replace(",", "")) > 0:
            reply = f"Tu inversión Hey tiene ${invest}. El GAT actual es 10.5% anual. ¿Quieres hacer un abono?"
        else:
            reply = "Aún no tienes una inversión activa. Puedes empezar desde $500 con un GAT de 10.5% anual. ¿Te interesa?"
        sugg = ["¿Cómo funciona la inversión?", "¿Cuánto necesito para empezar?"]

    elif any(w in msg for w in ["score", "buró", "buro", "crédito"]):
        reply = f"Tu score buró es {score}. Pagar a tiempo y reducir la utilización de crédito son los pasos clave para mejorarlo. ¿Quieres ver tu plan personalizado?"
        sugg  = ["¿Cómo mejorar mi score?", "Ver mis productos de crédito"]

    elif any(w in msg for w in ["gasto", "gasté", "compra", "categoría", "mes"]):
        reply = "Puedes ver el desglose completo de tus gastos en la pestaña 'Gastos'. ¿Quieres que te explique alguna categoría específica?"
        sugg  = ["Ver todos mis gastos", "¿Cómo ahorrar más?"]

    elif any(w in msg for w in ["hola", "buenos", "buenas", "hi", "hey"]):
        reply = "¡Hola! Estoy aquí para ayudarte. Puedes preguntarme sobre tu cashback, inversiones, gastos o score buró. ¿Por dónde empezamos?"
        sugg  = ["¿Cuánto cashback tengo?", "¿Cómo está mi score?", "Ver mis gastos"]

    else:
        reply = f"Puedo ayudarte con información sobre tu cashback (${cashback}), gastos del mes, score buró ({score}) e inversiones. ¿Sobre cuál te gustaría saber más?"
        sugg  = ["¿Cuánto cashback tengo?", "¿Cómo está mi score?", "Ver mis gastos"]

    return reply, sugg


def _extract_from_context(context: str, prefix: str, suffix: str) -> str:
    try:
        start = context.index(prefix) + len(prefix)
        end   = context.index(suffix, start)
        return context[start:end]
    except ValueError:
        return "0"


def _extract_suggestions(reply: str) -> list[str]:
    """Intenta extraer sugerencias del reply del LLM o devuelve defaults."""
    defaults = ["¿Cuánto cashback tengo?", "Ver mis gastos", "¿Cómo está mi score?"]
    return defaults
