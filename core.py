import os
from fastapi import Header, HTTPException
from supabase import acreate_client, AsyncClient
from google import genai
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

supabase_client: AsyncClient = None
gemini_client: genai.Client = None

async def inicializar():
    global supabase_client, gemini_client

    supabase_url = os.environ.get("SUPABASE_URL", "")
    supabase_key = os.environ.get("SUPABASE_KEY", "")
    gemini_api_key = os.environ.get("GEMINI_API_KEY")

    if supabase_url and supabase_key:
        supabase_client = await acreate_client(supabase_url, supabase_key)
        print(f"[OK] Supabase conectado: {supabase_url}")
    else:
        print("[ERROR] SUPABASE_URL o SUPABASE_KEY no configuradas")

    if gemini_api_key is None:
        raise ValueError("[ERROR CRÍTICO] GEMINI_API_KEY no encontrada en variables de entorno. Verifica tu archivo .env")

    print(f"[DEBUG] GEMINI_API_KEY detectada: {gemini_api_key[:5]}... (longitud: {len(gemini_api_key)})")
    gemini_client = genai.Client(api_key=gemini_api_key)
    print("[OK] Cliente Gemini inicializado correctamente")

@asynccontextmanager
async def lifespan(app):
    await inicializar()
    yield

async def verificar_token_jwt(authorization: str = Header(default="")) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    token = authorization.split(" ", 1)[1]

    if not supabase_client:
        raise HTTPException(status_code=503, detail="Servicio de autenticación no disponible")

    try:
        user_response = await supabase_client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Token inválido o expirado")
        return str(user_response.user.id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Error de autenticación: {str(e)}")
