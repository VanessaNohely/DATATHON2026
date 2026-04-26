import os
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────
BASE_DIR     = Path(__file__).parent.parent  # raíz del repo
DATA_DIR     = BASE_DIR

CLUSTERS_CSV = DATA_DIR / "user_clusters.csv"
FEATURES_CSV = DATA_DIR / "merged_features.csv"
CONV_CSV     = DATA_DIR / "analysis" / "conversation_features.csv"

# ── LLM ───────────────────────────────────────────────────────
LLM_PROVIDER  = os.getenv("LLM_PROVIDER", "anthropic")   # "anthropic" | "openai"
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_KEY    = os.getenv("OPENAI_API_KEY", "")

# claude-haiku-4-5 → más barato · claude-sonnet-4-6 → más capaz
LLM_MODEL     = os.getenv("LLM_MODEL", "claude-haiku-4-5-20251001")
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "512"))

# Número máximo de turnos de historial a mantener por sesión
CHAT_HISTORY_MAX_TURNS = int(os.getenv("CHAT_HISTORY_MAX_TURNS", "8"))

# ── CORS ──────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:4200",  # Angular dev
    "http://localhost:3000",
]
