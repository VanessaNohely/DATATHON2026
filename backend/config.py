import os
from pathlib import Path
from dotenv import load_dotenv

# Carga el .env automáticamente desde la carpeta backend/
load_dotenv(Path(__file__).parent / ".env")

BASE_DIR = Path(__file__).parent.parent

CLUSTERS_CSV = BASE_DIR / "user_clusters.csv"
FEATURES_CSV = BASE_DIR / "hey_banco_complete_features.csv"
CONV_CSV     = BASE_DIR / "analysis" / "conversation_features.csv"

LLM_PROVIDER  = os.getenv("LLM_PROVIDER", "ollama")
OLLAMA_MODEL  = os.getenv("OLLAMA_MODEL", "gemma4:e2b")
OLLAMA_URL    = os.getenv("OLLAMA_URL", "http://localhost:11434")

ANTHROPIC_KEY  = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_KEY     = os.getenv("OPENAI_API_KEY", "")
LLM_MODEL      = os.getenv("LLM_MODEL", "claude-haiku-4-5-20251001")
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "512"))

CHAT_HISTORY_MAX_TURNS = int(os.getenv("CHAT_HISTORY_MAX_TURNS", "8"))

ALLOWED_ORIGINS = [
    "http://localhost:4200",
    "http://localhost:3000",
]
