export async function analyzeJob(jobDescription, resume) {
  const response = await fetch('http://localhost:8000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobDescription, resume })
  })
  const data = await response.json()
  return data.result
}