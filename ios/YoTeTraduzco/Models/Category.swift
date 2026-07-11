import SwiftUI

enum WordCategory: String, CaseIterable, Identifiable {
    case sustantivo
    case adjetivo
    case verbo
    case phrasalVerb = "phrasal verb"
    case adverbio
    case fraseHecha = "frase hecha"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .sustantivo: "Sustantivo"
        case .adjetivo: "Adjetivo"
        case .verbo: "Verbo"
        case .phrasalVerb: "Phrasal Verb"
        case .adverbio: "Adverbio"
        case .fraseHecha: "Frase Hecha"
        }
    }

    var emoji: String {
        switch self {
        case .sustantivo: "📦"
        case .adjetivo: "✨"
        case .verbo: "⚡"
        case .phrasalVerb: "🔗"
        case .adverbio: "➡️"
        case .fraseHecha: "💬"
        }
    }

    var color: Color {
        switch self {
        case .sustantivo: .appIndigo
        case .adjetivo: .appEmerald
        case .verbo: .appViolet
        case .phrasalVerb: .appAmber
        case .adverbio: .appSky
        case .fraseHecha: .appRose
        }
    }

    var colorKey: String {
        switch self {
        case .sustantivo: "blue"
        case .adjetivo: "green"
        case .verbo: "purple"
        case .phrasalVerb: "orange"
        case .adverbio: "yellow"
        case .fraseHecha: "red"
        }
    }

    static func from(_ value: String?) -> WordCategory? {
        guard let value else { return nil }
        return WordCategory(rawValue: value)
    }
}
