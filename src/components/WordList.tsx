import { useEffect, useState } from 'react'
import type { Word } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { WordCard } from './WordCard'

interface WordListProps {
  refreshTrigger: number
}

const CATEGORIES = [
  { value: 'sustantivo', label: 'Sustantivos', emoji: '📦' },
  { value: 'adjetivo', label: 'Adjetivos', emoji: '✨' },
  { value: 'verbo', label: 'Verbos', emoji: '⚡' },
  { value: 'phrasal verb', label: 'Phrasal Verbs', emoji: '🔗' },
  { value: 'adverbio', label: 'Adverbios', emoji: '➡️' },
  { value: 'frase hecha', label: 'Frases Hechas', emoji: '💬' },
]

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
      {/* Search bar */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Buscar palabras..."
          className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            categoryFilter === ''
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              categoryFilter === cat.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Word count */}
      {!loading && words.length > 0 && (
        <div className="text-sm text-gray-500">
          {words.length} {words.length === 1 ? 'palabra' : 'palabras'}
          {categoryFilter && ` en ${CATEGORIES.find(c => c.value === categoryFilter)?.label}`}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Cargando...</p>
        </div>
      ) : words.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500 text-lg">
            {search || categoryFilter
              ? 'No se encontraron palabras con esos filtros'
              : 'No hay palabras guardadas aún'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {!search && !categoryFilter && '¡Traduce tu primera palabra arriba!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {words.map((word) => (
            <WordCard key={word.id} word={word} onUpdate={fetchWords} />
          ))}
        </div>
      )}
    </div>
  )
}
