import SwiftUI
import Kingfisher

struct WordDetailView: View {
    let word: Palabra
    var onUpdate: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var showDeleteConfirmation = false

    // Editable fields
    @State private var selectedCategory: WordCategory?
    @State private var notes: String
    @State private var imageUrl: String?
    @State private var isLoadingImage = false
    @State private var isSaving = false
    @State private var hasChanges = false

    private let supabase = SupabaseService.shared

    init(word: Palabra, onUpdate: @escaping () -> Void) {
        self.word = word
        self.onUpdate = onUpdate
        self._selectedCategory = State(initialValue: WordCategory.from(word.categoria))
        self._notes = State(initialValue: word.notas ?? "")
        self._imageUrl = State(initialValue: word.imagenUrl)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Image
                imageSection

                // Word pair + pronunciation
                wordPairSection

                // Dictionary meanings (if any)
                if let significados = word.significados, !significados.isEmpty {
                    significadosSection(significados)
                }

                Divider()

                // Category picker (editable)
                categorySection

                // Notes (editable)
                notesSection

            }
            .padding()
            .padding(.bottom, 20)
        }
        .background(Color.neutral50)
        .safeAreaInset(edge: .bottom) {
            if hasChanges {
                Button {
                    Task { await save() }
                } label: {
                    HStack {
                        if isSaving {
                            ProgressView().tint(.white)
                        }
                        Text(isSaving ? "Guardando..." : "Guardar cambios")
                            .font(.body.weight(.semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)
                .tint(Color.appIndigo)
                .disabled(isSaving)
                .padding(.horizontal)
                .padding(.bottom, 8)
                .background(.ultraThinMaterial)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(role: .destructive) {
                    showDeleteConfirmation = true
                } label: {
                    Image(systemName: "trash")
                }
            }
        }
        .confirmationDialog("Eliminar palabra", isPresented: $showDeleteConfirmation) {
            Button("Eliminar", role: .destructive) {
                Task {
                    try? await supabase.deleteWord(id: word.id)
                    onUpdate()
                    dismiss()
                }
            }
        } message: {
            Text("Quieres eliminar \"\(word.palabraOriginal)\"?")
        }
    }

    // MARK: - Image Section

    private var imageSection: some View {
        Group {
            if let imageUrl, let url = URL(string: imageUrl) {
                ZStack(alignment: .bottomTrailing) {
                    KFImage(url)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(height: 160)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                    // Overlay controls
                    HStack(spacing: 6) {
                        Button {
                            Task { await changeImage() }
                        } label: {
                            Image(systemName: "arrow.triangle.2.circlepath")
                                .font(.caption.weight(.medium))
                                .padding(8)
                                .background(.ultraThinMaterial)
                                .clipShape(Circle())
                        }
                        .disabled(isLoadingImage)

                        Button {
                            self.imageUrl = nil
                            hasChanges = true
                        } label: {
                            Image(systemName: "xmark")
                                .font(.caption.weight(.medium))
                                .padding(8)
                                .background(.ultraThinMaterial)
                                .clipShape(Circle())
                        }
                    }
                    .padding(8)
                }
            } else {
                VStack(spacing: 12) {
                    Image(systemName: "photo")
                        .font(.system(size: 32))
                        .foregroundStyle(Color.neutral400)

                    Button {
                        Task { await changeImage() }
                    } label: {
                        Label(isLoadingImage ? "Buscando..." : "Buscar imagen",
                              systemImage: "plus")
                        .font(.subheadline.weight(.medium))
                    }
                    .buttonStyle(.bordered)
                    .disabled(isLoadingImage)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 32)
                .background(Color.neutral50)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [8]))
                        .foregroundStyle(Color.neutral300)
                )
            }
        }
    }

    // MARK: - Word Pair

    private var wordPairSection: some View {
        VStack(spacing: 12) {
            HStack(spacing: 10) {
                Text(word.palabraOriginal)
                    .font(.system(.title2, design: .serif, weight: .black))
                    .foregroundStyle(Color.neutral900)

                Button {
                    SpeechService.shared.pronounce(word.palabraOriginal, language: .english)
                } label: {
                    Image(systemName: "speaker.wave.2.fill")
                        .font(.caption)
                        .padding(8)
                        .background(Color.appIndigo.opacity(0.1))
                        .clipShape(Circle())
                }
                .tint(Color.appIndigo)
            }

            HStack(spacing: 10) {
                Text(word.traduccion)
                    .font(.body)
                    .foregroundStyle(Color.neutral600)

                Button {
                    SpeechService.shared.pronounce(word.traduccion, language: .spanish)
                } label: {
                    Image(systemName: "speaker.wave.2.fill")
                        .font(.caption2)
                        .padding(6)
                        .background(Color.appEmerald.opacity(0.1))
                        .clipShape(Circle())
                }
                .tint(Color.appEmerald)
            }
        }
    }

    // MARK: - Significados Section

    @State private var showAllSignificados = false

    private func significadosSection(_ significados: [Significado]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("SIGNIFICADOS")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.neutral500)

                Spacer()

                if significados.count > 2 {
                    Button {
                        withAnimation { showAllSignificados.toggle() }
                    } label: {
                        Text(showAllSignificados ? "Ver menos" : "Ver todos (\(significados.count))")
                            .font(.caption)
                    }
                    .tint(Color.appIndigo)
                }
            }

            let displayedSignificados = showAllSignificados ? significados : Array(significados.prefix(2))
            ForEach(Array(displayedSignificados.enumerated()), id: \.offset) { index, significado in
                SignificadoCard(significado: significado, index: index)
            }
        }
    }

    // MARK: - Category Section

    private var categorySection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("CATEGORIA")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.neutral500)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 8) {
                ForEach(WordCategory.allCases) { category in
                    CategoryPill(
                        category: category,
                        isSelected: selectedCategory == category
                    ) {
                        if selectedCategory == category {
                            selectedCategory = nil
                        } else {
                            selectedCategory = category
                        }
                        hasChanges = true
                    }
                }
            }
        }
    }

    // MARK: - Notes Section

    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("NOTAS")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.neutral500)

            TextField("Contexto, ejemplos o recordatorios...", text: $notes, axis: .vertical)
                .lineLimit(2...4)
                .textFieldStyle(.roundedBorder)
                .font(.subheadline)
                .onChange(of: notes) {
                    hasChanges = true
                }
        }
    }

    // MARK: - Actions

    private func save() async {
        isSaving = true

        let update = PalabraUpdate(
            categoria: selectedCategory?.rawValue,
            color: selectedCategory?.colorKey,
            imagenUrl: imageUrl,
            notas: notes.isEmpty ? nil : notes
        )

        do {
            try await supabase.updateWord(id: word.id, update: update)
            hasChanges = false
            onUpdate()
        } catch {
            // silently fail for now
        }

        isSaving = false
    }

    private func changeImage() async {
        isLoadingImage = true
        let newUrl = try? await TranslationService.shared.fetchImageURL(for: word.palabraOriginal)
        imageUrl = newUrl
        hasChanges = true
        isLoadingImage = false
    }
}
