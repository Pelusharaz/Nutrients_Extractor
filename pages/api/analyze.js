// pages/api/analyze.js
import {
  ALLERGENS,
  NUTRIENTS,
  ALLERGEN_SYNONYMS,
  NUTRIENT_SYNONYMS
} from "../../lib/multilingual-dictionary";

function initResult() {
  const allergens = {};
  ALLERGENS.forEach(a => allergens[a] = { detected: false, snippet: null, confidence: 0 });

  const nutrition = {};
  NUTRIENTS.forEach(n => nutrition[n] = { value: null, unit: null, snippet: null });

  return { allergens, nutrition };
}

export function extractData(rawText) {
  const result = initResult();
  if (!rawText) return result;

  const lines = rawText.split(/\r?\n/);

  lines.forEach(line => {
    const lower = line.toLowerCase();

    // ALLERGENS detection using multilingual synonyms
    ALLERGENS.forEach(key => {
      if (!result.allergens[key].detected) {
        const matches = ALLERGEN_SYNONYMS[key].some(
          syn => lower.includes(syn.toLowerCase())
        );

        if (matches) {
          result.allergens[key] = {
            detected: true,
            snippet: line.trim(),
            confidence: 1
          };
        }
      }
    });

    // NUTRIENTS detection multilingual
    NUTRIENTS.forEach(key => {
      if (!result.nutrition[key].value) {
        const synonyms = NUTRIENT_SYNONYMS[key].join("|");

        const regex = new RegExp(
          `(${synonyms})\\s*[:\\-]?\\s*([\\d.,]+)\\s*(kcal|g|mg)?`,
          "i"
        );

        const match = line.match(regex);
        if (match) {
          result.nutrition[key] = {
            value: match[2],
            unit: match[3] || "-",
            snippet: line.trim()
          };
        }
      }
    });
  });

  return result;
}
