import logging

from deep_translator import GoogleTranslator

logger = logging.getLogger(__name__)

# Must match the non-English languages in frontend/src/i18n.js.
TARGET_LANGUAGES = ("te", "ta", "kn")


def translate_label(english_text: str) -> dict:
    """Best-effort translation of an admin-entered reason label into the
    app's other supported languages. Never raises - a failed translation
    just falls back to the English text, so a flaky third-party translate
    call can never block adding a reason option."""
    translations = {}
    for lang in TARGET_LANGUAGES:
        try:
            translations[lang] = GoogleTranslator(source="en", target=lang).translate(english_text)
        except Exception:  # noqa: BLE001 - third-party translate call, never fatal
            logger.exception("Failed to translate %r into %s; falling back to English.", english_text, lang)
            translations[lang] = english_text
    return translations
