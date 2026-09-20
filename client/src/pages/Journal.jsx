import { useState, useEffect } from 'react'
export default function Journal() {
  const [entries, setEntries] = useState([])
  const [text, setText] = useState('')
  const [type, setType] = useState('Small talk win')
  const [score, setScore] = useState(0)

  useEffect(() => {
    fetch('/api/journal').then(r => r.json()).then(setEntries).catch(() => {})
  }, [])

  const save = async () => {
    if (!text.trim()) return alert('Write something first.')
    await fetch('/api/journal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, type, score }) })
    setText(''); setScore(0)
    fetch('/api/journal').then(r => r.json()).then(setEntries)
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Wins Journal</h1>
      <p className="text-gray-500 text-sm mb-6">Evidence of your growth. Read this when doubt appears.</p>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-3">Record a win or reflection</h2>
        <textarea rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="What happened? What did you say that worked? How did they respond?" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
        <div className="flex gap-4 items-center flex-wrap mt-3">
          <select value={type} onChange={e => setType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {['Small talk win','Status update delivered','Meeting led','Escalation handled','Pitch delivered','Presentation','Recording practice','Breakthrough','Lesson learned'].map(t => <option key={t}>{t}</option>)}
          </select>
          <div className="flex gap-1">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setScore(n)} className={`text-xl ${n <= score ? 'text-amber-400' : 'text-gray-200'}`}>★</button>)}</div>
          <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save entry</button>
        </div>
      </div>
      {entries.length === 0 ? <div className="text-center text-gray-400 py-12 text-sm">No entries yet. Every good conversation deserves to be recorded here.</div> :
        entries.map(e => (
          <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-3 shadow-sm">
            <div className="text-xs text-gray-400 mb-2">{e.created_at?.slice(0,10)} · {e.type}{e.score ? ' · ' + '★'.repeat(e.score) : ''}</div>
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{e.text}</div>
          </div>
        ))}
    </div>
  )
}
