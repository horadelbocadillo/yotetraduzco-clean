import { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { word } = JSON.parse(event.body || '{}')

    if (!word || word.length < 2) {
      return {
        statusCode: 200,
        body: JSON.stringify({ suggestions: [] })
      }
    }

    // Datamuse API - spelling suggestions endpoint
    // /sug endpoint returns spelling suggestions for a given word
    const response = await fetch(
      `https://api.datamuse.com/sug?s=${encodeURIComponent(word)}&max=8`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Datamuse API error: ${response.status}`)
    }

    const data = await response.json()

    // Datamuse returns array of {word: string, score: number}
    // Filter and map to just the words
    const suggestions = data
      .filter((item: { word: string; score: number }) => item.score > 100)
      .map((item: { word: string }) => item.word)
      .slice(0, 5) // Limit to top 5 suggestions

    return {
      statusCode: 200,
      body: JSON.stringify({ suggestions })
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: (error as Error).message,
        suggestions: []
      })
    }
  }
}
