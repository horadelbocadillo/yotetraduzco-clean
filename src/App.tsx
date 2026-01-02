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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header mejorado con logo y gradientes */}
      <header className="bg-gradient-to-br from-white to-neutral-50 border-b border-neutral-200 relative overflow-hidden">
        {/* Barra de color rainbow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 via-emerald-500 via-amber-500 to-rose-500" />

        <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
          <div className="flex items-center justify-center gap-4">
            {/* Logo */}
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-soft-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>

            {/* Texto del header */}
            <div className="text-center">
              <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent tracking-tight">
                Yo te traduzco
              </h1>
              <p className="mt-1 text-sm md:text-base text-neutral-600 font-medium">
                Tu diccionario personal inglés—español
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16 space-y-16">
        {/* Sección de traducción */}
        <section className="animate-slide-up">
          <WordInput onWordAdded={handleWordAdded} />
        </section>

        {/* Sección de palabras guardadas */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-neutral-800 tracking-tight">
              Palabras guardadas
            </h2>
          </div>
          <WordList refreshTrigger={refreshTrigger} />
        </section>
      </main>

      {/* Footer mejorado */}
      <footer className="max-w-3xl mx-auto px-6 py-12 text-center text-sm text-neutral-600 border-t border-neutral-200 mt-16">
        <p>Hecho con <span className="text-rose-500 inline-block animate-heartbeat">♥</span> usando Claude Code</p>
      </footer>

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
