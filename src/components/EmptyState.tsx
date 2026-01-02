export function EmptyState() {
  return (
    <div className="empty-state">
      <svg className="empty-illustration" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" fill="#f5f5f5"/>
        <path d="M60 80 L80 60 L120 100 L140 80" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="70" cy="70" r="8" fill="#a3a3a3"/>
        <circle cx="130" cy="70" r="8" fill="#a3a3a3"/>
        <path d="M75 120 Q100 140 125 120" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M50 50 L60 80 M150 50 L140 80" stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <h3 className="empty-title">
        Tu diccionario está vacío
      </h3>
      <p className="empty-description">
        Comienza a traducir palabras y frases para construir tu colección personal de vocabulario.
      </p>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="btn btn-secondary"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Añadir tu primera palabra
      </button>
    </div>
  )
}
