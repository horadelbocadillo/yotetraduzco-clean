import Foundation

// MARK: - Significado (Dictionary Entry)
struct Significado: Codable, Equatable, Hashable {
    let partOfSpeech: String        // noun, verb, adjective, etc.
    let definitionEn: String        // Definition in English
    var definitionEs: String?       // Translated definition in Spanish
    let example: String?            // Example sentence
    let synonyms: [String]          // List of synonyms

    enum CodingKeys: String, CodingKey {
        case partOfSpeech = "part_of_speech"
        case definitionEn = "definition_en"
        case definitionEs = "definition_es"
        case example
        case synonyms
    }
}

// MARK: - Palabra
struct Palabra: Identifiable, Codable, Equatable, Hashable {
    let id: Int
    var palabraOriginal: String
    var traduccion: String
    var categoria: String?
    var color: String?
    var imagenUrl: String?
    var notas: String?
    var createdAt: String?

    // Dictionary meanings
    var significados: [Significado]?

    // Extra columns from DB (for future use)
    var idiomaOrigen: String?
    var idiomaDestino: String?
    var etiquetas: [String]?
    var tema: String?
    var frecuenciaUso: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case palabraOriginal = "palabra_original"
        case traduccion
        case categoria
        case color
        case imagenUrl = "imagen_url"
        case notas
        case createdAt = "created_at"
        case significados
        case idiomaOrigen = "idioma_origen"
        case idiomaDestino = "idioma_destino"
        case etiquetas
        case tema
        case frecuenciaUso = "frecuencia_uso"
    }
}

struct PalabraInsert: Codable {
    let palabraOriginal: String
    let traduccion: String
    var categoria: String?
    var color: String?
    var imagenUrl: String?
    var notas: String?
    var significados: [Significado]?

    enum CodingKeys: String, CodingKey {
        case palabraOriginal = "palabra_original"
        case traduccion
        case categoria
        case color
        case imagenUrl = "imagen_url"
        case notas
        case significados
    }
}

struct PalabraUpdate: Codable {
    var categoria: String?
    var color: String?
    var imagenUrl: String?
    var notas: String?
    var significados: [Significado]?

    enum CodingKeys: String, CodingKey {
        case categoria
        case color
        case imagenUrl = "imagen_url"
        case notas
        case significados
    }

    // Encode all fields explicitly so nil sends null to Supabase
    // (default Codable skips nil, which leaves the old DB value)
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(categoria, forKey: .categoria)
        try container.encode(color, forKey: .color)
        try container.encode(imagenUrl, forKey: .imagenUrl)
        try container.encode(notas, forKey: .notas)
        try container.encode(significados, forKey: .significados)
    }
}
