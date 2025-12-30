import { useEffect, useState } from 'react'
import { Word, supabase } from '../lib/supabase'
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar palabras..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Todas las categorías</option>
          <option value="sustantivo">Sustantivos</option>
          <option value="adjetivo">Adjetivos</option>
          <option value="verbo">Verbos</option>
          <option value="phrasal verb">Phrasal Verbs</option>
          <option value="adverbio">Adverbios</option>
          <option value="frase hecha">Frases Hechas</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : words.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay palabras guardadas aún
        </div>
      ) : (
        <div className="grid gap-4">
          {words.map((word) => (
            <WordCard key={word.id} word={word} onUpdate={fetchWords} />
          ))}
        </div>
      )}
    </div>
  )
}
