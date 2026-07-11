import { useState, useEffect } from 'react'
import type { Word } from '../lib/supabase'
import { pronounceWord } from '../lib/utils'
import { getCategory } from '../lib/constants'

interface WordDetailProps {
  word: Word
  onClose: () => void
}

interface DictionaryDefinition {
  definition: string
  example?: string
}

interface DictionaryMeaning {
  partOfSpeech: string
  definitions: DictionaryDefinition[]
}

interface DictionaryData {
  word: string
  phonetic?: string
  meanings: DictionaryMeaning[]
}

export function WordDetail({ word, onClose }: WordDetailProps) {
  const [dictionaryData, setDictionaryData] = useState<DictionaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const categoryData = getCategory(word.categoria)

  useEffect(() => {
    const fetchDictionary = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.palabra_original)}`
        )

        if (!response.ok) {
          throw new Error('No se encontraron definiciones')
        }

        const data = await response.json()

        if (data && data.length > 0) {
          // Combinar todas las acepciones de todas las entradas
          const allMeanings: DictionaryMeaning[] = []

          for (const entry of data) {
            if (entry.meanings) {
              for (const meaning of entry.meanings) {
                // Buscar si ya existe este partOfSpeech
                const existing = allMeanings.find(m => m.partOfSpeech === meaning.partOfSpeech)
                if (existing) {
                  // Añadir definiciones sin duplicar
                  for (const def of meaning.definitions) {
                    if (!existing.definitions.some(d => d.definition === def.definition)) {
                      existing.definitions.push(def)
                    }
                  }
                } else {
                  allMeanings.push({
                    partOfSpeech: meaning.partOfSpeech,
                    definitions: meaning.definitions.map((d: DictionaryDefinition) => ({
                      definition: d.definition,
                      example: d.example
                    }))
                  })
                }
              }
            }
          }

          setDictionaryData({
            word: data[0].word,
            phonetic: data[0].phonetic,
            meanings: allMeanings
          })
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchDictionary()
  }, [word.palabra_original])

  const getPartOfSpeechColor = (pos: string) => {
    const colors: Record<string, string> = {
      noun: 'blue',
      verb: 'purple',
      adjective: 'green',
      adverb: 'yellow',
      interjection: 'orange',
      pronoun: 'red',
      preposition: 'neutral',
      conjunction: 'neutral',
    }
    return colors[pos] || 'neutral'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-detail" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header con palabra */}
        <div className="detail-header">
          <div className="detail-word-row">
            <h2 className="detail-word">{word.palabra_original}</h2>
            <button
              onClick={() => pronounceWord(word.palabra_original, 'en-US')}
              className="detail-speak"
              title="Pronunciar"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            {categoryData && (
              <span className={`detail-category ${categoryData.color}`}>
                {categoryData.label}
              </span>
            )}
          </div>
          {dictionaryData?.phonetic && (
            <span className="detail-phonetic">{dictionaryData.phonetic}</span>
          )}
        </div>

        {/* Traducción guardada */}
        <div className="detail-translation-box">
          <span className="detail-translation-label">Traducción</span>
          <p className="detail-translation-text">{word.traduccion}</p>
        </div>

        {/* Definiciones del diccionario */}
        <div className="detail-definitions">
          <h3 className="detail-section-title">Definiciones en inglés</h3>

          {loading ? (
            <div className="detail-loading">
              <div className="spinner-small"></div>
              <span>Cargando definiciones...</span>
            </div>
          ) : error ? (
            <div className="detail-error">{error}</div>
          ) : dictionaryData?.meanings.length ? (
            <div className="detail-meanings">
              {dictionaryData.meanings.map((meaning, idx) => (
                <div key={idx} className="detail-meaning">
                  <span className={`detail-pos ${getPartOfSpeechColor(meaning.partOfSpeech)}`}>
                    {meaning.partOfSpeech}
                  </span>
                  <ol className="detail-def-list">
                    {meaning.definitions.slice(0, 5).map((def, defIdx) => (
                      <li key={defIdx} className="detail-def-item">
                        <span className="detail-def-text">{def.definition}</span>
                        {def.example && (
                          <span className="detail-def-example">"{def.example}"</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          ) : (
            <div className="detail-error">No se encontraron definiciones</div>
          )}
        </div>

        {/* Notas si existen */}
        {word.notas && (
          <div className="detail-notes">
            <h3 className="detail-section-title">Notas</h3>
            <p>{word.notas}</p>
          </div>
        )}
      </div>
    </div>
  )
}
