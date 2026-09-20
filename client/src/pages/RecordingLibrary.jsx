import { useState, useEffect } from 'react'
export default function RecordingLibrary() {
  const [recordings, setRecordings] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch('/api/recordings').then(r => r.json()).then(setRecordings).catch(() => {})
  }, [])

  const del = async (id) => {
    if (!confirm('Delete this recording?')) return
    await fetch(`/api/recordings/${id}`, { method: 'DELETE' })
    setRecordings(r => r.filter(x => x.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const fmt = s => s ? `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}` : '—'

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Recording Library</h1>
      <p className="text-gray-500 text-sm mb-6">All your practice recordings with transcripts and AI feedback.</p>
      {recordings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🎙️</div>
          <div className="font-medium">No recordings yet</div>
          <div className="text-sm mt-1">Start a practice session and record yourself to see your library grow.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {recordings.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50" onClick={() => setSelected(selected?.id === r.id ? null : r)}>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg flex-shrink-0">🎙️</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 capitalize">{r.type?.replace(/-/g,' ')}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{r.created_at?.slice(0,16).replace('T',' ')} · {fmt(r.duration_seconds)} · {r.wpm || 0} wpm</div>
                </div>
                <div className="flex gap-2">
                  {r.file_path && <a href={r.file_path} download className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200" onClick={e => e.stopPropagation()}>⬇ Download</a>}
                  <button onClick={e => { e.stopPropagation(); del(r.id) }} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">🗑 Delete</button>
                </div>
              </div>
              {selected?.id === r.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-3">
                  {r.transcript && <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700"><strong className="text-gray-800 block mb-1">Transcript:</strong>{r.transcript}</div>}
                  {r.ai_feedback && <div className="bg-blue-50 rounded-lg p-3 text-xs text-gray-700 leading-relaxed"><strong className="text-blue-700 block mb-1">🧠 AI Feedback:</strong>{r.ai_feedback}</div>}
                  {!r.ai_feedback && <div className="text-xs text-gray-400 italic">No AI feedback for this recording. Use the analyse button during recording to get feedback.</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
