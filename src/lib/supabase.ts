import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Word {
  id: number
  palabra_original: string
  traduccion: string
  categoria: string | null
  color: string | null
  imagen_url: string | null
  notas: string | null
  created_at: string
}
