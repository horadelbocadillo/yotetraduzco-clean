import type { Word } from '../../lib/supabase'

interface Answer {
  word: Word
  userAnswer: string
  isCorrect: boolean
  type: 'multiple' | 'write'
}

interface QuizResultsProps {
  answers: Answer[]
  onRetry: () => void
  onExit: () => void
}

export function QuizResults({ answers, onRetry, onExit }: QuizResultsProps) {
  const correctCount = answers.filter(a => a.isCorrect).length
  const totalCount = answers.length
  const percentage = Math.round((correctCount / totalCount) * 100)

  const multipleChoiceAnswers = answers.filter(a => a.type === 'multiple')
  const writeAnswers = answers.filter(a => a.type === 'write')
  const incorrectAnswers = answers.filter(a => !a.isCorrect)

  const getScoreEmoji = () => {
    if (percentage >= 90) return '🎉'
    if (percentage >= 70) return '👏'
    if (percentage >= 50) return '💪'
    return '📚'
  }

  const getScoreMessage = () => {
    if (percentage >= 90) return '¡Excelente! Dominas este vocabulario'
    if (percentage >= 70) return '¡Muy bien! Vas por buen camino'
    if (percentage >= 50) return 'No está mal, pero puedes mejorar'
    return 'Sigue practicando, ¡tú puedes!'
  }

  return (
    <div className="quiz-results">
      <div className="quiz-results-card">
        <div className="quiz-results-header">
          <span className="quiz-results-emoji">{getScoreEmoji()}</span>
          <h2 className="quiz-results-title">Quiz completado</h2>
          <p className="quiz-results-message">{getScoreMessage()}</p>
        </div>

        <div className="quiz-score">
          <div className="quiz-score-circle">
            <svg viewBox="0 0 100 100">
              <circle
                className="quiz-score-bg"
                cx="50"
                cy="50"
                r="45"
                strokeWidth="10"
                fill="none"
              />
              <circle
                className="quiz-score-fill"
                cx="50"
                cy="50"
                r="45"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${percentage * 2.83} 283`}
                strokeLinecap="round"
              />
            </svg>
            <div className="quiz-score-text">
              <span className="quiz-score-number">{percentage}%</span>
              <span className="quiz-score-label">{correctCount}/{totalCount}</span>
            </div>
          </div>
        </div>

        <div className="quiz-results-breakdown">
          <div className="quiz-breakdown-item">
            <span className="quiz-breakdown-label">Multiple choice</span>
            <span className="quiz-breakdown-value">
              {multipleChoiceAnswers.filter(a => a.isCorrect).length}/{multipleChoiceAnswers.length}
            </span>
          </div>
          <div className="quiz-breakdown-item">
            <span className="quiz-breakdown-label">Escribir respuesta</span>
            <span className="quiz-breakdown-value">
              {writeAnswers.filter(a => a.isCorrect).length}/{writeAnswers.length}
            </span>
          </div>
        </div>

        {incorrectAnswers.length > 0 && (
          <div className="quiz-mistakes">
            <h3 className="quiz-mistakes-title">Palabras a repasar</h3>
            <div className="quiz-mistakes-list">
              {incorrectAnswers.map((answer, index) => (
                <div key={index} className="quiz-mistake-item">
                  <div className="quiz-mistake-word">
                    <span className="quiz-mistake-en">{answer.word.palabra_original}</span>
                    <span className="quiz-mistake-arrow">→</span>
                    <span className="quiz-mistake-es">{answer.word.traduccion}</span>
                  </div>
                  <div className="quiz-mistake-your">
                    Tu respuesta: <span className="quiz-mistake-wrong">{answer.userAnswer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="quiz-results-actions">
          <button className="btn btn-secondary" onClick={onExit}>
            Volver al diccionario
          </button>
          <button className="btn btn-primary" onClick={onRetry}>
            Repetir Quiz
          </button>
        </div>
      </div>
    </div>
  )
}
