from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from config import ALLOWED_ORIGINS
from services import data, persona, llm
import pandas as df

# ── App ───────────────────────────────────────────────────────
app = FastAPI(title="Hey Havi API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Carga de datos al arrancar ────────────────────────────────
@app.on_event("startup")
async def startup():
    data.get_df()   # carga los 3 CSVs y hace el merge
    print(f"🤖 LLM disponible: {llm.is_available()} ({llm.LLM_PROVIDER})")


# ── Request models ────────────────────────────────────────────
class ChatRequest(BaseModel):
    user_id: str
    message: str


# ── Endpoints ─────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "status":    "ok",
        "version":   "1.0.0",
        "llm_ready": llm.is_available(),
    }

@app.get("/{user_id}/persona")
async def construct_persona(user_id):

    user = df[df['user_id']==user_id]

    persona = f"""
- Perfil de riesgo: {user['axis1_kmeans_label'].values[0]}
- Ingreso y estrato de riqueza: {user['axis2_kmeans_label'].values[0]}
- Spending lifestyle: {user['axis3_kmeans_label'].values[0]}
- Digital engagement and loyalty: {user['axis4_kmeans_label'].values[0]}
"""
    return {"persona": persona}

@app.get("/api/user/{user_id}/context")
async def get_user_context(user_id: str):
    """
    Retorna perfil completo, alertas proactivas, saludo de Havi
    y recomendaciones de productos. Se llama UNA vez al abrir la app.
    """
    row = data.get_user(user_id)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Usuario {user_id} no encontrado.")

    ctx = persona.build_context(user_id, row)

    # Si hay LLM, reemplaza el saludo por defecto con uno generado
    if llm.is_available():
        system   = ctx["profile"]["_persona_markdown"]
        greeting, _ = llm.chat(
            user_id=user_id,
            message="Genera un saludo personalizado breve para este usuario. Solo el saludo, sin explicaciones.",
            persona_markdown=system,
        )
        ctx["havi_greeting"] = greeting
        llm.reset_history(user_id)   # reinicia historial para el chat real

    return ctx


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """
    Recibe un mensaje del usuario y retorna la respuesta de Havi.
    Mantiene historial de conversación en memoria por sesión.
    """
    row = data.get_user(req.user_id)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Usuario {req.user_id} no encontrado.")

    system        = persona.build_markdown(row)
    reply, suggestions = llm.chat(req.user_id, req.message, system)

    return {
        "message":     reply,
        "suggestions": suggestions,
    }


@app.delete("/api/chat/{user_id}/history")
async def clear_history(user_id: str):
    """Limpia el historial de conversación de un usuario (útil para testing)."""
    llm.reset_history(user_id)
    return {"status": "ok", "message": f"Historial de {user_id} eliminado."}
