# YoTeTraduzco — Roadmap (julio 2026)

> Tablero: https://github.com/users/horadelbocadillo/projects/3
> Issues: https://github.com/horadelbocadillo/yotetraduzco-clean/issues

Objetivo: pasar de "diccionario personal" a "app de aprendizaje": recordar las palabras (gamificación), ampliar vocabulario (sugerencias) y practicar pronunciación con feedback de fonemas — todo con APIs gratuitas — e instalable en el iPhone sin cuenta de desarrollador.

## M1 — Gamificación y repaso espaciado ([#1](https://github.com/horadelbocadillo/yotetraduzco-clean/issues/1)–[#6](https://github.com/horadelbocadillo/yotetraduzco-clean/issues/6))

La pieza que hace que las palabras se recuerden: repaso espaciado (SM-2 simplificado, el de Anki) sobre el Quiz que ya existe.

1. **#1** Esquema SRS en Supabase (estado, intervalo, próximo repaso por palabra)
2. **#2** Algoritmo SM-2 conectado al Quiz
3. **#3** Sesión diaria: "Tienes N palabras para repasar hoy"
4. **#4** Racha diaria 🔥 + XP/niveles
5. **#5** Logros e insignias
6. **#6** Dashboard de progreso (ya estaba en la Fase 6 antigua; ahora con datos reales del SRS)

## M2 — Descubrimiento de vocabulario ([#7](https://github.com/horadelbocadillo/yotetraduzco-clean/issues/7)–[#10](https://github.com/horadelbocadillo/yotetraduzco-clean/issues/10))

Sugerencias de palabras relacionadas con las consultadas, usando **Datamuse** (gratuita, sin API key — ya se usa en `get-suggestions.ts`).

7. **#7** Function `get-related-words` (sinónimos, antónimos, asociadas, por tema)
8. **#8** Sección "Palabras relacionadas" en cada palabra
9. **#9** Sección "Descubre": sugerencias personalizadas según tu vocabulario
10. **#10** Añadir sugerencia con un toque (traduce + clasifica + imagen + entra al SRS)

## M3 — Pronunciación con feedback de fonemas ([#11](https://github.com/horadelbocadillo/yotetraduzco-clean/issues/11)–[#15](https://github.com/horadelbocadillo/yotetraduzco-clean/issues/15))

Escuchar → repetir → ver qué fonemas dices bien/mal. Stack 100% gratuito:
- **Free Dictionary API**: IPA + audio mp3 de hablante real (ya integrada)
- **Web Speech API** (`webkitSpeechRecognition`): reconocimiento de voz en el navegador
- **CMUdict** (npm): palabra → fonemas; alineación Levenshtein para marcar cada fonema

11. **#11** IPA y audio nativo por palabra
12. **#12** Grabación + reconocimiento de voz
13. **#13** Comparación fonema a fonema (G2P + alineación)
14. **#14** UI de práctica: IPA coloreado (verde/rojo) + consejos por fonema
15. **#15** Spike: Vosk WASM / whisper.cpp para precisión acústica real

## M4 — App en iPhone sin cuenta de desarrollador ([#16](https://github.com/horadelbocadillo/yotetraduzco-clean/issues/16)–[#19](https://github.com/horadelbocadillo/yotetraduzco-clean/issues/19))

Solución: **PWA**. Safari permite "Añadir a pantalla de inicio" → icono propio, pantalla completa, offline e incluso notificaciones push (iOS 16.4+). Sin App Store, sin 99 €/año.

16. **#16** Manifest + iconos + splash iOS
17. **#17** Service worker y modo offline (`vite-plugin-pwa`)
18. **#18** Verificar en iPhone real: micrófono, speech recognition, push
19. **#19** Decidir el futuro de la app SwiftUI (`ios/`) — free provisioning solo como banco de pruebas (caduca a los 7 días)

## Orden recomendado

**M1 → M4 → M2 → M3.** M1 es el mayor valor (retención). M4 es barato y pone la app en el iPhone pronto. M3 depende de #18 (capacidades del micro/speech en iOS), por eso conviene verificar M4 antes de invertir en pronunciación.
