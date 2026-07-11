import { useState, useRef, useEffect } from 'react'
import type { Word } from '../../lib/supabase'

interface QuestionWriteAnswerProps {
  word: Word
  questionNumber: number
  totalQuestions: number
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
}

// Normaliza texto para comparación flexible (sin tildes, minúsculas, trim)
const normalizeAnswer = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export function QuestionWriteAnswer({
  word,
  questionNumber,
  totalQuestions,
  onAnswer
}: QuestionWriteAnswerProps) {
  const [answer, setAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (showFeedback || !answer.trim()) return

    const correct = normalizeAnswer(answer) === normalizeAnswer(word.traduccion)
    setIsCorrect(correct)
    setShowFeedback(true)

    setTimeout(() => {
      onAnswer(correct, answer)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className="quiz-question">
      <div className="quiz-progress">
        <div className="quiz-progress-text">
          Pregunta {questionNumber} de {totalQuestions}
        </div>
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="quiz-question-type">
        Escribe la traducción
      </div>

      <div className="quiz-word-display">
        <span className="quiz-word-en">{word.palabra_original}</span>
      </div>

      <form onSubmit={handleSubmit} className="quiz-write-form">
        <input
          ref={inputRef}
          type="text"
          className={`quiz-write-input ${showFeedback ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
          placeholder="Escribe la traducción en español..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={showFeedback}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {!showFeedback && (
          <button
            type="submit"
            className="btn btn-primary quiz-submit-btn"
            disabled={!answer.trim()}
          >
            Comprobar
          </button>
        )}
      </form>

      {showFeedback && (
        <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? (
            <>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>¡Correcto!</span>
            </>
          ) : (
            <>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>
                Incorrecto. La respuesta correcta es: <strong>{word.traduccion}</strong>
              </span>
            </>
          )}
        </div>
      )}

      <p className="quiz-write-hint">
        No te preocupes por mayúsculas o tildes
      </p>
    </div>
  )
}
