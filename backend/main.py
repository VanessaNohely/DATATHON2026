from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd

app = FastAPI()

df = pd.read_csv("../user_clusters.csv")

@app.get("/") # The path is inside ""
async def root():
    return {"message": "Hello World"}

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