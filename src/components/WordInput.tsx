import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { pronounceWord } from '../lib/utils'
import { CATEGORIES, getCategoryColor } from '../lib/constants'

interface WordInputProps {
  onWordAdded: (word: string) => void
}

interface PreviewData {
  originalWord: string
  translation: string
  imageUrl: string | null
}

export function WordInput({ onWordAdded }: WordInputProps) {
  const [word, setWord] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [includeImage, setIncludeImage] = useState(true)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [categoria, setCategoria] = useState('')
  const [notas, setNotas] = useState('')

  const handleTranslate = async () => {
    if (!word.trim()) return

    setLoading(true)
    setError('')

    try {
      // 1. Translate
      const translateRes = await fetch('/.netlify/functions/translate', {
        method: 'POST',
        body: JSON.stringify({ word: word.trim() }),
      })

      if (!translateRes.ok) {
        const errorData = await translateRes.json()
        throw new Error(errorData.error || 'Error al traducir')
      }

      const { originalWord, translation } = await translateRes.json()

      // 2. Get image (only if includeImage is true)
      let imageUrl = null
      if (includeImage) {
        const imageRes = await fetch('/.netlify/functions/get-image', {
          method: 'POST',
          body: JSON.stringify({ query: originalWord }),
        })

        if (imageRes.ok) {
          const data = await imageRes.json()
          imageUrl = data.imageUrl
        }
      }

      // 3. Show preview
      setPreview({ originalWord, translation, imageUrl })
      setLoading(false)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!preview) return

    setLoading(true)
    try {
      // Auto-assign color based on category
      const autoColor = getCategoryColor(categoria)

      const { error: dbError } = await supabase.from('palabras').insert({
        palabra_original: preview.originalWord,
        traduccion: preview.translation,
        imagen_url: preview.imageUrl,
        categoria: categoria || null,
        color: autoColor || null,
        notas: notas || null,
      })

      if (dbError) throw dbError

      // Reset all
      const savedWord = preview.originalWord
      setWord('')
      setPreview(null)
      setCategoria('')
      setNotas('')
      onWordAdded(savedWord)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setPreview(null)
    setCategoria('')
    setNotas('')
  }

  if (preview) {
    const categoryColor = getCategoryColor(categoria)

    return (
      <div className="space-y-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-soft-xl animate-slide-up">
          {preview.imageUrl && (
            <img
              src={preview.imageUrl}
              alt={preview.originalWord}
              className="w-full h-56 object-cover rounded-xl mb-6"
            />
          )}

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl font-semibold text-neutral-900">{preview.originalWord}</span>
              <button
                onClick={() => pronounceWord(preview.originalWord, 'en-US')}
                className="relative w-11 h-11 flex items-center justify-center border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:border-indigo-500 rounded-xl transition-all focus-ring group"
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
            <span className="text-neutral-300 text-xl">→</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl text-neutral-700">{preview.translation}</span>
              <button
                onClick={() => pronounceWord(preview.translation, 'es-ES')}
                className="relative w-11 h-11 flex items-center justify-center border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:border-emerald-500 rounded-xl transition-all focus-ring group"
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

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 text-sm bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {categoryColor && (
                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                  <div className={`w-3 h-3 rounded-full bg-${categoryColor}-500`}></div>
                  <span>Color asignado automáticamente</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">Notas</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Añade contexto, ejemplos o recordatorios..."
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 text-sm resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-neutral-100">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-soft-md disabled:opacity-50 font-semibold transition-all text-sm focus-ring"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 bg-white border-2 border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 disabled:opacity-50 font-semibold transition-all text-sm focus-ring"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleTranslate()}
          placeholder="Escribe una palabra o frase en inglés..."
          disabled={loading}
          aria-label="Palabra o frase en inglés para traducir"
          className="flex-1 px-5 py-4 text-base border-2 border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white input-focus transition-all"
        />
        <button
          onClick={handleTranslate}
          disabled={loading || !word.trim()}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all text-sm btn-focus"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          {loading ? 'Traduciendo...' : 'Traducir'}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer font-medium">
        <input
          type="checkbox"
          checked={includeImage}
          onChange={(e) => setIncludeImage(e.target.checked)}
          aria-label="Incluir imagen ilustrativa"
          className="w-5 h-5 text-indigo-600 border-neutral-300 rounded focus:ring-indigo-500"
        />
        Incluir imagen ilustrativa
      </label>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  )
}
