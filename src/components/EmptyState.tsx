export function EmptyState() {
  return (
    <div className="text-center py-16 px-6 bg-white rounded-2xl border-2 border-dashed border-neutral-200">
      <svg className="w-44 h-44 mx-auto mb-8 opacity-80" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" fill="#f5f5f5"/>
        <path d="M60 80 L80 60 L120 100 L140 80" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="70" cy="70" r="8" fill="#a3a3a3"/>
        <circle cx="130" cy="70" r="8" fill="#a3a3a3"/>
        <path d="M75 120 Q100 140 125 120" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M50 50 L60 80 M150 50 L140 80" stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <h3 className="font-display text-2xl font-semibold text-neutral-800 mb-3">
        Tu diccionario está vacío
      </h3>
      <p className="text-neutral-600 mb-8 max-w-md mx-auto">
        Comienza a traducir palabras y frases para construir tu colección personal de vocabulario.
      </p>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 border-2 border-neutral-200 text-neutral-700 rounded-xl font-semibold transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Añadir tu primera palabra
      </button>
    </div>
  )
}
