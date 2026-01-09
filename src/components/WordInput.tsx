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
  const [loadingImage, setLoadingImage] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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

      // 2. Get image (always try to fetch by default)
      let imageUrl = null
      const imageRes = await fetch('/.netlify/functions/get-image', {
        method: 'POST',
        body: JSON.stringify({ query: originalWord }),
      })

      if (imageRes.ok) {
        const data = await imageRes.json()
        imageUrl = data.imageUrl
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
    setWord('') // Clear input
    inputRef.current?.focus() // Focus back to input
  }

  const handleChangeImage = async () => {
    if (!preview) return

    setLoadingImage(true)
    try {
      const imageRes = await fetch('/.netlify/functions/get-image', {
        method: 'POST',
        body: JSON.stringify({ query: preview.originalWord }),
      })

      if (imageRes.ok) {
        const data = await imageRes.json()
        setPreview({ ...preview, imageUrl: data.imageUrl })
      }
    } catch (err) {
      console.error('Error fetching image:', err)
    } finally {
      setLoadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    if (!preview) return
    setPreview({ ...preview, imageUrl: null })
  }

  if (preview) {
    const categoryColor = getCategoryColor(categoria)

    return (
      <div className="translation-card">
        {preview.imageUrl ? (
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <img
              src={preview.imageUrl}
              alt={preview.originalWord}
              style={{
                width: '100%',
                height: '14rem',
                objectFit: 'cover',
                borderRadius: '12px'
              }}
            />
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '0.75rem'
            }}>
              <button
                onClick={handleChangeImage}
                disabled={loadingImage}
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.875rem', padding: '0.625rem 1rem' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {loadingImage ? 'Buscando...' : 'Cambiar imagen'}
              </button>
              <button
                onClick={handleRemoveImage}
                className="btn btn-secondary"
                style={{ fontSize: '0.875rem', padding: '0.625rem 1rem' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Quitar
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--neutral-50)',
            border: '2px dashed var(--neutral-300)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto', color: 'var(--neutral-400)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p style={{ color: 'var(--neutral-600)', fontSize: '0.875rem', marginTop: '0.75rem', marginBottom: '1rem' }}>
              Sin imagen
            </p>
            <button
              onClick={handleChangeImage}
              disabled={loadingImage}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem', padding: '0.625rem 1.5rem' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {loadingImage ? 'Buscando...' : 'Añadir imagen'}
            </button>
          </div>
        )}

        <div className="word-pair" style={{ marginBottom: '2rem' }}>
          <div className="word-original">
            <span>{preview.originalWord}</span>
            <button
              onClick={() => pronounceWord(preview.originalWord, 'en-US')}
              className="pronunciation-btn"
              aria-label="Pronunciar palabra en inglés"
            >
              <span className="lang-badge">EN</span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
          <span className="arrow">:</span>
          <div className="word-translation">
            <span>{preview.translation}</span>
            <button
              onClick={() => pronounceWord(preview.translation, 'es-ES')}
              className="pronunciation-btn"
              aria-label="Pronunciar traducción en español"
            >
              <span className="lang-badge es">ES</span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--neutral-500)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Categoría
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="filter-select"
            style={{ width: '100%' }}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          {categoryColor && (
            <div style={{
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--neutral-500)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: `linear-gradient(180deg, var(--${categoryColor}-500), var(--${categoryColor}-600))`
              }}></div>
              <span>Color asignado automáticamente</span>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--neutral-500)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Notas
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Añade contexto, ejemplos o recordatorios..."
            className="input"
            style={{
              width: '100%',
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--neutral-100)'
        }}>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="btn btn-secondary"
          >
            Cancelar
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
