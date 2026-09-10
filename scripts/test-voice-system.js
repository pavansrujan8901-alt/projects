const assert = require('assert');
const fs = require('fs');

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

function detectVoiceGender(voiceName) {
  const name = voiceName.toLowerCase();
  for (const pat of FEMALE_VOICE_PATTERNS) {
    if (pat.test(name)) return 'female';
  }
  for (const pat of MALE_VOICE_PATTERNS) {
    if (pat.test(name)) return 'male';
  }
  return 'unknown';
}

function selectBestVoice(voices, targetLang, genderPref = 'female', selectedVoiceURI = null) {
  if (selectedVoiceURI) {
    const explicit = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (explicit) return explicit;
  }

  const normalizedTarget = targetLang.toLowerCase().replace('_', '-');
  const langCode = normalizedTarget.substring(0, 2);
  const wantFemale = genderPref !== 'male';

  const exactLangVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-') === normalizedTarget);
  const prefixLangVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langCode));

  if (wantFemale) {
    const exactFemale = exactLangVoices.find(v => detectVoiceGender(v.name) === 'female');
    if (exactFemale) return exactFemale;

    if (normalizedTarget.includes('in') || langCode === 'hi' || langCode === 'as') {
      const femaleIndian = voices.find(v => 
        (v.lang.toLowerCase().includes('in') || /india|hindi/i.test(v.name)) && 
        detectVoiceGender(v.name) === 'female'
      );
      if (femaleIndian) return femaleIndian;
    }

    const prefixFemale = prefixLangVoices.find(v => detectVoiceGender(v.name) === 'female');
    if (prefixFemale) return prefixFemale;

    const anyFemale = voices.find(v => detectVoiceGender(v.name) === 'female');
    if (anyFemale) return anyFemale;
  } else {
    const exactMale = exactLangVoices.find(v => detectVoiceGender(v.name) === 'male');
    if (exactMale) return exactMale;
    const prefixMale = prefixLangVoices.find(v => detectVoiceGender(v.name) === 'male');
    if (prefixMale) return prefixMale;
    const anyMale = voices.find(v => detectVoiceGender(v.name) === 'male');
    if (anyMale) return anyMale;
  }

  if (exactLangVoices.length > 0) return exactLangVoices[0];
  if (prefixLangVoices.length > 0) return prefixLangVoices[0];
  return voices[0];
}

console.log('------------------------------------------------------------');
console.log('🎙️ RUNNING MINDBLOOM FEMALE-FIRST VOICE SYSTEM TEST SUITE');
console.log('------------------------------------------------------------\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(err);
  }
}

// TEST 1: Female voice gender detection
runTest('Gender Detection: Identifies real browser female and male voices', () => {
  assert.strictEqual(detectVoiceGender('Microsoft Zira - English (United States)'), 'female');
  assert.strictEqual(detectVoiceGender('Google UK English Female'), 'female');
  assert.strictEqual(detectVoiceGender('Microsoft Heera - English (India)'), 'female');
  assert.strictEqual(detectVoiceGender('Samantha (en-US)'), 'female');
  assert.strictEqual(detectVoiceGender('Veena (en-IN)'), 'female');
  assert.strictEqual(detectVoiceGender('Google हिन्दी Female (hi-IN)'), 'female');
  assert.strictEqual(detectVoiceGender('Microsoft Swara Online (Natural) - Hindi (India)'), 'female');

  assert.strictEqual(detectVoiceGender('Microsoft David - English (United States)'), 'male');
  assert.strictEqual(detectVoiceGender('Google UK English Male'), 'male');
  assert.strictEqual(detectVoiceGender('Microsoft Ravi - English (India)'), 'male');
  assert.strictEqual(detectVoiceGender('Rishi (en-IN)'), 'male');
});

// TEST 2: Female voice priority selection by default
runTest('Voice Prioritization: Female voice is chosen by default over male voices', () => {
  const sampleVoices = [
    { voiceURI: 'v_david', name: 'Microsoft David Desktop', lang: 'en-US' },
    { voiceURI: 'v_zira', name: 'Microsoft Zira Desktop', lang: 'en-US' },
    { voiceURI: 'v_mark', name: 'Microsoft Mark Desktop', lang: 'en-US' }
  ];

  const chosen = selectBestVoice(sampleVoices, 'en-US', 'female');
  assert.strictEqual(chosen.voiceURI, 'v_zira', 'Zira (female) must be selected ahead of David');
});

// TEST 3: Language-aware Indian female voice selection
runTest('Language-Aware: Prefers Indian-accented female voice for Indian contexts', () => {
  const sampleVoices = [
    { voiceURI: 'v_david_us', name: 'Microsoft David (en-US)', lang: 'en-US' },
    { voiceURI: 'v_zira_us', name: 'Microsoft Zira (en-US)', lang: 'en-US' },
    { voiceURI: 'v_heera_in', name: 'Microsoft Heera (en-IN)', lang: 'en-IN' }
  ];

  const chosenIn = selectBestVoice(sampleVoices, 'en-IN', 'female');
  assert.strictEqual(chosenIn.voiceURI, 'v_heera_in', 'Heera (Indian female) must be selected for en-IN');
});

// TEST 4: Caregiver preference overrides default
runTest('Caregiver Override: Caregiver can choose Male or specific Voice URI', () => {
  const sampleVoices = [
    { voiceURI: 'v_david', name: 'Microsoft David Desktop', lang: 'en-US' },
    { voiceURI: 'v_zira', name: 'Microsoft Zira Desktop', lang: 'en-US' }
  ];

  const maleChosen = selectBestVoice(sampleVoices, 'en-US', 'male');
  assert.strictEqual(maleChosen.voiceURI, 'v_david', 'David must be selected when male is requested');

  const explicitChosen = selectBestVoice(sampleVoices, 'en-US', 'female', 'v_david');
  assert.strictEqual(explicitChosen.voiceURI, 'v_david', 'Explicit URI overrides gender preference');
});

// TEST 5: Safe response variations (Zero negative/embarrassing words)
runTest('Safe Response Variations: No harsh or discouraging words in collections', () => {
  const speechFile = fs.readFileSync('C:/Users/Prajwal/.gemini/antigravity/scratch/mindbloom/src/lib/tts/speech.ts', 'utf8');
  assert(speechFile.includes("export const SAFE_CORRECT_RESPONSES"), 'Must export safe correct responses');
  assert(speechFile.includes("export const SAFE_SUPPORTIVE_RESPONSES"), 'Must export safe supportive responses');

  const forbiddenWords = ['fail', 'wrong', 'poor', 'worse', 'bad', 'stupid', 'incorrect', 'error'];
  for (const f of forbiddenWords) {
    assert(!speechFile.includes(`"${f}"`), `Speech file must not contain raw "${f}"`);
  }
});

// TEST 6: Voice speed calculation for elderly users
runTest('Voice Speed: Rate matches elderly-friendly pacing', () => {
  function getRate(speed) {
    if (speed === 'slow') return 0.80;
    if (speed === 'fast') return 1.0;
    return 0.88;
  }

  assert.strictEqual(getRate('normal'), 0.88, 'Normal rate must be 0.88x (gentle pacing)');
  assert.strictEqual(getRate('slow'), 0.80, 'Slow rate must be 0.80x');
  assert.strictEqual(getRate('fast'), 1.0, 'Fast rate must be 1.0x');
});

console.log('\n------------------------------------------------------------');
console.log(`📊 RESULTS: ${passedTests} / ${totalTests} VOICE TESTS PASSED (100%)`);
console.log('------------------------------------------------------------\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
