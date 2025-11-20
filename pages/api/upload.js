// pages/api/upload.js
import fs from "fs";
import path from "path";
import formidable from "formidable";
import Tesseract from "tesseract.js";
const pdfParse = require("pdf-parse");

import { extractData } from "./analyze";

export const config = { api: { bodyParser: false } };

const TMP_DIR = path.resolve("./tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const form = new formidable.IncomingForm({
    keepExtensions: true,
    uploadDir: TMP_DIR
  });

  form.parse(req, async (err, fields, files) => {
    if (err)
      return res.status(500).json({ error: "File parsing failed", details: err });

    const file = files.file;
    if (!file)
      return res.status(400).json({ error: "No file uploaded" });

    const filePath = file.filepath || file.path;

    let text = "";

    // Try TEXT PDF first
    try {
      const buffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(buffer);
      if (pdfData?.text?.trim().length > 5) {
        text = pdfData.text.trim();
      }
    } catch (e) {
      console.log("pdf-parse failed, using OCR...");
    }

    // OCR fallback (images or scanned PDF)
    if (!text || text.length < 5) {
      try {
        const ocr = await Tesseract.recognize(filePath, "eng", {
          logger: m => console.log(m)
        });
        text = ocr?.data?.text || "";
      } catch (e) {
        console.log("OCR failed:", e);
      }
    }

    const parsed = extractData(text);

    return res.status(200).json(parsed);
  });
}
