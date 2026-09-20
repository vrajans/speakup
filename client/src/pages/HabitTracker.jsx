import { useState, useEffect } from 'react'

const DNN = [
  "Voice warm-up done before first meeting or practice session",
  "Read or practiced one script aloud and recorded it",
  "Listened back to recording and noted one thing to improve",
  "Used one power phrase or removed one filler word in real conversation",
  "Made one proactive contribution in a meeting (question, comment, or opener)",
]

export default function HabitTracker() {
  const [habitDays, setHabitDays] = useState({})
  const [dnn, setDnn] = useState({})
  const [totalSessions, setTotalSessions] = useState(0)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setTotalSessions(d.total_sessions || 0)).catch(() => {})
    fetch('/api/habits').then(r => r.json()).then(rows => {
      const h = {}; rows.forEach(r => { h[r.date] = JSON.parse(r.completed_items || '[]') }); setHabitDays(h)
    }).catch(() => {})
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const todayItems = habitDays[today] || []
  const todayNum = (totalSessions || 0) + 1

  const toggleDay = async (n) => {
    const key = n; const cur = habitDays[key] || []
    const updated = cur.includes('done') ? [] : ['done']
    const newH = { ...habitDays, [key]: updated }
    setHabitDays(newH)
  }

  const toggleDNN = async (i) => {
    const cur = todayItems.includes(i) ? todayItems.filter(x => x !== i) : [...todayItems, i]
    const newH = { ...habitDays, [today]: cur }
    setHabitDays(newH)
    await fetch('/api/habits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: today, completed_items: cur }) }).catch(() => {})
  }

  const done = Object.values(habitDays).filter(v => Array.isArray(v) && v.length > 0).length

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Habit Tracker</h1>
      <p className="text-gray-500 text-sm mb-6">90 squares. Build the unbroken chain. {done} of 90 days completed.</p>

      {/* 90-day grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4">90-day practice grid</h2>
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
          {Array.from({ length: 90 }, (_, i) => {
            const n = i + 1
            const isToday = n === todayNum
            const isDone = n <= totalSessions
            return (
              <div key={n} title={`Day ${n}`}
                className={`aspect-square rounded flex items-center justify-center text-xs font-bold cursor-pointer transition-all
                  ${isDone ? 'bg-blue-500 text-white' : isToday ? 'bg-amber-100 border-2 border-amber-500 text-amber-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                {n}
              </div>
            )
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500" /> Done</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border-2 border-amber-500 bg-amber-100" /> Today</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100" /> Upcoming</div>
        </div>
      </div>

      {/* Daily non-negotiables */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Today's non-negotiables</h2>
        <p className="text-xs text-gray-400 mb-4">Check off each habit as you complete it. {todayItems.length} of {DNN.length} done today.</p>
        <div className="space-y-0">
          {DNN.map((item, i) => {
            const checked = todayItems.includes(i)
            return (
              <div key={i} onClick={() => toggleDNN(i)} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-none cursor-pointer hover:bg-gray-50 px-2 rounded">
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${checked ? 'bg-green-500 text-white' : 'border-2 border-gray-300'}`}>
                  {checked && <span className="text-xs">✓</span>}
                </div>
                <span className={`text-sm leading-relaxed ${checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item}</span>
              </div>
            )
          })}
        </div>
        {todayItems.length === DNN.length && (
          <div className="mt-4 text-center text-green-600 font-semibold text-sm">🎉 All habits complete for today! Great work.</div>
        )}
      </div>
    </div>
  )
}
