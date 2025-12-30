import { useState } from 'react'
import { WordInput } from './components/WordInput'
import { WordList } from './components/WordList'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header - minimal y elegante */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-light text-neutral-900 text-center tracking-tight">
            Yo te traduzco
          </h1>
          <p className="text-center mt-2 text-sm text-neutral-500">
            Tu diccionario personal inglés—español
          </p>
        </div>
      </header>

      {/* Main content con constraints */}
      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-16">
        {/* Sección de traducción */}
        <section>
          <WordInput onWordAdded={() => setRefreshTrigger(prev => prev + 1)} />
        </section>

        {/* Sección de palabras guardadas */}
        <section>
          <h2 className="text-xl md:text-2xl font-light text-neutral-800 mb-8">
            Palabras guardadas
          </h2>
          <WordList refreshTrigger={refreshTrigger} />
        </section>
      </main>

      {/* Footer minimal */}
      <footer className="max-w-5xl mx-auto px-6 py-12 text-center text-sm text-neutral-400 border-t border-neutral-200 mt-16">
        <p>Hecho con Claude Code</p>
      </footer>
    </div>
  )
}

export default App
