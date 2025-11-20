---

# 📄 **README.md — Nutrients & Allergen Extractor**

A simple tool that extracts **nutritional values** and **allergens** from uploaded product labels.
Works with **images** and **PDFs** (text-based or scanned), supports **multiple languages**, and always returns the results in **English**.

The backend uses:

* **Next.js API routes**
* **Tesseract.js** for OCR
* **pdf-parse** for text PDF extraction
* A **multilingual dictionary** to match allergens and nutrients across languages
* A clean result format ready for frontend tables + JSON output

---

## 🚀 Features

### ✔ Supports Images

Upload photos of labels and extract text automatically.

### ✔ Supports PDF Uploads

* Reads **text PDFs** using `pdf-parse`.
* Falls back to **OCR** for scanned PDFs.

### ✔ Multilingual Detection

The backend checks the uploaded text against a large multilingual dictionary for:

**Allergens:**
Gluten, Egg, Crustaceans, Fish, Peanut, Soy, Milk, Tree Nuts, Celery, Mustard

**Nutrients:**
Energy, Fat, Carbohydrate, Sugar, Protein, Sodium

Regardless of the input language, the output is always returned in **English**.

### ✔ Clean JSON Output

Frontend structure:

```json
{
  "allergens": {
    "Gluten": { "detected": true, "snippet": "…", "confidence": 1 },
    "Egg": { "detected": false, "snippet": null, "confidence": 0 }
  },
  "nutrition": {
    "Energy": { "value": "250", "unit": "kcal", "snippet": "…" },
    "Protein": { "value": "10", "unit": "g", "snippet": "…" }
  }
}
```

---

## 🧠 How It Works

1. The user uploads a file from the frontend.
2. `upload.js` receives it and:

   * Tries reading a PDF as text (if it’s a PDF)
   * If text is missing, runs **OCR**
3. The extracted text is sent to `analyze.js`.
4. `analyze.js`:

   * Normalizes the text
   * Matches keywords in all languages
   * Maps them back to English labels
5. Returns structured allergen + nutrient data.

---

## 📁 Project Structure

```
/pages/api
│── upload.js      # Handles file uploads + OCR + PDF parsing
│── analyze.js     # Multilingual extraction + mapping
/tmp               # Temporary uploaded files
/public            # Frontend assets
```

---

## ⚙ Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo
```

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

---

## 📡 Deployment (Render)

The project runs smoothly on **Render** using:

**Build Command**

```
npm install && npm run build
```

**Start Command**

```
npm start
```

Whenever you push to GitHub, Render automatically redeploys.

---

## 🛠 Technologies Used

* **Next.js**
* **Node.js**
* **Tesseract.js**
* **pdf-parse**
* **formidable**
* **Custom multilingual keyword dictionary**

---

## 📬 API Usage

**POST** `/api/upload`

**Form Data**

| Field | Type                | Required |
| ----- | ------------------- | -------- |
| file  | File (image or PDF) | Yes      |

**Response Example**

```json
{
  "allergens": { ... },
  "nutrition": { ... }
}
```

---

## 🚧 Known Limitations

* OCR accuracy depends on image quality.
* Very low-quality scanned PDFs may require manual correction.
* pdfjs-dist is intentionally not used (due to compatibility issues).

---

## 📌 Future Improvements

* Add ingredient extraction
* Add language auto-detection
* Add per-item confidence scoring
* Add optional translation preview

---

## 🧑‍💻 Author

**Pelu Jeremiah**
Simple, practical solutions.

---


live link : https://nutrients-extractor.onrender.com/