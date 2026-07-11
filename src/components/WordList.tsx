import { useEffect, useState } from 'react'
import type { Word } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { CATEGORIES, getCategory } from '../lib/constants'
import { EmptyState } from './EmptyState'
import { pronounceWord } from '../lib/utils'
import { WordDetail } from './WordDetail'

interface WordListProps {
  refreshTrigger: number
}

export function WordList({ refreshTrigger }: WordListProps) {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)

  const fetchWords = async () => {
    setLoading(true)
    let query = supabase
      .from('palabras')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`palabra_original.ilike.%${search}%,traduccion.ilike.%${search}%`)
    }

    if (categoryFilter) {
      query = query.eq('categoria', categoryFilter)
    }

    const { data } = await query
    setWords(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchWords()
  }, [refreshTrigger, categoryFilter])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchWords()
    }, 300)
    return () => clearTimeout(debounceTimer)
  }, [search])

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta palabra?')) {
      await supabase.from('palabras').delete().eq('id', id)
      fetchWords()
    }
  }

  const getCategoryColor = (categoria: string | null) => {
    const cat = getCategory(categoria)
    return cat?.color || 'neutral'
  }

  return (
    <div className="word-list-container">
      {/* Header con contador y filtros */}
      <div className="word-list-header">
        <div className="word-list-title">
          <span className="word-list-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span>Guardadas</span>
          {!loading && (
            <span className="word-count-badge">{words.length}</span>
          )}
        </div>

        {/* Filtro de categoría */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="category-filter"
        >
          <option value="">Todas</option>
          {CATEGORIES.filter(c => c.value).map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Barra de búsqueda */}
      <div className="word-list-search">
        <svg className="search-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en tu biblioteca..."
          className="search-input-compact"
        />
      </div>

      {/* Lista de palabras */}
      <div className="word-list-items">
        {loading ? (
          <div className="word-list-loading">
            <div className="spinner-small"></div>
            <span>Cargando...</span>
          </div>
        ) : words.length === 0 ? (
          search || categoryFilter ? (
            <div className="word-list-empty">
              <span>No se encontraron palabras</span>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          words.map((word) => {
            const categoryData = getCategory(word.categoria)
            const colorClass = getCategoryColor(word.categoria)

            return (
              <div
                key={word.id}
                className="word-item word-item-clickable"
                onClick={() => setSelectedWord(word)}
              >
                <div className={`word-item-dot ${colorClass}`}></div>
                <div className="word-item-content">
                  <div className="word-item-header">
                    <span className="word-item-original">{word.palabra_original}</span>
                    <button
                      className="word-item-speak"
                      onClick={(e) => {
                        e.stopPropagation()
                        pronounceWord(word.palabra_original, 'en-US')
                      }}
                      title="Pronunciar"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                    {categoryData && (
                      <span className={`word-item-category ${colorClass}`}>
                        {categoryData.label}
                      </span>
                    )}
                  </div>
                  <div className="word-item-translation">{word.traduccion}</div>
                </div>
                <button
                  className="word-item-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(word.id)
                  }}
                  title="Eliminar"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Modal de detalle */}
      {selectedWord && (
        <WordDetail
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  )
}
