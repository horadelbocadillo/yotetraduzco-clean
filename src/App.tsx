import { useState } from 'react'
import { WordInput } from './components/WordInput'
import { WordList } from './components/WordList'
import { Toast } from './components/Toast'
import { Quiz } from './components/Quiz/Quiz'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)

  const handleWordAdded = (word: string) => {
    setRefreshTrigger(prev => prev + 1)
    setToastMessage({
      title: 'Palabra guardada',
      message: `"${word}" se añadió a tu diccionario`
    })
  }

  return (
    <div className="app">
      {/* Header compacto */}
      <header className="header-compact">
        <div className="header-left">
          <div className="logo-small">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="header-title-compact">Yo te traduzco</h1>
        </div>
        <button
          className="btn-quiz-icon"
          onClick={() => setShowQuiz(true)}
          title="Practicar con Quiz"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Campo de búsqueda/traducción */}
        <section className="search-section-main">
          <WordInput onWordAdded={handleWordAdded} />
        </section>

        {/* Lista de palabras guardadas */}
        <section className="words-section">
          <WordList refreshTrigger={refreshTrigger} />
        </section>
      </main>

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="modal-overlay" onClick={() => setShowQuiz(false)}>
          <div className="modal-content modal-quiz" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowQuiz(false)}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Quiz onExit={() => setShowQuiz(false)} />
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <Toast
          title={toastMessage.title}
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  )
}

export default App
