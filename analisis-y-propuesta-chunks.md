# Yo te traduzco — Análisis comparativo con Palabros y propuesta de evolución a app de chunks

## 1. Análisis de Palabros

**App:** Palabros - Dictionary (iOS)
**Developer:** Nacho Cerrato Ruiz (Sevilla)
**Lanzamiento:** 20 febrero 2026 | **Versión actual:** 1.1.3
**Tamaño:** 9.1 MB | **Modelo:** Freemium (Pro: 3.99€/mes, 9.99€/año, 49.99€ lifetime)
**Fuentes de datos:** RAE API (ES), Free Dictionary API (EN), Relycapp (backup EN)

### Funcionalidades

| Funcionalidad | Descripción | UX |
|---|---|---|
| **Dashboard (Home)** | Tarjetas resumen Saved/Learned con contadores y última palabra. Sección "Recent" con palabras consultadas. "Word of the day" | Tab principal. Información a un vistazo. Acceso rápido a recientes |
| **Búsqueda de palabras** | Barra de búsqueda con lista de resultados mostrando nombre, categoría gramatical (badge de color) y definición truncada | Tab dedicada (lupa). Búsqueda inline con teclado |
| **Ficha de palabra** | Palabra + categoría gramatical + definiciones numeradas con tipo (Intr., Trans., etc.). Botón guardar (✓ verde) y eliminar (papelera roja). Botón compartir | Vista detalle. Acciones claras y binarias |
| **Library (Colección)** | Dos tabs: Saved / Learned. Contador de palabras. Lista con bullet de color por categoría. Icono de filtro por tipo gramatical | Tab dedicada (estantería). Filtro por: Nouns, Adjectives, Verbs, Adverbs |
| **Review (Quiz)** | Modal: "Test your vocabulary" con selector de cantidad de palabras, modo Easy/Hard, formato 4 opciones 1 correcta | Acceso desde Library. Quiz de reconocimiento |
| **Color-coding gramatical** | Consistente en toda la app: Noun (morado), Adjective (rosa), Verb (naranja), Adverb (verde) | Visual, inmediato, coherente |
| **Settings / Data Sources** | APIs configurables, walkthrough, contacto, "Visual stats" | Panel modal desde Home |

### Lo que Palabros hace bien

- Ciclo de aprendizaje cerrado: Guardar → Revisar → Graduar (Saved → Review → Learned)
- Color-coding consistente en toda la app
- Información mínima pero suficiente en cada nivel de detalle (lista → ficha)
- Dark mode nativo
- Sin ads
- App muy ligera (9.1 MB)

### Limitaciones para nuestro caso de uso

- La unidad es la **palabra individual**, no chunks ni expresiones
- Las categorías son **gramaticales** (noun, verb), no funcionales
- Las definiciones vienen de diccionarios genéricos, no de producción propia
- El review es de **reconocimiento** (elige entre 4), no de **producción** (produce tú)
- No hay contexto de uso, ni registro oral/escrito, ni correcciones

---

## 2. Estado actual de "Yo te traduzco"

**Stack:** React 19 + TypeScript + Tailwind CSS 4 + Supabase + Netlify
**Tipografía:** Literata (serif, display) + DM Sans (sans, body)
**Modo:** Light mode, web-first, responsive

### Funcionalidades actuales

| Funcionalidad | Descripción |
|---|---|
| **Input de traducción** | Campo de texto para palabra/frase EN, botón "Traducir", checkbox para imagen ilustrativa |
| **Tarjetas de vocabulario** | Par EN→ES, pronunciación EN/ES, categoría con color + emoji, notas opcionales, editar/eliminar |
| **Categorías** | Sustantivos, Verbos, Adjetivos, Expresiones, Tecnología (semánticas, no gramaticales) |
| **Búsqueda y filtro** | Texto libre + dropdown por categoría |
| **Diseño** | Color bar lateral por categoría, gradientes, toast notifications, empty state |

### Lo que tiene bien

