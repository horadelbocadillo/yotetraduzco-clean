import SwiftUI

@Observable
final class AppSettings {
    static let shared = AppSettings()

    var autocorrectEnabled: Bool {
        didSet { UserDefaults.standard.set(autocorrectEnabled, forKey: "autocorrectEnabled") }
    }

    var darkModeOption: DarkModeOption {
        didSet { UserDefaults.standard.set(darkModeOption.rawValue, forKey: "darkModeOption") }
    }

    private init() {
        self.autocorrectEnabled = UserDefaults.standard.bool(forKey: "autocorrectEnabled")
        let saved = UserDefaults.standard.string(forKey: "darkModeOption") ?? DarkModeOption.system.rawValue
        self.darkModeOption = DarkModeOption(rawValue: saved) ?? .system
    }

    var colorScheme: ColorScheme? {
        switch darkModeOption {
        case .system: nil
        case .light: .light
        case .dark: .dark
        }
    }

    enum DarkModeOption: String, CaseIterable, Identifiable {
        case system
        case light
        case dark

        var id: String { rawValue }

        var label: String {
            switch self {
            case .system: "Sistema"
            case .light: "Claro"
            case .dark: "Oscuro"
            }
        }

        var icon: String {
            switch self {
            case .system: "iphone"
            case .light: "sun.max.fill"
            case .dark: "moon.fill"
            }
        }
    }
}
