import { supabase } from './supabase'
import type { Word, EstadoSRS } from './supabase'

// Regla de repaso (issue #2):
// - Fallo: la palabra vuelve a entrar en el siguiente quiz (proximo_repaso = hoy)
// - Acierto: vuelve a entrar en una semana, para comprobar que se sigue recordando
// Una palabra pasa a "dominada" al acumular 3 aciertos más que fallos.
const INTERVALO_ACIERTO_DIAS = 7
const ACIERTOS_NETOS_PARA_DOMINADA = 3

const toDateString = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export interface SrsUpdate {
  estado: EstadoSRS
  intervalo_dias: number
  proximo_repaso: string
  aciertos: number
  fallos: number
  ultimo_repaso: string
}

export function applySrsResult(word: Word, isCorrect: boolean): SrsUpdate {
  const hoy = new Date()

  if (!isCorrect) {
    return {
      estado: 'aprendiendo',
      intervalo_dias: 0,
      proximo_repaso: toDateString(hoy),
      aciertos: word.aciertos,
      fallos: word.fallos + 1,
      ultimo_repaso: hoy.toISOString(),
    }
  }

  const aciertos = word.aciertos + 1
  const dominada = aciertos - word.fallos >= ACIERTOS_NETOS_PARA_DOMINADA
  const proximo = new Date(hoy)
  proximo.setDate(proximo.getDate() + INTERVALO_ACIERTO_DIAS)

  return {
    estado: dominada ? 'dominada' : 'aprendiendo',
    intervalo_dias: INTERVALO_ACIERTO_DIAS,
    proximo_repaso: toDateString(proximo),
    aciertos,
    fallos: word.fallos,
    ultimo_repaso: hoy.toISOString(),
  }
}

export async function updateWordProgress(word: Word, isCorrect: boolean): Promise<void> {
  const update = applySrsResult(word, isCorrect)
  const { error } = await supabase.from('palabras').update(update).eq('id', word.id)
  if (error) {
    console.error('No se pudo guardar el progreso SRS:', error.message)
  }
}

// Palabras que tocan hoy: las falladas recientemente y las acertadas hace >= 7 días
export function isDue(word: Word, today = new Date()): boolean {
  return word.proximo_repaso <= toDateString(today)
}
