export async function analyzeJob(jobDescription, resume) {
  const response = await fetch('https://job-tracker-production-e88d.up.railway.app/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobDescription, resume })
  })
  const data = await response.json()
  return data.result
}