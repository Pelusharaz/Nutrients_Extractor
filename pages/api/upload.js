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


// with rule based extraction

import fs from "fs";
import path from "path";
import Tesseract from "tesseract.js";
import formidable from "formidable";
import { fromPath } from "pdf2pic";

export const config = { api: { bodyParser: false } };

// Ensure tmp folder exists
const TMP_DIR = path.resolve("./tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// Allergens and nutrients lists
const ALLERGENS = ["Gluten","Egg","Crustaceans","Fish","Peanut","Soy","Milk","Tree nuts","Celery","Mustard"];
const NUTRIENTS = ["Energy","Fat","Carbohydrate","Sugar","Protein","Sodium"];

// Rule-based extraction
function extractInfo(text) {
  const result = { allergens: [], nutrients: {} };
  const lowerText = text.toLowerCase();
  
  ALLERGENS.forEach(a => {
    if (lowerText.includes(a.toLowerCase())) result.allergens.push(a);
  });
  
  NUTRIENTS.forEach(n => {
    const match = text.match(new RegExp(`${n}:\\s*([\\d.,]+)`, "i"));
    if (match) result.nutrients[n] = match[1];
  });
  
  return result;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const form = new formidable.IncomingForm({ keepExtensions: true, uploadDir: TMP_DIR });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Error parsing file", details: err.message });

    const file = files.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = file.filepath || file.path;
    if (!filePath) return res.status(400).json({ error: "File path not found" });

    try {
      const converter = fromPath(filePath, {
        density: 150,
        saveFilename: "tmp_page",
        savePath: TMP_DIR,
        format: "png",
        width: 1240,
        height: 1754,
      });

      // Try OCR for first 50 pages max (adjust if needed)
      const numPages = 50;
      let ocrText = "";

      for (let i = 1; i <= numPages; i++) {
        try {
          const image = await converter(i);
          const ocrResult = await Tesseract.recognize(path.resolve(image.path), "eng");
          ocrText += "\n" + ocrResult.data.text;
        } catch (pageErr) {
          // If a page fails, break loop (probably last page)
          break;
        }
      }

      const extractedText = ocrText.trim();
      const parsed = extractInfo(extractedText);

      return res.status(200).json(parsed);
    } catch (error) {
      console.error("OCR failed:", error);
      return res.status(500).json({ error: "OCR failed", details: error.message });
    }
  });
}


