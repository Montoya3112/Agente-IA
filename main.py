import base64
import io
from fastapi import FastAPI, Depends, Form, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from datetime import datetime, timedelta
import pypdf
import core
from ai_engine import procesar_prompt

app = FastAPI(title="MRCA AI Assistant", lifespan=core.lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return FileResponse("static/index.html")

@app.post("/api/chat")
async def chat(
    user_id: str = Depends(core.verificar_token_jwt),
    texto: str = Form(...),
    imagen: UploadFile | None = File(None),
    archivo: UploadFile | None = File(None)
):
    imagen_base64 = None
    texto_documento = None

    # Handle Image Upload
    if imagen and imagen.filename:
        image_bytes = await imagen.read()
        imagen_base64 = base64.b64encode(image_bytes).decode("utf-8")

    # Handle Document / PDF Upload
    if archivo and archivo.filename:
        filename = archivo.filename.lower()
        file_bytes = await archivo.read()

        if filename.endswith(".pdf"):
            try:
                pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                paginas_texto = []
                for i, page in enumerate(pdf_reader.pages):
                    t = page.extract_text()
                    if t:
                        paginas_texto.append(f"--- Pág. {i+1} ---\n{t}")
                texto_documento = "\n".join(paginas_texto)
                print(f"[DOC] PDF procesado correctamente: {filename} ({len(pdf_reader.pages)} páginas)")
            except Exception as e:
                print(f"[WARN] Error al leer PDF {filename}: {e}")
                texto_documento = f"[Error al extraer texto del PDF {filename}]"
        else:
            # Plain text, CSV, Code files
            try:
                texto_documento = file_bytes.decode("utf-8", errors="ignore")
                print(f"[DOC] Documento de texto procesado: {filename}")
            except Exception as e:
                print(f"[WARN] Error al leer archivo {filename}: {e}")

    respuesta = await procesar_prompt(texto, imagen_base64, texto_documento)

    # Save to history
    try:
        if core.supabase_client:
            await core.supabase_client.table("historial_consultas").insert({
                "user_id": user_id,
                "prompt": texto,
                "respuesta": respuesta,
                "tiene_imagen": (imagen is not None and imagen.filename is not None) or (archivo is not None and archivo.filename is not None)
            }).execute()
    except Exception as e:
        print(f"[WARN] Error al guardar en historial: {e}")

    return {"respuesta": respuesta}

@app.get("/api/historial")
async def historial(user_id: str = Depends(core.verificar_token_jwt)):
    try:
        if core.supabase_client:
            response = await core.supabase_client.table("historial_consultas").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return {"historial": response.data}
        return {"historial": []}
    except Exception as e:
        print(f"[WARN] Error al cargar historial: {e}")
        return {"historial": []}

@app.get("/api/admin/telemetria")
async def telemetria(user_id: str = Depends(core.verificar_token_jwt)):
    try:
        if core.supabase_client:
            response = await core.supabase_client.table("historial_consultas").select("*").execute()
            datos = response.data or []
        else:
            datos = []
    except Exception as e:
        print(f"[WARN] Error al cargar telemetría: {e}")
        datos = []

    total_consultas = len(datos)
    consultas_con_imagen = sum(1 for d in datos if d.get("tiene_imagen"))
    usuarios_unicos = len(set(d.get("user_id") for d in datos if d.get("user_id")))

    hoy = datetime.now()
    peticiones_por_dia = {}
    for i in range(7):
        fecha = (hoy - timedelta(days=i)).strftime("%Y-%m-%d")
        peticiones_por_dia[fecha] = 0

    for d in datos:
        if d.get("created_at"):
            fecha = d["created_at"][:10]
            if fecha in peticiones_por_dia:
                peticiones_por_dia[fecha] += 1

    return {
        "total_consultas": total_consultas,
        "consultas_con_imagen": consultas_con_imagen,
        "usuarios_unicos": usuarios_unicos,
        "peticiones_por_dia": peticiones_por_dia,
        "uptime_porcentaje": 99.9,
        "errores": 0
    }
