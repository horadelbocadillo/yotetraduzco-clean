import { useState } from 'react'
import type { Word } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

interface WordCardProps {
  word: Word
  onUpdate: () => void
}

const COLORS = [
  { value: 'blue', label: 'Azul 🔵', borderClass: 'border-l-blue-500', bgClass: 'bg-blue-500', textClass: 'text-blue-700', bgLightClass: 'bg-blue-50' },
  { value: 'green', label: 'Verde 🟢', borderClass: 'border-l-green-500', bgClass: 'bg-green-500', textClass: 'text-green-700', bgLightClass: 'bg-green-50' },
  { value: 'red', label: 'Rojo 🔴', borderClass: 'border-l-red-500', bgClass: 'bg-red-500', textClass: 'text-red-700', bgLightClass: 'bg-red-50' },
  { value: 'purple', label: 'Morado 🟣', borderClass: 'border-l-purple-500', bgClass: 'bg-purple-500', textClass: 'text-purple-700', bgLightClass: 'bg-purple-50' },
  { value: 'yellow', label: 'Amarillo 🟡', borderClass: 'border-l-yellow-500', bgClass: 'bg-yellow-500', textClass: 'text-yellow-700', bgLightClass: 'bg-yellow-50' },
  { value: 'orange', label: 'Naranja 🟠', borderClass: 'border-l-orange-500', bgClass: 'bg-orange-500', textClass: 'text-orange-700', bgLightClass: 'bg-orange-50' },
]

const CATEGORIES = [
  { value: 'sustantivo', label: 'Sustantivo', emoji: '📦' },
  { value: 'adjetivo', label: 'Adjetivo', emoji: '✨' },
  { value: 'verbo', label: 'Verbo', emoji: '⚡' },
  { value: 'phrasal verb', label: 'Phrasal Verb', emoji: '🔗' },
  { value: 'adverbio', label: 'Adverbio', emoji: '➡️' },
  { value: 'frase hecha', label: 'Frase Hecha', emoji: '💬' },
]

export function WordCard({ word, onUpdate }: WordCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [categoria, setCategoria] = useState(word.categoria || '')
  const [color, setColor] = useState(word.color || '')
  const [notas, setNotas] = useState(word.notas || '')

  const colorConfig = COLORS.find(c => c.value === word.color)
  const colorClass = colorConfig?.borderClass || 'border-l-gray-300'
  const bgGradient = colorConfig ? colorConfig.bgLightClass : 'bg-gray-50'

  const categoryData = CATEGORIES.find(c => c.value === word.categoria)

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
    <div className={cn(
      "border-l-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden",
      colorClass
    )}>
      <div className="md:flex">
        {/* Image section */}
        {word.imagen_url ? (
          <div className="md:w-2/5 md:flex-shrink-0">
            <img
              src={word.imagen_url}
              alt={word.palabra_original}
              className="w-full h-48 md:h-full object-cover"
            />
          </div>
        ) : word.color ? (
          <div className={cn("md:w-1/5 md:flex-shrink-0 h-32 md:h-auto", bgGradient)}></div>
        ) : null}

        {/* Content section */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold text-gray-900">{word.palabra_original}</span>
                <span className="text-gray-400 text-xl">→</span>
                <span className="text-xl text-gray-700">{word.traduccion}</span>
              </div>

              {categoryData && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  <span>{categoryData.emoji}</span>
                  <span>{categoryData.label}</span>
                </span>
              )}
            </div>

            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="ml-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {isEditing ? '💾 Guardar' : '✏️ Editar'}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-3 mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sin color</option>
                    {COLORS.map(col => (
                      <option key={col.value} value={col.value}>{col.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Añade notas, ejemplos..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
          ) : (
            word.notas && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 italic">{word.notas}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
