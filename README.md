# 🧠 MRCA AI Assistant — Asistente Inteligente Multimodal & Académico

Un asistente de inteligencia artificial avanzado desarrollado con **FastAPI**, **Google Gemini 3.5**, **Three.js** y **Supabase**, diseñado para ofrecer asistencia cotidiana, análisis de documentos PDF, desarrollo matemático en LaTeX, generación de cuestionarios interactivos y visualización 3D en tiempo real.

---

## ✨ Características Principales

- 🤖 **Motor Multimodal Gemini 3.5**: Respuestas humanizadas y empáticas impulsadas por los modelos más recientes de Google Gemini.
- 📄 **Procesamiento de PDF y Archivos**: Lectura y extracción automática de texto de archivos PDF, código fuente (`.py`, `.js`) y documentos de texto.
- 🧮 **Formatos Matemáticos LaTeX (KaTeX)**: Desarrollo pedagógico paso a paso de expresiones algebraicas, cálculo e ingeniería.
- 📝 **Cuestionarios Interactivos**: Generación de exámenes de opción múltiple con respuestas ocultas desplegables (`<details>`).
- 🎨 **Visualización 3D con Three.js**: Red Neuronal 3D interactiva con pulsos sinápticos animados en tiempo real y gráficos tridimensionales de métricas.
- 🔐 **Autenticación & Base de Datos**: Integración con **Supabase Auth** y almacenamiento de historial de consultas en PostgreSQL.
- 🎙️ **Entrada por Voz & Adjuntos de Imagen**: Soporte para dictado por voz mediante Web Speech API y análisis multimodal de imágenes.

---

## 🛠️ Tecnologías Utilizadas

- **Backend**: Python 3.13, FastAPI, Uvicorn, PyPDF, `google-genai` SDK, `python-dotenv`.
- **Frontend**: HTML5, Vanilla CSS (Glassmorphism), JavaScript (ES6+), Three.js (WebGL), Marked.js, KaTeX.
- **Base de Datos & Auth**: Supabase (PostgreSQL + JWT Authentication).

---

## 🚀 Instalación y Configuración Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/Montoya3112/Agente-IA.git
cd Agente-IA
```

### 2. Crear y activar entorno virtual
```bash
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/macOS:
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_supabase_service_role_key
GEMINI_API_KEY=tu_gemini_api_key
```

### 5. Ejecutar la aplicación
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Visita **`http://localhost:8000`** en tu navegador.

---

## 👤 Licencia y Autor
Desarrollado para **MRCA Solutions**. Todos los derechos reservados.
