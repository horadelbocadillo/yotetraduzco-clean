import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pronounceWord(word: string, lang: 'en-US' | 'es-ES' = 'en-US') {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = lang
    utterance.rate = 0.9 // Slightly slower for clarity
    utterance.pitch = 1

    window.speechSynthesis.speak(utterance)
  } else {
    console.warn('Speech synthesis not supported in this browser')
  }
}
