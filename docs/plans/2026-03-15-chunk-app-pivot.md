# Chunk App Pivot — Fase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform "Yo te traduzco" from a word-translation app into a chunk-based oral production learning app with functional categories and learning status.

**Architecture:** Keep existing React + Supabase stack. Create a new `chunks` table in Supabase (keeping `palabras` intact for rollback safety). Replace the Word data model, categories, input form, card component, and list component to work with chunks instead of word pairs.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Supabase (PostgreSQL), Netlify Functions, class-variance-authority

---

## Overview of Tasks

| # | Task | What changes |
|---|------|-------------|
| 1 | New Supabase table `chunks` | Database schema |
| 2 | New TypeScript types + Supabase client | `src/lib/supabase.ts` |
| 3 | New categories + colors | `src/lib/constants.ts`, `src/index.css` |
| 4 | New ChunkCard component | `src/components/ChunkCard.tsx` (replaces WordCard) |
| 5 | New ChunkInput component | `src/components/ChunkInput.tsx` (replaces WordInput) |
| 6 | New ChunkList component | `src/components/ChunkList.tsx` (replaces WordList) |
| 7 | New ChunkImport component | `src/components/ChunkImport.tsx` (JSON paste) |
| 8 | Update App.tsx | Wire everything together |
| 9 | Visual polish + responsive | CSS adjustments |

---

### Task 1: Create `chunks` table in Supabase

**Files:**
- External: Supabase SQL editor (dashboard)

**Step 1: Run this SQL in Supabase SQL Editor**

```sql
CREATE TABLE chunks (
  id BIGSERIAL PRIMARY KEY,
  chunk TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'frases_hechas',
  subcategory TEXT,
  purpose TEXT,
  my_example TEXT,
  instead_of TEXT,
  spanish_equivalent TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'practiced', 'automated')),
  notes TEXT,
  imagen_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ
);

-- Enable RLS but allow all for now (same pattern as palabras)
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to chunks" ON chunks
  FOR ALL USING (true) WITH CHECK (true);

-- Index for common queries
CREATE INDEX idx_chunks_category ON chunks(category);
CREATE INDEX idx_chunks_status ON chunks(status);
CREATE INDEX idx_chunks_created_at ON chunks(created_at DESC);
```

**Step 2: Verify table exists**

Go to Supabase Table Editor and confirm `chunks` table appears with all columns.

**Step 3: Commit** (nothing to commit locally yet — this is a DB change)

---

### Task 2: Update TypeScript types and Supabase client

**Files:**
- Modify: `src/lib/supabase.ts`

**Step 1: Replace the Word interface with a Chunk interface**

Replace the entire contents of `src/lib/supabase.ts` with:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export type ChunkStatus = 'new' | 'practiced' | 'automated'

export interface Chunk {
  id: number
  chunk: string
  category: string
  subcategory: string | null
  purpose: string | null
  my_example: string | null
  instead_of: string | null
  spanish_equivalent: string | null
  source: string | null
  status: ChunkStatus
  notes: string | null
  imagen_url: string | null
  created_at: string
  last_reviewed: string | null
}
```

**Step 2: Verify app still compiles**

Run: `npm run dev`
Expected: Build errors in components that import `Word` — this is expected and will be fixed in subsequent tasks.

**Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: replace Word interface with Chunk data model"
```

---

