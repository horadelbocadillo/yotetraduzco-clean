import SwiftUI

struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "book.closed")
                .font(.system(size: 56))
                .foregroundStyle(Color.neutral300)

            Text("Tu diccionario esta vacio")
                .font(.system(.title3, design: .serif, weight: .semibold))
                .foregroundStyle(Color.neutral800)

            Text("Traduce tu primera palabra para empezar a construir tu vocabulario")
                .font(.subheadline)
                .foregroundStyle(Color.neutral500)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 280)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.vertical, 80)
    }
}

#Preview {
    EmptyStateView()
}
