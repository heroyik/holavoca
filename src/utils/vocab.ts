import vocabData from '@/data/vocab.json';

export interface VocabEntry {
  "스페인어 단어": string;
  "성별/문법 정보": string;
  "한국어 의미": string;
  "출처": string;
  "예문"?: string;
}

export type POS = 'noun' | 'verb' | 'adjective' | 'other';

export interface LearningUnit {
  id: string;
  title: string;
  source: string;
  words: VocabEntry[];
}

/**
 * Heuristic to guess the Part Of Speech (POS) of a Spanish word
 */
export function guessPOS(entry: VocabEntry): POS {
  const genderInfo = (entry["성별/문법 정보"] || "").toLowerCase();
  const koreanMeaning = (entry["한국어 의미"] || "").trim();
  const spanishWord = (entry["스페인어 단어"] || "").toLowerCase();

  // 1. Verbs: Korean meaning usually ends with '다' in this dataset
  if (koreanMeaning.endsWith("다")) {
    return 'verb';
  }

  // 2. Nouns: Explicitly marked with gender m or f
  if (genderInfo.includes('m') || genderInfo.includes('f')) {
    return 'noun';
  }

  // 3. Adjectives: Often have forms like o/a or /a but not marked as nouns
  if (spanishWord.includes('/') || spanishWord.includes('(')) {
    return 'adjective';
  }

  return 'other';
}

const COMMON_COGNATES = [
  "actor", "hotel", "model", "radio", "taxi", "doctor", "idea", "menu", "pasta", "pizza",
  "hospital", "internet", "material", "moral", "original", "personal", "plan", "posible", "probable",
  "banano", "bicicleta", "chocolate", "computadora", "elefante", "familia", "guitarra", "león", "mapa", "mesa",
  "parque", "teléfono", "tomate", "tren", "universidad", "video", "yoga", "zebra", "animal", "base",
  "cable", "canal", "clase", "club", "color", "comuna", "control", "crítico", "debate", "decision"
];

function getDifficultyScore(word: string): number {
  let score = word.length * 10;

  // Accents check (á, é, í, ó, ú, ñ)
  const accents = /[áéíóúñ]/i;
  if (accents.test(word)) {
    score += 50;
  }

  // Cognate check
  const cleanWord = word.toLowerCase().split('/')[0].split('(')[0].trim();
  if (COMMON_COGNATES.includes(cleanWord)) {
    score -= 100; // Very easy
  }

  return score;
}

/**
 * Simple Levenshtein distance for cognate detection
 */
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function isEasyCognate(spanishWord: string, koreanMeaning: string): boolean {
  const cleanSpanish = spanishWord.toLowerCase().split('/')[0].split('(')[0].trim();

  // 1. Check curated list
  if (COMMON_COGNATES.includes(cleanSpanish)) return true;

  // 2. Heuristic check: Many English cognates end in -ción (tion), -dad (ty), -mente (ly), etc.
  // Since we don't have English translations in the JSON (only Korean), 
  // and the user specifically asked for "English Cognates", 
  // we might need to assume the Spanish word itself looks like English.
  // Common patterns for Spanish/English cognates:
  if (cleanSpanish.endsWith('ción') || cleanSpanish.endsWith('dad') || cleanSpanish.endsWith('al') || cleanSpanish.endsWith('ble')) {
    // These are very likely cognates if they are long enough
    if (cleanSpanish.length > 5) return true;
  }

  return false;
}

