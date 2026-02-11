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
  return (vocabData as any).length;
}
