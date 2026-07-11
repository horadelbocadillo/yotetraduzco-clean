import SwiftUI
import Kingfisher

struct WordCardView: View {
    let word: Palabra

    private var category: WordCategory? { WordCategory.from(word.categoria) }
    private var barColor: Color { category?.color ?? Color.neutral300 }

    var body: some View {
        HStack(spacing: 0) {
            // Color bar (always visible)
            barColor
                .frame(width: 5)
                .clipShape(UnevenRoundedRectangle(
                    topLeadingRadius: 12,
                    bottomLeadingRadius: 12
                ))

            HStack(spacing: 12) {
                // Image thumbnail (if available)
                if let imageUrl = word.imagenUrl, let url = URL(string: imageUrl) {
                    KFImage(url)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 56, height: 56)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                // Text content
                VStack(alignment: .leading, spacing: 6) {
                    // Word pair
                    HStack(spacing: 6) {
                        Text(word.palabraOriginal)
                            .font(.system(.body, design: .serif, weight: .black))
                            .foregroundStyle(Color.neutral900)

                        Text(":")
                            .font(.body.weight(.semibold))
                            .foregroundStyle(Color.neutral300)

                        Text(word.traduccion)
                            .font(.subheadline)
                            .foregroundStyle(Color.neutral600)
                    }

                    // Category badge
                    if let category {
                        HStack(spacing: 4) {
                            Text(category.emoji)
                                .font(.caption2)
                            Text(category.label)
                                .font(.system(size: 10, weight: .bold))
                                .textCase(.uppercase)
                                .tracking(0.3)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(category.color)
                        .foregroundStyle(.white)
                        .clipShape(Capsule())
                    }

                    // Notes preview
                    if let notas = word.notas, !notas.isEmpty {
                        Text(notas)
                            .font(.caption)
                            .foregroundStyle(Color.neutral400)
                            .lineLimit(1)
                    }
                }

                Spacer()

                // Chevron
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(Color.neutral300)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 14)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.neutral200, lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.03), radius: 1, y: 1)
    }
}

#Preview {
    VStack(spacing: 12) {
        WordCardView(word: Palabra(
            id: 1,
            palabraOriginal: "serendipity",
            traduccion: "serendipia",
            categoria: "sustantivo",
            color: "blue",
            notas: "A pleasant surprise"
        ))
        WordCardView(word: Palabra(
            id: 2,
            palabraOriginal: "sour",
            traduccion: "agrio",
            categoria: nil,
            color: nil
        ))
        WordCardView(word: Palabra(
            id: 3,
            palabraOriginal: "bald",
            traduccion: "calvo",
            categoria: "adjetivo",
            color: "green",
            imagenUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"
        ))
    }
    .padding()
    .background(Color.neutral50)
}
