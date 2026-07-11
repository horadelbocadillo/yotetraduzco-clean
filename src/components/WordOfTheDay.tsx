import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Word } from '../lib/supabase'

export function WordOfTheDay() {
  const [word, setWord] = useState<Word | null>(null)
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    getWordOfDay()
  }, [])

  const getWordOfDay = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const cached = localStorage.getItem('wordOfTheDay')

      if (cached) {
        const { date, wordId } = JSON.parse(cached)
        if (date === today) {
          const { data } = await supabase
            .from('palabras')
            .select('*')
            .eq('id', wordId)
            .single()
          if (data) {
            setWord(data)
            setLoading(false)
            return
          }
        }
      }

      const { data: words } = await supabase
        .from('palabras')
        .select('*')

      if (!words?.length) {
        setLoading(false)
        return
      }

      // Random determinístico basado en fecha
      const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0)
      const index = seed % words.length
      const selectedWord = words[index]

      localStorage.setItem('wordOfTheDay', JSON.stringify({
        date: today,
        wordId: selectedWord.id
      }))

      setWord(selectedWord)
    } catch (error) {
      console.error('Error fetching word of the day:', error)
    } finally {
      setLoading(false)
    }
  }

  const speak = (text: string, lang: 'en-US' | 'es-ES') => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  }

  if (loading) {
    return (
      <div className="wotd-card wotd-loading">
        <div className="wotd-loading-text">Cargando palabra del día...</div>
      </div>
    )
  }

  if (!word) {
    return null
  }

  return (
    <div className="wotd-card">
      <div className="wotd-header">
        <span className="wotd-badge">Palabra del día</span>
        <span className="wotd-date">{new Date().toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        })}</span>
      </div>

      <div className="wotd-content">
        {word.imagen_url && (
          <div className="wotd-image">
            <img src={word.imagen_url} alt={word.palabra_original} />
          </div>
        )}

        <div className="wotd-word-section">
          <div className="wotd-original">
            <span>{word.palabra_original}</span>
            <button
              className="pronunciation-btn"
              onClick={() => speak(word.palabra_original, 'en-US')}
              title="Escuchar en inglés"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span className="lang-badge">EN</span>
            </button>
          </div>

          {revealed ? (
            <div className="wotd-translation">
              <span className="arrow">→</span>
              <span>{word.traduccion}</span>
              <button
                className="pronunciation-btn"
                onClick={() => speak(word.traduccion, 'es-ES')}
                title="Escuchar en español"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span className="lang-badge es">ES</span>
              </button>
            </div>
          ) : (
            <button
              className="wotd-reveal-btn"
              onClick={() => setRevealed(true)}
            >
              Revelar traducción
            </button>
          )}

          {word.categoria && (
            <span className={`category-badge ${word.color || 'blue'}`}>
              {word.categoria}
            </span>
          )}
        </div>
      </div>

      {revealed && word.notas && (
        <div className="wotd-notes">
          <strong>Notas:</strong> {word.notas}
        </div>
      )}
    </div>
  )
}
