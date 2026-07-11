import SwiftUI

struct SignificadoCard: View {
    let significado: Significado
    let index: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Part of speech badge
            HStack(spacing: 6) {
                Circle()
                    .fill(colorForPartOfSpeech(significado.partOfSpeech))
                    .frame(width: 8, height: 8)

                Text(significado.partOfSpeech.capitalized)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(colorForPartOfSpeech(significado.partOfSpeech))
            }

            // Definition in English
            Text(significado.definitionEn)
                .font(.subheadline)
                .foregroundStyle(Color.neutral700)
                .italic()

            // Definition in Spanish (if available)
            if let definitionEs = significado.definitionEs, !definitionEs.isEmpty {
                Text(definitionEs)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Color.neutral900)
            }

            // Example (if available)
            if let example = significado.example, !example.isEmpty {
                Text("\"" + example + "\"")
                    .font(.caption)
                    .foregroundStyle(Color.neutral500)
                    .padding(.top, 2)
            }

            // Synonyms (if available)
            if !significado.synonyms.isEmpty {
                synonymsView
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.neutral50)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .strokeBorder(Color.neutral200, lineWidth: 1)
        )
    }

    @ViewBuilder
    private var synonymsView: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Synonyms")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(Color.neutral400)

            FlowLayout(spacing: 6) {
                ForEach(significado.synonyms.prefix(5), id: \.self) { synonym in
                    Text(synonym)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.neutral100)
                        .foregroundStyle(Color.neutral600)
                        .clipShape(Capsule())
                }
            }
        }
    }

    private func colorForPartOfSpeech(_ pos: String) -> Color {
        switch pos.lowercased() {
        case "noun": return .appIndigo
        case "verb": return .appViolet
        case "adjective": return .appEmerald
        case "adverb": return .appSky
        case "exclamation", "interjection": return .appAmber
        default: return .neutral500
        }
    }
}

// MARK: - FlowLayout for synonyms

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrangeSubviews(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrangeSubviews(proposal: proposal, subviews: subviews)

        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: .unspecified
            )
        }
    }

    private func arrangeSubviews(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)

            if currentX + size.width > maxWidth && currentX > 0 {
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }

            positions.append(CGPoint(x: currentX, y: currentY))
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
        }

        return (CGSize(width: maxWidth, height: currentY + lineHeight), positions)
    }
}

#Preview {
    VStack(spacing: 12) {
        SignificadoCard(
            significado: Significado(
                partOfSpeech: "verb",
                definitionEn: "to move at a speed faster than walking",
                definitionEs: "moverse a una velocidad mayor que caminar",
                example: "She runs every morning before work",
                synonyms: ["sprint", "dash", "race", "jog", "gallop"]
            ),
            index: 0
        )

        SignificadoCard(
            significado: Significado(
                partOfSpeech: "noun",
                definitionEn: "an act or period of running",
                definitionEs: "un acto o periodo de correr",
                example: nil,
                synonyms: []
            ),
            index: 1
        )
    }
    .padding()
}
