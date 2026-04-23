const GEMINI_API_KEY = 'AIzaSyAF9ufQugYqIFsSPGx1O_cHLyZ62Xcg764'

export async function analyzeJob(jobDescription, resume) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `You are a career advisor. Given this job description and resume, give:
1. A match score out of 100
2. Top 3 matching skills
3. Top 3 missing skills
4. One sentence of advice

Job Description:
${jobDescription}

Resume:
${resume}

Reply in this exact format:
Score: X/100
Matching skills: x, y, z
Missing skills: x, y, z
Advice: ...`
          }]
        }]
      })
    }
  )
  const data = await response.json()
  console.log('Gemini response:', data)
  if (!data.candidates) throw new Error(JSON.stringify(data))
  return data.candidates[0].content.parts[0].text
}