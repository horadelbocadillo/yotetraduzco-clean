# Yo te traduzco — Product Design: Research & Discovery

> Análisis comparativo, diagnóstico de gaps, y propuesta de implementación para evolucionar la app iOS.
> Fecha: marzo 2026

---

## 1. Research: Análisis del competidor (Palabros)

### 1.1 Arquitectura de información

Palabros organiza su experiencia en 4 niveles de profundidad:

```
Dashboard (resumen)
  ├── Saved / Learned counters
  ├── Recent words (últimas 5)
  └── Word of the day

Library (colección)
  ├── Saved tab (palabras activas)
  ├── Learned tab (palabras graduadas)
  └── Filtro por categoría gramatical

Word Detail (ficha)
  ├── Palabra + categoría badge
  ├── Definiciones numeradas con tipo
  └── Acciones: guardar / eliminar / compartir

Review (práctica activa)
  ├── Setup: cantidad + dificultad
  ├── Quiz: 4 opciones, 1 correcta
  └── Feedback inmediato (verde/rojo)
```

### 1.2 Modelo de engagement

Palabros sigue un ciclo de 3 fases que mantiene al usuario volviendo:

```
DESCUBRIR → GUARDAR → PRACTICAR → GRADUAR
    ↑                                  │
    └──────────────────────────────────┘
         (ciclo continuo)
```

- **Descubrir**: búsqueda de palabras en diccionarios externos
- **Guardar**: la palabra pasa a "Saved" (contador sube)
- **Practicar**: quiz de reconocimiento (4 opciones)
- **Graduar**: si aciertas consistentemente → "Learned" (satisfacción)

El dashboard con counters Saved/Learned crea un **feedback loop visual**: quieres ver el contador de Learned subir.

### 1.3 Patrones de diseño observados

| Patrón | Implementación | Efecto |
|---|---|---|
| **Progressive disclosure** | Lista (mínimo) → Detalle (completo) → Quiz (activo) | Reduce cognitive load |
| **Color-coding consistente** | Mismo color por categoría en toda la app | Pattern recognition inmediato |
| **Gamificación ligera** | Counters, progreso en quiz, Easy/Hard | Motivación sin presión |
| **Dark mode nativo** | Colores adaptativos, contraste correcto | Comfort visual |
| **Binary actions** | Guardar (✓ verde) / Eliminar (🗑 rojo) | Decisión rápida |

---

## 2. Discovery: Diagnóstico de YoTeTraduzco

### 2.1 Lo que tenemos y Palabros no

| Ventaja nuestra | Impacto en aprendizaje |
|---|---|
| **Imágenes (Unsplash)** | Dual coding: memoria visual + verbal. Retención significativamente mayor |
| **Pronunciación audio** | Producción oral, no solo reconocimiento visual |
| **Notas personales** | Contexto propio = encoding más profundo |
| **Auto-clasificación** | Menos fricción al guardar = más palabras guardadas |
| **Traducción automática** | Flujo más rápido que buscar en diccionario |
| **Phrasal verbs + frases hechas** | Categorías que Palabros no tiene |

### 2.2 Lo que nos falta (gaps críticos)

| Gap                             | Impacto                                                                                                                                    | Prioridad  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| **No hay ciclo de aprendizaje** | Sin práctica, guardar palabras es inútil. Es la diferencia entre un diccionario y una herramienta de aprendizaje                           | 🔴 Crítica |
| **Dark mode roto**              | Colores hardcoded no adaptan. En modo oscuro: fondos blancos, textos ilegibles, contraste roto                                             | 🔴 Crítica |
| **No hay dashboard**            | Sin métricas de progreso, no hay motivación para volver                                                                                    | Baja       |
| **No hay review/quiz**          | Sin práctica activa, la retención cae drásticamente                                                                                        | 🟡 Alta    |
| **No hay estado de progreso**   | No sabes qué palabras dominas y cuáles no                                                                                                  | 🟡 Alta    |
| **No hay palabra del día**      | Pierde un trigger de engagement diario pero esta palabra debe ser de las que yo he consultado, de las que forman parte de la base de datos | 🟢 Media   |
| **No hay scroll en la home**    | No puedes hacer scroll para ver las palabras buscada ni paginado                                                                           | 🟢 Media   |
| **No hay diccionario**          | sólo hay traducción de uno de los múltiples significados que puede tener una palabra con lo que se está perdiendo parte del aprendizage    | 🔴 Crítica |

### 2.3 Diagnóstico técnico: Dark Mode

**Problema raíz**: todos los colores en `Colors.swift` son valores RGB fijos. No usan `UIColor { traitCollection in }` ni Asset Catalog con variantes light/dark.

**Impacto concreto en dark mode**:

| Elemento | Light mode | Dark mode (roto) |
|---|---|---|
| `Color.neutral50` (fondos) | Gris muy claro ✅ | Gris muy claro sobre negro ⚠️ |
| `.white` (cards) | Blanco sobre gris ✅ | Blanco sobre negro — deslumbra ⚠️ |
| `Color.neutral900` (texto) | Casi negro sobre blanco ✅ | Casi negro sobre negro — invisible ❌ |
| `Color.neutral500` (secondary) | Gris medio sobre blanco ✅ | Gris medio sobre negro — bajo contraste ⚠️ |
| `.background(.white)` en cards | Tarjeta sobre fondo ✅ | Bloque blanco flotando ⚠️ |

