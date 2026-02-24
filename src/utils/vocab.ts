import vocabData from '@/data/vocab.json';

export interface VocabEntry {
  "스페인어 단어": string;
  "성별/문법 정보": string;
  "한국어 의미": string;
  "출처": string;
  "예문"?: string;
}

export interface LearningUnit {
  id: string;
  title: string;
  source: string;
  words: VocabEntry[];
}

// PRIORITY_WORDS removed (unused)

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

export function getUnits(sources: string[] = ['1', '2']): LearningUnit[] {
  const units: LearningUnit[] = [];

  // Filter data based on provided sources
  const filteredVocabData = (vocabData as VocabEntry[]).filter(item => sources.includes(item["출처"]));

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
export function getTotalWordCount(sources: string[] = ['1']): number {
  return (vocabData as VocabEntry[]).filter(item => sources.includes(item["출처"])).length;
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
