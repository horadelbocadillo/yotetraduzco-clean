import { useEffect, useState } from 'react'
import type { Word } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { pronounceWord } from '../lib/utils'
import { CATEGORIES, getCategoryColor, categoryDotVariants, getCategory } from '../lib/constants'
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
  }, [refreshTrigger, search, categoryFilter])

  return (
    <div className="space-y-6">
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en tus palabras..."
            aria-label="Buscar palabras guardadas"
            className="w-full pl-11 pr-4 py-3.5 text-base border-2 border-neutral-200 rounded-xl bg-white input-focus transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filtrar por categoría"
          className="px-4 py-3.5 border-2 border-neutral-200 rounded-xl bg-white input-focus transition-all font-medium text-sm min-w-[200px]"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.emoji} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Word count */}
      {!loading && words.length > 0 && (
        <div className="inline-flex items-center px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-full text-xs font-semibold">
          {words.length} {words.length === 1 ? 'palabra' : 'palabras'}
          {categoryFilter && ` · ${getCategory(categoryFilter)?.label}`}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-neutral-200 border-t-indigo-500"></div>
          <p className="mt-4 text-neutral-500 text-sm font-medium">Cargando palabras...</p>
        </div>
      ) : words.length === 0 ? (
        search || categoryFilter ? (
          <div className="text-center py-16 px-6">
            <div className="text-6xl mb-4 opacity-20">🔍</div>
            <p className="text-neutral-600 font-medium text-lg mb-2">No se encontraron palabras</p>
            <p className="text-neutral-500 text-sm">
              Intenta con otros términos o filtra por otra categoría
            </p>
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        <div className="grid gap-4">
          {words.map((word, index) => (
            <div
              key={word.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <WordCard word={word} onUpdate={fetchWords} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
