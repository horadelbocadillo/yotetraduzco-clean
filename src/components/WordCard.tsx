import { useState } from 'react'
import type { Word } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { pronounceWord } from '../lib/utils'
import { CATEGORIES, getCategory } from '../lib/constants'

interface WordCardProps {
  word: Word
  onUpdate: () => void
}

const COLOR_CLASSES = {
  indigo: {
    border: 'border-l-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  emerald: {
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  rose: {
    border: 'border-l-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  amber: {
    border: 'border-l-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  violet: {
    border: 'border-l-violet-500',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  sky: {
    border: 'border-l-sky-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
}

export function WordCard({ word, onUpdate }: WordCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [categoria, setCategoria] = useState(word.categoria || '')
  const [notas, setNotas] = useState(word.notas || '')

  const colorKey = (word.color || 'indigo') as keyof typeof COLOR_CLASSES
  const colorClasses = COLOR_CLASSES[colorKey] || COLOR_CLASSES.indigo
  const categoryData = getCategory(word.categoria)

  const handleSave = async () => {
    const categoryColor = CATEGORIES.find(c => c.value === categoria)?.color || null

    await supabase.from('palabras').update({
      categoria: categoria || null,
      color: categoryColor,
      notas: notas || null,
    }).eq('id', word.id)

    setIsEditing(false)
    onUpdate()
  }

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta palabra?')) {
      await supabase.from('palabras').delete().eq('id', word.id)
      onUpdate()
    }
  }

  return (
    <article className={`bg-white rounded-2xl border border-neutral-200 border-l-[6px] ${colorClasses.border} overflow-hidden hover:shadow-soft-lg transition-all duration-200`}>
      <div className="md:flex">
        {/* Image section */}
        {word.imagen_url && (
          <div className="md:w-2/5 md:flex-shrink-0">
            <img
              src={word.imagen_url}
              alt={word.palabra_original}
              className="w-full h-48 md:h-full object-cover"
            />
          </div>
        )}

        {/* Content section */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl font-semibold text-neutral-900">{word.palabra_original}</span>
                  <button
                    onClick={() => pronounceWord(word.palabra_original, 'en-US')}
                    className="relative w-11 h-11 flex items-center justify-center border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:border-indigo-500 rounded-lg transition-all focus-ring group"
                    aria-label="Pronunciar palabra en inglés"
                  >
                    <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                      EN
                    </span>
                    <svg className="w-5 h-5 text-neutral-600 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                </div>

                <span className="text-neutral-300 text-lg">→</span>

                <div className="flex items-center gap-2">
                  <span className="text-xl text-neutral-700">{word.traduccion}</span>
                  <button
                    onClick={() => pronounceWord(word.traduccion, 'es-ES')}
                    className="relative w-11 h-11 flex items-center justify-center border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:border-emerald-500 rounded-lg transition-all focus-ring group"
                    aria-label="Pronunciar traducción en español"
                  >
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                      ES
                    </span>
                    <svg className="w-5 h-5 text-neutral-600 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                </div>
              </div>

              {categoryData && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses.badge}`}>
                  <span>{categoryData.emoji}</span>
                  <span>{categoryData.label}</span>
                </span>
              )}
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-9 h-9 flex items-center justify-center hover:bg-neutral-100 rounded-lg transition-colors text-neutral-400 hover:text-neutral-700 focus-ring"
                aria-label="Editar palabra"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="w-9 h-9 flex items-center justify-center hover:bg-red-50 rounded-lg transition-colors text-neutral-400 hover:text-red-600 focus-ring"
                aria-label="Eliminar palabra"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4 mt-6 pt-6 border-t border-neutral-100">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                    Categoría
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-neutral-200 rounded-xl input-focus bg-white"
                  >
                    <option value="">Sin categoría</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                  Notas
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Añade contexto, ejemplos o recordatorios..."
                  className="w-full px-3 py-3 text-sm border-2 border-neutral-200 rounded-xl input-focus resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-soft-md transition-all text-sm font-semibold focus-ring"
                >
                  Guardar cambios
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setCategoria(word.categoria || '')
                    setNotas(word.notas || '')
                  }}
                  className="px-4 py-2 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all text-sm font-semibold focus-ring"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            word.notas && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-sm text-neutral-600 leading-relaxed">{word.notas}</p>
              </div>
            )
          )}
        </div>
      </div>
    </article>
  )
}
