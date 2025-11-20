// utils/multilingual-dictionary.js

export const ALLERGENS = [
  "Gluten","Egg","Crustaceans","Fish","Peanut","Soy",
  "Milk","Tree nuts","Celery","Mustard"
];

export const NUTRIENTS = [
  "Energy","Fat","Carbohydrate","Sugar","Protein","Sodium"
];

// OFFLINE multilingual keyword map
export const ALLERGEN_SYNONYMS = {
  Gluten:       ["gluten", "glutén", "glutine", "glutenfrei"],
  Egg:          ["egg", "tojás", "uovo", "eier"],
  Crustaceans:  ["crustaceans", "rákfélék", "crostacei"],
  Fish:         ["fish", "hal", "pesce", "fisch"],
  Peanut:       ["peanut", "földimogyoró", "arachide"],
  Soy:          ["soy", "szója", "soia"],
  Milk:         ["milk", "tej", "latte", "milch"],
  "Tree nuts":  ["tree nuts", "diófélék", "mogyoró", "noci"],
  Celery:       ["celery", "zeller", "sedano"],
  Mustard:      ["mustard", "mustár", "senape"]
};

export const NUTRIENT_SYNONYMS = {
  Energy:        ["energy", "energia", "kalória", "kcal"],
  Fat:           ["fat", "zsír", "grassi"],
  Carbohydrate:  ["carbohydrate", "szénhidrát", "carboidrati"],
  Sugar:         ["sugar", "cukor", "zucchero"],
  Protein:       ["protein", "fehérje", "proteine"],
  Sodium:        ["sodium", "nátrium", "sale"]
};
