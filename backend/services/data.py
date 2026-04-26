"""
services/data.py
Carga y merge de los CSVs de Carlos. Se ejecuta una sola vez al arrancar.
"""
import pandas as pd
from config import CLUSTERS_CSV, FEATURES_CSV, CONV_CSV

# Columnas disponibles en hey_banco_complete_features.csv (71 cols de Carlos)
_FEATURE_COLS = [
    "user_id", "edad", "ingreso_mensual_mxn", "score_buro",
    "dias_desde_ultimo_login", "es_hey_pro_x", "num_productos_activos",
    "satisfaccion_1_10", "antiguedad_dias", "cashback_total",
    "monthly_avg_spend", "digital_payment_rate", "investment_balance",
    "engagement_score", "credit_health" if "credit_health" in [] else None,
    "pct_restaurante", "pct_tecnologia", "pct_viajes",
    "pct_supermercado", "pct_entretenimiento", "pct_servicios_digitales",
    "atypical_txn_rate", "failed_txn_rate", "dispute_rate",
    "financial_sophistication", "vulnerability_flag",
]
# Filtrar Nones
_FEATURE_COLS = [c for c in _FEATURE_COLS if c]

_CONV_COLS = [
    "user_id", "conv_style", "conv_dominant_topic",
    "conv_n_conversations", "conv_n_interactions",
]


def load() -> pd.DataFrame:
    """Carga y une los CSVs. Devuelve un DataFrame indexado por user_id."""
    clusters = pd.read_csv(CLUSTERS_CSV)
    conv     = pd.read_csv(CONV_CSV, usecols=_CONV_COLS)

    # Cargar solo columnas que existen en el CSV de Carlos
    features_all = pd.read_csv(FEATURES_CSV, nrows=1)
    available_cols = ["user_id"] + [c for c in _FEATURE_COLS if c != "user_id" and c in features_all.columns]
    features = pd.read_csv(FEATURES_CSV, usecols=available_cols)

    # Normalizar nombre de hey_pro
    if "es_hey_pro_x" in features.columns:
        features = features.rename(columns={"es_hey_pro_x": "es_hey_pro"})

    df = (clusters
          .merge(conv,     on="user_id", how="left")
          .merge(features, on="user_id", how="left"))

    # Rellenar NULLs en ejes sin crédito
    df["axis1_kmeans_label"] = df["axis1_kmeans_label"].fillna("Conservative")
    df["axis2_kmeans_label"] = df["axis2_kmeans_label"].fillna("Entry")
    df["axis4_kmeans_label"] = df["axis4_kmeans_label"].fillna("Casual")
    df["conv_style"]         = df["conv_style"].fillna("Passive")

    df = df.set_index("user_id")
    print(f"✅ Dataset listo: {len(df):,} usuarios | {len(df.columns)} features")
    return df


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
