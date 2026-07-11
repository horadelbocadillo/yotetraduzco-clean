import Foundation

final class DictionaryService {
    static let shared = DictionaryService()

    private let freeDictionaryURL = "https://api.dictionaryapi.dev/api/v2/entries/en"
    private let relycURL = "https://dictionary.relycapp.com/api/v1/dictionary/lookup"
    private let maxMeanings = 5

    private init() {}

    /// Looks up a word in dictionary APIs and returns meanings
    /// Primary: Free Dictionary API, Fallback: Relyc API
    func lookup(word: String) async -> [DictionaryEntry] {
        let trimmedWord = word.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !trimmedWord.isEmpty else { return [] }

        // Try Free Dictionary API first (has examples and synonyms)
        if let entries = await lookupFreeDictionary(word: trimmedWord), !entries.isEmpty {
            return Array(entries.prefix(maxMeanings))
        }

        // Fallback to Relyc API
        if let entries = await lookupRelyc(word: trimmedWord), !entries.isEmpty {
            return Array(entries.prefix(maxMeanings))
        }

        return []
    }

    // MARK: - Free Dictionary API

    private func lookupFreeDictionary(word: String) async -> [DictionaryEntry]? {
        guard let encodedWord = word.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed),
              let url = URL(string: "\(freeDictionaryURL)/\(encodedWord)") else {
            return nil
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                return nil
            }

            let apiResponse = try JSONDecoder().decode([FreeDictionaryResponse].self, from: data)
            return parseFreeDictionaryResponse(apiResponse)
        } catch {
            print("Free Dictionary API error: \(error)")
            return nil
        }
    }

    private func parseFreeDictionaryResponse(_ response: [FreeDictionaryResponse]) -> [DictionaryEntry] {
        var entries: [DictionaryEntry] = []

        for item in response {
            for meaning in item.meanings {
                for definition in meaning.definitions {
                    let entry = DictionaryEntry(
                        partOfSpeech: meaning.partOfSpeech,
                        definitionEn: definition.definition,
                        definitionEs: nil,
                        example: definition.example,
                        synonyms: definition.synonyms ?? meaning.synonyms ?? []
                    )
                    entries.append(entry)
                }
            }
        }

        return entries
    }

    // MARK: - Relyc API (Fallback)

    private func lookupRelyc(word: String) async -> [DictionaryEntry]? {
        guard let encodedWord = word.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(relycURL)?word=\(encodedWord)") else {
            return nil
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                return nil
            }

            let apiResponse = try JSONDecoder().decode(RelycResponse.self, from: data)
            return parseRelycResponse(apiResponse)
        } catch {
            print("Relyc API error: \(error)")
            return nil
        }
    }

    private func parseRelycResponse(_ response: RelycResponse) -> [DictionaryEntry] {
        var entries: [DictionaryEntry] = []

        for entry in response.entries {
            for definition in entry.definitions {
                let dictEntry = DictionaryEntry(
                    partOfSpeech: entry.pos ?? "unknown",
                    definitionEn: definition,
                    definitionEs: nil,
                    example: nil,
                    synonyms: []
                )
                entries.append(dictEntry)
            }
        }

        return entries
    }
}

// MARK: - Dictionary Entry (Internal model)

struct DictionaryEntry {
    let partOfSpeech: String
    let definitionEn: String
    var definitionEs: String?
    let example: String?
    let synonyms: [String]

    /// Convert to Significado model for storage
    func toSignificado() -> Significado {
        Significado(
            partOfSpeech: partOfSpeech,
            definitionEn: definitionEn,
            definitionEs: definitionEs,
            example: example,
            synonyms: synonyms
        )
    }
}

// MARK: - Free Dictionary API Response Models

private struct FreeDictionaryResponse: Codable {
    let word: String
    let phonetic: String?
    let phonetics: [Phonetic]?
    let origin: String?
    let meanings: [Meaning]

    struct Phonetic: Codable {
        let text: String?
        let audio: String?
    }

    struct Meaning: Codable {
        let partOfSpeech: String
        let definitions: [Definition]
        let synonyms: [String]?
        let antonyms: [String]?
    }

    struct Definition: Codable {
        let definition: String
        let example: String?
        let synonyms: [String]?
        let antonyms: [String]?
    }
}

// MARK: - Relyc API Response Models

private struct RelycResponse: Codable {
    let word: String
    let entries: [RelycEntry]

    struct RelycEntry: Codable {
        let lang: String?
        let lemma: String?
        let pos: String?
        let ipa: String?
        let definitions: [String]
        let forms: [String]?
    }
}
