// ==============================================================================
// NIVORA - FEMALE-FIRST VOICE ENGINE & TTS/STT SERVICE
// Natural, elder-friendly speech companion with female prioritization,
// multi-language support, persistent caregiver controls, and chime synthesis.
// ==============================================================================

export type VoiceGender = 'female' | 'male' | 'auto';
export type VoiceSpeed = 'slow' | 'normal' | 'fast';

export interface VoiceSettings {
  gender: VoiceGender;
  voiceURI: string | null;
  speed: VoiceSpeed;
  isMuted: boolean;
}

export interface CategorizedVoice {
  voice: SpeechSynthesisVoice;
  gender: 'female' | 'male' | 'unknown';
  isRecommended: boolean;
  displayName: string;
}

// Safe, elder-friendly natural response variations (Section 7)
export const SAFE_CORRECT_RESPONSES = [
  'Well done!',
  'Great job!',
  "That's right!",
  'Excellent!',
  'You got it!',
  'Wonderful memory!'
];

export const SAFE_SUPPORTIVE_RESPONSES = [
  "Good try. Let's try another one.",
  "That's okay. Take your time.",
  "Almost. Let's continue.",
  "No problem. We'll try the next one.",
  "That was a gentle try. Let's keep exploring."
];

const STORAGE_KEY = 'nivora_voice_settings';

const DEFAULT_SETTINGS: VoiceSettings = {
  gender: 'female', // Female-first by default! (Section 1)
  voiceURI: null,
  speed: 'normal',   // Elder-friendly 0.88x rate
  isMuted: false
};

// Known female voice name identifiers across Windows, macOS, iOS, Android, Chrome & Edge
const FEMALE_VOICE_PATTERNS = [
  /female/i, /woman/i, /girl/i,
  /zira/i, /heera/i, /neerja/i, /swara/i, /samantha/i, /victoria/i,
  /karen/i, /susan/i, /hazel/i, /catherine/i, /fiona/i, /veena/i,
  /leena/i, /moira/i, /tessa/i, /serena/i, /alva/i, /yuna/i,
  /kyoko/i, /ting-ting/i, /sin-ji/i, /mei-jia/i, /amira/i, /ayanda/i,
  /nour/i, /agnes/i, /helena/i, /monica/i, /paulina/i, /elsa/i,
  /mariska/i, /luciana/i, /ioana/i, /milena/i, /laura/i, /steffi/i,
  /miren/i, /katja/i, /anna/i, /alice/i, /kalpana/i, /geeta/i,
  /priya/i, /sunita/i, /ananya/i, /meera/i, /aria/i, /jenny/i,
  /natasha/i, /ava/i, /emma/i, /sonia/i, /clara/i, /charlotte/i
];

const MALE_VOICE_PATTERNS = [
  /male/i, /man/i, /david/i, /george/i, /mark/i, /ravi/i, /madhav/i,
  /hemant/i, /daniel/i, /oliver/i, /thomas/i, /arthur/i, /pranab/i,
  /aarav/i, /guy/i, /james/i, /alex/i, /fred/i, /rishi/i
];

