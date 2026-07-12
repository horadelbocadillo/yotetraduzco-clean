import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export type EstadoSRS = 'nueva' | 'aprendiendo' | 'dominada'

export interface Word {
  id: number
  palabra_original: string
  traduccion: string
  categoria: string | null
  color: string | null
  imagen_url: string | null
  notas: string | null
  created_at: string
  // SRS — repaso espaciado (SM-2 simplificado)
  estado: EstadoSRS
  intervalo_dias: number
  factor_facilidad: number
  proximo_repaso: string
  aciertos: number
  fallos: number
  ultimo_repaso: string | null
}
