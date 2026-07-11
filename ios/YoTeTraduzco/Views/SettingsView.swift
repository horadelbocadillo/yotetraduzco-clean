import SwiftUI

struct SettingsView: View {
    @Bindable var settings = AppSettings.shared

    var body: some View {
        NavigationStack {
            List {
                // Keyboard section
                Section {
                    Toggle(isOn: $settings.autocorrectEnabled) {
                        Label {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Autocorrector")
                                Text("Sugerencias del teclado al escribir")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        } icon: {
                            Image(systemName: "textformat.abc")
                                .foregroundStyle(Color.appIndigo)
                        }
                    }
                    .tint(Color.appIndigo)
                } header: {
                    Text("Teclado")
                }

                // Appearance section
                Section {
                    ForEach(AppSettings.DarkModeOption.allCases) { option in
                        Button {
                            settings.darkModeOption = option
                        } label: {
                            HStack {
                                Label {
                                    Text(option.label)
                                        .foregroundStyle(Color.primary)
                                } icon: {
                                    Image(systemName: option.icon)
                                        .foregroundStyle(Color.appIndigo)
                                }

                                Spacer()

                                if settings.darkModeOption == option {
                                    Image(systemName: "checkmark")
                                        .font(.body.weight(.semibold))
                                        .foregroundStyle(Color.appIndigo)
                                }
                            }
                        }
                    }
                } header: {
                    Text("Apariencia")
                }

                // About section
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundStyle(.secondary)
                    }
                } header: {
                    Text("Acerca de")
                } footer: {
                    Text("Hecho con amor usando Claude Code")
                        .frame(maxWidth: .infinity)
                        .padding(.top, 12)
                }
            }
            .navigationTitle("Ajustes")
        }
    }
}

#Preview {
    SettingsView()
}
