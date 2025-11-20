// with rule based extraction

// pages/api/upload.js
import fs from "fs";
import path from "path";
import formidable from "formidable";
import Tesseract from "tesseract.js";
const pdfParse = require("pdf-parse");

export const config = { api: { bodyParser: false } };

const TMP_DIR = path.resolve("./tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const ALLERGENS = ["Gluten","Egg","Crustaceans","Fish","Peanut","Soy","Milk","Tree nuts","Celery","Mustard"];
const NUTRIENTS = ["Energy","Fat","Carbohydrate","Sugar","Protein","Sodium"];

function initResult() {
  const allergens = {};
  ALLERGENS.forEach(a => allergens[a] = { detected: false, snippet: null, confidence: 0 });
  const nutrition = {};
  NUTRIENTS.forEach(n => nutrition[n] = { value: null, unit: null, snippet: null });
  return { allergens, nutrition };
}

function extractData(text) {
  const result = initResult();
  if (!text) return result;

  const lines = text.split(/\r?\n/);

  lines.forEach(line => {
    const l = line.toLowerCase();

    // Allergens
    ALLERGENS.forEach(a => {
      if (!result.allergens[a].detected && l.includes(a.toLowerCase())) {
        result.allergens[a] = { detected: true, snippet: line.trim(), confidence: 1 };
      }
    });

    // Nutrients
    NUTRIENTS.forEach(n => {
      if (!result.nutrition[n].value) {
        const match = line.match(new RegExp(`${n}\\s*[:\\-]?\\s*([\\d.,]+)\\s*(kcal|g|mg)?`, "i"));
        if (match) {
          result.nutrition[n] = { 
            value: match[1], 
            unit: match[2] || "-", 
            snippet: line.trim() 
          };
        }
      }
    });
  });

  return result;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const form = new formidable.IncomingForm({ keepExtensions: true, uploadDir: TMP_DIR });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File parsing failed", details: err.message });

    const file = files.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = file.filepath || file.path;

    let text = "";

    // 1️⃣ PDF text extraction
    try {
      const buffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(buffer);
      if (pdfData && pdfData.text.trim().length > 0) {
        text = pdfData.text.trim();
      }
    } catch (pdfErr) {
      console.warn("pdf-parse failed, fallback to OCR:", pdfErr.message);
    }

    // 2️⃣ OCR fallback (directly on PDF file)
    if (!text || text.length < 5) {
      try {
        const ocrResult = await Tesseract.recognize(filePath, "eng", { logger: m => console.log(m) });
        text = ocrResult.data.text || "";
      } catch (ocrErr) {
        console.error("OCR failed:", ocrErr.message);
      }
    }

    // 3️⃣ Extract allergens/nutrients
    const parsed = extractData(text);

    // 4️⃣ Always return result
    return res.status(200).json(parsed);
  });
}



// with open AI

// import formidable from "formidable";
// import fs from "fs";
// import path from "path";
// import pdfParse from "pdf-parse";
// import Tesseract from "tesseract.js";
// import OpenAI from "openai";
// import { fromPath } from "pdf2pic";

// export const config = {
//   api: {
//     bodyParser: false, // disable Next.js body parsing
//   },
// };

// // Initialize OpenAI
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Ensure tmp folder exists
// const TMP_DIR = path.resolve("./tmp");
// if (!fs.existsSync(TMP_DIR)) {
//   fs.mkdirSync(TMP_DIR, { recursive: true });
// }

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method Not Allowed" });
//   }

//   const form = new formidable.IncomingForm({
//     keepExtensions: true,
//     uploadDir: TMP_DIR,
//   });

//   form.parse(req, async (err, fields, files) => {
//     try {
//       if (err) return res.status(500).json({ error: "Error parsing file" });

//       const file = files.file;
//       if (!file) return res.status(400).json({ error: "No file uploaded" });

//       const filePath = file.filepath || file.path;
//       if (!filePath) return res.status(400).json({ error: "File path not found" });

//       let extractedText = "";

//       // Step 1: Try digital PDF extraction
//       try {
//         const pdfBuffer = fs.readFileSync(filePath);
//         const pdfData = await pdfParse(pdfBuffer);
//         extractedText = pdfData.text.trim();
//       } catch {
//         extractedText = "";
//       }

//       // Step 2: OCR if PDF is scanned or text extraction failed
//       if (!extractedText || extractedText.length < 10) {
//         try {
//           const converter = fromPath(filePath, {
//             density: 150,
//             saveFilename: "temp_page",
//             savePath: TMP_DIR,
//             format: "png",
//             width: 1240,
//             height: 1754,
//           });

//           const firstPage = 1;
//           const image = await converter(firstPage);
//           const imagePath = path.resolve(image.path);

//           const ocrResult = await Tesseract.recognize(imagePath, "eng");
//           extractedText = ocrResult.data.text.trim();
//         } catch (ocrError) {
//           console.error("OCR failed:", ocrError);
//           extractedText = ""; // fallback
//         }
//       }

//       // Step 3: Send extracted text to OpenAI
//       const prompt = `
// Extract allergens (Gluten, Egg, Crustaceans, Fish, Peanut, Soy, Milk, Tree nuts, Celery, Mustard)
// and nutritional values (Energy, Fat, Carbohydrate, Sugar, Protein, Sodium)
// from the following food product text.

// Respond ONLY in JSON.

// TEXT:
// ${extractedText}
// `;

//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [{ role: "user", content: prompt }],
//       });

//       const aiResponse = completion.choices[0].message.content;

//       let parsed;
//       try {
//         parsed = JSON.parse(aiResponse);
//       } catch {
//         parsed = { rawText: aiResponse };
//       }

//       return res.status(200).json(parsed);
//     } catch (error) {
//       console.error("Upload error:", error);
//       return res.status(500).json({ error: "Server Error", details: error.message });
//     }
//   });
// }