**Solución**: crear pares adaptativos que inviertan la escala en dark mode: Plantear la opción más sencilla con colores sencillos como tiene Palabros

```swift
// Antes (hardcoded):
static let neutral50 = Color(red: 250/255, ...)

// Después (adaptativo):
static let surfaceBackground = Color(UIColor { traits in
    traits.userInterfaceStyle == .dark
        ? UIColor(red: 23/255, ...)   // neutral900
        : UIColor(red: 250/255, ...)  // neutral50
})
```

---

## 3. Propuesta de implementación

### Sprint 1: Dark Mode (1-2 días)

**Objetivo**: que la app se vea correcta en los tres modos (Sistema/Claro/Oscuro).

**Tareas**:
1. Crear semantic color tokens en `Colors.swift`:
   - `Color.surfaceBackground` — fondo principal (neutral50 ↔ neutral900)
   - `Color.surfacePrimary` — cards (white ↔ neutral800)
   - `Color.surfaceSecondary` — inputs, pills no seleccionadas (neutral100 ↔ neutral700)
   - `Color.textPrimary` — texto principal (neutral900 ↔ neutral50)
   - `Color.textSecondary` — texto secundario (neutral600 ↔ neutral400)
   - `Color.textTertiary` — labels, captions (neutral500 ↔ neutral400)
   - `Color.border` — bordes y dividers (neutral200 ↔ neutral700)
2. Reemplazar colores hardcoded en todas las vistas:
   - `AddWordView`: `.white` → `.surfacePrimary`, `Color.neutral50` → `.surfaceBackground`
   - `WordDetailView`: ídem
   - `WordListView`: ídem
   - `CategoryPill`: `Color.neutral100` → `.surfaceSecondary`
   - `WordCardView`: `.white` → `.surfacePrimary`
3. Verificar que los colores de categoría (appIndigo, appEmerald, etc.) tienen suficiente contraste en ambos modos — estos probablemente no necesiten cambio
4. Ajustar sombras: en dark mode las sombras no se ven, usar `.shadow(color:)` con opacidad adaptativa o eliminarlas

**Resultado**: app visualmente coherente en light y dark mode.

---

### Sprint 2: Modelo de progreso (2-3 días)

**Objetivo**: añadir el ciclo de aprendizaje que falta.

**Cambios en modelo de datos**:

```sql
ALTER TABLE palabras ADD COLUMN estado TEXT DEFAULT 'nueva';
ALTER TABLE palabras ADD COLUMN veces_acertada INTEGER DEFAULT 0;
ALTER TABLE palabras ADD COLUMN veces_fallada INTEGER DEFAULT 0;
ALTER TABLE palabras ADD COLUMN ultimo_repaso TIMESTAMPTZ;
```

Estados: `nueva` → `practicando` → `aprendida`
- `nueva`: recién guardada, sin repasar
- `practicando`: ha sido repasada al menos 1 vez
- `aprendida`: acertada 3+ veces consecutivas (configurable)

**Tareas**:
1. Migrar schema Supabase (4 columnas nuevas)
2. Actualizar modelo `Palabra.swift` con campos nuevos
3. Añadir badge de estado en WordCardView (dot: ○ nueva, ◐ practicando, ● aprendida)
4. Lógica de graduación automática en el servicio de quiz

---

### Sprint 3: Dashboard (2-3 días)

**Objetivo**: pantalla home con métricas y accesos rápidos.

**Diseño**:

```
┌─────────────────────────────────────┐
│  Yo te traduzco                     │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │    12     │  │     3    │        │
│  │ Guardadas │  │Aprendidas│        │
│  └──────────┘  └──────────┘        │
│                                     │
│  PALABRA DEL DÍA                    │
│  ┌─────────────────────────────┐    │
│  │ 🔵 Serendipity              │    │
│  │    Serendipia               │    │
│  │    [imagen]                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  RECIENTES                          │
│  ┌─ Straightforward ──────────┐    │
│  ├─ Nevertheless ─────────────┤    │
│  └─ Get along with ───────────┘    │
│                                     │
│  [Repasar 5 palabras]              │
└─────────────────────────────────────┘
```

**Tareas**:
1. Crear `DashboardView.swift` como nuevo tab (reemplaza WordListView como Home)
2. Queries Supabase: count by estado, fetch recientes (limit 5), random palabra del día
3. Card de métricas (2 columnas, equal width)
4. Palabra del día
5. Lista de recientes (compact, sin imagen)
6. CTA "Repasar N palabras" que lanza el quiz
7. Reorganizar TabView: Dashboard / Palabras / Traducir / Ajustes

---

### Sprint 4: Quiz — Reconocimiento (3-4 días)

**Objetivo**: modo review tipo Palabros (4 opciones, 1 correcta).

