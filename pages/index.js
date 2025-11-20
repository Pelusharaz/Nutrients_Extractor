import { useState } from 'react'
import ResultTable from '../components/ResultTable'


export default function Home() {
const [file, setFile] = useState(null)
const [loading, setLoading] = useState(false)
const [result, setResult] = useState(null)
const [error, setError] = useState(null)


async function handleUpload(e) {
e.preventDefault()
if (!file) return alert('Choose a PDF first')
setLoading(true)
setError(null)
setResult(null)
try {
const fd = new FormData()
fd.append('file', file)
const res = await fetch('/api/upload', {
method: 'POST',
body: fd
})
if (!res.ok) {
const txt = await res.text()
throw new Error(txt || 'Upload failed')
}
const data = await res.json()
setResult(data)
} catch (err) {
setError(err.message)
} finally {
setLoading(false)
}
}

return (
<div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Inter, system-ui' }}>
<h1>Sharaz Allergen & Nutrition Extractor</h1>
<p>Upload a product PDF (digital or scanned). The backend will extract allergens and nutrition values.</p>


<form onSubmit={handleUpload} style={{ marginBottom: 20 }}>
<input
type="file"
accept="application/pdf"
onChange={(e) => setFile(e.target.files?.[0] || null)}
/>
<div style={{ marginTop: 12 }}>
<button type="submit" disabled={loading}>
{loading ? 'Processing…' : 'Upload & Extract'}
</button>
</div>
</form>


{error && <div style={{ color: 'crimson' }}>Error: {error}</div>}


{result && (
<div>
<h2>Extraction Result</h2>
<ResultTable data={result} />


<h3>Raw JSON</h3>
<pre style={{ whiteSpace: 'pre-wrap', background: '#f3f3f3', padding: 12 }}>{JSON.stringify(result, null, 2)}</pre>


<div style={{ marginTop: 12 }}>
<a
href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`}
download="extraction.json"
>
Download JSON
</a>
</div>
</div>
)}
</div>
)
}