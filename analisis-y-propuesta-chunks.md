# Yo te traduzco — Análisis comparativo con Palabros y propuesta de evolución

## 1. Análisis de Palabros (basado en capturas reales)

**App:** Palabros - Dictionary (iOS)
**Developer:** Nacho Cerrato Ruiz (Sevilla)
**Lanzamiento:** 20 febrero 2026 | **Versión actual:** 1.1.3
**Tamaño:** 9.1 MB | **Modelo:** Freemium (Pro: 3.99€/mes, 9.99€/año, 49.99€ lifetime)
**Fuentes de datos:** RAE API (ES), Free Dictionary API (EN), Relycapp (backup EN)

### Funcionalidades documentadas (capturas IMG_1120–IMG_1129)

| Pantalla | Funcionalidad | Detalles UX |
|---|---|---|
| **Dashboard** (IMG_1123) | Home con métricas: Saved (20), Learned (0). Sección "Recent" con últimas 5 palabras. "Word of the day" destacada | Tab principal. Información de progreso a un vistazo. Color-coded dots por categoría |
| **Library — Saved** (IMG_1124) | Lista de 20 palabras guardadas. Cada entrada: bullet de color + palabra + definición truncada | Tab estantería. Scroll vertical. Filtrable por categoría |
| **Library — Learned** (IMG_1125) | Tab separada para palabras graduadas. Vacía (0 words) — indica que el ciclo de aprendizaje existe pero no se ha completado | Misma estructura que Saved |
| **Filtro por categoría** (IMG_1127) | Modal con: Nouns (circle morado), Adjectives (circle rosa), Verbs (circle naranja), Adverbs (circle verde) | Color-coding consistente en toda la app |
| **Word detail** (IMG_1128) | Palabra "Sung", categoría "Noun", definiciones numeradas (1, 2, 3) con tipo (Intr., Trans.). Botones: guardar (✓ verde), eliminar (papelera roja), compartir | Vista detalle limpia. Acciones binarias claras |
| **Quiz — Pregunta** (IMG_1120, 1121, 1122) | "Test your vocabulary". Barra de progreso (2/20). Palabra + categoría badge. 4 opciones de respuesta. Feedback: verde (correcto) / rojo (incorrecto) con definición | Formato reconocimiento. Progreso visible |
| **Quiz — Setup** (IMG_1126) | Modal: selector cantidad de palabras (5, 10, 15, 20). Toggle Easy/Hard. Botón "Start review" | Configuración rápida pre-quiz |
| **Settings** (IMG_1129) | Data sources: RAE API, Free Dictionary API, Relycapp. "Delete all words". About/Walkthrough | Panel de configuración simple |

### Lo que Palabros hace bien

- **Ciclo de aprendizaje cerrado**: Guardar → Review quiz → Graduar (Saved → Learned)
- **Color-coding gramatical** consistente en toda la app (dots en listas, badges en detail)
- **Información progresiva**: lista (mínima) → detalle (completa) → quiz (activa)
- **Dark mode nativo** bien implementado
- **Ligereza**: 9.1 MB, sin ads, UI mínima
- **Dashboard motivacional**: counters, recientes, palabra del día

### Limitaciones

- Unidad = palabra individual, no chunks ni expresiones
- Categorías solo gramaticales (noun, verb, adjective, adverb)
- Definiciones de diccionarios genéricos, sin producción propia
- Review de **reconocimiento** (elige 1 de 4), no de **producción** (genera tú)
- Sin contexto de uso propio ni notas personales
- Sin imágenes ilustrativas

---

## 2. Estado actual de "Yo te traduzco" (marzo 2026)

**Stack iOS:** SwiftUI + MVVM + Supabase + Kingfisher
**Stack Web:** React 19 + TypeScript + Tailwind CSS 4 + Supabase + Netlify

### Funcionalidades implementadas

| Funcionalidad | iOS | Web |
|---|---|---|
| **Traducción EN→ES** (DeepL) | ✅ | ✅ |
| **Imagen ilustrativa** (Unsplash) | ✅ | ✅ |
| **Pronunciación EN/ES** | ✅ AVSpeechSynthesizer | ✅ Web Speech API |
| **Categorización automática** | ✅ Free Dictionary API | ❌ Manual |
| **Categorías con color-coding** | ✅ 6 categorías, dots | ✅ 5 categorías, emoji+color |
| **CRUD completo** | ✅ | ✅ |
| **Búsqueda** | ✅ searchable | ✅ texto libre |
| **Filtro por categoría** | ✅ Menu | ✅ dropdown |
| **Edición inline** | ✅ categoría, notas, imagen | ✅ |
| **Notas personales** | ✅ | ✅ |
| **Dark mode** | ⚠️ Mecanismo existe, colores no adaptan | ❌ Solo light |
| **Dashboard** | ❌ | ❌ |
| **Quiz / Review** | ❌ | ❌ |
| **Ciclo aprendizaje** | ❌ | ❌ |
| **Estadísticas** | ❌ | ❌ |
| **Palabra del día** | ❌ | ❌ |

