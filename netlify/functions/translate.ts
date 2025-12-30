import { Handler } from '@netlify/functions'

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

    const params = new URLSearchParams({
      text: word,
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
    const translation = data.translations[0].text

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
