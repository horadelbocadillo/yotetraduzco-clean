import { useState, useRef } from 'react'
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
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [categoria, setCategoria] = useState('')
  const [notas, setNotas] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleTranslate = async () => {
    if (!word.trim()) return

    setLoading(true)
    setError('')

    try {
      // Translate only - no automatic image fetch
      const translateRes = await fetch('/.netlify/functions/translate', {
        method: 'POST',
        body: JSON.stringify({ word: word.trim() }),
      })

      if (!translateRes.ok) {
        const errorData = await translateRes.json()
        throw new Error(errorData.error || 'Error al traducir')
      }

      const { originalWord, translation } = await translateRes.json()

      // Show preview without image (user can add it optionally)
      setPreview({ originalWord, translation, imageUrl: null })
      setLoading(false)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!preview) return

    setLoading(true)
    setError('')

    try {
      // Auto-assign color based on category
      const autoColor = getCategoryColor(categoria)

      console.log('Saving word:', {
        palabra_original: preview.originalWord,
        traduccion: preview.translation,
        categoria: categoria || null,
        color: autoColor || null,
      })

      const { data, error: dbError } = await supabase.from('palabras').insert({
        palabra_original: preview.originalWord,
        traduccion: preview.translation,
        imagen_url: preview.imageUrl,
        categoria: categoria || null,
        color: autoColor || null,
        notas: notas || null,
      }).select()

      console.log('Supabase response:', { data, error: dbError })

      if (dbError) throw dbError

      // Reset all
      const savedWord = preview.originalWord
      setWord('')
      setPreview(null)
      setCategoria('')
      setNotas('')
      onWordAdded(savedWord)
    } catch (err) {
      console.error('Save error:', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setPreview(null)
    setCategoria('')
    setNotas('')
    setWord('')
    inputRef.current?.focus()
  }

  if (preview) {
    return (
      <div className="preview-card">
        {/* Palabra y traducción */}
        <div className="preview-main">
          <div className="preview-word">
            <span className="preview-original">{preview.originalWord}</span>
            <button
              onClick={() => pronounceWord(preview.originalWord, 'en-US')}
              className="preview-speak"
              title="Pronunciar"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
          <div className="preview-translation">{preview.translation}</div>
        </div>

        {/* Categoría */}
        <div className="preview-category">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="category-select-compact"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--rose-50)',
            border: '1px solid var(--rose-200)',
            color: 'var(--rose-700)',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}

        {/* Acciones */}
        <div className="preview-actions">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-save"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="btn-cancel"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="translation-card">
      <div className="input-group">
        <input
          ref={inputRef}
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleTranslate()}
          placeholder="Escribe una palabra o frase en inglés..."
          disabled={loading}
          aria-label="Palabra o frase en inglés para traducir"
          className="input"
        />
        <button
          onClick={handleTranslate}
          disabled={loading || !word.trim()}
          className="btn btn-primary"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          {loading ? 'Traduciendo...' : 'Traducir'}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'var(--rose-50)',
          border: '2px solid var(--rose-200)',
          color: 'var(--rose-700)',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          fontSize: '0.875rem',
          fontWeight: 500,
          marginTop: '1rem'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
