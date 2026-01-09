import { useEffect, useState } from 'react'
import type { Word } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../lib/constants'
import { EmptyState } from './EmptyState'
import { WordCard } from './WordCard'

interface WordListProps {
  refreshTrigger: number
}

export function WordList({ refreshTrigger }: WordListProps) {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const wordsPerPage = 10

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

  // Fetch words immediately when refreshTrigger or categoryFilter changes
  useEffect(() => {
    fetchWords()
    setCurrentPage(1) // Reset to first page
  }, [refreshTrigger, categoryFilter])

  // Debounce search input - wait 300ms after user stops typing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchWords()
      setCurrentPage(1) // Reset to first page on search
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [search])

  // Calculate pagination
  const totalPages = Math.ceil(words.length / wordsPerPage)
  const startIndex = (currentPage - 1) * wordsPerPage
  const endIndex = startIndex + wordsPerPage
  const currentWords = words.slice(startIndex, endIndex)

  return (
    <>
      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">Palabras guardadas</h2>
        {!loading && words.length > 0 && (
          <span className="word-count">
            {words.length} {words.length === 1 ? 'palabra' : 'palabras'}
          </span>
        )}
      </div>

      {/* Search and filter */}
      {!loading && words.length > 0 && (
        <div className="search-section">
          <div className="search-wrapper">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en tus palabras..."
              aria-label="Buscar palabras guardadas"
              className="input"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filtrar por categoría"
            className="filter-select"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid var(--neutral-200)',
            borderTopColor: 'var(--indigo-500)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <p style={{
            marginTop: '1rem',
            color: 'var(--neutral-500)',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            Cargando palabras...
          </p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : words.length === 0 ? (
        search || categoryFilter ? (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.2 }}>🔍</div>
            <p style={{
              color: 'var(--neutral-600)',
              fontWeight: 500,
              fontSize: '1.125rem',
              marginBottom: '0.5rem'
            }}>
              No se encontraron palabras
            </p>
            <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
              Intenta con otros términos o filtra por otra categoría
            </p>
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        <>
          <div className="words-grid">
            {currentWords.map((word) => (
              <WordCard key={word.id} word={word} onUpdate={fetchWords} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--neutral-200)'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--neutral-200)',
                  background: currentPage === 1 ? 'var(--neutral-100)' : 'white',
                  color: currentPage === 1 ? 'var(--neutral-400)' : 'var(--neutral-700)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                Anterior
              </button>

              <span style={{
                color: 'var(--neutral-600)',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--neutral-200)',
                  background: currentPage === totalPages ? 'var(--neutral-100)' : 'white',
                  color: currentPage === totalPages ? 'var(--neutral-400)' : 'var(--neutral-700)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
