import SwiftUI

@Observable
final class AddWordViewModel {
    // Input
    var inputWord = ""

    // Preview state
    var preview: PreviewData?
    var selectedCategory: WordCategory?
    var notes = ""

    // Options
    var includeImage = false

    // Loading states
    var isTranslating = false
    var isSaving = false
    var isLoadingImage = false

    // Feedback
    var error: String?
    var showSavedToast = false
    var savedWord = ""

    private let translation = TranslationService.shared
    private let supabase = SupabaseService.shared
    private let classifier = ClassificationService.shared
    private let dictionary = DictionaryService.shared

    struct PreviewData {
        let originalWord: String
        let translatedWord: String
        var imageUrl: String?
        var significados: [Significado]
    }

    func translate() async {
        guard !inputWord.trimmingCharacters(in: .whitespaces).isEmpty else { return }

        isTranslating = true
        error = nil

        do {
            let trimmedWord = inputWord.trimmingCharacters(in: .whitespaces)
            let result = try await translation.translate(word: trimmedWord)

            // Fetch dictionary entries and translate definitions in parallel with image
            async let dictionaryLookup = lookupAndTranslateDefinitions(word: result.originalWord)
            async let imageLookup: String? = includeImage
                ? try? await translation.fetchImageURL(for: result.originalWord)
                : nil

            let significados = await dictionaryLookup
            let imageUrl = await imageLookup

            preview = PreviewData(
                originalWord: result.originalWord,
                translatedWord: result.translation,
                imageUrl: imageUrl,
                significados: significados
            )

            // Auto-classify based on first dictionary meaning or fallback to classifier
            if let firstMeaning = significados.first {
                selectedCategory = mapPartOfSpeechToCategory(firstMeaning.partOfSpeech)
            } else {
                selectedCategory = await classifier.classify(word: result.originalWord)
            }
        } catch {
            self.error = error.localizedDescription
        }

        isTranslating = false
    }

    private func lookupAndTranslateDefinitions(word: String) async -> [Significado] {
        let entries = await dictionary.lookup(word: word)
        guard !entries.isEmpty else { return [] }

        let translatedEntries = await translation.translateDefinitions(entries)
        return translatedEntries.map { $0.toSignificado() }
    }

    private func mapPartOfSpeechToCategory(_ pos: String) -> WordCategory? {
        switch pos.lowercased() {
        case "noun": return .sustantivo
        case "verb": return .verbo
        case "adjective": return .adjetivo
        case "adverb": return .adverbio
        case "phrasal verb": return .phrasalVerb
        default: return nil
        }
    }

    func save() async {
        guard let preview else { return }

        isSaving = true
        error = nil

        do {
            let word = PalabraInsert(
                palabraOriginal: preview.originalWord,
                traduccion: preview.translatedWord,
                categoria: selectedCategory?.rawValue,
                color: selectedCategory?.colorKey,
                imagenUrl: preview.imageUrl,
                notas: notes.isEmpty ? nil : notes,
                significados: preview.significados.isEmpty ? nil : preview.significados
            )

            try await supabase.insertWord(word)

            savedWord = preview.originalWord
            showSavedToast = true
            reset()
        } catch {
            self.error = error.localizedDescription
        }

        isSaving = false
    }

    func changeImage() async {
        guard let preview else { return }

        isLoadingImage = true
        let imageUrl = try? await translation.fetchImageURL(for: preview.originalWord)
        self.preview?.imageUrl = imageUrl
        isLoadingImage = false
    }

    func removeImage() {
        preview?.imageUrl = nil
    }

    func cancel() {
        reset()
    }

    private func reset() {
        inputWord = ""
        preview = nil
        selectedCategory = nil
        notes = ""
        includeImage = false
    }
}
