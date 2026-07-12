import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Word } from '../../lib/supabase'
import { updateWordProgress, isDue } from '../../lib/srs'
import { QuizSetup } from './QuizSetup'
import { QuestionMultipleChoice } from './QuestionMultipleChoice'
import { QuestionWriteAnswer } from './QuestionWriteAnswer'
import { QuizResults } from './QuizResults'

type QuizState = 'setup' | 'playing' | 'results'
type QuestionType = 'multiple' | 'write'

interface Answer {
  word: Word
  userAnswer: string
  isCorrect: boolean
  type: QuestionType
}

interface Question {
  word: Word
  type: QuestionType
  options?: Word[] // solo para multiple choice
}

interface QuizProps {
  onExit: () => void
}

// Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function Quiz({ onExit }: QuizProps) {
  const [state, setState] = useState<QuizState>('setup')
  const [allWords, setAllWords] = useState<Word[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWords()
  }, [])

  const fetchWords = async () => {
    const { data } = await supabase
      .from('palabras')
      .select('*')

    if (data) {
      setAllWords(data)
    }
    setLoading(false)
  }

  const generateQuestions = (count: number, category: string | null): Question[] => {
    let words = allWords

    if (category) {
      words = words.filter(w => w.categoria === category)
    }

    // Prioridad SRS: primero las que tocan hoy (falladas o con repaso semanal
    // cumplido), y si no llenan el quiz, se completa con el resto
    const dueWords = shuffleArray(words.filter(w => isDue(w)))
    const restWords = shuffleArray(words.filter(w => !isDue(w)))
    const selected = [...dueWords, ...restWords].slice(0, count)

    // Dividir: primera mitad multiple choice, segunda mitad escribir
    const half = Math.ceil(count / 2)
    const multipleChoiceWords = selected.slice(0, half)
    const writeWords = selected.slice(half)

    const multipleChoiceQuestions: Question[] = multipleChoiceWords.map(word => {
      // Generar 3 opciones incorrectas aleatorias
      const otherWords = allWords.filter(w => w.id !== word.id)
      const wrongOptions = shuffleArray(otherWords).slice(0, 3)
      const options = shuffleArray([word, ...wrongOptions])

      return {
        word,
        type: 'multiple' as QuestionType,
        options
      }
    })

    const writeQuestions: Question[] = writeWords.map(word => ({
      word,
      type: 'write' as QuestionType
    }))

    // Mezclar el orden de las preguntas
    return shuffleArray([...multipleChoiceQuestions, ...writeQuestions])
  }

  const handleStart = (count: number, category: string | null) => {
    const generatedQuestions = generateQuestions(count, category)
    setQuestions(generatedQuestions)
    setCurrentIndex(0)
    setAnswers([])
    setState('playing')
  }

  const handleAnswer = (isCorrect: boolean, userAnswer: string) => {
    const currentQuestion = questions[currentIndex]

    // Guardar el progreso SRS por respuesta: si se abandona el quiz a
    // medias, lo ya contestado cuenta igualmente
    void updateWordProgress(currentQuestion.word, isCorrect)

    setAnswers(prev => [
      ...prev,
      {
        word: currentQuestion.word,
        userAnswer,
        isCorrect,
        type: currentQuestion.type
      }
    ])

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setState('results')
    }
  }

  const handleRetry = () => {
    setState('setup')
    setQuestions([])
    setAnswers([])
    setCurrentIndex(0)
  }

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="quiz-loading">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="quiz-container">
      {state === 'setup' && (
        <QuizSetup
          totalWords={allWords.length}
          onStart={handleStart}
          onCancel={onExit}
        />
      )}

      {state === 'playing' && questions[currentIndex] && (
        <>
          {questions[currentIndex].type === 'multiple' ? (
            <QuestionMultipleChoice
              key={questions[currentIndex].word.id}
              word={questions[currentIndex].word}
              options={questions[currentIndex].options!}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              onAnswer={handleAnswer}
            />
          ) : (
            <QuestionWriteAnswer
              key={questions[currentIndex].word.id}
              word={questions[currentIndex].word}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              onAnswer={handleAnswer}
            />
          )}
        </>
      )}

      {state === 'results' && (
        <QuizResults
          answers={answers}
          onRetry={handleRetry}
          onExit={onExit}
        />
      )}
    </div>
  )
}