### Task 3: Update categories and color system

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/index.css`

**Step 1: Replace categories in constants.ts**

Replace the entire contents of `src/lib/constants.ts` with:

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

export const CATEGORIES = [
  { value: '', label: 'Sin categoría', emoji: '', color: '' },
  { value: 'muletillas_pro', label: 'Muletillas pro', emoji: '🗣️', color: 'green' },
  { value: 'combos_que_molan', label: 'Combos que molan', emoji: '🤝', color: 'blue' },
  { value: 'phrasal_verbs', label: 'Phrasal verbs', emoji: '🔗', color: 'orange' },
  { value: 'frases_hechas', label: 'Frases hechas', emoji: '💬', color: 'violet' },
  { value: 'trucos_de_fabrica', label: 'Trucos de fábrica', emoji: '🏭', color: 'pink' },
  { value: 'conectores', label: 'Conectores', emoji: '🔄', color: 'sky' },
] as const

export const STATUS_CONFIG = [
  { value: 'new', label: 'Nuevo', icon: '○', color: 'neutral' },
  { value: 'practiced', label: 'Practicando', icon: '◐', color: 'amber' },
  { value: 'automated', label: 'Automatizado', icon: '●', color: 'emerald' },
] as const

export const COLOR_CLASSES: Record<string, string> = {
  green: 'bg-emerald-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  violet: 'bg-violet-500',
  pink: 'bg-pink-500',
  sky: 'bg-sky-500',
}

export const categoryDotVariants = cva(
  'rounded-full flex-shrink-0',
  {
    variants: {
      color: {
        green: 'bg-emerald-500',
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        violet: 'bg-violet-500',
        pink: 'bg-pink-500',
        sky: 'bg-sky-500',
        '': 'bg-neutral-300',
      },
      size: {
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
      },
    },
    defaultVariants: {
      color: '',
      size: 'sm',
    },
  }
)

export type CategoryDotVariants = VariantProps<typeof categoryDotVariants>

// Helper functions
export function getCategoryColor(categoria: string | null): string {
  if (!categoria) return ''
  return CATEGORIES.find(c => c.value === categoria)?.color || ''
}

export function getCategoryEmoji(categoria: string | null): string {
  if (!categoria) return ''
  return CATEGORIES.find(c => c.value === categoria)?.emoji || ''
}

export function getCategoryLabel(categoria: string | null): string {
  if (!categoria) return ''
  return CATEGORIES.find(c => c.value === categoria)?.label || ''
}

export function getCategory(value: string | null) {
  return CATEGORIES.find(c => c.value === value)
}

export function getStatusConfig(status: string) {
  return STATUS_CONFIG.find(s => s.value === status)
}
```

**Step 2: Add pink color variables to index.css**

In `src/index.css`, add these CSS variables inside `:root` (after the sky variables):

```css
  --pink-50: #fdf2f8;
  --pink-100: #fce7f3;
  --pink-200: #fbcfe8;
  --pink-500: #ec4899;
  --pink-600: #db2777;
  --pink-700: #be185d;
```

**Step 3: Update color bar CSS classes in index.css**

Replace the `.word-card.blue`, `.word-card.green`, etc. color bar rules with:

```css
.word-card.green .word-color-bar {
  background: linear-gradient(180deg, var(--emerald-500), var(--emerald-600));
}

.word-card.blue .word-color-bar {
  background: linear-gradient(180deg, var(--indigo-500), var(--indigo-600));
}

.word-card.orange .word-color-bar {
  background: linear-gradient(180deg, var(--amber-500), var(--amber-600));
}

.word-card.violet .word-color-bar {
  background: linear-gradient(180deg, var(--violet-500), var(--violet-600));
}

.word-card.pink .word-color-bar {
  background: linear-gradient(180deg, var(--pink-500), var(--pink-600));
}

.word-card.sky .word-color-bar {
  background: linear-gradient(180deg, var(--sky-500), var(--sky-600));
}
```

And update the `.category-badge` color classes similarly:

```css
.category-badge.green {
  background: var(--emerald-500);
  color: white;
}

.category-badge.blue {
  background: var(--indigo-500);
  color: white;
}

.category-badge.orange {
  background: var(--amber-600);
  color: white;
}

.category-badge.violet {
  background: var(--violet-500);
  color: white;
}

.category-badge.pink {
  background: var(--pink-500);
  color: white;
}

.category-badge.sky {
  background: var(--sky-500);
  color: white;
}
```

**Step 4: Commit**

```bash
git add src/lib/constants.ts src/index.css
git commit -m "feat: update categories to chunk-based functional system with new colors"
```

---

### Task 4: Create ChunkCard component

**Files:**
- Create: `src/components/ChunkCard.tsx`

**Step 1: Create the new ChunkCard component**

