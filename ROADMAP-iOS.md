# YoTeTraduzco - Roadmap iOS App

## Estado actual (marzo 2026)

- **Web app**: React 19 + Vite + Tailwind, desplegada en Netlify
- **iOS app**: SwiftUI + MVVM, en desarrollo activo
- **Backend**: Supabase (proyecto: `zgdrfdrsiulankhbyrtc`)
- **DB**: Tabla `palabras` restaurada (schema alineado web + iOS)
- **APIs**: DeepL (traducción via Netlify Functions), Unsplash (imágenes via Netlify Functions), Free Dictionary API (clasificación directa desde iOS)

---

## Fase 0: Alinear base de datos — COMPLETADA

- [x] Adaptar schema de `palabras` para que funcione con web + iOS
  - Renombrar `fecha_creada` → `created_at`
  - Añadir columnas `color` e `imagen_url`
  - Mantener columnas extra del backup (`etiquetas`, `tema`, `frecuencia_uso`)
- [x] Verificar que la web app funciona con la DB nueva
- [ ] Actualizar variables de entorno en Netlify (pendiente deploy)

---

## Fase 1: Proyecto Xcode + Arquitectura base — COMPLETADA

- [x] Crear proyecto iOS en SwiftUI (target iOS 17+) con xcodegen
- [x] Configurar SPM: `supabase-swift` 2.0+, `Kingfisher` 8.0+
- [x] Arquitectura MVVM: `Models/`, `ViewModels/`, `Views/`, `Services/`, `Extensions/`
- [x] Supabase client configurado con URL + anon key (Session Pooler IPv4)
- [x] Modelo `Palabra` con CodingKeys para snake_case, `Hashable`
- [x] Modelos `PalabraInsert` y `PalabraUpdate` para mutaciones

---

## Fase 2: Sistema de diseño iOS — COMPLETADA

- [x] Paleta de colores trasladada de web a SwiftUI (`Colors.swift`)
  - Indigo, Violet, Emerald, Rose, Amber, Sky + escala neutral 50-900
  - `LinearGradient.appPrimary` (indigo → violet)
- [x] Tipografia: `.system(.serif)` para display, `.system` para body
- [x] Componentes: WordCardView, CategoryPill, toast overlay
- [x] Color bar lateral (5px) en WordCardView por categoría
- [ ] **Dark mode adaptativo** — colores hardcoded no se adaptan (ver Fase 5)

---

## Fase 3: Pantallas principales — COMPLETADA (con mejoras pendientes)

### 3.1 — Lista de palabras (Home)
- [x] NavigationStack con título "Yo te traduzco"
- [x] Barra de búsqueda nativa (`searchable`)
- [x] Filtro por categoría (Menu con checkmark)
- [x] ScrollView + LazyVStack de WordCards
- [x] Pull-to-refresh (`refreshable`)
- [x] Empty state cuando no hay palabras
- [x] NavigationLink a WordDetailView
- [ ] Contador de palabras en header

### 3.2 — Añadir palabra (Traducir tab)
- [x] Input card con TextField + botón "Traducir"
- [x] Autocorrector configurable desde Ajustes
- [x] `.keyboardType(.asciiCapable)` + `.textInputAutocapitalization(.never)`
- [x] Preview card tras traducción: imagen, word pair, categoría, notas
- [x] Auto-clasificación via Free Dictionary API (ClassificationService)
- [x] Selector de categoría 2 columnas (LazyVGrid + CategoryPill)
- [x] Campo de notas
- [x] CTAs horizontales: "Descartar" (bordered) + "Guardar" (filled) — equal visual weight
- [x] Toast de confirmación con auto-dismiss
- [x] Imagen compacta (140px) con overlay controls (cambiar/eliminar)
- [x] Pronunciación EN/ES con speaker buttons

