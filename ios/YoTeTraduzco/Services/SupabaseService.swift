import Foundation
import Supabase

final class SupabaseService {
    static let shared = SupabaseService()

    let client: SupabaseClient

    private init() {
        client = SupabaseClient(
            supabaseURL: URL(string: "https://zgdrfdrsiulankhbyrtc.supabase.co")!,
            supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZHJmZHJzaXVsYW5raGJ5cnRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDExNDMsImV4cCI6MjA4OTE3NzE0M30.1SHRzi8VL_rcCim3coMoechhE08bvPk-6rJqWM3U6DY"
        )
    }

    // MARK: - Fetch all words

    func fetchWords(search: String? = nil, category: String? = nil) async throws -> [Palabra] {
        var query = client
            .from("palabras")
            .select()

        // Filters must come before transforms (order)
        if let search, !search.isEmpty {
            query = query.or("palabra_original.ilike.%\(search)%,traduccion.ilike.%\(search)%")
        }

        if let category, !category.isEmpty {
            query = query.eq("categoria", value: category)
        }

        return try await query
            .order("created_at", ascending: false)
            .execute()
            .value
    }

    // MARK: - Insert word

    func insertWord(_ word: PalabraInsert) async throws {
        try await client
            .from("palabras")
            .insert(word)
            .execute()
    }

    // MARK: - Update word

    func updateWord(id: Int, update: PalabraUpdate) async throws {
        try await client
            .from("palabras")
            .update(update)
            .eq("id", value: id)
            .execute()
    }

    // MARK: - Delete word

    func deleteWord(id: Int) async throws {
        try await client
            .from("palabras")
            .delete()
            .eq("id", value: id)
            .execute()
    }
}
