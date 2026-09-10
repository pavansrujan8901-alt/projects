// ==============================================================================
// NIVORA - MULTILINGUAL CAPABILITY MATRIX & HONEST FALLBACKS
// Provides accurate feature detection for Text, Voice, Speech Input, and AI
// per language with zero false claims and graceful elder-friendly fallbacks.
// ==============================================================================

export interface LanguageCapability {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  hasTextSupport: boolean;
  hasVoiceSynthesisSupport: boolean;
  hasSpeechRecognitionSupport: boolean;
  hasAIGenerationSupport: boolean;
  preferredVoiceGender: 'female';
  fallbackLanguage: string;
  guidanceNote: string;
}

export const LANGUAGE_CAPABILITIES: Record<string, LanguageCapability> = {
  en: {
    code: 'en',
    name: 'English (India)',
    nativeName: 'English',
    flag: '🇮🇳',
    hasTextSupport: true,
    hasVoiceSynthesisSupport: true,
    hasSpeechRecognitionSupport: true,
    hasAIGenerationSupport: true,
    preferredVoiceGender: 'female',
    fallbackLanguage: 'en',
    guidanceNote: 'Full natural female voice companion and speech input active.'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    hasTextSupport: true,
    hasVoiceSynthesisSupport: true,
    hasSpeechRecognitionSupport: true,
    hasAIGenerationSupport: true,
    preferredVoiceGender: 'female',
    fallbackLanguage: 'hi',
    guidanceNote: 'Female Hindi voice companion, high-contrast Devanagari text, and speech recognition active.'
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    hasTextSupport: true,
    hasVoiceSynthesisSupport: true,
    hasSpeechRecognitionSupport: true,
    hasAIGenerationSupport: true,
    preferredVoiceGender: 'female',
    fallbackLanguage: 'bn',
    guidanceNote: 'Full Bengali text, female voice prompts, and cultural nostalgia active.'
  },
  as: {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    flag: '🌾',
    hasTextSupport: true,
    hasVoiceSynthesisSupport: true, // Bengali/Assamese phonetic synth fallback
    hasSpeechRecognitionSupport: false,
    hasAIGenerationSupport: true,
    preferredVoiceGender: 'female',
    fallbackLanguage: 'bn',
    guidanceNote: 'Large readable Eastern Nagari script with soothing chimes and phonetic pronunciation.'
  },
  kha: {
    code: 'kha',
    name: 'Khasi',
    nativeName: 'Khasi',
    flag: '🌲',
    hasTextSupport: true,
    hasVoiceSynthesisSupport: false, // Honest detection: Browser TTS does not bundle native Khasi voices
    hasSpeechRecognitionSupport: false,
    hasAIGenerationSupport: true,
    preferredVoiceGender: 'female',
    fallbackLanguage: 'en',
    guidanceNote: 'Large, dignified visual text cards with gentle feedback chimes. Tap Hear Again for clear English assistance if needed.'
  },
  mni: {
    code: 'mni',
    name: 'Manipuri (Meitei)',
    nativeName: 'মৈতৈলোন্ / Manipuri',
    flag: '🌺',
    hasTextSupport: true,
    hasVoiceSynthesisSupport: false, // Honest detection: Browser TTS does not bundle native Meitei voices
    hasSpeechRecognitionSupport: false,
    hasAIGenerationSupport: true,
    preferredVoiceGender: 'female',
    fallbackLanguage: 'en',
    guidanceNote: 'High-contrast bilingual text cards with acoustic Pena instrument sound chimes.'
  },
  gr: {
    code: 'gr',
    name: 'Garo',
    nativeName: 'A·chik',
    flag: '⛰️',
    hasTextSupport: true,
    hasVoiceSynthesisSupport: false,
    hasSpeechRecognitionSupport: false,
    hasAIGenerationSupport: true,
    preferredVoiceGender: 'female',
    fallbackLanguage: 'en',
    guidanceNote: 'High-visibility visual cards with gentle audio chimes.'
  },
  mz: {
    code: 'mz',
    name: 'Mizo',
    nativeName: 'Mizo ṭawng',
    flag: '🌄',
    hasTextSupport: true,
    hasVoiceSynthesisSupport: false,
    hasSpeechRecognitionSupport: false,
    hasAIGenerationSupport: true,
    preferredVoiceGender: 'female',
    fallbackLanguage: 'en',
    guidanceNote: 'Large Latin-script text cards with pleasant harmonic feedback chimes.'
  }
};

export function getLanguageCapability(code: string): LanguageCapability {
  return LANGUAGE_CAPABILITIES[code] || LANGUAGE_CAPABILITIES['en'];
}

/**
 * Dynamically tests if the current browser environment contains an installed voice
 * for a specific language tag.
 */
export function checkBrowserVoiceAvailable(langCode: string): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  const voices = window.speechSynthesis.getVoices();
  const cap = getLanguageCapability(langCode);
  if (!cap.hasVoiceSynthesisSupport) return false;

  const match = voices.find(v => 
    v.lang.toLowerCase().startsWith(langCode.toLowerCase()) || 
    v.lang.toLowerCase().includes(langCode.toLowerCase())
  );
  return !!match;
}