export function getUnits(sources: string[] = ['1', '2'], excludeEasy: boolean = false): LearningUnit[] {
  const units: LearningUnit[] = [];

  // Filter data based on provided sources
  let filteredVocabData = (vocabData as VocabEntry[]).filter(item => sources.includes(item["출처"]));

  // Apply easy cognate filter if requested
  if (excludeEasy) {
    filteredVocabData = filteredVocabData.filter(item => !isEasyCognate(item["스페인어 단어"], item["한국어 의미"]));
  }

  // 1. Flatten and unique the vocabulary
  const uniqueWords = new Map<string, VocabEntry>();
  filteredVocabData.forEach((word) => {
    const key = word["스페인어 단어"].toLowerCase().trim();
    if (!uniqueWords.has(key)) {
      uniqueWords.set(key, word);
    }
  });

  const allWords = Array.from(uniqueWords.values());

  // 2. Sort by Difficulty (v2.0 logic)
  allWords.sort((a, b) => {
    const diffA = getDifficultyScore(a["스페인어 단어"]);
    const diffB = getDifficultyScore(b["스페인어 단어"]);
    if (diffA !== diffB) return diffA - diffB;
    // Deterministic tie-break
    return a["스페인어 단어"].localeCompare(b["스페인어 단어"]);
  });

  // 3. Partition into exactly 15 units
  const TOTAL_UNITS = 15;
  const unitSize = Math.ceil(allWords.length / TOTAL_UNITS);

  for (let i = 0; i < TOTAL_UNITS; i++) {
    const start = i * unitSize;
    const end = Math.min(start + unitSize, allWords.length);
    const unitWords = allWords.slice(start, end);

    if (unitWords.length === 0) break;

    units.push({
      id: `unit-${i + 1}`,
      title: `Unit ${i + 1}`,
      source: "Multi",
      words: unitWords,
    });
  }

  return units;
}

export function getRandomWords(count: number, sources: string[] = ['1'], exclude?: string | string[]): VocabEntry[] {
  const allWords = (vocabData as VocabEntry[]).filter(item => sources.includes(item["출처"]));

  const excludeArray = typeof exclude === 'string' ? [exclude] : exclude || [];
  const filtered = excludeArray.length > 0
    ? allWords.filter(w => !excludeArray.includes(w["스페인어 단어"]))
    : allWords;

  return [...filtered].sort(() => Math.random() - 0.5).slice(0, count);
}
export function getTotalWordCount(sources: string[] = ['1'], excludeEasy: boolean = false): number {
  let filtered = (vocabData as VocabEntry[]).filter(item => sources.includes(item["출처"]));
  if (excludeEasy) {
    filtered = filtered.filter(item => !isEasyCognate(item["스페인어 단어"], item["한국어 의미"]));
  }
  return filtered.length;
}

/**
 * Parses a Spanish word string and returns the form corresponding to the specified gender.
 * Handles patterns like "abogado/a", "actor/actriz", "escritor(a)".
 */
export function getGenderedForm(fullWord: string, gender: 'm' | 'f'): string {
  if (gender === 'm') {
    // Usually the first part is masculine
    if (fullWord.includes('/')) {
      const parts = fullWord.split('/');
      // If second part is just a suffix (e.g., "abogado/a"), first part is masculine
      if (parts[1].length === 1) return parts[0];
      // Otherwise, it might be "actor/actriz", so first part is masculine
      return parts[0];
    }
    if (fullWord.includes('(')) {
      return fullWord.split('(')[0];
    }
    return fullWord;
  } else {
    // Feminine
    if (fullWord.includes('/')) {
      const parts = fullWord.split('/');
      if (parts[1].length === 1) {
        // e.g. "abogado/a" -> "abogada"
        // Replace last character if it's 'o'
        if (parts[0].endsWith('o')) {
          return parts[0].slice(0, -1) + parts[1];
        }
        // Otherwise just append suffix (rare in this dataset but safe)
        return parts[0] + parts[1];
      }
      // e.g. "actor/actriz" -> "actriz"
      return parts[1];
    }
    if (fullWord.includes('(')) {
      // e.g. "escritor(a)" -> "escritora"
      const base = fullWord.split('(')[0];
      const suffix = fullWord.split('(')[1].replace(')', '');
      return base + suffix;
    }
    return fullWord;
  }
}
