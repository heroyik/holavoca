
import fs from 'fs';
const vocabData = JSON.parse(fs.readFileSync('./src/data/vocab.json', 'utf8'));

function getUnitsMixed(sources = ['1']) {
    const filteredVocabData = vocabData.filter(item => sources.includes(item["출처"]));
    const uniqueWords = new Map();
    filteredVocabData.forEach((word) => {
        const key = word["스페인어 단어"].toLowerCase().trim();
        if (!uniqueWords.has(key)) { uniqueWords.set(key, word); }
    });
    const allWords = Array.from(uniqueWords.values());

    const sourceGroups = {};
    sources.forEach(s => { sourceGroups[s] = []; });
    allWords.forEach(w => {
        if (sourceGroups[w["출처"]]) { sourceGroups[w["출처"]].push(w); }
    });

    Object.values(sourceGroups).forEach(group => {
        group.sort((a, b) => {
            const wordA = a["스페인어 단어"].toLowerCase();
            const wordB = b["스페인어 단어"].toLowerCase();
            if (wordA.length !== wordB.length) return wordA.length - wordB.length;
            return wordA.split('').reverse().join('').localeCompare(wordB.split('').reverse().join(''));
        });
    });

    const interleavedWords = [];
    const maxGroupSize = Math.max(...Object.values(sourceGroups).map(g => g.length));
    for (let i = 0; i < maxGroupSize; i++) {
        sources.forEach(s => {
            if (sourceGroups[s][i]) { interleavedWords.push(sourceGroups[s][i]); }
        });
    }

    return interleavedWords.slice(0, 20);
}

const unit1Words = getUnitsMixed(['1', '2']);
const sources = unit1Words.map(w => w["출처"]);
const counts = sources.reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {});

console.log('--- Unit 1 Vocabulary Mix (Vol 1 + Vol 2) ---');
console.log('Total words:', unit1Words.length);
console.log('Counts per source:', JSON.stringify(counts));
console.log('Sample mix:');
unit1Words.slice(0, 10).forEach(w => {
    console.log(`- ${w["스페인어 단어"]} (Vol ${w["출처"]})`);
});
