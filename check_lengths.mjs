
import fs from 'fs';
const vocabData = JSON.parse(fs.readFileSync('./src/data/vocab.json', 'utf8'));

const vol1 = vocabData.filter(w => w["출처"] === "1");
const vol2 = vocabData.filter(w => w["출처"] === "2");

console.log('Vol 1 total:', vol1.length);
console.log('Vol 2 total:', vol2.length);

const vol1Lengths = vol1.filter(w => w["스페인어 단어"].length <= 3).length;
const vol2Lengths = vol2.filter(w => w["스페인어 단어"].length <= 3).length;

console.log('Vol 1 words (<=3 chars):', vol1Lengths);
console.log('Vol 2 words (<=3 chars):', vol2Lengths);

const vol2Shortest = vol2.sort((a, b) => a["스페인어 단어"].length - b["스페인어 단어"].length).slice(0, 10);
console.log('Vol 2 Shortest words examples:');
vol2Shortest.forEach(w => console.log(`- ${w["스페인어 단어"]} (${w["스페인어 단어"].length} chars)`));
