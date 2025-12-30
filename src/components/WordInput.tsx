import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface WordInputProps {
  onWordAdded: () => void
}

const COLORS = [
  { value: '', label: 'Sin color' },
  { value: 'blue', label: 'Azul 🔵', class: 'bg-blue-500' },
  { value: 'green', label: 'Verde 🟢', class: 'bg-green-500' },
  { value: 'red', label: 'Rojo 🔴', class: 'bg-red-500' },
  { value: 'purple', label: 'Morado 🟣', class: 'bg-purple-500' },
  { value: 'yellow', label: 'Amarillo 🟡', class: 'bg-yellow-500' },
  { value: 'orange', label: 'Naranja 🟠', class: 'bg-orange-500' },
]

const CATEGORIES = [
  { value: '', label: 'Sin categoría' },
  { value: 'sustantivo', label: 'Sustantivo' },
  { value: 'adjetivo', label: 'Adjetivo' },
  { value: 'verbo', label: 'Verbo' },
  { value: 'phrasal verb', label: 'Phrasal Verb' },
  { value: 'adverbio', label: 'Adverbio' },
  { value: 'frase hecha', label: 'Frase Hecha' },
]

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
  const [color, setColor] = useState('')
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
      const { error: dbError } = await supabase.from('palabras').insert({
        palabra_original: preview.originalWord,
        traduccion: preview.translation,
        imagen_url: preview.imageUrl,
        categoria: categoria || null,
        color: color || null,
        notas: notas || null,
      })

      if (dbError) throw dbError

      // Reset all
      setWord('')
      setPreview(null)
      setCategoria('')
      setColor('')
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
    setColor('')
    setNotas('')
  }

  if (preview) {
    const colorClass = COLORS.find(c => c.value === color)?.class || ''

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
          {preview.imageUrl && (
            <img
              src={preview.imageUrl}
              alt={preview.originalWord}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}

          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-800">{preview.originalWord}</span>
            <span className="text-gray-400">→</span>
            <span className="text-2xl text-gray-700">{preview.translation}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {COLORS.map(col => (
                  <option key={col.value} value={col.value}>{col.label}</option>
                ))}
              </select>
            </div>
          </div>

          {color && (
            <div className={`h-2 rounded-full mb-3 ${colorClass}`}></div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Añade notas, ejemplos, contexto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar Palabra'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium transition-colors"
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
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleTranslate()}
            placeholder="Escribe una palabra o frase en inglés..."
            disabled={loading}
            className="flex-1 px-5 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            onClick={handleTranslate}
            disabled={loading || !word.trim()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all hover:shadow-lg"
          >
            {loading ? 'Traduciendo...' : 'Traducir'}
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={includeImage}
            onChange={(e) => setIncludeImage(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          Incluir imagen ilustrativa
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
