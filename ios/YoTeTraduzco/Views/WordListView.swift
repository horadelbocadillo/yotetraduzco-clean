import SwiftUI

struct WordListView: View {
    @Bindable var viewModel: WordListViewModel

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.words.isEmpty {
                    ProgressView("Cargando palabras...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.words.isEmpty {
                    EmptyStateView()
                } else {
                    wordsList
                }
            }
            .navigationTitle("Yo te traduzco")
            .searchable(text: $viewModel.searchText, prompt: "Buscar en tus palabras...")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    categoryMenu
                }
            }
            .onChange(of: viewModel.searchText) {
                Task { await viewModel.fetchWords() }
            }
            .onChange(of: viewModel.selectedCategory) {
                Task { await viewModel.fetchWords() }
            }
            .task {
                await viewModel.fetchWords()
            }
            .refreshable {
                await viewModel.fetchWords()
            }
        }
    }

    private var wordsList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(viewModel.words) { word in
                    NavigationLink(value: word) {
                        WordCardView(word: word)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
            .padding(.top, 8)
        }
        .navigationDestination(for: Palabra.self) { word in
            WordDetailView(word: word, onUpdate: {
                Task { await viewModel.fetchWords() }
            })
        }
    }

    private var categoryMenu: some View {
        Menu {
            Button {
                viewModel.selectedCategory = nil
            } label: {
                HStack {
                    Text("Todas")
                    if viewModel.selectedCategory == nil {
                        Image(systemName: "checkmark")
                    }
                }
            }

            Divider()

            ForEach(WordCategory.allCases) { category in
                Button {
                    viewModel.selectedCategory = category
                } label: {
                    HStack {
                        Text("\(category.emoji) \(category.label)")
                        if viewModel.selectedCategory == category {
                            Image(systemName: "checkmark")
                        }
                    }
                }
            }
        } label: {
            Image(systemName: viewModel.selectedCategory != nil
                  ? "line.3.horizontal.decrease.circle.fill"
                  : "line.3.horizontal.decrease.circle")
            .foregroundStyle(viewModel.selectedCategory != nil ? Color.appIndigo : .secondary)
        }
    }
}
