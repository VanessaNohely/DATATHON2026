"""
services/llm.py
Cliente LLM + historial de conversación por usuario.

Proveedores soportados:
  - ollama   → local, sin costo (gemma4:e2b por defecto) ← DEFAULT
  - anthropic → Claude en la nube
  - openai    → GPT en la nube

Si no hay LLM disponible, cae a respuestas basadas en reglas.
"""
from __future__ import annotations
from collections import defaultdict
from config import (
    LLM_PROVIDER,
    OLLAMA_MODEL, OLLAMA_URL,
    ANTHROPIC_KEY, OPENAI_KEY,
    LLM_MODEL, LLM_MAX_TOKENS, CHAT_HISTORY_MAX_TURNS,
)

# Historial en memoria: { user_id: [{"role": "user"|"assistant", "content": str}] }
_history: dict[str, list[dict]] = defaultdict(list)


# ── Disponibilidad ────────────────────────────────────────────
def is_available() -> bool:
    if LLM_PROVIDER == "ollama":
        return _ollama_running()
    if LLM_PROVIDER == "anthropic":
        return bool(ANTHROPIC_KEY)
    if LLM_PROVIDER == "openai":
        return bool(OPENAI_KEY)
    return False


def _ollama_running() -> bool:
    try:
        import requests
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=2)
        return r.status_code == 200
    except Exception:
        return False


# ── Punto de entrada principal ────────────────────────────────
def chat(user_id: str, message: str, persona_markdown: str) -> tuple[str, list[str]]:
    """
    Envía un mensaje al LLM y retorna (respuesta, sugerencias).
    El persona_markdown se usa como system prompt para contextualizar.
    """
    if not is_available():
        return _rule_based(message, persona_markdown)

    if LLM_PROVIDER == "ollama":
        return _ollama_chat(user_id, message, persona_markdown)
    if LLM_PROVIDER == "anthropic":
        return _anthropic_chat(user_id, message, persona_markdown)
    if LLM_PROVIDER == "openai":
        return _openai_chat(user_id, message, persona_markdown)

    return _rule_based(message, persona_markdown)


def reset_history(user_id: str) -> None:
    _history[user_id] = []


# ── Ollama (local) ────────────────────────────────────────────
def _ollama_chat(user_id: str, message: str, system: str) -> tuple[str, list[str]]:
    try:
        from ollama import chat as ollama_chat

        _history[user_id].append({"role": "user", "content": message})
        history = _history[user_id][-CHAT_HISTORY_MAX_TURNS * 2:]

        response = ollama_chat(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": system},
                *history,
            ],
            stream=False,
        )

        reply = response["message"]["content"]
        _history[user_id].append({"role": "assistant", "content": reply})
        return reply, _default_suggestions()

    except Exception as e:
        print(f"[Ollama error] {e}")
        return _rule_based(message, system)


# ── Anthropic (Claude) ────────────────────────────────────────
def _anthropic_chat(user_id: str, message: str, system: str) -> tuple[str, list[str]]:
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

        _history[user_id].append({"role": "user", "content": message})
        history = _history[user_id][-CHAT_HISTORY_MAX_TURNS * 2:]

        response = client.messages.create(
            model=LLM_MODEL,
            max_tokens=LLM_MAX_TOKENS,
            system=system,
            messages=history,
        )

        reply = response.content[0].text
        _history[user_id].append({"role": "assistant", "content": reply})
        return reply, _default_suggestions()

    except Exception as e:
        print(f"[Anthropic error] {e}")
        return _rule_based(message, system)


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
        return reply, _default_suggestions()

    except Exception as e:
        print(f"[OpenAI error] {e}")
        return _rule_based(message, system)


# ── Fallback: reglas sin LLM ──────────────────────────────────
def _rule_based(message: str, context: str) -> tuple[str, list[str]]:
    msg      = message.lower()
    cashback = _extract(context, "Cashback acumulado: $", " MXN")
    score    = _extract(context, "Score buró: ", " (")
    invest   = _extract(context, "Saldo en inversión: $", " MXN")

    if any(w in msg for w in ["cashback", "recompensa"]):
        return (f"Tienes ${cashback} en cashback acumulado. Puedes usarlo en tu próxima compra. ¿Quieres saber cómo?",
                ["¿Cómo usar mi cashback?", "Ver mis gastos del mes"])

    if any(w in msg for w in ["inversión", "inversion", "invertir", "rendimiento"]):
        if invest and float(invest.replace(",", "")) > 0:
            reply = f"Tu inversión Hey tiene ${invest}. El GAT actual es 10.5% anual. ¿Quieres hacer un abono?"
        else:
            reply = "Aún no tienes inversión activa. Puedes empezar desde $500 con GAT de 10.5% anual. ¿Te interesa?"
        return reply, ["¿Cómo funciona la inversión?", "¿Cuánto necesito para empezar?"]

    if any(w in msg for w in ["score", "buró", "buro", "crédito"]):
        return (f"Tu score buró es {score}. Pagar a tiempo y reducir utilización son los pasos clave para mejorarlo.",
                ["¿Cómo mejorar mi score?", "Ver mis productos"])

    if any(w in msg for w in ["gasto", "compra", "categoría", "mes"]):
        return ("Puedes ver el desglose completo de tus gastos en la pestaña 'Gastos'. ¿Te explico alguna categoría?",
                ["Ver todos mis gastos", "¿Cómo ahorrar más?"])

    if any(w in msg for w in ["hola", "buenos", "buenas", "hi"]):
        return ("¡Hola! Puedo ayudarte con tu cashback, inversiones, gastos o score buró. ¿Por dónde empezamos?",
                ["¿Cuánto cashback tengo?", "¿Cómo está mi score?", "Ver mis gastos"])

    return (f"Puedo ayudarte con tu cashback (${cashback}), gastos, score ({score}) e inversiones. ¿Sobre cuál te gustaría saber?",
            ["¿Cuánto cashback tengo?", "¿Cómo está mi score?", "Ver mis gastos"])


def _extract(ctx: str, prefix: str, suffix: str) -> str:
    try:
        s = ctx.index(prefix) + len(prefix)
        e = ctx.index(suffix, s)
        return ctx[s:e]
    except ValueError:
        return "0"


def _default_suggestions() -> list[str]:
    return ["¿Cuánto cashback tengo?", "Ver mis gastos", "¿Cómo está mi score?"]
