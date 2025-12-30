import { useEffect, useState } from 'react'
import type { Word } from '../lib/supabase'
import { supabase } from '../lib/supabase'

interface WordListProps {
  refreshTrigger: number
}

const CATEGORIES = [
  { value: 'sustantivo', label: 'Sustantivos', emoji: '📦', color: 'blue' },
  { value: 'adjetivo', label: 'Adjetivos', emoji: '✨', color: 'green' },
  { value: 'verbo', label: 'Verbos', emoji: '⚡', color: 'purple' },
  { value: 'phrasal verb', label: 'Phrasal Verbs', emoji: '🔗', color: 'orange' },
  { value: 'adverbio', label: 'Adverbios', emoji: '➡️', color: 'yellow' },
  { value: 'frase hecha', label: 'Frases Hechas', emoji: '💬', color: 'red' },
]

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
}

export function WordList({ refreshTrigger }: WordListProps) {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editCategoria, setEditCategoria] = useState('')
  const [editNotas, setEditNotas] = useState('')

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

  const handleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
    setEditingId(null)
  }

  const handleEdit = (word: Word) => {
    setEditingId(word.id)
    setEditCategoria(word.categoria || '')
    setEditNotas(word.notas || '')
  }

  const handleSave = async (wordId: number) => {
    const categoryColor = CATEGORIES.find(c => c.value === editCategoria)?.color || ''

    await supabase.from('palabras').update({
      categoria: editCategoria || null,
      color: categoryColor || null,
      notas: editNotas || null,
    }).eq('id', wordId)

    setEditingId(null)
    fetchWords()
  }

  const getCategoryColor = (categoria: string | null) => {
    if (!categoria) return ''
    return CATEGORIES.find(c => c.value === categoria)?.color || ''
  }

  return (
    <div className="space-y-8">
      {/* Search bar */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar palabras..."
          className="w-full px-5 py-3.5 text-base border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition-all bg-white"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all uppercase tracking-wide ${
            categoryFilter === ''
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              categoryFilter === cat.value
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span className="mr-1.5">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Word count */}
      {!loading && words.length > 0 && (
        <div className="text-xs text-neutral-400 uppercase tracking-wide">
          {words.length} {words.length === 1 ? 'palabra' : 'palabras'}
          {categoryFilter && ` · ${CATEGORIES.find(c => c.value === categoryFilter)?.label}`}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-300"></div>
          <p className="mt-4 text-neutral-400 text-sm">Cargando...</p>
        </div>
      ) : words.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 opacity-20">📚</div>
          <p className="text-neutral-400 text-base">
            {search || categoryFilter
              ? 'No se encontraron palabras'
              : 'No hay palabras guardadas'}
          </p>
          <p className="text-neutral-300 text-sm mt-2">
            {!search && !categoryFilter && 'Traduce tu primera palabra arriba'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {words.map((word) => {
            const isExpanded = expandedId === word.id
            const isEditing = editingId === word.id
            const colorClass = COLOR_CLASSES[getCategoryColor(word.categoria)] || 'bg-neutral-300'

            return (
              <div key={word.id} className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
                {/* Word item - clickable */}
                <button
                  onClick={() => handleExpand(word.id)}
                  className="w-full px-5 py-4 flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left"
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorClass}`}></div>
                  <span className="text-lg font-light text-neutral-900 flex-1">{word.palabra_original}</span>
                  <span className="text-neutral-400 text-sm">
                    {isExpanded ? '↑' : '→'}
                  </span>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-neutral-100">
                    {word.imagen_url && (
                      <img
                        src={word.imagen_url}
                        alt={word.palabra_original}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}

                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-xl font-light text-neutral-900">{word.palabra_original}</span>
                      <span className="text-neutral-300">→</span>
                      <span className="text-lg text-neutral-600">{word.traduccion}</span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4 pt-4 border-t border-neutral-100">
                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">Categoría</label>
                          <select
                            value={editCategoria}
                            onChange={(e) => setEditCategoria(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 bg-white"
                          >
                            <option value="">Sin categoría</option>
                            {CATEGORIES.map(cat => (
                              <option key={cat.value} value={cat.value}>
                                {cat.emoji} {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">Notas</label>
                          <textarea
                            value={editNotas}
                            onChange={(e) => setEditNotas(e.target.value)}
                            placeholder="Añade notas, ejemplos..."
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
                            rows={2}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(word.id)}
                            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 text-xs font-medium"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 text-xs font-medium"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {word.categoria && (
                          <div className="text-xs text-neutral-500 mb-2">
                            {CATEGORIES.find(c => c.value === word.categoria)?.emoji} {CATEGORIES.find(c => c.value === word.categoria)?.label}
                          </div>
                        )}
                        {word.notas && (
                          <div className="text-sm text-neutral-600 mt-3 pt-3 border-t border-neutral-100">
                            {word.notas}
                          </div>
                        )}
                        <button
                          onClick={() => handleEdit(word)}
                          className="mt-4 text-xs text-neutral-500 hover:text-neutral-900 font-medium uppercase tracking-wide"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
