import SwiftUI

@Observable
final class WordListViewModel {
    var words: [Palabra] = []
    var searchText = ""
    var selectedCategory: WordCategory?
    var isLoading = false
    var error: String?

    private let supabase = SupabaseService.shared

    func fetchWords() async {
        isLoading = true
        error = nil

        do {
            words = try await supabase.fetchWords(
                search: searchText.isEmpty ? nil : searchText,
                category: selectedCategory?.rawValue
            )
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func deleteWord(_ word: Palabra) async {
        do {
            try await supabase.deleteWord(id: word.id)
            words.removeAll { $0.id == word.id }
        } catch {
            self.error = error.localizedDescription
        }
    }
}
