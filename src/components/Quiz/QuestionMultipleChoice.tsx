import { useState } from 'react'
import type { Word } from '../../lib/supabase'

interface QuestionMultipleChoiceProps {
  word: Word
  options: Word[]
  questionNumber: number
  totalQuestions: number
  onAnswer: (isCorrect: boolean, userAnswer: string) => void
}

export function QuestionMultipleChoice({
  word,
  options,
  questionNumber,
  totalQuestions,
  onAnswer
}: QuestionMultipleChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleSelect = (option: Word, index: number) => {
    if (showFeedback) return

    setSelected(index)
    setShowFeedback(true)

    const isCorrect = option.id === word.id

    setTimeout(() => {
      onAnswer(isCorrect, option.traduccion)
    }, 1200)
  }

  const getOptionClass = (option: Word, index: number) => {
    if (!showFeedback) {
      return selected === index ? 'selected' : ''
    }

    if (option.id === word.id) {
      return 'correct'
    }

    if (selected === index && option.id !== word.id) {
      return 'incorrect'
    }

    return ''
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
        Elige la traducción correcta
      </div>

      <div className="quiz-word-display">
        <span className="quiz-word-en">{word.palabra_original}</span>
      </div>

      <div className="quiz-options">
        {options.map((option, index) => (
          <button
            key={option.id}
            className={`quiz-option ${getOptionClass(option, index)}`}
            onClick={() => handleSelect(option, index)}
            disabled={showFeedback}
          >
            <span className="quiz-option-letter">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="quiz-option-text">{option.traduccion}</span>
            {showFeedback && option.id === word.id && (
              <span className="quiz-option-icon correct">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            {showFeedback && selected === index && option.id !== word.id && (
              <span className="quiz-option-icon incorrect">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