### 3.3 — Detalle de palabra
- [x] Vista editable completa (no solo lectura)
- [x] Imagen con overlay controls (cambiar/eliminar)
- [x] Pronunciación EN y ES (AVSpeechSynthesizer)
- [x] Categoría editable (2-col grid con CategoryPill)
- [x] Notas editables
- [x] "Guardar cambios" aparece como `safeAreaInset` cuando `hasChanges = true`
- [x] Eliminar con `confirmationDialog`

### 3.4 — Ajustes
- [x] Toggle autocorrector con descripción
- [x] Selector dark mode: Sistema / Claro / Oscuro
- [x] Sección "Acerca de" con versión
- [x] `preferredColorScheme` aplicado desde ContentView

---

## Fase 4: Servicios y APIs — COMPLETADA

- [x] **SupabaseService**: CRUD completo (fetchAll con search/category, insert, update, delete)
  - Filtros (.or, .eq) antes de transforms (.order) — fix aplicado
- [x] **TranslationService**: DeepL + Unsplash via Netlify Functions proxy
- [x] **SpeechService**: AVSpeechSynthesizer para EN (en-US) y ES (es-ES)
- [x] **ClassificationService**: Free Dictionary API + reglas multi-word
  - 1 palabra → API lookup (noun→sustantivo, verb→verbo, etc.)
  - 2 palabras con partícula → phrasal verb
  - 3+ palabras → frase hecha

---

## Fase 5: Funcionalidades nativas iOS — EN PROGRESO

- [x] `sensoryFeedback(.selection)` en CategoryPill
- [x] AVSpeechSynthesizer para pronunciación
- [ ] **Dark mode adaptativo** — PENDIENTE (colores RGB hardcoded no se adaptan)
- [ ] Spotlight Search — indexar palabras
- [ ] Widget — palabra del día en home screen
- [ ] Accesibilidad — VoiceOver labels, Dynamic Type

---

## Fase 6: Funcionalidades avanzadas — PLANIFICADA

> Ver `propuesta-research-discovery.md` para el análisis completo

- [ ] Dashboard con contadores (guardadas, aprendidas, recientes)
- [ ] Quiz / Review mode (reconocimiento → producción)
- [ ] Ciclo de aprendizaje: Nuevo → Practicado → Automatizado
- [ ] Palabra del día
- [ ] Estadísticas visuales
- [ ] Evolución a chunk cards (expresiones, no solo palabras)
- [ ] Import desde sesiones Claude

---

## Fase 7: Polish y lanzamiento

- [ ] App Icon (gradiente indigo→violet)
- [ ] Launch screen
- [ ] Onboarding mínimo
- [ ] TestFlight beta
- [ ] App Store submission

---

## Estructura de archivos actual

```
ios/YoTeTraduzco/
├── App/
│   ├── ContentView.swift          ← TabView + dark mode
│   └── YoTeTraduzcoApp.swift
├── Models/
│   ├── Palabra.swift              ← Palabra, PalabraInsert, PalabraUpdate
│   ├── Category.swift             ← WordCategory enum (6 categorías)
│   └── AppSettings.swift          ← @Observable, UserDefaults
├── ViewModels/
│   ├── AddWordViewModel.swift     ← traducción + preview + save
│   └── WordListViewModel.swift    ← fetch + search + filter
├── Views/
│   ├── WordListView.swift         ← Home tab
│   ├── AddWordView.swift          ← Traducir tab
│   ├── WordDetailView.swift       ← Detalle editable
│   ├── SettingsView.swift         ← Ajustes tab
│   └── Components/
│       ├── WordCardView.swift     ← Tarjeta en lista
│       ├── CategoryPill.swift     ← Selector de categoría
│       └── EmptyStateView.swift
├── Services/
│   ├── SupabaseService.swift      ← CRUD Supabase
│   ├── TranslationService.swift   ← DeepL + Unsplash
│   ├── SpeechService.swift        ← AVSpeechSynthesizer
│   └── ClassificationService.swift ← Free Dictionary API
└── Extensions/
    └── Colors.swift               ← Paleta completa
```
