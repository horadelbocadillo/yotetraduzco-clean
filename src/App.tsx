import { useState } from 'react'
import { WordInput } from './components/WordInput'
import { WordList } from './components/WordList'
import { Toast } from './components/Toast'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null)

  const handleWordAdded = (word: string) => {
    setRefreshTrigger(prev => prev + 1)
    setToastMessage({
      title: 'Palabra guardada',
      message: `"${word}" se añadió a tu diccionario`
    })
  }

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="header-text">
            <h1 className="header-title">Yo te traduzco</h1>
            <p className="header-subtitle">Tu diccionario personal inglés—español</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {/* Translation Section */}
        <section className="section">
          <WordInput onWordAdded={handleWordAdded} />
        </section>

        {/* Search & Filters + Word Cards */}
        <section className="section">
          <WordList refreshTrigger={refreshTrigger} />
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Hecho con <span className="footer-heart">♥</span> usando Claude Code</p>
      </footer>

      {/* Toast notification */}
      {toastMessage && (
        <Toast
          title={toastMessage.title}
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  )
}

export default App
