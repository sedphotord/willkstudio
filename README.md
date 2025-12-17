
# ⚡ WillkStudio: The AI-Native IDE

![WillkStudio Banner](https://via.placeholder.com/1200x400/09090b/3b82f6?text=WillkStudio+AI+IDE)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Powered%20by-Gemini-8E75B2)](https://deepmind.google/technologies/gemini/)

**WillkStudio** es un Entorno de Desarrollo Integrado (IDE) avanzado, ejecutado completamente en el navegador y orquestado por una arquitectura de Inteligencia Artificial Multi-Agente. No es solo un chatbot de código; es un sistema capaz de razonar, planificar, editar sistemas de archivos virtuales y renderizar aplicaciones completas en tiempo real.

---

## 📑 Tabla de Contenidos

1. [Filosofía del Proyecto](#-filosofía-del-proyecto)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Características Principales](#-características-principales)
4. [⚙️ Configuración y API Keys (BYOK)](#-configuración-y-api-keys-byok)
5. [Instalación y Desarrollo](#-instalación-y-desarrollo)
6. [Guía de Uso](#-guía-de-uso)
7. [Estructura del Código](#-estructura-del-código)
8. [Sistema de Agentes](#-sistema-de-agentes)
9. [Seguridad y Privacidad](#-seguridad-y-privacidad)
10. [Roadmap](#-roadmap)

---

## 🧠 Filosofía del Proyecto

WillkStudio nace de la premisa de que la codificación asistida por IA no debe ser "copiar y pegar" fragmentos de código, sino una colaboración fluida donde el humano actúa como Director Técnico y la IA como el equipo de ingeniería.

El sistema implementa una **Cadena de Razonamiento (Chain of Thought)** explícita:
1.  **Diagnóstico:** Antes de escribir código, se analiza el estado actual.
2.  **Planificación:** Se decide si es una tarea de UI, Lógica o Debugging.
3.  **Ejecución Atómica:** Los cambios se aplican como transacciones en un sistema de archivos virtual.
4.  **Feedback Narrativo:** El usuario ve *qué* está pensando la IA, no solo el resultado final.

---

## 🏗 Arquitectura del Sistema

El núcleo de WillkStudio se basa en tres pilares tecnológicos sincronizados:

### 1. Sistema de Archivos Virtual (In-Memory VFS)
Utilizamos una estructura de datos de árbol recursivo para simular un sistema de archivos UNIX en el navegador.
- **Normalización de Rutas:** Manejo automático de `/`, `\` y rutas relativas.
- **Persistencia:** Estado guardado en `localStorage` mediante `Zustand`.
- **Compresión:** Algoritmos `JSZip` optimizados para importar/exportar proyectos complejos sin latencia.

### 2. Motor de Ejecución (Sandpack)
Integración profunda con `@codesandbox/sandpack-react` que actúa como el "Runtime":
- Compila React/TypeScript en el navegador (usando Web Workers).
- Soporta recarga en caliente (HMR).
- Permite la instalación de dependencias NPM en tiempo real.

### 3. Orquestador de IA (AgentManager)
Una capa de abstracción sobre los LLMs (Gemini, OpenAI, Anthropic) que transforma lenguaje natural en operaciones JSON estructuradas (`create`, `update`, `delete`).

---

## 🚀 Características Principales

### 🤖 Multi-Provider AI (BYOK)
Trae tu propia clave. WillkStudio es agnóstico al proveedor, soportando:
- **Google Gemini 2.5/Flash:** Optimizado para velocidad y contexto largo (hasta 1M tokens).
- **OpenAI GPT-4o:** Para razonamiento complejo lógico.
- **Anthropic Claude 3.5 Sonnet:** Superior en generación de código y UI.
- **Mistral AI:** Opción open-weights eficiente.

### 💎 UI/UX de Grado Empresarial
- **Editor Monaco:** La misma experiencia de edición que VS Code (IntelliSense, Minimap, Diff View).
- **Narrative Loading:** Feedback visual paso a paso ("🔍 Analizando ZIP...", "🧹 Limpiando dependencias...").
- **Drag & Drop:** Sube imágenes, archivos de texto o ZIPs completos arrastrándolos al chat.

### 🛡️ Robustez y Auto-Reparación
- **Dependency Detection:** Si la IA sugiere usar `framer-motion`, el sistema detecta la falta en `package.json` y sugiere instalarla.
- **Import Fixer:** Un agente especializado revisa errores de "Module not found" y los corrige proactivamente.

---

## ⚙️ Configuración y API Keys (BYOK)

WillkStudio opera bajo el modelo **Bring Your Own Key (BYOK)**. Esto significa que no revendemos tokens; tú controlas tus costos y límites directamente con el proveedor de IA.

### Gestión de Claves

1.  Abre el **Panel de Configuración** (icono ⚙️ en la esquina inferior izquierda del sidebar o en el header del dashboard).
2.  Navega a la pestaña **Models & Keys**.

### Proveedores Soportados

#### 1. Google Gemini (Recomendado / Default)
*Es el motor predeterminado debido a su gran ventana de contexto y baja latencia.*
- **Obtener Key:** [Google AI Studio](https://aistudio.google.com/)
- **Modelos:** Gemini 2.5 Flash, Gemini 1.5 Pro.
- **Ventaja:** Ventana de contexto masiva permite leer proyectos enteros.

#### 2. OpenAI
- **Obtener Key:** [OpenAI Platform](https://platform.openai.com/api-keys)
- **Modelos:** GPT-4o, GPT-3.5 Turbo.
- **Nota:** Requiere tener créditos activos en la cuenta de OpenAI.

#### 3. Anthropic
- **Obtener Key:** [Anthropic Console](https://console.anthropic.com/)
- **Modelos:** Claude 3.5 Sonnet, Claude 3 Haiku.
- **Ventaja:** Excelente calidad de código y menor tasa de alucinaciones.

#### 4. Mistral AI
- **Obtener Key:** [Mistral Platform](https://console.mistral.ai/)
- **Modelos:** Mistral Large, Mistral Small.

### Auto Mode vs. Selección Manual
- **Auto Mode (Activado por defecto):** El sistema elige inteligentemente el modelo. Usará modelos rápidos (Gemini Flash) para tareas simples de UI y modelos potentes (Claude/GPT-4) para lógica compleja, siempre y cuando las claves estén configuradas.
- **Manual Mode:** Fuerzas al editor a usar un proveedor específico para todas las tareas.

> **🔒 Nota de Seguridad:** Tus claves API se almacenan **exclusivamente en el `localStorage` de tu navegador**. Nunca se envían a ningún servidor de WillkStudio ni a terceros que no sean el proveedor de IA correspondiente.

---

## 💻 Instalación y Desarrollo

### Prerrequisitos
- Node.js v18+
- npm, pnpm o yarn

### Pasos de Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-org/willkstudio.git
    cd willkstudio
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o
    pnpm install
    ```

3.  **Variables de Entorno (Opcional):**
    Puedes pre-configurar una clave para desarrollo local creando un archivo `.env`:
    ```env
    VITE_API_KEY=tu_clave_gemini_para_dev
    ```
    *Si no configuras esto, la app pedirá la clave en la UI.*

4.  **Iniciar Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```
    Accede a `http://localhost:5173`.

---

## 📖 Guía de Uso

### Flujo de Trabajo Típico

1.  **Creación:** Desde el Dashboard, inicia un "New Project" o selecciona una plantilla (SaaS, Landing Page).
2.  **Prompting:**
    - Usa el chat lateral para describir requerimientos.
    - *Tip:* Sé específico. "Crea un botón" es peor que "Crea un botón azul con bordes redondeados y un icono de flecha a la derecha usando Lucide React".
3.  **Iteración:**
    - La IA generará el código y actualizará el preview.
    - Si algo falla, escribe "Fix it" o explica el error. El Agente de Fix analizará el contexto.
4.  **Edición Manual:**
    - Haz clic en cualquier archivo en el explorador para abrir el editor Monaco.
    - Tus cambios manuales se sincronizan con la "memoria" de la IA para futuros prompts.
5.  **Exportación:**
    - Usa el botón de descarga (icono de flecha abajo en el header) para obtener un `.zip` listo para producción.

### Atajos de Teclado
- `Cmd + K` / `Ctrl + K`: Abrir Paleta de Comandos (Buscar archivos).
- `Cmd + S` / `Ctrl + S`: Guardar Snapshot manual.
- `Cmd + Enter`: Enviar mensaje en el chat.

---

## 📂 Estructura del Código

Una guía para contribuidores que quieran entender el mapa del proyecto.

```text
/src
├── components/          # Componentes React de UI
│   ├── Editor.tsx       # El núcleo del IDE (Layout, Paneles)
│   ├── FileTreeNode.tsx # Componente recursivo del explorador
│   └── ...
├── lib/
│   ├── ai/
│   │   ├── agents.ts    # Lógica de orquestación (AgentManager)
│   │   └── prompts.ts   # System Prompts para cada rol (Code, UI, Fix)
│   ├── store.ts         # Estado global (Zustand) - Maneja archivos, settings
│   ├── utils.ts         # Manipulación de FS, ZIPs, Normalización de rutas
│   └── schemas.ts       # Definiciones Zod para validación de JSON de IA
├── services/            # Servicios externos (si los hubiera)
├── types.ts             # Definiciones TypeScript compartidas
├── App.tsx              # Router principal (Landing, Login, Dashboard, Editor)
└── index.tsx            # Punto de entrada
```

### El Agente Manager (`lib/ai/agents.ts`)
Esta clase es el cerebro. Implementa un patrón **Strategy** donde:
1.  Recibe el input del usuario.
2.  El `RouterAgent` clasifica la intención (CODE, UI, FIX).
3.  Instancia el agente específico.
4.  Construye el contexto (lee los archivos relevantes del Store).
5.  Llama a la API (Gemini/OpenAI/etc).
6.  Valida la respuesta contra `AIResponseSchema` usando Zod.
7.  Devuelve las acciones a ejecutar.

---

## 🤖 Sistema de Agentes

WillkStudio utiliza roles especializados definidos en `lib/ai/prompts.ts`:

### 1. Router Agent
El "Traffic Controller". No escribe código. Solo decide quién debe trabajar.
*Prompt:* "Classify intent: Is this a visual change? A logical bug? A new feature?"

### 2. Code Architect Agent
Ingeniero Senior. Se enfoca en la funcionalidad, tipos y estructura de datos.
*Reglas:* Clean Code, SOLID, Preferencia por TypeScript estricto.

### 3. UI/UX Agent
Diseñador Frontend. Experto en Tailwind CSS.
*Reglas:* Estética moderna, espaciado consistente, accesibilidad, animaciones sutiles.

### 4. Fix Agent
Especialista en Debugging.
*Habilidad especial:* Analiza errores de compilación simulados y dependencias faltantes. Si ve un import roto, crea el archivo faltante.

---

## 🔐 Seguridad y Privacidad

La seguridad es primordial en herramientas de desarrollo.

1.  **Client-Side Execution:** Todo el código se ejecuta en tu navegador usando Web Workers (via Sandpack). No hay ejecución remota de código arbitrario en nuestros servidores.
2.  **Local Storage:** Tus proyectos y configuraciones persisten en `localStorage` (via `zustand/persist`). Si borras la caché del navegador, asegúrate de exportar tus proyectos antes.
3.  **API Keys:** Como se mencionó en la sección BYOK, las claves nunca abandonan tu navegador excepto para comunicarse directamente con la API del proveedor (Google/OpenAI).

---

## 🗺 Roadmap

El futuro de WillkStudio incluye:

- [ ] **Soporte para Git:** Integración real para commit/push a GitHub.
- [ ] **Deployment:** Despliegue en un clic a Vercel/Netlify.
- [ ] **Colaboración:** Edición multijugador en tiempo real (CRDTs).
- [ ] **Soporte Backend:** Contenedores Web completos para ejecutar Node.js/Python (vía WebContainers).
- [ ] **Extensiones:** Sistema de plugins para la comunidad.

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!
1.  Haz un Fork del proyecto.
2.  Crea tu rama de características (`git checkout -b feature/AmazingFeature`).
3.  Haz Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Haz Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un Pull Request.

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  <strong>WillkStudio</strong> — Code at the speed of thought.
  <br>
  Hecho con ❤️, ☕ y mucha IA.
</div>
