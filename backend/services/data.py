"""
services/data.py
Carga y merge de los 3 CSVs. Se ejecuta una sola vez al arrancar.
"""
import pandas as pd
from config import CLUSTERS_CSV, FEATURES_CSV, CONV_CSV

# Columnas de features que necesita el contexto
_FEATURE_COLS = [
    "user_id", "edad", "ingreso_mensual_mxn", "score_buro",
    "dias_desde_ultimo_login", "es_hey_pro", "num_productos_activos",
    "satisfaccion_1_10", "antiguedad_dias", "cashback_total",
    "monthly_avg_spend", "digital_payment_rate", "investment_balance",
    "engagement_score", "credit_health",
    "pct_restaurante", "pct_tecnologia", "pct_viajes",
    "pct_supermercado", "pct_entretenimiento", "pct_servicios_digitales",
]

_CONV_COLS = [
    "user_id", "conv_style", "conv_dominant_topic",
    "conv_n_conversations", "conv_n_interactions",
]


def load() -> pd.DataFrame:
    """Carga y une los 3 datasets. Devuelve un DataFrame indexado por user_id."""
    clusters = pd.read_csv(CLUSTERS_CSV)
    features = pd.read_csv(FEATURES_CSV, usecols=_FEATURE_COLS)
    conv     = pd.read_csv(CONV_CSV,     usecols=_CONV_COLS)

    df = (clusters
          .merge(conv,     on="user_id", how="left")
          .merge(features, on="user_id", how="left"))

    # Rellenar NULLs en ejes sin crédito
    df["axis1_kmeans_label"] = df["axis1_kmeans_label"].fillna("Conservative")
    df["axis2_kmeans_label"] = df["axis2_kmeans_label"].fillna("Entry")
    df["axis4_kmeans_label"] = df["axis4_kmeans_label"].fillna("Casual")
    df["conv_style"]         = df["conv_style"].fillna("Passive")

    df = df.set_index("user_id")
    print(f"✅ Dataset listo: {len(df):,} usuarios")
    return df


# Singleton — se carga una sola vez
_df: pd.DataFrame | None = None


def get_df() -> pd.DataFrame:
    global _df
    if _df is None:
        _df = load()
    return _df


def get_user(user_id: str) -> dict | None:
    df = get_df()
    if user_id not in df.index:
        return None
    return df.loc[user_id].to_dict()
