// lib/ocr.js


const fs = require('fs')
const path = require('path')


const useGoogle = process.env.USE_GOOGLE_VISION === 'true'


async function ocrWithTesseract(buffer) {
// Use tesseract.js to recognize text from PDF pages (converted to images)
// For simplicity this helper expects a PDF to be already rasterized or
// that Tesseract can work on the PDF buffer directly (tesseract.js can read images).
// A robust production solution should rasterize PDF pages to images using `pdf-poppler` or `pdftoppm`.


const { createWorker } = require('tesseract.js')
const tmp = path.join('/tmp', `pdf_ocr_${Date.now()}.png`)
// Quick hack: write buffer to a file — this won't always work for PDFs
fs.writeFileSync(tmp, buffer)
const worker = createWorker()
await worker.load()
await worker.loadLanguage('eng')
await worker.initialize('eng')
const { data: { text } } = await worker.recognize(tmp)
await worker.terminate()
try { fs.unlinkSync(tmp) } catch (e) {}
return text
}

async function ocrWithGoogleVision(buffer) {
// Requires GOOGLE_APPLICATION_CREDENTIALS and @google-cloud/vision installed
// We provide code but keep it optional in package.json
const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient()
const [result] = await client.documentTextDetection({ image: { content: buffer } })
const fullText = result.fullTextAnnotation?.text || ''
return fullText
}


module.exports = async function runOCR(buffer) {
if (useGoogle) {
return await ocrWithGoogleVision(buffer)
}
return await ocrWithTesseract(buffer)
}