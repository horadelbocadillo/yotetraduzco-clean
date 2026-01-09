**🗺️ ROADMAP COMPLETO - "YOTETRADUZCO"**

  **📋 RESUMEN DE TAREAS**

  **Bugs a corregir:** 3
  **Mejoras UX:** 1
  **Feature principal (Diccionario):** 4
---

  **🎯 FASE 1: QUICK WINS (Bugs & UX) - ~2 horas**

  **1.1 Bug: Buscador con cada letra ⚡ Prioridad Alta**

  **Problema:** El buscador de palabras guardadas busca instantáneamente con cada letra

  **Solución:** Añadir debounce de 300ms en WordList

  **Archivos:** src/components/WordList.tsx

  **Impacto:** Menos queries a Supabase, mejor rendimiento

  **Tiempo:** 15 minutos


  **1.2 Bug: Botones mal dimensionados ⚡ Prioridad Alta**

  **Problema:** Botones de eliminar/editar en cards tienen mal tamaño

  **Solución:** Ajustar CSS de .icon-btn o botones en WordCard

  **Archivos:** src/components/WordCard.tsx, src/index.css

  **Impacto:** Mejor accesibilidad y UX móvil

  **Tiempo:** 20 minutos


  **1.3 Bug: Cancelar no limpia input ⚡ Prioridad Media**

  **Problema:** Al cancelar traducción, no vuelve el foco al input limpio

  **Solución:** En handleCancel() → limpiar word + focus input

  **Archivos:** src/components/WordInput.tsx

  **Impacto:** Mejor flujo de interacción

  **Tiempo:** 10 minutos


  **1.4 UX: Mover "Añadir imagen" a posterior 🔄 Prioridad Media**

  **Problema:** No se puede añadir imagen después de guardar

  **Solución:**

  - Quitar checkbox "Incluir imagen" del input inicial

  - Añadir opción "Añadir/Cambiar imagen" en preview y en card detalle

  - Siempre pedir imagen por defecto, pero permitir cambiarla después

  **Archivos:**

  - src/components/WordInput.tsx (quitar checkbox)

  - src/components/WordCard.tsx (añadir botón "Cambiar imagen")

  **Impacto:** Mayor flexibilidad, mejor UX

  **Tiempo:** 45 minutos

  **⏱️ Total Fase 1: ~1.5 horas**
   ---

  **🚀 FASE 2: DICCIONARIO HÍBRIDO (Core Feature) - ~4 horas**

  **2.1 Backend: Free Dictionary API 🔧**

  **Tarea:** Crear función Netlify para obtener definiciones

  **Archivo:** netlify/functions/get-definitions.ts

  // Endpoint: https://api.dictionaryapi.dev/api/v2/entries/en/{word}

  // Devuelve: múltiples definiciones con part of speech, ejemplos

  **Tiempo:** 30 minutos

  **2.2 Backend: Traducir definiciones 🔧**

  **Tarea:** Modificar o crear función que traduce cada definición

  **Opciones:**

  - A) Extender translate.ts para aceptar array de definiciones

  - B) Crear translate-definitions.ts específica

  **Archivo:** netlify/functions/translate-definitions.ts

  **Tiempo:** 30 minutos

  **2.3 Base de datos: Nuevo campo 💾**

  **Tarea:** Añadir campo opcional definicion a tabla palabras

  ALTER TABLE palabras

  ADD COLUMN definicion TEXT,

  ADD COLUMN part_of_speech VARCHAR(50);

  **Archivo:** Migration en Supabase

  **Tiempo:** 10 minutos

  **2.4 Frontend: UI de selección de acepciones 🎨**

  **Tarea:** Nuevo componente o sección en preview

  **Diseño:**
  ┌─────────────────────────────────────┐

  │ "run" tiene múltiples significados  │

  ├─────────────────────────────────────┤

  │ ⦿ correr (verb)                     │

  │   to move at speed faster than walk │

  │                                      │

  │ ○ dirigir (verb)                    │

  │   to be in charge of; manage        │

  │                                      │

  │ ○ carrera (noun)                    │

  │   an act of running                 │

  └─────────────────────────────────────┘

  **Archivos:** src/components/WordInput.tsx

  **Componente nuevo:** DefinitionSelector.tsx (opcional)

  **Tiempo:** 1.5 horas

  **2.5 Frontend: Lógica de flujo 🔄**

  **Flujo actualizado:**

  1. Usuario escribe "run" → click Traducir

  2. Llamar get-definitions.ts

  3. Si múltiples definiciones:

     → Mostrar selector

     → Usuario elige

     → Traducir definición elegida con DeepL

  4. Si solo 1 definición o no encontrada:

     → Traducir directo con DeepL (como ahora)

  5. Mostrar preview con definición

  6. Guardar con definicion + part__of__speech

  **Archivos:** src/components/WordInput.tsx

  **Tiempo:** 1 hora 

  **2.6 Frontend: Mostrar definición en cards 👁️**

  **Tarea:** Mostrar definición guardada en WordCard

  **Diseño:** Badge pequeño con part of speech + definición en tooltip o nota

  **Archivos:** src/components/WordCard.tsx

  **Tiempo:** 30 minutos

  **⏱️ Total Fase 2: ~4 horas**
 ---

  **🎁 FASE 3: OPTIMIZACIONES (Opcional/Futuro) - ~2 horas**

  **3.1 Cache de diccionario 💾**

Tabla dictionary_cache para no llamar API repetidamente

  **Tiempo:** 1 hora


  **3.2 Frases hechas/Idioms 📚**

  Detectar espacios → buscar en Dictionary API idioms

  **Tiempo:** 45 minutos

  **3.3 Sinónimos y ejemplos 📝**

  Mostrar sinónimos de Free Dictionary en preview

  **Tiempo:** 30 minutos

  ---

  **📊 ROADMAP VISUAL**

  

  FASE 1 (Quick Wins) - 1.5h

  ├─ ✅ Debounce buscador (15min)

  ├─ ✅ Fix botones cards (20min)

  ├─ ✅ Fix cancelar + focus (10min)

  └─ ✅ Mover añadir imagen (45min)

  

  FASE 2 (Diccionario Híbrido) - 4h

  ├─ 🔧 API get-definitions (30min)

  ├─ 🔧 API translate-definitions (30min)

  ├─ 💾 BD: nuevo campo definicion (10min)

  ├─ 🎨 UI selector acepciones (1.5h)

  ├─ 🔄 Lógica de flujo (1h)

  └─ 👁️ Mostrar en cards (30min)

  

  FASE 3 (Optimizaciones) - 2h

  ├─ 💾 Cache diccionario (1h)

  ├─ 📚 Frases hechas (45min)

  └─ 📝 Sinónimos (30min)

  ---

  **🎯 ORDEN RECOMENDADO DE IMPLEMENTACIÓN**

  
  **Opción A - Bugs primero (Recomendado):**

  1. Fase 1 completa (bugs + UX)

  2. Fase 2 completa (diccionario)

  3. Fase 3 cuando sea necesario

  

  **Opción B - Feature primero:**

  4. Fase 2 (diccionario) → valor inmediato

  5. Fase 1 (bugs) → polish

  6. Fase 3 (optimizaciones)

  
Fase 4: crear gamificación para ir recordando las palabras aprendidas