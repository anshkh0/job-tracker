import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { analyzeJob } from './gemini'

const statusColors = {
  Applied: 'bg-blue-100 text-blue-700',
  Interview: 'bg-yellow-100 text-yellow-700',
  Offer: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

function App() {
  const [jobs, setJobs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ company: '', role: '', status: 'Applied', date: '' })
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    const { data, error } = await supabase.from('Applications').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setJobs(data)
    setLoading(false)
  }

  async function handleAdd() {
    if (!form.company || !form.role || !form.date) return
    const { data, error } = await supabase.from('Applications').insert([form]).select()
    if (error) console.error(error)
    else setJobs([...data, ...jobs])
    setForm({ company: '', role: '', status: 'Applied', date: '' })
    setShowForm(false)
  }

  async function handleDelete(id) {
    await supabase.from('Applications').delete().eq('id', id)
    setJobs(jobs.filter(job => job.id !== id))
    setSelectedJob(null)
  }

  async function handleStatusChange(id, newStatus) {
    await supabase.from('Applications').update({ status: newStatus }).eq('id', id)
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job))
  }

  async function handleAnalyze() {
    if (!jobDescription || !resume) return
    setAnalyzing(true)
    const result = await analyzeJob(jobDescription, resume)
    setAnalysis(result)
    setAnalyzing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Job Tracker</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add Application
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">New Application</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Company"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Role"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2 text-sm"
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
              <select
                className="border rounded-lg px-3 py-2 text-sm"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAdd}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="border px-4 py-2 rounded-lg text-sm text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <p className="text-center text-gray-400 py-12">Loading...</p>
          ) : jobs.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No applications yet. Add one!</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr
                    key={job.id}
                    onClick={() => { setSelectedJob(job); setAnalysis('') }}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium">{job.company}</td>
                    <td className="px-6 py-4 text-gray-600">{job.role}</td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <select
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${statusColors[job.status]}`}
                        value={job.status}
                        onChange={e => handleStatusChange(job.id, e.target.value)}
                      >
                        <option>Applied</option>
                        <option>Interview</option>
                        <option>Offer</option>
                        <option>Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{job.date}</td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedJob && (
            <div className="border-t p-6">
              <h2 className="font-semibold text-gray-700 mb-4">{selectedJob.company} — {selectedJob.role}</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Paste Job Description</label>
                  <textarea
                    className="border rounded-lg px-3 py-2 text-sm w-full h-32"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Paste Your Resume</label>
                  <textarea
                    className="border rounded-lg px-3 py-2 text-sm w-full h-32"
                    placeholder="Paste your resume text here..."
                    value={resume}
                    onChange={e => setResume(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Match'}
              </button>
              {analysis && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-line">
                  {analysis}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App