This replaces `WordCard.tsx`. The card now shows:
- Category badge + status indicator (top)
- Chunk text (big, prominent)
- Purpose (what it's for)
- "Instead of" field (the Spanish habit it replaces)
- Example sentence
- Edit modal with all chunk fields

```typescript
import { useState } from 'react'
import type { Chunk, ChunkStatus } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { pronounceWord } from '../lib/utils'
import { CATEGORIES, STATUS_CONFIG, getCategory, getStatusConfig } from '../lib/constants'

interface ChunkCardProps {
  chunk: Chunk
  onUpdate: () => void
}

export function ChunkCard({ chunk, onUpdate }: ChunkCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editData, setEditData] = useState({
    category: chunk.category,
    subcategory: chunk.subcategory || '',
    purpose: chunk.purpose || '',
    my_example: chunk.my_example || '',
    instead_of: chunk.instead_of || '',
    spanish_equivalent: chunk.spanish_equivalent || '',
    source: chunk.source || '',
    status: chunk.status,
    notes: chunk.notes || '',
  })

  const categoryData = getCategory(chunk.category)
  const statusData = getStatusConfig(chunk.status)
  const colorKey = categoryData?.color || ''

  const handleSave = async () => {
    await supabase.from('chunks').update({
      category: editData.category,
      subcategory: editData.subcategory || null,
      purpose: editData.purpose || null,
      my_example: editData.my_example || null,
      instead_of: editData.instead_of || null,
      spanish_equivalent: editData.spanish_equivalent || null,
      source: editData.source || null,
      status: editData.status as ChunkStatus,
      notes: editData.notes || null,
    }).eq('id', chunk.id)

    setIsModalOpen(false)
    onUpdate()
  }

  const handleCloseModal = () => {
    setEditData({
      category: chunk.category,
      subcategory: chunk.subcategory || '',
      purpose: chunk.purpose || '',
      my_example: chunk.my_example || '',
      instead_of: chunk.instead_of || '',
      spanish_equivalent: chunk.spanish_equivalent || '',
      source: chunk.source || '',
      status: chunk.status,
      notes: chunk.notes || '',
    })
    setIsModalOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleCloseModal()
  }

  const handleDelete = async () => {
    if (confirm('¿Eliminar este chunk?')) {
      await supabase.from('chunks').delete().eq('id', chunk.id)
      onUpdate()
    }
  }

  return (
    <article className={`word-card ${colorKey}`}>
      <div className="word-color-bar"></div>
      <div className="relative h-full flex flex-col">
        {/* Top row: Category + Status + Edit */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <div className="flex items-center gap-2">
            {categoryData && categoryData.value && (
              <span className={`category-badge ${colorKey}`}>
                <span>{categoryData.emoji}</span>
                <span>{categoryData.label}</span>
              </span>
            )}
            {statusData && (
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--neutral-500)',
              }}>
                {statusData.icon} {statusData.label}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '6px', border: '1.5px solid var(--neutral-300)',
              background: 'white', color: 'var(--neutral-600)',
              cursor: 'pointer', transition: 'all 0.2s ease',
              fontSize: '20px', fontWeight: 'bold', lineHeight: '1'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--indigo-50)'
              e.currentTarget.style.borderColor = 'var(--indigo-500)'
              e.currentTarget.style.color = 'var(--indigo-600)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = 'var(--neutral-300)'
              e.currentTarget.style.color = 'var(--neutral-600)'
            }}
            aria-label="Editar chunk"
            title="Editar"
          >
            +
          </button>
        </div>

        {/* Chunk text */}
        <div className="flex-1 px-3 py-1">
          <div className="flex items-baseline gap-1">
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 900,
              color: 'var(--neutral-900)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em'
            }}>{chunk.chunk}</span>
            <button
              onClick={() => pronounceWord(chunk.chunk, 'en-US')}
              style={{
                width: '18px', height: '18px',
                border: '1px solid var(--neutral-200)',
                background: 'white', borderRadius: '4px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease',
                position: 'relative', flexShrink: 0,
                verticalAlign: 'super', transform: 'translateY(-8px)', marginLeft: '2px'
              }}
              aria-label="Pronunciar chunk"
            >
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: 'var(--indigo-600)', color: 'white',
                fontSize: '0.375rem', fontWeight: 700,
                padding: '1px 2px', borderRadius: '2px'
              }}>EN</span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '9px', height: '9px', color: 'var(--neutral-600)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>

          {/* Purpose or instead_of — show whichever is available */}
          {chunk.instead_of && (
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--neutral-500)',
              marginTop: '0.25rem',
              fontStyle: 'italic'
            }}>
              En vez de: "{chunk.instead_of}"
            </p>
          )}
          {!chunk.instead_of && chunk.purpose && (
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--neutral-500)',
              marginTop: '0.25rem',
            }}>
              {chunk.purpose}
            </p>
          )}
        </div>

        {/* Bottom row: Delete */}
        <div className="flex justify-end px-3 pb-2 pt-1">
          <button
            onClick={handleDelete}
            style={{
              width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '6px', border: '1.5px solid var(--neutral-300)',
              background: 'white', color: 'var(--neutral-600)',
              cursor: 'pointer', transition: 'all 0.2s ease',
              fontSize: '20px', fontWeight: 'bold', lineHeight: '1'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--red-50)'
              e.currentTarget.style.borderColor = 'var(--red-500)'
              e.currentTarget.style.color = 'var(--red-600)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = 'var(--neutral-300)'
              e.currentTarget.style.color = 'var(--neutral-600)'
            }}
            aria-label="Eliminar"
            title="Eliminar"
          >
            ×
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={handleCloseModal}
          onKeyDown={handleKeyDown}
        >
          <div
            style={{
              background: 'white', borderRadius: '16px',
              maxWidth: '600px', width: '100%', maxHeight: '90vh',
              overflow: 'auto', position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem', borderBottom: '1px solid var(--neutral-200)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, background: 'white', zIndex: 10,
              borderRadius: '16px 16px 0 0'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem', fontWeight: 600, color: 'var(--neutral-900)'
              }}>
                Editar: "{chunk.chunk}"
              </h3>
              <button
                onClick={handleCloseModal}
                style={{
                  width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '6px', border: '1px solid var(--neutral-300)',
                  background: 'white', color: 'var(--neutral-600)',
                  cursor: 'pointer', fontSize: '20px', fontWeight: 'bold'
                }}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Category */}
              <div>
                <label className="modal-label">Categoría</label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  style={{
                    width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem',
                    border: '2px solid var(--neutral-200)', borderRadius: '12px', background: 'white'
                  }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="modal-label">Subcategoría</label>
                <input
                  type="text"
                  value={editData.subcategory}
                  onChange={(e) => setEditData({ ...editData, subcategory: e.target.value })}
                  placeholder="ej: concesión, adición, contraste..."
                  className="modal-input"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="modal-label">Para qué sirve</label>
                <textarea
                  value={editData.purpose}
                  onChange={(e) => setEditData({ ...editData, purpose: e.target.value })}
                  placeholder="¿Qué problema comunicativo resuelve?"
                  className="modal-input"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              {/* My example */}
              <div>
                <label className="modal-label">Tu ejemplo</label>
                <textarea
                  value={editData.my_example}
                  onChange={(e) => setEditData({ ...editData, my_example: e.target.value })}
                  placeholder="Una frase tuya usando este chunk..."
                  className="modal-input"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              {/* Instead of */}
              <div>
                <label className="modal-label">En vez de decir</label>
                <input
                  type="text"
                  value={editData.instead_of}
                  onChange={(e) => setEditData({ ...editData, instead_of: e.target.value })}
                  placeholder="La traducción literal del español que desplaza..."
                  className="modal-input"
                />
              </div>

              {/* Spanish equivalent */}
              <div>
                <label className="modal-label">Equivalente en español</label>
                <input
                  type="text"
                  value={editData.spanish_equivalent}
                  onChange={(e) => setEditData({ ...editData, spanish_equivalent: e.target.value })}
                  placeholder="Referencia conceptual en español..."
                  className="modal-input"
                />
              </div>

              {/* Source */}
              <div>
                <label className="modal-label">Fuente</label>
                <input
                  type="text"
                  value={editData.source}
                  onChange={(e) => setEditData({ ...editData, source: e.target.value })}
                  placeholder="ej: Sesión Claude, podcast, conversación..."
                  className="modal-input"
                />
              </div>

              {/* Status */}
              <div>
                <label className="modal-label">Estado</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {STATUS_CONFIG.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setEditData({ ...editData, status: s.value as any })}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: `2px solid ${editData.status === s.value ? 'var(--indigo-500)' : 'var(--neutral-200)'}`,
                        background: editData.status === s.value ? 'var(--indigo-50)' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: editData.status === s.value ? 'var(--indigo-700)' : 'var(--neutral-600)',
                        textAlign: 'center'
                      }}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="modal-label">Notas</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Reglas, matices, por qué suena mal la alternativa..."
                  className="modal-input"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem', borderTop: '1px solid var(--neutral-200)',
              display: 'flex', gap: '0.5rem',
              position: 'sticky', bottom: 0, background: 'white',
              borderRadius: '0 0 16px 16px'
            }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1, padding: '0.625rem 1rem',
                  background: 'linear-gradient(to right, var(--indigo-600), var(--violet-600))',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Guardar cambios
              </button>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '0.625rem 1rem', background: 'white',
                  border: '2px solid var(--neutral-200)', color: 'var(--neutral-700)',
                  borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
```

**Step 2: Add modal form CSS classes to index.css**

Add at the end of `src/index.css` (before the responsive media query):

```css
/* Modal form elements */
.modal-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--neutral-600);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 2px solid var(--neutral-200);
  border-radius: 12px;
  background: white;
  font-family: var(--font-body);
  transition: all 0.2s ease;
}

.modal-input:focus {
  outline: none;
  border-color: var(--indigo-500);
  box-shadow: 0 0 0 4px var(--indigo-50);
}
```

**Step 3: Commit**

```bash
git add src/components/ChunkCard.tsx src/index.css
git commit -m "feat: create ChunkCard component with full chunk fields and edit modal"
```

---

### Task 5: Create ChunkInput component

**Files:**
- Create: `src/components/ChunkInput.tsx`

**Step 1: Create the manual chunk input form**

This replaces `WordInput.tsx`. Instead of translating a word, the user enters a chunk directly with its metadata.

```typescript
import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, STATUS_CONFIG } from '../lib/constants'

interface ChunkInputProps {
  onChunkAdded: (chunk: string) => void
}

export function ChunkInput({ onChunkAdded }: ChunkInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [chunk, setChunk] = useState('')
  const [category, setCategory] = useState('frases_hechas')
  const [subcategory, setSubcategory] = useState('')
  const [purpose, setPurpose] = useState('')
  const [myExample, setMyExample] = useState('')
  const [insteadOf, setInsteadOf] = useState('')
  const [spanishEquivalent, setSpanishEquivalent] = useState('')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('new')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!chunk.trim()) return

    setLoading(true)
    setError('')

    try {
      const { error: dbError } = await supabase.from('chunks').insert({
        chunk: chunk.trim(),
        category,
        subcategory: subcategory || null,
        purpose: purpose || null,
        my_example: myExample || null,
        instead_of: insteadOf || null,
        spanish_equivalent: spanishEquivalent || null,
        source: source || null,
        status,
        notes: notes || null,
      })

      if (dbError) throw dbError

      const savedChunk = chunk.trim()
      resetForm()
      onChunkAdded(savedChunk)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setChunk('')
    setCategory('frases_hechas')
    setSubcategory('')
    setPurpose('')
    setMyExample('')
    setInsteadOf('')
    setSpanishEquivalent('')
    setSource('')
    setStatus('new')
    setNotes('')
    setIsExpanded(false)
    inputRef.current?.focus()
  }

  const handleChunkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && chunk.trim()) {
      setIsExpanded(true)
    }
  }

  return (
    <div className="translation-card">
      {/* Chunk input */}
      <div className="input-group">
        <input
          ref={inputRef}
          type="text"
          value={chunk}
          onChange={(e) => setChunk(e.target.value)}
          onKeyDown={handleChunkKeyDown}
          placeholder="Escribe un chunk en inglés... (ej: having said that)"
          disabled={loading}
          aria-label="Chunk en inglés"
          className="input"
        />
        {!isExpanded ? (
          <button
            onClick={() => chunk.trim() && setIsExpanded(true)}
            disabled={!chunk.trim()}
            className="btn btn-primary"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading || !chunk.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        )}
      </div>

      {/* Expanded form */}
      {isExpanded && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Category + Status row */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="modal-label">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="filter-select"
                style={{ width: '100%' }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="modal-label">Estado</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {STATUS_CONFIG.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    style={{
                      flex: 1, padding: '0.5rem', borderRadius: '8px',
                      border: `2px solid ${status === s.value ? 'var(--indigo-500)' : 'var(--neutral-200)'}`,
                      background: status === s.value ? 'var(--indigo-50)' : 'white',
                      cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                      color: status === s.value ? 'var(--indigo-700)' : 'var(--neutral-600)',
                      textAlign: 'center'
                    }}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instead of */}
          <div>
            <label className="modal-label">En vez de decir</label>
            <input
              type="text"
              value={insteadOf}
              onChange={(e) => setInsteadOf(e.target.value)}
              placeholder="La traducción literal que tu cerebro quiere producir..."
              className="modal-input"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="modal-label">Para qué sirve</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="¿Qué problema comunicativo resuelve?"
              className="modal-input"
            />
          </div>

          {/* My example */}
          <div>
            <label className="modal-label">Tu ejemplo</label>
            <textarea
              value={myExample}
              onChange={(e) => setMyExample(e.target.value)}
              placeholder="Escribe una frase tuya usando este chunk..."
              className="modal-input"
              style={{ minHeight: '60px', resize: 'vertical' }}
            />
          </div>

          {/* Spanish equivalent + Source row */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="modal-label">Equivalente en español</label>
              <input
                type="text"
                value={spanishEquivalent}
                onChange={(e) => setSpanishEquivalent(e.target.value)}
                placeholder="Referencia conceptual..."
                className="modal-input"
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="modal-label">Fuente</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="ej: Sesión Claude, podcast..."
                className="modal-input"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="modal-label">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reglas, matices, contexto adicional..."
              className="modal-input"
              style={{ minHeight: '60px', resize: 'vertical' }}
            />
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex', gap: '0.75rem', marginTop: '0.5rem',
            paddingTop: '1rem', borderTop: '1px solid var(--neutral-100)'
          }}>
            <button onClick={handleSave} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              {loading ? 'Guardando...' : 'Guardar chunk'}
            </button>
            <button onClick={resetForm} disabled={loading} className="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: 'var(--rose-50)', border: '2px solid var(--rose-200)',
          color: 'var(--rose-700)', padding: '0.75rem 1rem',
          borderRadius: '12px', fontSize: '0.875rem', fontWeight: 500, marginTop: '1rem'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/ChunkInput.tsx
git commit -m "feat: create ChunkInput component for manual chunk entry"
```

---

### Task 6: Create ChunkList component

**Files:**
- Create: `src/components/ChunkList.tsx`

**Step 1: Create the new list component**

This replaces `WordList.tsx`. Adds status filter alongside category filter.

```typescript
import { useEffect, useState } from 'react'
import type { Chunk } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { CATEGORIES, STATUS_CONFIG } from '../lib/constants'
import { EmptyState } from './EmptyState'
import { ChunkCard } from './ChunkCard'

interface ChunkListProps {
  refreshTrigger: number
}

export function ChunkList({ refreshTrigger }: ChunkListProps) {
  const [chunks, setChunks] = useState<Chunk[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const chunksPerPage = 10

  const fetchChunks = async () => {
    setLoading(true)
    let query = supabase
      .from('chunks')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`chunk.ilike.%${search}%,instead_of.ilike.%${search}%,purpose.ilike.%${search}%,my_example.ilike.%${search}%`)
    }

    if (categoryFilter) {
      query = query.eq('category', categoryFilter)
    }

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data } = await query
    setChunks(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchChunks()
    setCurrentPage(1)
  }, [refreshTrigger, categoryFilter, statusFilter])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchChunks()
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(debounceTimer)
  }, [search])

  const totalPages = Math.ceil(chunks.length / chunksPerPage)
  const startIndex = (currentPage - 1) * chunksPerPage
  const currentChunks = chunks.slice(startIndex, startIndex + chunksPerPage)

  return (
    <>
      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">Mis chunks</h2>
        {!loading && chunks.length > 0 && (
          <span className="word-count">
            {chunks.length} {chunks.length === 1 ? 'chunk' : 'chunks'}
          </span>
        )}
      </div>

      {/* Search and filters */}
      {!loading && chunks.length > 0 && (
        <div className="search-section">
          <div className="search-wrapper">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en tus chunks..."
              aria-label="Buscar chunks"
              className="input"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filtrar por categoría"
            className="filter-select"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.filter(c => c.value).map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por estado"
            className="filter-select"
            style={{ minWidth: '150px' }}
          >
            <option value="">Todos los estados</option>
            {STATUS_CONFIG.map((s) => (
              <option key={s.value} value={s.value}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{
            display: 'inline-block', width: '40px', height: '40px',
            border: '4px solid var(--neutral-200)', borderTopColor: 'var(--indigo-500)',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite'
          }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--neutral-500)', fontSize: '0.875rem', fontWeight: 500 }}>
            Cargando chunks...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : chunks.length === 0 ? (
        search || categoryFilter || statusFilter ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.2 }}>🔍</div>
            <p style={{ color: 'var(--neutral-600)', fontWeight: 500, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              No se encontraron chunks
            </p>
            <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
              Intenta con otros términos o cambia los filtros
            </p>
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        <>
          <div className="words-grid">
            {currentChunks.map((chunk) => (
              <ChunkCard key={chunk.id} chunk={chunk} onUpdate={fetchChunks} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem',
              borderTop: '1px solid var(--neutral-200)'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px',
                  border: '1px solid var(--neutral-200)',
                  background: currentPage === 1 ? 'var(--neutral-100)' : 'white',
                  color: currentPage === 1 ? 'var(--neutral-400)' : 'var(--neutral-700)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 500, fontSize: '0.875rem'
                }}
              >
                Anterior
              </button>
              <span style={{ color: 'var(--neutral-600)', fontSize: '0.875rem', fontWeight: 500 }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px',
                  border: '1px solid var(--neutral-200)',
                  background: currentPage === totalPages ? 'var(--neutral-100)' : 'white',
                  color: currentPage === totalPages ? 'var(--neutral-400)' : 'var(--neutral-700)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 500, fontSize: '0.875rem'
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/ChunkList.tsx
git commit -m "feat: create ChunkList component with category and status filters"
```

---

### Task 7: Create ChunkImport component

**Files:**
- Create: `src/components/ChunkImport.tsx`

**Step 1: Create the JSON import component**

Allows pasting a JSON block from a Claude session to import multiple chunks at once.

```typescript
import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ChunkImportProps {
  onImported: (count: number) => void
}

export function ChunkImport({ onImported }: ChunkImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImport = async () => {
    setError('')
    setLoading(true)

    try {
      const data = JSON.parse(jsonText)
      const chunksToImport = data.chunks || (Array.isArray(data) ? data : [data])

      if (!chunksToImport.length) {
        throw new Error('No se encontraron chunks en el JSON')
      }

      const rows = chunksToImport.map((c: any) => ({
        chunk: c.chunk,
        category: c.category || 'frases_hechas',
        subcategory: c.subcategory || null,
        purpose: c.purpose || null,
        my_example: c.my_example || null,
        instead_of: c.instead_of || null,
        spanish_equivalent: c.spanish_equivalent || null,
        source: c.source || data.session_date ? `Sesión Claude ${data.session_date}` : null,
        status: c.status || 'new',
        notes: c.notes || null,
      }))

      const { error: dbError } = await supabase.from('chunks').insert(rows)
      if (dbError) throw dbError

      setJsonText('')
      setIsOpen(false)
      onImported(rows.length)
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('JSON inválido. Revisa el formato.')
      } else {
        setError((err as Error).message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-secondary"
        style={{ width: '100%', justifyContent: 'center' }}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Importar desde sesión Claude (JSON)
      </button>
    )
  }

  return (
    <div className="translation-card">
      <div style={{ marginBottom: '1rem' }}>
        <label className="modal-label">Pega el JSON de tu sesión Claude</label>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={'{\n  "session_date": "2026-03-15",\n  "chunks": [\n    {\n      "chunk": "having said that",\n      "category": "muletillas_pro",\n      ...\n    }\n  ]\n}'}
          className="modal-input"
          style={{
            minHeight: '200px',
            resize: 'vertical',
            fontFamily: 'monospace',
            fontSize: '0.8rem'
          }}
        />
      </div>

      {error && (
        <div style={{
          background: 'var(--rose-50)', border: '2px solid var(--rose-200)',
          color: 'var(--rose-700)', padding: '0.75rem 1rem',
          borderRadius: '12px', fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleImport}
          disabled={loading || !jsonText.trim()}
          className="btn btn-primary"
          style={{ flex: 1 }}
        >
          {loading ? 'Importando...' : 'Importar chunks'}
        </button>
        <button
          onClick={() => { setIsOpen(false); setJsonText(''); setError('') }}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/ChunkImport.tsx
git commit -m "feat: create ChunkImport component for JSON paste from Claude sessions"
```

---

### Task 8: Update App.tsx

**Files:**
- Modify: `src/App.tsx`

**Step 1: Wire up the new components**

Replace the entire contents of `src/App.tsx`:

```typescript
import { useState } from 'react'
import { ChunkInput } from './components/ChunkInput'
import { ChunkImport } from './components/ChunkImport'
import { ChunkList } from './components/ChunkList'
import { Toast } from './components/Toast'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null)

  const handleChunkAdded = (chunk: string) => {
    setRefreshTrigger(prev => prev + 1)
    setToastMessage({
      title: 'Chunk guardado',
      message: `"${chunk}" se añadió a tu colección`
    })
  }

  const handleImported = (count: number) => {
    setRefreshTrigger(prev => prev + 1)
    setToastMessage({
      title: 'Importación completada',
      message: `${count} chunk${count !== 1 ? 's' : ''} importado${count !== 1 ? 's' : ''}`
    })
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className="header">
        <div className="header-content">
          <div className="logo">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="header-text">
            <h1 className="header-title">Yo te traduzco</h1>
            <p className="header-subtitle">Tu colección de chunks para sonar natural en inglés</p>
          </div>
        </div>
      </header>

      <main id="main-content" className="container">
        <section className="section">
          <ChunkInput onChunkAdded={handleChunkAdded} />
        </section>

        <section className="section">
          <ChunkImport onImported={handleImported} />
        </section>

        <section className="section">
          <ChunkList refreshTrigger={refreshTrigger} />
        </section>
      </main>

      <footer className="footer">
        <p>Hecho con <span className="footer-heart">♥</span> usando Claude Code</p>
      </footer>

      {toastMessage && (
        <Toast
          title={toastMessage.title}
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  )
}

export default App
```

**Step 2: Verify the app compiles and runs**

Run: `npm run dev`
Expected: App loads with new chunk input, import button, and empty chunk list.

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up chunk components in App.tsx, update header subtitle"
```

---

### Task 9: Update EmptyState and clean up

**Files:**
- Modify: `src/components/EmptyState.tsx`

**Step 1: Update EmptyState text for chunks**

Change the text references from "palabras" to "chunks". Find the text content in the component and update:
- Title: "Tu colección está vacía" (or similar)
- Description: update to reference chunks instead of palabras
- CTA: update button text

**Step 2: Final verification**

Run: `npm run dev`

Verify:
1. Header shows "Tu colección de chunks para sonar natural en inglés"
2. Chunk input form works — enter a chunk, expand form, fill fields, save
3. Chunk appears in the grid with category badge, status, and pronunciation button
4. Edit modal opens with all fields
5. Status toggle works (Nuevo/Practicando/Automatizado)
6. Category and status filters work
7. Search works across chunk, instead_of, purpose, my_example
8. Import button opens JSON paste area
9. JSON import works with the format from the spec doc
10. Delete works with confirmation
11. Responsive: single column on mobile

**Step 3: Commit**

```bash
git add src/components/EmptyState.tsx
git commit -m "feat: update EmptyState for chunk-based app"
```

---

## Notes for implementation

- **Old components** (`WordCard.tsx`, `WordInput.tsx`, `WordList.tsx`) can be kept temporarily for reference but are no longer imported. Delete them after confirming everything works.
- **Old table** (`palabras`) stays in Supabase — no data is lost.
- **Netlify functions** (`translate.ts`, `get-image.ts`, `get-suggestions.ts`) are still available but not used by the new flow. Keep them for potential future use.
- **Card height**: The current `.word-card` has `height: 120px`. This may need to increase for chunks that show the "instead of" text. Consider changing to `min-height: 120px` in index.css.
