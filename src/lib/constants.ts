import { cva, type VariantProps } from 'class-variance-authority'

export const CATEGORIES = [
  { value: '', label: 'Sin categoría', emoji: '', color: '' },
  { value: 'sustantivo', label: 'Sustantivo', emoji: '📦', color: 'blue' },
  { value: 'adjetivo', label: 'Adjetivo', emoji: '✨', color: 'green' },
  { value: 'verbo', label: 'Verbo', emoji: '⚡', color: 'purple' },
  { value: 'phrasal verb', label: 'Phrasal Verb', emoji: '🔗', color: 'orange' },
  { value: 'adverbio', label: 'Adverbio', emoji: '➡️', color: 'yellow' },
  { value: 'frase hecha', label: 'Frase Hecha', emoji: '💬', color: 'red' },
] as const

export const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
}

// CVA variant for category color dots
export const categoryDotVariants = cva(
  'rounded-full flex-shrink-0',
  {
    variants: {
      color: {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        '': 'bg-neutral-300',
      },
      size: {
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
      },
    },
    defaultVariants: {
      color: '',
      size: 'sm',
    },
  }
)

export type CategoryDotVariants = VariantProps<typeof categoryDotVariants>

// Helper functions
export function getCategoryColor(categoria: string | null): string {
  if (!categoria) return ''
  return CATEGORIES.find(c => c.value === categoria)?.color || ''
}

export function getCategoryEmoji(categoria: string | null): string {
  if (!categoria) return ''
  return CATEGORIES.find(c => c.value === categoria)?.emoji || ''
}

export function getCategoryLabel(categoria: string | null): string {
  if (!categoria) return ''
  return CATEGORIES.find(c => c.value === categoria)?.label || ''
}

export function getCategory(value: string | null) {
  return CATEGORIES.find(c => c.value === value)
}
