# YoTeTraduzco - Memoria del Proyecto

## Descripción
Aplicación multiplataforma para aprender vocabulario inglés → español. Permite traducir palabras, guardarlas con imágenes, categorizarlas gramaticalmente, escuchar pronunciación, y practicar con quizzes.

---

## Stack Tecnológico

### Web (React)
- **Framework**: React 19.2, TypeScript 5.9
- **Build**: Vite 7.2
- **Estilos**: Tailwind CSS 4.1 + CSS Variables
- **Backend**: Netlify Functions (serverless)
- **Base de datos**: Supabase PostgreSQL

### iOS (SwiftUI)
- **Framework**: SwiftUI (iOS 17+)
- **Arquitectura**: MVVM + @Observable
- **Dependencias**: supabase-swift, Kingfisher

---

## Estructura del Proyecto

```
/4. yotetraduzco-clean/
├── src/                           # Web (React)
│   ├── components/
│   │   ├── WordInput.tsx         # Formulario traducción + preview
│   │   ├── WordList.tsx          # Listado con búsqueda/filtros
│   │   ├── WordCard.tsx          # Card individual con edición
│   │   ├── WordOfTheDay.tsx      # Palabra del día
│   │   ├── Toast.tsx             # Notificaciones
│   │   ├── EmptyState.tsx        # Estado vacío
│   │   └── Quiz/
│   │       ├── Quiz.tsx          # Orquestador principal
│   │       ├── QuizSetup.tsx     # Configuración del quiz
│   │       ├── QuestionMultipleChoice.tsx
│   │       ├── QuestionWriteAnswer.tsx
│   │       └── QuizResults.tsx   # Resultados + errores
│   ├── lib/
│   │   ├── supabase.ts           # Cliente + tipos
│   │   └── constants.ts          # Categorías + colores
│   ├── App.tsx                   # Layout principal
│   └── index.css                 # Variables + estilos
│
├── ios/YoTeTraduzco/             # iOS (SwiftUI)
│   ├── App/                      # Entry point
│   ├── Models/                   # Palabra, Significado, Category
│   ├── ViewModels/               # AddWordViewModel, WordListViewModel
│   ├── Views/                    # WordListView, AddWordView, WordDetailView
│   │   └── Components/           # CategoryPill, SignificadoCard
│   ├── Services/                 # Supabase, Translation, Dictionary, Speech
│   └── Extensions/               # Colors
│
├── netlify/functions/            # Serverless APIs
│   ├── translate.ts              # DeepL
│   ├── get-image.ts              # Unsplash
│   └── get-suggestions.ts        # Datamuse
│
└── supabase/migrations/          # SQL migrations
```

---

## Credenciales

### Supabase
- **URL**: `https://mafbuoicsxaonfsxprip.supabase.co` (proyecto VIVO, con los datos — el de `.env`)
- **Proyecto**: yotetraduzco_clean
- **Tabla principal**: `palabras`
- **Panel SQL**: https://supabase.com/dashboard/project/mafbuoicsxaonfsxprip/sql
- ⚠️ Proyectos MUERTOS (Supabase los pausó/borró, no usar): `zgdrfdrsiulankhbyrtc` (aún hardcodeado en la app iOS), `mdjswqgqxnbyxnpmflos` (estaba en las env vars de Netlify hasta jul 2026)