class SpeechService {
  private isSpeaking = false;
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private settings: VoiceSettings = { ...DEFAULT_SETTINGS };
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private lastSpokenText = '';
  private lastSpokenLang = 'en';
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
      this.loadSettings();
    }
  }

  // Load available voices from browser
  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (voices && voices.length > 0) {
      this.cachedVoices = voices;
      this.notifyListeners();
    }
  }

  // Load persistent settings from localStorage
  private loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  // Save settings to localStorage
  private saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch {
      // Ignore
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public setGender(gender: VoiceGender) {
    this.settings.gender = gender;
    this.saveSettings();
  }

  public setVoiceURI(voiceURI: string | null) {
    this.settings.voiceURI = voiceURI;
    this.saveSettings();
  }

  public setSpeed(speed: VoiceSpeed) {
    this.settings.speed = speed;
    this.saveSettings();
  }

  public setMuted(muted: boolean) {
    this.settings.isMuted = muted;
    if (muted) this.stop();
    this.saveSettings();
  }

  public toggleMute(): boolean {
    const next = !this.settings.isMuted;
    this.setMuted(next);
    return next;
  }

  // Audio Context for gentle chimes
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Gentle sound effects synthesizer
  playChime(type: 'flip' | 'success' | 'complete' | 'star' | 'click') {
    if (this.settings.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'flip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success' || type === 'star') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'complete') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.15);
        osc.frequency.setValueAtTime(659.25, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {
      // Non-blocking
    }
  }

  // Detects voice gender from name heuristics
  public detectVoiceGender(voice: SpeechSynthesisVoice): 'female' | 'male' | 'unknown' {
    const name = voice.name.toLowerCase();
    for (const pat of FEMALE_VOICE_PATTERNS) {
      if (pat.test(name)) return 'female';
    }
    for (const pat of MALE_VOICE_PATTERNS) {
      if (pat.test(name)) return 'male';
    }
    return 'unknown';
  }

  // Returns all available voices categorized for Caregiver Settings (Section 2 & 4)
  public getAvailableVoices(): CategorizedVoice[] {
    if (this.cachedVoices.length === 0 && this.synth) {
      this.cachedVoices = this.synth.getVoices();
    }

    return this.cachedVoices.map(voice => {
      const gender = this.detectVoiceGender(voice);
      const isFemale = gender === 'female';
      const isRecommended = isFemale || /india|indian|hindi|natural/i.test(voice.name);

      let displayName = voice.name;
      if (isFemale) {
        displayName += ' (Warm Female • Recommended)';
      } else if (gender === 'male') {
        displayName += ' (Male)';
      }

      return {
        voice,
        gender,
        isRecommended,
        displayName
      };
    });
  }

  // Intelligently selects the best female voice matching language and priority algorithm (Section 22)
  public selectBestVoice(targetLang: string): SpeechSynthesisVoice | null {
    if (this.cachedVoices.length === 0 && this.synth) {
      this.cachedVoices = this.synth.getVoices();
    }

    const voices = this.cachedVoices;
    if (!voices || voices.length === 0) return null;

    // 1. User selected specific voice URI (Section 22: Priority 1)
    if (this.settings.voiceURI) {
      const explicit = voices.find(v => v.voiceURI === this.settings.voiceURI);
      if (explicit) return explicit;
    }

    const normalizedTarget = targetLang.toLowerCase().replace('_', '-');
    const langCode = normalizedTarget.substring(0, 2); // 'en', 'hi', 'as'
    const wantFemale = this.settings.gender !== 'male'; // Default to female!

    // Separate exact locale matches (e.g. 'en-in') vs broad prefix matches (e.g. 'en-us')
    const exactLangVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-') === normalizedTarget);
    const prefixLangVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langCode));

    if (wantFemale) {
      // Priority 2a: Exact locale match female voice (e.g. en-IN female for en-IN)
      const exactFemale = exactLangVoices.find(v => this.detectVoiceGender(v) === 'female');
      if (exactFemale) return exactFemale;

      // Priority 2b: Indian-accented female voice if target is Indian regional / English
      if (normalizedTarget.includes('in') || langCode === 'hi' || langCode === 'as') {
        const femaleIndian = voices.find(v => 
          (v.lang.toLowerCase().includes('in') || /india|hindi/i.test(v.name)) && 
          this.detectVoiceGender(v) === 'female'
        );
        if (femaleIndian) return femaleIndian;
      }

      // Priority 2c: Broad prefix match female voice (e.g. any English female voice)
      const prefixFemale = prefixLangVoices.find(v => this.detectVoiceGender(v) === 'female');
      if (prefixFemale) return prefixFemale;

      // Priority 2d: Any high-quality female voice on device
      const anyFemale = voices.find(v => this.detectVoiceGender(v) === 'female');
      if (anyFemale) return anyFemale;
    } else {
      // Male requested
      const exactMale = exactLangVoices.find(v => this.detectVoiceGender(v) === 'male');
      if (exactMale) return exactMale;
      const prefixMale = prefixLangVoices.find(v => this.detectVoiceGender(v) === 'male');
      if (prefixMale) return prefixMale;
      const anyMale = voices.find(v => this.detectVoiceGender(v) === 'male');
      if (anyMale) return anyMale;
    }

    // Fallbacks
    if (exactLangVoices.length > 0) return exactLangVoices[0];
    if (prefixLangVoices.length > 0) return prefixLangVoices[0];
    return voices.find(v => v.default) || voices[0];
  }

  // Natural response variations generator (Section 7)
  public getRandomFeedback(isCorrect: boolean): string {
    const list = isCorrect ? SAFE_CORRECT_RESPONSES : SAFE_SUPPORTIVE_RESPONSES;
    return list[Math.floor(Math.random() * list.length)];
  }

  // Text-to-Speech (TTS) Execution
  public speak(text: string, lang = 'en', onEnd?: () => void) {
    if (typeof window === 'undefined' || !this.synth) return;
    if (this.settings.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    // Stop previous utterance immediately to prevent audio overlap (Section 23)
    this.stop();

    this.lastSpokenText = text;
    this.lastSpokenLang = lang;

    const utterance = new SpeechSynthesisUtterance(text);

    // Speed rate: slow (0.80), normal (0.88 - default), fast (1.0)
    let rate = 0.88;
    if (this.settings.speed === 'slow') rate = 0.80;
    else if (this.settings.speed === 'fast') rate = 1.0;

    utterance.rate = rate;
    utterance.pitch = this.settings.gender === 'male' ? 0.95 : 1.05; // Gentle warmth
    utterance.volume = 1.0;

    // Language mapping for TTS
    const langMap: Record<string, string> = {
      hi: 'hi-IN',
      as: 'as-IN',
      brx: 'as-IN',
      mni: 'mni-IN',
      kha: 'en-IN',
      lus: 'en-IN',
      grt: 'en-IN',
      trp: 'bn-IN',
      en: 'en-IN'
    };
    const targetBcp47 = langMap[lang] || 'en-US';
    utterance.lang = targetBcp47;

    // Female voice priority selection
    const chosenVoice = this.selectBestVoice(targetBcp47);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  // Reliable "Hear Again" / Replay (Section 11)
  public hearAgain(fallbackText?: string, lang?: string) {
    const textToSpeak = this.lastSpokenText || fallbackText;
    if (!textToSpeak) return;
    this.playChime('click');
    this.speak(textToSpeak, lang || this.lastSpokenLang);
  }

  // Live preview for Caregiver settings (Section 4)
  public previewVoice(voiceURI?: string, speed?: VoiceSpeed) {
    if (typeof window === 'undefined' || !this.synth) return;
    this.stop();

    const sample = 'Hello. I am your Nivora voice companion. I am here to guide you with patience, warmth, and peace.';
    const utterance = new SpeechSynthesisUtterance(sample);

    let rate = 0.88;
    const targetSpeed = speed || this.settings.speed;
    if (targetSpeed === 'slow') rate = 0.80;
    else if (targetSpeed === 'fast') rate = 1.0;

    utterance.rate = rate;
    utterance.pitch = 1.05;

    if (voiceURI) {
      const v = this.cachedVoices.find(voice => voice.voiceURI === voiceURI);
      if (v) utterance.voice = v;
    } else {
      const best = this.selectBestVoice('en');
      if (best) utterance.voice = best;
    }

    this.synth.speak(utterance);
  }

  public stop() {
    if (typeof window !== 'undefined' && this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getLastSpokenText(): string {
    return this.lastSpokenText;
  }

  // Speech-to-Text (STT) for voice input
  public startListening(
    onResult: (transcript: string) => void,
    onError?: (err: string) => void,
    lang = 'en'
  ): { stop: () => void } | null {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = 
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const sttMap: Record<string, string> = {
        hi: 'hi-IN',
        as: 'as-IN',
        mni: 'mni-IN',
        brx: 'as-IN',
        en: 'en-IN'
      };
      recognition.lang = sttMap[lang] || 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        if (onError) onError(event.error || 'Speech recognition error');
      };

      recognition.start();

      return {
        stop: () => {
          try {
            recognition.stop();
          } catch {
            // Ignore
          }
        }
      };
    } catch (e: any) {
      if (onError) onError(e.message || 'Could not start microphone');
      return null;
    }
  }
}

export const speech = new SpeechService();
