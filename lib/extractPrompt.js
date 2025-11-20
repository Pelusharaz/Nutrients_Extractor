function buildExtractPrompt(cleanText) {
// The prompt instructs the LLM to locate allergens and nutrition values
// and return a JSON object matching a strict schema. Keep the prompt precise.
return `You are a JSON extractor. Given the following raw product description and nutrition/allergen information extracted from a product PDF, produce EXACT JSON with these keys:


- "allergens": an object whose keys are: Gluten, Egg, Crustaceans, Fish, Peanut, Soy, Milk, Tree nuts, Celery, Mustard. For each allergen give an object {"detected": true/false, "snippet": "short text showing where it was found (max 200 chars) or null", "confidence": number between 0.0 and 1.0}.


- "nutrition": an object whose keys are: Energy, Fat, Carbohydrate, Sugar, Protein, Sodium. For each provide {"value": number or null, "unit": string or null, "snippet": "short text or null"}.


If a value is not present, set it to null. Use numeric values and normalized units: Energy -> kcal (if only kJ present, convert approx: 1 kcal = 4.184 kJ), Fat/Carbohydrate/Sugar/Protein -> grams (g), Sodium -> milligrams (mg). If the text contains ranges, pick the first numeric value. Do not include any additional keys or explanation — return only valid JSON.


Raw text below:
\n---BEGIN TEXT---\n${cleanText.replace(/`/g, "``")}\n---END TEXT---\n
Respond only with the JSON.`
}


module.exports = { buildExtractPrompt }