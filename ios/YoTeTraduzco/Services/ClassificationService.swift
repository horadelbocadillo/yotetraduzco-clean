import Foundation

final class ClassificationService {
    static let shared = ClassificationService()

    private init() {}

    /// Auto-detect grammatical category using Free Dictionary API
    func classify(word: String) async -> WordCategory? {
        // Clean the word (take first word for multi-word phrases)
        let cleanWord = word.trimmingCharacters(in: .whitespaces)

        // Multi-word phrases → "frase hecha" or "phrasal verb"
        let words = cleanWord.split(separator: " ")
        if words.count >= 3 {
            return .fraseHecha
        }

        // Try phrasal verb detection (2 words where second is a preposition/particle)
        if words.count == 2 {
            let particles = ["up", "down", "out", "in", "on", "off", "over", "away", "back", "through", "along", "around", "about", "across"]
            if let second = words.last, particles.contains(String(second).lowercased()) {
                return .phrasalVerb
            }
            return .fraseHecha
        }

        // Single word → query dictionary API
        guard let encoded = cleanWord.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed),
              let url = URL(string: "https://api.dictionaryapi.dev/api/v2/entries/en/\(encoded)") else {
            return nil
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)

            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                return nil
            }

            let entries = try JSONDecoder().decode([DictionaryEntry].self, from: data)

            // Get the first part of speech
            if let partOfSpeech = entries.first?.meanings.first?.partOfSpeech {
                return mapPartOfSpeech(partOfSpeech)
            }
        } catch {
            // Silently fail — classification is optional
        }

        return nil
    }

    private func mapPartOfSpeech(_ pos: String) -> WordCategory? {
        switch pos.lowercased() {
        case "noun": return .sustantivo
        case "adjective": return .adjetivo
        case "verb": return .verbo
        case "adverb": return .adverbio
        case "interjection", "exclamation": return .fraseHecha
        default: return nil
        }
    }
}

// MARK: - Dictionary API response types

private struct DictionaryEntry: Codable {
    let meanings: [Meaning]
}

private struct Meaning: Codable {
    let partOfSpeech: String
}
