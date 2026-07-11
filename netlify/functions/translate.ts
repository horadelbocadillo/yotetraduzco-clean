import { Handler } from '@netlify/functions'

interface DictionaryDefinition {
  definition: string
}

interface DictionaryMeaning {
  partOfSpeech: string
  definitions: DictionaryDefinition[]
}

interface DictionaryEntry {
  word: string
  meanings: DictionaryMeaning[]
}

async function getDefinitionFromDictionary(word: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    if (!response.ok) return null

    const data: DictionaryEntry[] = await response.json()
    if (!data || data.length === 0) return null

    // Collect ALL definitions with their part of speech
    const allDefinitions: { definition: string; partOfSpeech: string }[] = []

    for (const entry of data) {
      if (entry.meanings) {
        for (const meaning of entry.meanings) {
          for (const def of meaning.definitions) {
            allDefinitions.push({
              definition: def.definition,
              partOfSpeech: meaning.partOfSpeech
            })
          }
        }
      }
    }

    if (allDefinitions.length === 0) return null

    // Filter nouns first (most common meaning for vocabulary learning)
    const nounDefs = allDefinitions.filter(d => d.partOfSpeech === 'noun')

    // High-priority keywords that indicate common/useful definitions
    const highPriorityKeywords = ['toilet', 'bathroom', 'lavatory', 'person who', 'place where', 'device', 'tool', 'food', 'animal']

    // Check nouns first for high-priority definitions
    if (nounDefs.length > 0) {
      for (const def of nounDefs) {
        const lowerDef = def.definition.toLowerCase()
        if (highPriorityKeywords.some(kw => lowerDef.includes(kw))) {
          return def.definition
        }
      }

      // If no high-priority match, prefer longer definitions (more descriptive)
      // but filter out very short ones that are likely obscure
      const goodDefs = nounDefs.filter(d => d.definition.length > 30)
      if (goodDefs.length > 0) {
        return goodDefs[0].definition
      }

      // Last resort for nouns
      return nounDefs[0].definition
    }

    // Fallback to verbs
    const verbDefs = allDefinitions.filter(d => d.partOfSpeech === 'verb')
    if (verbDefs.length > 0) {
      // Check for high-priority keywords in verbs too
      for (const def of verbDefs) {
        const lowerDef = def.definition.toLowerCase()
        if (highPriorityKeywords.some(kw => lowerDef.includes(kw))) {
          return def.definition
        }
      }
      return verbDefs[0].definition
    }

    // Fallback to adjectives
    const adjDefs = allDefinitions.filter(d => d.partOfSpeech === 'adjective')
    if (adjDefs.length > 0) {
      return adjDefs[0].definition
    }

    // Final fallback: first definition
    return allDefinitions[0].definition

  } catch {
    return null
  }
}

async function translateWithDeepL(text: string): Promise<string> {
  const params = new URLSearchParams({
    text,
    source_lang: 'EN',
    target_lang: 'ES',
  })

  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  if (!response.ok) {
    throw new Error(`DeepL API error: ${response.status}`)
  }

  const data = await response.json()
  return data.translations[0].text
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { word } = JSON.parse(event.body || '{}')

    if (!word) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Word is required' })
      }
    }

    const normalizedWord = word.trim().toLowerCase()

    // Step 1: Try DeepL translation
    let translation = await translateWithDeepL(word)

    // Step 2: If DeepL returns the same word (didn't translate), use dictionary fallback
    if (translation.toLowerCase() === normalizedWord) {
      const definition = await getDefinitionFromDictionary(normalizedWord)

      if (definition) {
        // Translate the definition instead
        translation = await translateWithDeepL(definition)
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        originalWord: word,
        translation,
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message })
    }
  }
}
