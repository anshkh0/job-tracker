export async function analyzeJob(jobDescription, resumeFile) {
  const formData = new FormData()
  formData.append('jobDescription', jobDescription)
  formData.append('resume', resumeFile)

  const response = await fetch('https://job-tracker-production-e88d.up.railway.app/analyze', {
    method: 'POST',
    body: formData
  })
  const data = await response.json()
  return data.result
}