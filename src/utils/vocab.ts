import vocabData from '@/data/vocab.json';

export interface VocabEntry {
  "스페인어 단어": string;
  "성별/문법 정보": string;
  "한국어 의미": string;
  "출처": string;
}

export interface LearningUnit {
  id: string;
  title: string;
  source: string;
  words: VocabEntry[];
}

export function getUnits(): LearningUnit[] {
  const units: LearningUnit[] = [];
  const wordsBySource: Record<string, VocabEntry[]> = {};

  // Group by source
  (vocabData as VocabEntry[]).forEach((word) => {
    if (!wordsBySource[word["출처"]]) {
      wordsBySource[word["출처"]] = [];
    }
    wordsBySource[word["출처"]].push(word);
  });

  // Split each source into units of 20 words
  Object.keys(wordsBySource).sort().forEach((source) => {
    const sourceWords = wordsBySource[source];
    for (let i = 0; i < sourceWords.length; i += 20) {
      const unitWords = sourceWords.slice(i, i + 20);
      units.push({
        id: `unit-${source}-${i / 20 + 1}`,
        title: `Unit ${i / 20 + 1}`,
        source: source,
        words: unitWords,
      });
    }
  });

  return units;
}

export function getRandomWords(count: number, exclude?: string[]): VocabEntry[] {
  const allWords = vocabData as VocabEntry[];
  const filtered = exclude
    ? allWords.filter(w => !exclude.includes(w["스페인어 단어"]))
    : allWords;

  return [...filtered].sort(() => Math.random() - 0.5).slice(0, count);
}
export function getTotalWordCount(): number {
  return (vocabData as VocabEntry[]).length;
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
