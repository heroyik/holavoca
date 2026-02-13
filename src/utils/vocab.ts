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

import { PRIORITY_WORDS } from './priorityWords';

export function getUnits(sources: string[] = ['1']): LearningUnit[] {
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

  // 2. Sort by Difficulty Heuristic
  // Hierarchy: Priority List -> Length -> Deterministic Hash (to mix alphabetical)
  allWords.sort((a, b) => {
    const wordA = a["스페인어 단어"].toLowerCase();
    const wordB = b["스페인어 단어"].toLowerCase();

    // Priority Check
    const isPriorityA = PRIORITY_WORDS.has(wordA);
    const isPriorityB = PRIORITY_WORDS.has(wordB);

    if (isPriorityA && !isPriorityB) return -1;
    if (!isPriorityA && isPriorityB) return 1;

    // Length Check (shorter = easier)
    if (wordA.length !== wordB.length) {
      return wordA.length - wordB.length;
    }

    // Deterministic Shuffle: Sort by reversed string
    // e.g. "gato" (otag) vs "perro" (orrep)
    // This breaks alphabetical clustering effectively while being deterministic.
    const revA = wordA.split('').reverse().join('');
    const revB = wordB.split('').reverse().join('');
    return revA.localeCompare(revB);
  });

  // 3. Chunk into units of 20
  const UNIT_SIZE = 20;
  const totalUnits = Math.ceil(allWords.length / UNIT_SIZE);

  for (let i = 0; i < totalUnits; i++) {
    const start = i * UNIT_SIZE;
    const unitWords = allWords.slice(start, start + UNIT_SIZE);

    units.push({
      id: `unit-${i + 1}`, // Sequential IDs: unit-1, unit-2...
      title: `Unit ${i + 1}`,
      source: "General", // Flattened source
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
