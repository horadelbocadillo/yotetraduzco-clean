import { useState } from 'react'
import { CATEGORIES } from '../../lib/constants'

interface QuizSetupProps {
  totalWords: number
  onStart: (count: number, category: string | null) => void
  onCancel: () => void
}

export function QuizSetup({ totalWords, onStart, onCancel }: QuizSetupProps) {
  const [count, setCount] = useState(10)
  const [category, setCategory] = useState<string | null>(null)

  const counts = [5, 10, 15, 20]
  const maxCount = Math.min(totalWords, 20)

  if (totalWords < 4) {
    return (
      <div className="quiz-setup">
        <div className="quiz-setup-card">
          <h2 className="quiz-setup-title">Quiz de vocabulario</h2>
          <p className="quiz-setup-warning">
            Necesitas al menos 4 palabras en tu diccionario para empezar un quiz.
            Actualmente tienes {totalWords}.
          </p>
          <button className="btn btn-secondary" onClick={onCancel}>
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-setup">
      <div className="quiz-setup-card">
        <h2 className="quiz-setup-title">Quiz de vocabulario</h2>
        <p className="quiz-setup-subtitle">
          Pon a prueba tu memoria con dos rondas: primero elige la traducción correcta, luego escríbela.
        </p>

        <div className="quiz-setup-section">
          <label className="quiz-setup-label">Número de palabras</label>
          <div className="quiz-count-options">
            {counts.map(n => (
              <button
                key={n}
                className={`quiz-count-btn ${count === n ? 'active' : ''} ${n > maxCount ? 'disabled' : ''}`}
                onClick={() => n <= maxCount && setCount(n)}
                disabled={n > maxCount}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="quiz-setup-hint">
            Tienes {totalWords} palabras disponibles
          </p>
        </div>

        <div className="quiz-setup-section">
          <label className="quiz-setup-label">Filtrar por categoría (opcional)</label>
          <select
            className="filter-select"
            value={category || ''}
            onChange={e => setCategory(e.target.value || null)}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="quiz-setup-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onStart(count, category)}
          >
            Empezar Quiz
          </button>
        </div>
      </div>
    </div>
  )
}
