import AVFoundation

final class SpeechService {
    static let shared = SpeechService()

    private let synthesizer = AVSpeechSynthesizer()

    private init() {}

    func pronounce(_ text: String, language: Language) {
        synthesizer.stopSpeaking(at: .immediate)

        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: language.code)
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.9
        utterance.pitchMultiplier = 1.0

        synthesizer.speak(utterance)
    }

    enum Language {
        case english
        case spanish

        var code: String {
            switch self {
            case .english: "en-US"
            case .spanish: "es-ES"
            }
        }
    }
}