**Flujo**:
```
Setup → Quiz loop → Resultado
```

**Setup modal**:
- Selector: 5 / 10 / 15 / 20 palabras
- Modo: Fácil (EN→ES) / Difícil (ES→EN)
- Prioridad: palabras sin repasar primero, luego más antiguas
- Botón "Empezar repaso"

**Quiz screen**:
- Barra de progreso (3/10)
- Palabra presentada (con imagen si existe)
- 4 opciones de respuesta (1 correcta + 3 distractoras de la misma categoría)
- Feedback: verde (acertada) / rojo (fallada) con la respuesta correcta
- Transición automática tras 1.5s

**Pantalla resultado**:
- Puntuación: 8/10
- Lista de errores con la respuesta correcta
- Botón "Volver al dashboard"

**Tareas**:
1. `ReviewSetupView.swift` — modal de configuración
2. `ReviewQuizView.swift` — pantalla de pregunta + feedback
3. `ReviewResultView.swift` — resumen final
4. `ReviewViewModel.swift` — lógica de selección de palabras, barajado, scoring, actualización de estado
5. Actualizar `veces_acertada` / `veces_fallada` / `ultimo_repaso` / `estado` en Supabase tras cada quiz
6. Algoritmo de distractoras: misma categoría cuando sea posible, random si no hay suficientes

---

### Sprint 5: Chunks + Integración con práctica en Claude Desktop (por definir)

> **PENDIENTE DE DISEÑO** — Este sprint requiere definir el flujo completo entre las sesiones de práctica de inglés en Claude Desktop y la app iOS. Los chunks (expresiones, phrasal verbs, discourse markers, etc.) que surgen durante la práctica oral con Claude deben poder llegar a YoTeTraduzco para ser repasados.

**Preguntas abiertas**:
- ¿Cómo se exportan los chunks desde Claude Desktop? (JSON manual, API, copy-paste estructurado)
- ¿El modelo de datos actual (`palabras`) es suficiente o necesita evolucionar a chunk cards con campos como "en vez de decir", "para qué sirve", "mi ejemplo"?
- ¿Las categorías actuales (sustantivo, verbo, etc.) son suficientes o hay que añadir categorías funcionales (muletillas pro, conectores, combos)?
- ¿El quiz de reconocimiento (Sprint 4) se adapta bien a chunks o necesita un modo de producción (escribir en vez de elegir)?
- ¿Qué papel juega la práctica con Claude en el ciclo de aprendizaje? ¿Practicar con Claude cuenta como "repaso"?

**Dirección probable**:
1. Evolución del modelo de datos de "palabra → traducción" a "chunk card" con metadatos de producción
2. Mecanismo de import desde sesiones Claude (formato JSON definido entre app y proyecto Claude Desktop)
3. Categorías funcionales además de gramaticales
4. Quiz adaptado a chunks (producción, no solo reconocimiento)
5. Sincronización del estado de progreso: lo que practicas con Claude alimenta el estado en la app

> Ver `analisis-y-propuesta-chunks.md` sección 4 para el modelo de chunk card propuesto.

---

## 4. Roadmap de priorización

```
AHORA (semana 1-2)
├── Sprint 1: Dark mode adaptativo ← bloquea todo lo visual
└── Sprint 2: Modelo de progreso  ← bloquea quiz y dashboard

SIGUIENTE (semana 3-4)
├── Sprint 3: Dashboard
└── Sprint 4: Quiz reconocimiento

POR DEFINIR
└── Sprint 5: Chunks + integración Claude Desktop
    ← requiere diseñar el flujo práctica → import → repaso

BACKLOG
├── Quiz de producción (escribir, no solo elegir)
├── Estadísticas y distribución visual
├── Widget de palabra del día
├── Notificaciones de repaso espaciado
├── Spotlight Search
└── App Store submission
```

---

## 5. Métricas de éxito

| Métrica | Baseline (hoy) | Target Sprint 4 |
|---|---|---|
| Funcionalidades vs Palabros | 40% | 80% |
| Dark mode funcional | No | Sí |
| Ciclo de aprendizaje | No existe | Completo (reconocimiento) |
| Dashboard | No | Sí |
| Chunks desde Claude Desktop | No existe | Por definir en Sprint 5 |

---

## 6. Ventaja competitiva

**Paridad con Palabros** (tras Sprint 4):
- Dashboard, quiz reconocimiento, ciclo de aprendizaje, dark mode, filtros, color-coding

**Ventajas que ya tenemos sobre Palabros**:
- Imágenes ilustrativas (dual coding = mejor retención)
- Pronunciación audio en ambos idiomas
- Notas personales con contexto propio
- Auto-clasificación inteligente (phrasal verbs, frases hechas)
- Traducción automática (no solo diccionario)

**Diferenciación real** (Sprint 5 — por definir):
- Integración directa con práctica oral en Claude Desktop
- Chunk cards: expresiones completas, no solo palabras sueltas
- Campo "en vez de decir" (sustitución de hábito lingüístico)
- Ciclo: practicas con Claude → registras el chunk → lo repasas en la app → lo automatizas
