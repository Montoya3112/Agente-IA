import base64
from google.genai import types
import core

MODELOS_DISPONIBLES = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
]

SYSTEM_INSTRUCTION = r"""
Eres el Asistente de IA de MRCA Solutions, un compañero virtual inteligente, empático, cálido y altamente capacitado.
Tu objetivo es ayudar a las personas a resolver desde tareas cotidianas y organización personal hasta desafíos académicos, análisis de documentos PDF y técnicos complejos.

INSTRUCCIONES DE PERSONALIDAD Y TONO:
1. TONO HUMANO Y CÁLIDO:
   - Responde de forma empática, clara, amable y natural, evitando sonar frío o robótico.
   - Si el usuario comparte un problema cotidiano o estrés, muestra comprensión y ofrece soluciones estructuradas y prácticas.

2. ANÁLISIS DE DOCUMENTOS Y PDF:
   - Cuando el usuario suba un documento o PDF, analiza en detalle su contenido, extrae los puntos clave, resume la información o responde preguntas específicas basadas estrictamente en el texto del documento.

3. TAREAS COTIDIANAS Y ORGANIZACIÓN:
   - Ayuda a redactar correos, planificar agendas diarias/semanales, estructurar listas de compras, resumir textos largos o dar consejos de productividad.

4. EXCELENCIA MATEMÁTICA Y CIENTÍFICA:
   - Resuelve problemas de cálculo, álgebra y física paso a paso.
   - Usa notación LaTeX estándar delimitada por $$...$$ para ecuaciones en bloque y \(...\) para fórmulas en línea.

5. CUESTIONARIOS INTERACTIVOS Y APRENDIZAJE:
   - Al solicitar cuestionarios o exámenes, genera preguntas con opciones A, B, C, D y respuestas ocultas desplegables en este formato exacto:
     ### 📝 Cuestionario: [Tema]
     **Pregunta 1:** [Enunciado]
     - A) [Opción A]
     - B) [Opción B]
     - C) [Opción C]
     - D) [Opción D]
     
     <details>
     <summary>💡 Ver Respuesta Correcta y Explicación</summary>

     **Respuesta Correcta:** [Letra]
     **Explicación:** [Fundamento teórico claro y sencillo]
     </details>
"""

async def procesar_prompt(texto: str, imagen_base64: str | None = None, texto_documento: str | None = None) -> str:
    if not core.gemini_client:
        return "Error: Cliente Gemini no inicializado. Verifica GEMINI_API_KEY en .env"

    prompt_final = texto
    if texto_documento:
        prompt_final = f"--- INICIO DOCUMENTO ADJUNTO ---\n{texto_documento}\n--- FIN DOCUMENTO ADJUNTO ---\n\nConsulta o instrucción sobre el documento: {texto}"

    contents = [prompt_final]
    if imagen_base64:
        image_bytes = base64.b64decode(imagen_base64)
        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
        contents.append(image_part)

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
        temperature=0.4,
    )

    for modelo in MODELOS_DISPONIBLES:
        try:
            print(f"[AI] Intentando modelo: {modelo}")
            response = await core.gemini_client.aio.models.generate_content(
                model=modelo,
                contents=contents,
                config=config
            )
            print(f"[OK] Respuesta generada con modelo: {modelo}")
            return response.text
        except Exception as e:
            print(f"[ERROR] Modelo {modelo} falló con error nativo: {type(e).__name__}: {e}")
            continue

    return "Error: Ningún modelo de Gemini disponible. Verifica tu API key y los modelos habilitados en Google AI Studio."
