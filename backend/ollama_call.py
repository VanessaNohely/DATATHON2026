from ollama import chat

def ollama_call(persona, message):
    stream = chat(model='gemma4:e2b', messages=[
        {
            'role': 'user',
            'content': f"""
El usuario tiene la siguiente financial persona:
{persona}

---

Su mensaje es el siguiente:
{message}
"""
        },
    ],stream=True)

    for chunk in stream:
        print(chunk['message']['content'], end='', flush=True)

if __name__ == "__main__":
    ollama_call("Adverso al riesgo", "Recomiendame los instrumentos financieros adecuados para mi perfil de riesgo")