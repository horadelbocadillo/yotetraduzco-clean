import { useState } from 'react'
import type { Word } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

interface WordCardProps {
  word: Word
  onUpdate: () => void
}

const COLORS = [
  { value: 'blue', label: 'Azul 🔵', class: 'border-l-blue-500' },
  { value: 'green', label: 'Verde 🟢', class: 'border-l-green-500' },
  { value: 'red', label: 'Rojo 🔴', class: 'border-l-red-500' },
  { value: 'purple', label: 'Morado 🟣', class: 'border-l-purple-500' },
  { value: 'yellow', label: 'Amarillo 🟡', class: 'border-l-yellow-500' },
  { value: 'orange', label: 'Naranja 🟠', class: 'border-l-orange-500' },
]

const CATEGORIES = [
  'sustantivo',
  'adjetivo',
  'verbo',
  'phrasal verb',
  'adverbio',
  'frase hecha'
]

export function WordCard({ word, onUpdate }: WordCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [categoria, setCategoria] = useState(word.categoria || '')
  const [color, setColor] = useState(word.color || '')
  const [notas, setNotas] = useState(word.notas || '')

  const colorClass = COLORS.find(c => c.value === word.color)?.class || 'border-l-gray-300'

  const handleSave = async () => {
    await supabase.from('palabras').update({
      categoria: categoria || null,
      color: color || null,
      notas: notas || null,
    }).eq('id', word.id)

    setIsEditing(false)
    onUpdate()
  }

  return (
    <div className={cn("border-l-4 bg-white rounded-lg shadow p-4", colorClass)}>
      {word.imagen_url && (
        <img
          src={word.imagen_url}
          alt={word.palabra_original}
          className="w-full h-32 object-cover rounded mb-3"
        />
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-2 items-center">
          <span className="font-bold text-lg">{word.palabra_original}</span>
          <span>→</span>
          <span className="text-lg">{word.traduccion}</span>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          {isEditing ? 'Guardar' : 'Editar'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-2 mt-3">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Sin categoría</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Sin color</option>
            {COLORS.map(col => (
              <option key={col.value} value={col.value}>{col.label}</option>
            ))}
          </select>

          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Notas..."
            className="w-full p-2 border rounded"
            rows={2}
          />
        </div>
      ) : (
        <div className="text-sm text-gray-600 space-y-1">
          {word.categoria && <div>Categoría: {word.categoria}</div>}
          {word.notas && <div>Notas: {word.notas}</div>}
        </div>
      )}
    </div>
  )
}
