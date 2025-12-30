import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface WordInputProps {
  onWordAdded: () => void
}

const CATEGORIES = [
  { value: '', label: 'Sin categoría', color: '' },
  { value: 'sustantivo', label: 'Sustantivo', color: 'blue' },
  { value: 'adjetivo', label: 'Adjetivo', color: 'green' },
  { value: 'verbo', label: 'Verbo', color: 'purple' },
  { value: 'phrasal verb', label: 'Phrasal Verb', color: 'orange' },
  { value: 'adverbio', label: 'Adverbio', color: 'yellow' },
  { value: 'frase hecha', label: 'Frase Hecha', color: 'red' },
]

const getCategoryColor = (categoria: string) => {
  return CATEGORIES.find(c => c.value === categoria)?.color || ''
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
      setWord('')
      setPreview(null)
      setCategoria('')
      setNotas('')
      onWordAdded()
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
    const colorClasses: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
    }

    return (
      <div className="space-y-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-8">
          {preview.imageUrl && (
            <img
              src={preview.imageUrl}
              alt={preview.originalWord}
              className="w-full h-56 object-cover rounded-lg mb-6"
            />
          )}

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-3xl font-light text-neutral-900">{preview.originalWord}</span>
            <span className="text-neutral-300">→</span>
            <span className="text-2xl text-neutral-600">{preview.translation}</span>
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
                  <div className={`w-3 h-3 rounded-full ${colorClasses[categoryColor]}`}></div>
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
              className="flex-1 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 font-medium transition-colors text-sm"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 disabled:opacity-50 font-medium transition-colors text-sm"
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
          className="flex-1 px-5 py-3.5 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition-all bg-white"
        />
        <button
          onClick={handleTranslate}
          disabled={loading || !word.trim()}
          className="px-8 py-3.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all text-sm"
        >
          {loading ? 'Traduciendo...' : 'Traducir'}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-500 cursor-pointer">
        <input
          type="checkbox"
          checked={includeImage}
          onChange={(e) => setIncludeImage(e.target.checked)}
          className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-400"
        />
        Incluir imagen ilustrativa
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
