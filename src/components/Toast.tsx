import { useEffect } from 'react'

interface ToastProps {
  message: string
  title?: string
  onClose: () => void
  duration?: number
}

export function Toast({ message, title = 'Éxito', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="fixed bottom-8 right-8 bg-white rounded-xl shadow-soft-xl border border-emerald-200 flex items-center gap-4 p-4 pr-6 animate-toast z-50 max-w-md">
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="font-semibold text-neutral-900">{title}</div>
        <div className="text-sm text-neutral-600">{message}</div>
      </div>
      <button
        onClick={onClose}
        className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 p-1 rounded transition-colors"
        aria-label="Cerrar notificación"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
