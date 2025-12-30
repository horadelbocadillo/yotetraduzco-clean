import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface WordInputProps {
  onWordAdded: () => void
}

export function WordInput({ onWordAdded }: WordInputProps) {
  const [word, setWord] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      const { originalWord, translation } = await translateRes.json()

      // 2. Get image
      const imageRes = await fetch('/.netlify/functions/get-image', {
        method: 'POST',
        body: JSON.stringify({ query: originalWord }),
      })
      const { imageUrl } = await imageRes.json()

      // 3. Save to Supabase
      const { error: dbError } = await supabase.from('palabras').insert({
        palabra_original: originalWord,
        traduccion: translation,
        imagen_url: imageUrl,
      })

      if (dbError) throw dbError

      setWord('')
      onWordAdded()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleTranslate()}
          placeholder="Escribe una palabra en inglés..."
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleTranslate}
          disabled={loading || !word.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Traduciendo...' : 'Traducir'}
        </button>
      </div>
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  )
}
