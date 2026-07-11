import SwiftUI

extension Color {
    // Primary palette (matching web app)
    static let appIndigo = Color(red: 99/255, green: 102/255, blue: 241/255)    // #6366F1
    static let appIndigo600 = Color(red: 79/255, green: 70/255, blue: 229/255)  // #4F46E5
    static let appViolet = Color(red: 139/255, green: 92/255, blue: 246/255)    // #8B5CF6
    static let appViolet600 = Color(red: 124/255, green: 58/255, blue: 237/255) // #7C3AED
    static let appEmerald = Color(red: 16/255, green: 185/255, blue: 129/255)   // #10B981
    static let appRose = Color(red: 244/255, green: 63/255, blue: 94/255)       // #F43F5E
    static let appAmber = Color(red: 217/255, green: 119/255, blue: 6/255)      // #D97706
    static let appSky = Color(red: 14/255, green: 165/255, blue: 233/255)       // #0EA5E9

    // Neutrals
    static let neutral50 = Color(red: 250/255, green: 250/255, blue: 250/255)
    static let neutral100 = Color(red: 245/255, green: 245/255, blue: 245/255)
    static let neutral200 = Color(red: 229/255, green: 229/255, blue: 229/255)
    static let neutral300 = Color(red: 212/255, green: 212/255, blue: 212/255)
    static let neutral400 = Color(red: 163/255, green: 163/255, blue: 163/255)
    static let neutral500 = Color(red: 115/255, green: 115/255, blue: 115/255)
    static let neutral600 = Color(red: 82/255, green: 82/255, blue: 82/255)
    static let neutral700 = Color(red: 64/255, green: 64/255, blue: 64/255)
    static let neutral800 = Color(red: 38/255, green: 38/255, blue: 38/255)
    static let neutral900 = Color(red: 23/255, green: 23/255, blue: 23/255)

    // Category color from string key
    static func categoryColor(for key: String?) -> Color {
        guard let key else { return .neutral300 }
        switch key {
        case "blue": return .appIndigo
        case "green": return .appEmerald
        case "purple": return .appViolet
        case "orange": return .appAmber
        case "yellow": return .appSky
        case "red": return .appRose
        default: return .neutral300
        }
    }
}

// Primary gradient matching web app (indigo → violet)
extension LinearGradient {
    static let appPrimary = LinearGradient(
        colors: [.appIndigo600, .appViolet600],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
