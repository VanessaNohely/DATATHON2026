from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from config import ALLOWED_ORIGINS
from services import data, persona, llm

app = FastAPI(title="Hey Havi API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    data.get_df()
    print(f"LLM disponible: {llm.is_available()} ({llm.LLM_PROVIDER})")

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.get("/")
async def root():
    return {"status": "ok", "version": "1.0.0", "llm_ready": llm.is_available()}

@app.get("/{user_id}/persona")
async def get_persona(user_id: str):
    row = data.get_user(user_id)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Usuario {user_id} no encontrado.")
    return {"persona": persona.build_markdown(row)}

@app.get("/api/user/{user_id}/context")
async def get_user_context(user_id: str):
    row = data.get_user(user_id)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Usuario {user_id} no encontrado.")

    ctx = persona.build_context(user_id, row)

    if llm.is_available():
        system = ctx["profile"]["_persona_markdown"]
        greeting, _ = llm.chat(
            user_id=user_id,
            message="Saluda al usuario de forma breve y amigable en español. IMPORTANTE: responde SOLO el saludo, sin comillas, sin explicaciones.",
            persona_markdown=system,
        )
        ctx["havi_greeting"] = greeting
        llm.reset_history(user_id)

    return ctx

@app.post("/api/chat")
async def chat(req: ChatRequest):
    row = data.get_user(req.user_id)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Usuario {req.user_id} no encontrado.")

    system = persona.build_markdown(row)
    reply, suggestions = llm.chat(req.user_id, req.message, system)
    return {"message": reply, "suggestions": suggestions}

@app.delete("/api/chat/{user_id}/history")
async def clear_history(user_id: str):
    llm.reset_history(user_id)
    return {"status": "ok", "message": f"Historial de {user_id} eliminado."}
