import SwiftUI

struct ContentView: View {
    @Bindable var settings = AppSettings.shared

    var body: some View {
        TabView {
            WordListView(viewModel: WordListViewModel())
                .tabItem {
                    Label("Palabras", systemImage: "book.fill")
                }

            AddWordView(viewModel: AddWordViewModel())
                .tabItem {
                    Label("Traducir", systemImage: "plus.circle.fill")
                }

            SettingsView()
                .tabItem {
                    Label("Ajustes", systemImage: "gearshape.fill")
                }
        }
        .tint(Color.appIndigo)
        .preferredColorScheme(settings.colorScheme)
    }
}

#Preview {
    ContentView()
}