### Netlify
- **Sitio en producción**: `yotetraduzco` (https://yotetraduzco.netlify.app) — deploy automático desde GitHub `main`
- **Sitio huérfano**: `glittery-crumble-c78529` — duplicado antiguo, candidato a borrar

### APIs (via Netlify Functions)
- **DeepL**: Traducción EN→ES
- **Unsplash**: Imágenes (50 req/hora)
- **Free Dictionary API**: Definiciones (primario)
- **Relyc API**: Diccionario (fallback)
- **Datamuse**: Sugerencias de spelling

---

## Funcionalidades Implementadas

### Core
- [x] Traducción EN → ES (DeepL)
- [x] Imágenes asociadas (Unsplash)
- [x] Gestión CRUD completo
- [x] Categorización gramatical (sustantivo, verbo, adjetivo, phrasal verb, adverbio, frase hecha)
- [x] Búsqueda y filtrado
- [x] Significados múltiples del diccionario
- [x] Traducción de definiciones
- [x] Pronunciación (Web Speech API / AVFoundation)

### Quiz/Review Mode (Web) - 9 Mayo 2026
- [x] Configuración: elegir cantidad (5/10/15/20) y filtrar por categoría
- [x] Ronda Multiple Choice: 4 opciones, feedback visual
- [x] Ronda Escribir: validación flexible (sin tildes/mayúsculas)
- [x] Resultados: puntuación circular, desglose por tipo, lista de errores
- [x] Repetir quiz o volver al diccionario

### Palabra del Día (Web) - 9 Mayo 2026
- [x] Selección aleatoria del vocabulario guardado
- [x] Persistencia diaria (localStorage)
- [x] Botón "Revelar traducción"
- [x] Pronunciación integrada
- [x] Muestra imagen y notas

---

## Base de Datos

### Tabla: `palabras`
```sql
id              SERIAL PRIMARY KEY
palabra_original TEXT NOT NULL
traduccion      TEXT NOT NULL
categoria       TEXT           -- sustantivo, verbo, etc.
color           TEXT           -- blue, green, purple, etc.
imagen_url      TEXT
notas           TEXT
significados    JSONB DEFAULT '[]'
created_at      TIMESTAMP DEFAULT NOW()
```

### Migración Pendiente
⚠️ Si no existe la columna `significados`, ejecutar:
```sql
ALTER TABLE palabras
ADD COLUMN IF NOT EXISTS significados JSONB DEFAULT '[]';
```

---

## Historial de Cambios

### 12 Julio 2026 - PWA + SRS (issues #1, #2, #16, #17)
**PWA instalable** (b22c60f): vite-plugin-pwa (manifest + SW autoUpdate), iconos minimalistas en `public/`, meta tags iOS. Instalada y verificada en el iPhone de Guiomar. Deploy = push a `main` (Netlify auto-despliega).

**SRS** (4c51050 + e1382b1): migración `add_srs_columns.sql` aplicada en producción; `src/lib/srs.ts` con la regla acordada: **fallo → vuelve al siguiente quiz; acierto → vuelve en 7 días; dominada con 3 aciertos netos**. El Quiz prioriza palabras con `proximo_repaso <= hoy` y guarda progreso por respuesta. `factor_facilidad` queda reservado (sin usar aún).

**Bug arreglado**: preguntas consecutivas del mismo tipo heredaban estado React (faltaba `key` en Quiz.tsx) — el quiz se quedaba bloqueado.

**Incidente resuelto**: las env vars de Netlify apuntaban a un Supabase muerto → diccionario vacío en producción. Corregidas vía CLI (sesión iniciada en este Mac). También hay token de Supabase CLI: la Management API (`POST /v1/projects/{ref}/database/query`) sirve para aplicar migraciones sin psql.

**Verificación E2E**: quiz jugado con Playwright headless contra la BD real (script desechable), datos restaurados después. Así se destapó que **"delight" está duplicada** (ids 34 y 52) → justifica #20.

**Estado del tablero**: cerradas #1 #2 #16 #17 · nuevas #20 (aviso de duplicados) y #21 (quiz con significados múltiples, alcance por definir con Guiomar) · **siguiente: #3 sesión de repaso diaria** ("Tienes N palabras para repasar hoy"). #18 medio hecha: instalación y datos verificados en iPhone real; falta probar micro/speech/push (condiciona M3).

### 9 Mayo 2026 - Quiz + Palabra del Día
**Archivos creados:**
- `src/components/WordOfTheDay.tsx`
- `src/components/Quiz/Quiz.tsx`
- `src/components/Quiz/QuizSetup.tsx`
- `src/components/Quiz/QuestionMultipleChoice.tsx`
- `src/components/Quiz/QuestionWriteAnswer.tsx`
- `src/components/Quiz/QuizResults.tsx`

**Archivos modificados:**
- `src/App.tsx` - Toggle Quiz/Diccionario, integración WordOfTheDay
- `src/index.css` - Estilos para Quiz y Word of the Day (~600 líneas)

### 17 Abril 2026 - Múltiples Significados (iOS)
- `Services/DictionaryService.swift`
- `Views/Components/SignificadoCard.swift`
- Modificaciones en Models, ViewModels, Views

---

## Roadmap

### Fase 5: iOS Nativas (Pospuesta)
- [ ] Dark mode adaptativo
- [ ] Spotlight Search
- [ ] Widget
- [ ] Accesibilidad mejorada

### Fase 6: Features Avanzadas
- [x] Quiz / Review mode (Web)
- [x] Palabra del día (Web)
- [ ] Dashboard con estadísticas
- [ ] Estadísticas visuales

### Fase 7: Lanzamiento
- [ ] App Icon
- [ ] Launch screen
- [ ] Onboarding
- [ ] TestFlight
- [ ] App Store

---

## Comandos

```bash
# Web - Desarrollo
cd "/Users/guiomar.romero/4. yotetraduzco-clean"
npm run dev          # Servidor dev (localhost:5173)
npm run build        # Build producción
npm run preview      # Preview build

# iOS - Xcode
open "/Users/guiomar.romero/4. yotetraduzco-clean/ios/YoTeTraduzco.xcodeproj"
```

---

## Netlify Functions

| Función | Método | Body | Retorno |
|---------|--------|------|---------|
| `translate` | POST | `{ word }` | `{ originalWord, translation }` |
| `get-image` | POST | `{ query }` | `{ imageUrl }` |
| `get-suggestions` | POST | `{ word }` | `{ suggestions[] }` |
