import Foundation

final class TranslationService {
    static let shared = TranslationService()

    // Uses the same Netlify function as the web app
    private let baseURL = "https://yotetraduzco.netlify.app/.netlify/functions"

    private init() {}

    struct TranslationResult {
        let originalWord: String
        let translation: String
    }

    func translate(word: String) async throws -> TranslationResult {
        let url = URL(string: "\(baseURL)/translate")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["word": word])

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw TranslationError.translationFailed
        }

        let result = try JSONDecoder().decode(TranslateResponse.self, from: data)
        return TranslationResult(originalWord: result.originalWord, translation: result.translation)
    }

    /// Translates an array of dictionary entries (their definitions) from EN to ES
    func translateDefinitions(_ entries: [DictionaryEntry]) async -> [DictionaryEntry] {
        var translatedEntries: [DictionaryEntry] = []

        for entry in entries {
            var translatedEntry = entry
            // Translate the English definition to Spanish
            if let result = try? await translate(word: entry.definitionEn) {
                translatedEntry.definitionEs = result.translation
            }
            translatedEntries.append(translatedEntry)
        }

        return translatedEntries
    }

    func fetchImageURL(for query: String) async throws -> String? {
        let url = URL(string: "\(baseURL)/get-image")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["query": query])

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            return nil
        }

        let result = try JSONDecoder().decode(ImageResponse.self, from: data)
        return result.imageUrl
    }
}

// MARK: - Response types

private struct TranslateResponse: Codable {
    let originalWord: String
    let translation: String
}

private struct ImageResponse: Codable {
    let imageUrl: String?
}

// MARK: - Errors

enum TranslationError: LocalizedError {
    case translationFailed

    var errorDescription: String? {
        switch self {
        case .translationFailed:
            return "No se pudo traducir la palabra. Inténtalo de nuevo."
        }
    }
}