- Stack moderno y mantenible
- Diseño visual limpio y profesional
- Supabase como backend propio (el contenido lo generas tú)
- Estructura de tarjetas flexible
- Responsive

### Lo que le falta

- **No hay ciclo de aprendizaje** — solo guardas y consultas
- **No hay estado de progreso** — no sabes qué has automatizado y qué no
- **Las categorías son genéricas** — "Expresiones" mete todo en el mismo saco
- **No hay contexto de producción** — la tarjeta no captura por qué te cuesta ni qué error desplaza
- **No hay mecanismo de repaso**

---

## 3. Comparación directa

| Aspecto | Palabros | Yo te traduzco |
|---|---|---|
| **Unidad** | Palabra individual | Palabra o frase |
| **Fuente de datos** | APIs de diccionario externas | Producción propia + Supabase |
| **Categorización** | Gramatical (noun, verb...) | Semántica (expresiones, tecnología...) |
| **Ciclo de aprendizaje** | Saved → Review → Learned | No existe |
| **Tipo de review** | Reconocimiento (4 opciones) | No existe |
| **Plataforma** | iOS nativa | Web app responsive |
| **Dark mode** | Sí (nativo) | No (light mode) |
| **Contexto de uso** | Definición de diccionario | Notas manuales opcionales |
| **Progreso** | Contadores Saved/Learned | Solo contador de guardadas |

---

## 4. Propuesta: evolución a app de chunks

### 4.1 Cambio de modelo de datos — la Chunk Card

La unidad deja de ser "palabra → traducción" y pasa a ser un **chunk** con metadatos de producción oral.

**Estructura de una chunk card:**

```
┌──────────────────────────────────────────────────┐
│ CHUNK: Having said that                          │
│ TIPO: Discourse marker (concesión)               │
│                                                  │
│ PARA QUÉ SIRVE:                                  │
│ Introduces una idea que matiza o contradice       │
│ lo que acabas de decir                           │
│                                                  │
│ TU EJEMPLO:                                      │
│ "The app looks great. Having said that, I think  │
│ the navigation needs work."                      │
│                                                  │
│ EN VEZ DE DECIR:                                 │
│ "But I have to say that..." ← traducción literal │
│ del español "pero tengo que decir que..."        │
│                                                  │
│ FUENTE: Sesión Claude 15-mar                     │
│ ESTADO: ○ Nuevo → ◐ Practicado → ● Automatizado │
└──────────────────────────────────────────────────┘
```

**Campos del modelo:**

| Campo | Tipo | Descripción |
|---|---|---|
| `chunk` | string | La expresión en inglés |
| `category` | enum | Muletillas pro, Combos que molan, Phrasal verbs, Frases hechas, Trucos de fábrica, Conectores |
| `subcategory` | string | Función específica: concesión, adición, contraste, etc. |
| `purpose` | string | Para qué sirve comunicativamente |
| `my_example` | string | Frase de producción propia usándolo |
| `instead_of` | string | La traducción literal del español que desplaza |
| `spanish_equivalent` | string | Equivalente conceptual en español (referencia, no traducción) |
| `source` | string | De dónde lo aprendiste (sesión Claude, podcast, conversación...) |
| `status` | enum | new / practiced / automated |
| `notes` | string | Notas adicionales, reglas, por qué suena mal la alternativa |
| `created_at` | timestamp | Fecha de registro |
| `last_reviewed` | timestamp | Última fecha de repaso |

**Por qué el campo "en vez de decir" es clave:**

No es un par de traducción. Es un par de **sustitución de hábito**. Captura la traducción literal que tu cerebro quiere producir desde el español y la pone al lado de la alternativa nativa. Cada vez que repasas, tu cerebro ve: "cuando quiero decir *pero tengo que decir que*, lo que debo producir es *having said that*."

### 4.2 Categorías funcionales

Sustituir las categorías genéricas por 6 categorías cercanas y funcionales:

| Categoría              | Color       | Qué metes ahí                                                        |
| ---------------------- | ----------- | --------------------------------------------------------------------- |
| **Muletillas pro**     | Verde       | Hilar ideas sin sonar robot: *having said that, the thing is, I mean* |
| **Combos que molan**   | Azul        | Parejas que van juntas sí o sí: *make a decision, heavy rain*         |
| **Phrasal verbs**      | Naranja     | Los de siempre: *come up with, figure out, put up with*               |
| **Frases hechas**      | Violeta     | Bloques que se dicen tal cual: *it's no big deal, let's call it a day* |
| **Trucos de fábrica**  | Rosa        | Patrones que multiplican vocabulario: *-ish, un-, over-*              |
| **Conectores**         | Celeste     | Enganchar una idea con la siguiente: *on top of that, by the way*     |

Cada categoría puede tener subcategorías funcionales. Ejemplo para Muletillas pro: concesión (*having said that*), adición (*on top of that*), contraste (*then again*), conclusión (*at the end of the day*).

### 4.3 Ciclo de aprendizaje

Inspirado en Palabros (Saved → Review → Learned) pero adaptado a **producción oral**:

```
Nuevo → Practicado → Automatizado

○ Nuevo: lo has registrado pero no lo has usado activamente
◐ Practicando: lo has producido en contexto con esfuerzo consciente
● Aprendido: te sale sin pensar en español primero
```

**Review basado en producción (no reconocimiento):**

- La app te presenta una situación en español o el campo "en vez de decir" → tú produces el chunk
- O te da el chunk → tú produces una frase completa usándolo en contexto
- Self-grading: tú decides si lo has clavado / ha salido con esfuerzo / lo has fallado
- Prioridad de repaso: los chunks con más tiempo sin practicar aparecen primero

### 4.4 Dashboard con progreso

Evolución del dashboard de Palabros:

- Contadores: Nuevos / Practicando / Aprendidos
- Distribución por categoría (cuántos discourse markers, cuántos collocations...)
- Chunks que llevan más tiempo sin practicar (prioridad de repaso)
- Racha de práctica diaria
- "Chunk of the day" (aleatorio de los que necesitan refuerzo)

### 4.5 Import desde sesiones Claude

Al final de cada sesión de práctica, Claude genera un bloque con los chunks trabajados. Formato:

```json
{
  "session_date": "2026-03-15",
  "chunks": [
    {
      "chunk": "having said that",
      "category": "discourse_marker",
      "subcategory": "concession",
      "purpose": "Introduce a contrasting or qualifying idea after a positive statement",
      "my_example": "The app looks great. Having said that, the navigation needs work.",
      "instead_of": "But I have to say that...",
      "spanish_equivalent": "dicho esto / dicho lo cual",
      "status": "practiced",
      "notes": "Natural in conversational standard. Sounds less abrupt than 'but' or 'however'."
    }
  ]
}
```

Opciones de import: copiar/pegar JSON, o en futuro endpoint API.

---

## 5. Roadmap hacia iOS

### Fase 1: Web app (lo que ya tienes)
- Pivotar el modelo de datos de "palabra → traducción" a chunk card
- Actualizar esquema de Supabase
- Rediseñar las tarjetas con los nuevos campos
- Implementar categorías funcionales con color-coding
- Añadir estados (nuevo/practicado/automatizado)
- Añadir import de sesiones Claude (JSON paste)

### Fase 2: Review y progreso (web)
- Implementar modo de review por producción
- Dashboard con contadores y distribución
- Filtros por categoría funcional y estado
- Repaso espaciado (priorizar chunks sin practicar)

### Fase 3: iOS nativa
- SwiftUI + SwiftData
- Misma estructura de Supabase como backend compartido (sync web ↔ iOS)
- Tab bar: Home / History / Library / Search (similar a Palabros)
- Widget de home screen con chunk para repasar
- Notificaciones de repaso espaciado
- Dark mode nativo

### Fase 4: Integración Claude
- Endpoint API para import automático de sesiones
- Posibilidad de que la app llame a Claude para generar situaciones de práctica
- Review asistido: Claude evalúa si tu producción es natural o suena a traducción
