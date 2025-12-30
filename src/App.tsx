import { useState } from 'react'
import { WordInput } from './components/WordInput'
import { WordList } from './components/WordList'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6 px-4 shadow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center">
            Yo te traduzco
          </h1>
          <p className="text-center mt-2 text-blue-100">
            Tu diccionario personal inglés-español
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <WordInput onWordAdded={() => setRefreshTrigger(prev => prev + 1)} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Palabras Guardadas</h2>
          <WordList refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  )
}

export default App
