import SwiftUI
import Kingfisher

struct AddWordView: View {
    @Bindable var viewModel: AddWordViewModel
    private let settings = AppSettings.shared

    var body: some View {
        NavigationStack {
            Group {
                if let preview = viewModel.preview {
                    previewView(preview)
                } else {
                    ScrollView {
                        inputCard.padding()
                    }
                }
            }
            .navigationTitle("Traducir")
            .background(Color.neutral50)
            .overlay {
                if viewModel.showSavedToast {
                    toastOverlay
                }
            }
        }
    }

    // MARK: - Input Card

    private var inputCard: some View {
        VStack(spacing: 16) {
            TextField("Escribe una palabra en ingles...", text: $viewModel.inputWord)
                .textFieldStyle(.roundedBorder)
                .font(.body)
                .autocorrectionDisabled(!settings.autocorrectEnabled)
                .textInputAutocapitalization(.never)
                .keyboardType(.asciiCapable)
                .submitLabel(.go)
                .onSubmit {
                    Task { await viewModel.translate() }
                }

            Toggle(isOn: $viewModel.includeImage) {
                Label {
                    Text("Buscar imagen")
                        .font(.subheadline)
                } icon: {
                    Image(systemName: "photo")
                        .foregroundStyle(Color.appIndigo)
                }
            }
            .tint(Color.appIndigo)

            Button {
                Task { await viewModel.translate() }
            } label: {
                HStack(spacing: 8) {
                    if viewModel.isTranslating {
                        ProgressView().tint(.white)
                    }
                    Image(systemName: "character.book.closed.fill")
                    Text(viewModel.isTranslating ? "Traduciendo..." : "Traducir")
                }
                .font(.body.weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(Color.appIndigo)
            .disabled(viewModel.inputWord.trimmingCharacters(in: .whitespaces).isEmpty || viewModel.isTranslating)

            if let error = viewModel.error {
                Text(error)
                    .font(.subheadline)
                    .foregroundStyle(.red)
                    .padding(12)
                    .frame(maxWidth: .infinity)
                    .background(Color.appRose.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding(20)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 2, y: 1)
    }

    // MARK: - Preview View (scroll + fixed buttons)

    private func previewView(_ preview: AddWordViewModel.PreviewData) -> some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 16) {
                    // Image (compact with overlay controls)
                    imageSection(preview)

                    // Word pair
                    wordPairSection(preview)

                    // Dictionary meanings
                    if !preview.significados.isEmpty {
                        significadosSection(preview.significados)
                    }

                    Divider()

                    // Category picker (2 columns)
                    categorySection

                    // Notes
                    notesSection
                }
                .padding(20)
                .background(.white)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .shadow(color: .black.opacity(0.05), radius: 2, y: 1)
                .padding()
            }

            // Fixed CTAs — horizontal layout, equal visual weight
            HStack(spacing: 10) {
                Button {
                    viewModel.cancel()
                } label: {
                    Text("Descartar")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .buttonStyle(.bordered)
                .tint(Color.neutral500)

                Button {
                    Task { await viewModel.save() }
                } label: {
                    HStack(spacing: 6) {
                        if viewModel.isSaving {
                            ProgressView().tint(.white)
                        }
                        Text(viewModel.isSaving ? "Guardando..." : "Guardar")
                            .font(.subheadline.weight(.semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                }
                .buttonStyle(.borderedProminent)
                .tint(Color.appIndigo)
                .disabled(viewModel.isSaving)
            }
            .padding(.horizontal)
            .padding(.top, 8)
            .padding(.bottom, 4)
            .background(.ultraThinMaterial)
        }
    }

    // MARK: - Image Section

    private func imageSection(_ preview: AddWordViewModel.PreviewData) -> some View {
        Group {
            if let imageUrl = preview.imageUrl, let url = URL(string: imageUrl) {
                ZStack(alignment: .bottomTrailing) {
                    KFImage(url)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(height: 140)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                    // Overlay controls
                    HStack(spacing: 6) {
                        Button {
                            Task { await viewModel.changeImage() }
                        } label: {
                            Image(systemName: "arrow.triangle.2.circlepath")
                                .font(.caption.weight(.medium))
                                .padding(8)
                                .background(.ultraThinMaterial)
                                .clipShape(Circle())
                        }
                        .disabled(viewModel.isLoadingImage)

                        Button {
                            viewModel.removeImage()
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
                noImagePlaceholder
            }
        }
    }

    // MARK: - Word Pair

    private func wordPairSection(_ preview: AddWordViewModel.PreviewData) -> some View {
        VStack(spacing: 6) {
            HStack(spacing: 8) {
                Text(preview.originalWord)
                    .font(.system(.title2, design: .serif, weight: .black))
                    .foregroundStyle(Color.neutral900)

                Button {
                    SpeechService.shared.pronounce(preview.originalWord, language: .english)
                } label: {
                    Image(systemName: "speaker.wave.2.fill")
                        .font(.caption2)
                        .padding(6)
                        .background(Color.appIndigo.opacity(0.1))
                        .clipShape(Circle())
                }
                .tint(Color.appIndigo)
            }

            HStack(spacing: 8) {
                Text(preview.translatedWord)
                    .font(.body)
                    .foregroundStyle(Color.neutral600)

                Button {
                    SpeechService.shared.pronounce(preview.translatedWord, language: .spanish)
                } label: {
                    Image(systemName: "speaker.wave.2.fill")
                        .font(.caption2)
                        .padding(5)
                        .background(Color.appEmerald.opacity(0.1))
                        .clipShape(Circle())
                }
                .tint(Color.appEmerald)
            }
        }
    }

    // MARK: - Significados Section

    private func significadosSection(_ significados: [Significado]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("SIGNIFICADOS")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.neutral500)

            ForEach(Array(significados.enumerated()), id: \.offset) { index, significado in
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
                        isSelected: viewModel.selectedCategory == category
                    ) {
                        if viewModel.selectedCategory == category {
                            viewModel.selectedCategory = nil
                        } else {
                            viewModel.selectedCategory = category
                        }
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

            TextField("Contexto, ejemplos o recordatorios...", text: $viewModel.notes, axis: .vertical)
                .lineLimit(2...4)
                .textFieldStyle(.roundedBorder)
                .font(.subheadline)
        }
    }

    // MARK: - No Image Placeholder

    private var noImagePlaceholder: some View {
        HStack(spacing: 12) {
            Image(systemName: "photo")
                .font(.title3)
                .foregroundStyle(Color.neutral400)

            Button {
                Task { await viewModel.changeImage() }
            } label: {
                Text(viewModel.isLoadingImage ? "Buscando..." : "Buscar imagen")
                    .font(.subheadline.weight(.medium))
            }
            .buttonStyle(.bordered)
            .disabled(viewModel.isLoadingImage)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(Color.neutral50)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(style: StrokeStyle(lineWidth: 1.5, dash: [6]))
                .foregroundStyle(Color.neutral300)
        )
    }

    // MARK: - Toast

    private var toastOverlay: some View {
        VStack {
            Spacer()
            HStack(spacing: 12) {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(Color.appEmerald)
                    .font(.title3)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Palabra guardada")
                        .font(.subheadline.weight(.semibold))
                    Text("\"\(viewModel.savedWord)\" se anadio a tu diccionario")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }
            .padding()
            .background(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .shadow(color: .black.opacity(0.1), radius: 8, y: 4)
            .padding()
            .padding(.bottom, 60)
        }
        .transition(.move(edge: .bottom).combined(with: .opacity))
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                withAnimation { viewModel.showSavedToast = false }
            }
        }
    }
}