### Lo que tenemos mejor que Palabros

- **Imágenes ilustrativas** — visual memory aid que Palabros no tiene
- **Notas personales** — contexto propio, no solo definiciones de diccionario
- **Traducción automática** — no solo búsqueda en diccionario
- **Pronunciación en ambos idiomas** — Palabros solo muestra texto
- **Clasificación automática inteligente** — phrasal verbs y frases hechas detectadas
- **Stack propio** — Supabase como backend, contenido generado por el usuario

---

## 3. Comparación directa

| Aspecto | Palabros | Yo te traduzco |
|---|---|---|
| **Unidad** | Palabra individual | Palabra o frase |
| **Fuente de datos** | APIs de diccionario | Producción propia + DeepL + Unsplash |
| **Categorización** | Gramatical (4: noun, verb, adj, adv) | Gramatical+funcional (6: +phrasal verb, +frase hecha) |
| **Imágenes** | No | Sí (Unsplash) |
| **Notas** | No | Sí |
| **Pronunciación** | No (solo texto) | Sí (EN + ES con audio) |
| **Ciclo de aprendizaje** | Saved → Review → Learned | No existe |
| **Quiz** | Reconocimiento (4 opciones) | No existe |
| **Dashboard** | Saved/Learned + recientes + word of day | No existe |
| **Dark mode** | Sí (nativo, bien implementado) | Parcial (mecanismo ok, colores no adaptan) |
| **Plataforma** | iOS nativa | iOS nativa + Web |
| **Peso** | 9.1 MB | ~15 MB (estimado con Kingfisher) |

---

## 4. Propuesta de evolución

### Fase A: Paridad competitiva con Palabros

Implementar las funcionalidades core que Palabros tiene y nosotros no:

1. **Dashboard** — contadores, recientes, palabra del día
2. **Quiz de reconocimiento** — formato 4 opciones como Palabros
3. **Ciclo Saved → Learned** — marcar palabras como aprendidas
4. **Dark mode completo** — colores adaptativos

### Fase B: Diferenciación (lo que Palabros no puede hacer)

Aprovechar nuestras ventajas únicas:

1. **Quiz de producción** — además del reconocimiento, que el usuario produzca la traducción
2. **Review con imágenes** — aprovechar las imágenes como pista visual
3. **Review con audio** — escuchar la palabra y producir la traducción
4. **Estadísticas por categoría** — distribución visual del vocabulario
5. **Repaso espaciado** — priorizar palabras antiguas sin practicar

### Fase C: Evolución a chunk cards

La unidad evoluciona de "palabra → traducción" a un **chunk con metadatos de producción oral**:

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
│                                                  │
│ ESTADO: ○ Nuevo → ◐ Practicado → ● Automatizado │
└──────────────────────────────────────────────────┘
```

**Categorías funcionales** (sustituyen a las gramaticales para chunks):

| Categoría              | Color       | Contenido                                                             |
| ---------------------- | ----------- | --------------------------------------------------------------------- |
| **Muletillas pro**     | Verde       | Hilar ideas sin sonar robot: *having said that, the thing is, I mean* |
| **Combos que molan**   | Azul        | Parejas que van juntas: *make a decision, heavy rain*                 |
| **Phrasal verbs**      | Naranja     | Los de siempre: *come up with, figure out, put up with*               |
| **Frases hechas**      | Violeta     | Bloques que se dicen tal cual: *it's no big deal, let's call it a day* |
| **Trucos de fábrica**  | Rosa        | Patrones que multiplican vocabulario: *-ish, un-, over-*              |
| **Conectores**         | Celeste     | Enganchar ideas: *on top of that, by the way*                        |

**Campo clave "en vez de decir"**: no es traducción, es **sustitución de hábito**. Captura la traducción literal que tu cerebro quiere producir desde el español y la pone al lado de la alternativa nativa.

### Fase D: Integración Claude

- Import automático de chunks desde sesiones de práctica
- Review asistido: Claude evalúa si tu producción suena natural
- Generación de situaciones de práctica contextualizadas
