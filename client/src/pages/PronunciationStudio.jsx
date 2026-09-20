import { useState, useRef, useEffect } from 'react'

const QUICK_WORDS = [
  "medallion architecture", "data lineage", "schema validation", "orchestration",
  "implementation", "recommendation", "validation", "accountability",
  "stakeholder", "deliverable", "sophisticated", "infrastructure",
  "Azure Data Factory", "Microsoft Fabric", "Power BI", "Dynamics 365",
  "ingestion pipeline", "transformation", "synchronisation", "articulation",
  "professional", "collaboration", "communication", "presentation",
]

const QUICK_SENTS = {
  data: [
    "Good morning, everyone. I want to give a quick update on the Data and Analytics program for this week.",
    "My recommendation is Option A — transaction-level grain with date partitioning.",
    "The pipeline is ready for validation.",
    "We have a dependency on the Data Governance team for the encryption policy approval.",
    "I want to be transparent about a risk that could affect our October deadline.",
    "Would it be helpful if I put together a one-page proposal on the reusable framework?",
    "This unblocks the Power BI team — they were waiting on this feed to build the executive dashboard.",
  ],
  conversation: [
    "Hey, how has your week been going? Anything interesting happening on your end?",
    "I am still getting used to Texas summers — it was 105 degrees when I arrived and I did not know what was happening!",
    "That is a great point. Let me build on that with what I am seeing in the data.",
    "Fair enough — I can see why the timeline feels aggressive from your team's side.",
    "I really appreciate you jumping on this so quickly. It made a big difference.",
    "No worries at all — I know how busy everything gets. Whenever you have a moment works for me.",
    "Let me think about that for a moment — I want to give you a considered answer.",
    "Does that make sense? I want to make sure I explained it clearly.",
    "Can we touch base later this week to align on the timeline before Thursday's meeting?",
    "I wanted to give you a heads up — the governance review may take a bit longer than planned.",
  ],
  paragraphs: [
    `Good morning, everyone. Thank you for joining the Q3 Data and Analytics Program Review. I know everyone is busy and I want to make sure these forty minutes are worth your time.\n\nMy name is [your name]. I am the Project Manager leading the Data and Analytics delivery workstream. I work across Azure Data Platform, Microsoft Fabric, and Power BI.\n\nToday I will cover three areas. First — where we are against the Q3 roadmap. Second — the two biggest technical decisions we made this quarter. Third — what I need from this group to hit our Q4 targets.\n\nLet me start with the roadmap.`,
    `I have been in IT for about sixteen years — started in 2009, worked across the full data stack. Early in my career I was doing ETL development and database work. More recently I have been leading end-to-end analytics programs.\n\nMy real passion is the intersection of data engineering and business value. Making sure the pipelines we build drive actual decisions — not just fill dashboards nobody looks at.\n\nI have been with the Microsoft program for about six months and I genuinely enjoy the complexity here. Every week I find something that impresses me.\n\nWhat about you — how long have you been on this team?`,
    `How was your weekend? I tried something new — went to the Dallas Farmers Market for the first time. It was completely different from what I expected. Food stalls, live music, families everywhere.\n\nIt reminded me a little of the weekend markets back home in India, but with a very different energy. I am still discovering the city. Every weekend I try one new thing — a restaurant, a neighborhood, a park.\n\nDo you have any recommendations for places I should try around Dallas or McKinney?`,
  ]
}

function Recorder({ targetText, onFeedback }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const mrRef = useRef(null)
  const srRef = useRef(null)
  const timerRef = useRef(null)
  const chunksRef = useRef([])

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []; setTranscript(''); setSeconds(0)
      const mr = new MediaRecorder(stream)
      mrRef.current = mr
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => { setBlob(new Blob(chunksRef.current, { type: 'audio/webm' })); stream.getTracks().forEach(t => t.stop()) }
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SR) {
        const sr = new SR(); sr.continuous = true; sr.interimResults = true; sr.lang = 'en-US'
        sr.onresult = e => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + ' '; setTranscript(t.trim()) }
        sr.onerror = () => {}; srRef.current = sr; sr.start()
      }
      mr.start(); setRecording(true); setBlob(null)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch (e) { alert('Microphone access needed.') }
  }

  const stop = () => {
    if (mrRef.current) mrRef.current.stop()
    if (srRef.current) { try { srRef.current.stop() } catch (e) {} }
    clearInterval(timerRef.current); setRecording(false)
  }

  const download = () => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `pronunciation-${new Date().toISOString().slice(0, 10)}.webm`
    a.click()
  }

  const analyse = async () => {
    if (!targetText) return alert('Please load a text to practise first.')
    setLoading(true)
    const r = await fetch('/api/ai/pronunciation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_text: targetText, transcript, duration_seconds: seconds })
    })
    const data = await r.json()
    if (onFeedback) onFeedback(data, transcript, seconds)
    setLoading(false)
  }

  return (
    <div>
      <div className={`border-2 rounded-xl p-4 text-center transition-all ${recording ? 'border-red-400 bg-red-50' : 'border-dashed border-gray-300 bg-gray-50'}`}>
        <div className="flex items-center justify-center gap-1 h-10 mb-2">
          {[6, 14, 8, 22, 10, 6, 18, 12, 8, 20, 10, 6, 16].map((h, i) => (
            <div key={i} className={`w-1 rounded-full ${recording ? 'bg-red-400' : 'bg-gray-300'}`}
              style={{ height: recording ? `${h}px` : '4px', transition: 'height 0.1s', animation: recording ? `wave ${0.6 + i * 0.05}s ease-in-out infinite alternate` : 'none' }} />
          ))}
        </div>
        <div className="text-xl font-bold text-gray-800 tabular-nums">{fmt(seconds)}</div>
        <div className="text-xs text-gray-500 mt-1">{recording ? '🔴 Recording — speak clearly' : blob ? `✓ ${fmt(seconds)} recorded` : 'Press Record to start'}</div>
        {transcript && <div className="mt-2 text-xs text-gray-500 bg-white border border-gray-200 rounded p-2 max-h-12 overflow-y-auto text-left">Heard: {transcript}</div>}
      </div>
      <div className="flex gap-2 mt-3 flex-wrap">
        {!recording ? <button onClick={start} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">⏺ Record</button>
          : <button onClick={stop} className="px-3 py-1.5 bg-red-700 text-white rounded-lg text-sm hover:bg-red-800">⏹ Stop</button>}
        {blob && !recording && <>
          <button onClick={start} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">⏺ Again</button>
          <button onClick={download} className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">⬇ Save</button>
          <button onClick={analyse} disabled={loading} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {loading ? '⏳ Analysing...' : '🧠 Analyse'}
          </button>
        </>}
      </div>
      <style>{`@keyframes wave { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }`}</style>
    </div>
  )
}

export default function PronunciationStudio() {
  const [text, setText] = useState('')
  const [rate, setRate] = useState(0.85)
  const [pitch, setPitch] = useState(1.0)
  const [voices, setVoices] = useState([])
  const [voiceIdx, setVoiceIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [wbwWords, setWbwWords] = useState([])
  const [wbwIdx, setWbwIdx] = useState(-1)
  const [status, setStatus] = useState('')
  const [sentTab, setSentTab] = useState('data')
  const [feedback, setFeedback] = useState(null)
  const synthRef = useRef(window.speechSynthesis)
  const wbwTimer = useRef(null)

  useEffect(() => {
    const load = () => {
      const v = synthRef.current.getVoices().filter(v => v.lang.startsWith('en'))
      setVoices(v)
      const usIdx = v.findIndex(v => v.lang === 'en-US')
      if (usIdx >= 0) setVoiceIdx(usIdx)
    }
    load()
    synthRef.current.onvoiceschanged = load
  }, [])

  const getVoice = () => voices[voiceIdx] || null

  const speak = (t, r) => {
    synthRef.current.cancel()
    if (!t.trim()) { setStatus('Please enter text first.'); return }
    const u = new SpeechSynthesisUtterance(t)
    u.rate = r || rate; u.pitch = pitch
    const v = getVoice(); if (v) u.voice = v
    u.onstart = () => { setPlaying(true); setStatus('🔊 Playing...') }
    u.onend = () => { setPlaying(false); setStatus('✓ Done. Now record yourself.') }
    u.onerror = () => { setPlaying(false); setStatus('Error — try a different voice or use Chrome.') }
    synthRef.current.speak(u)
  }

  const playWBW = () => {
    const words = text.split(/\s+/).filter(Boolean)
    if (!words.length) return
    synthRef.current.cancel()
    if (wbwTimer.current) clearTimeout(wbwTimer.current)
    setWbwWords(words); setWbwIdx(-1)
    let i = 0
    const next = () => {
      if (i >= words.length) { setWbwIdx(-1); setStatus('✓ Done. Now say it all smoothly.'); return }
      setWbwIdx(i)
      const u = new SpeechSynthesisUtterance(words[i])
      u.rate = 0.8; u.pitch = pitch
      const v = getVoice(); if (v) u.voice = v
      const ci = i; u.onend = () => { i = ci + 1; wbwTimer.current = setTimeout(next, 350) }
      synthRef.current.speak(u)
      setStatus(`Word ${i + 1}/${words.length}: "${words[i]}"`); i++
    }
    next()
  }

  const stop = () => { synthRef.current.cancel(); if (wbwTimer.current) clearTimeout(wbwTimer.current); setWbwIdx(-1); setPlaying(false); setStatus('') }

  const loadAndPlay = (t) => { setText(t); setTimeout(() => speak(t), 200) }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pronunciation Studio</h1>
      <p className="text-gray-500 text-sm mb-6">Paste any word, sentence or paragraph. Hear correct American English. Record yourself. Get AI feedback.</p>

      {/* Main player */}
      <div className="bg-white rounded-xl border-2 border-blue-300 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-3">🔊 Listen & Match</h2>
        <textarea rows={4} value={text} onChange={e => setText(e.target.value)}
          placeholder="Paste any word, phrase, sentence or paragraph here...&#10;&#10;Click any word or sentence below to load instantly."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />

        {/* Word by word highlight */}
        {wbwWords.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-base leading-loose">
            {wbwWords.map((w, i) => (
              <span key={i} className={`mr-1 px-1 rounded transition-all ${i === wbwIdx ? 'bg-blue-600 text-white font-bold' : i < wbwIdx ? 'text-gray-400' : 'text-gray-800'}`}>{w}</span>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">Speed: {rate.toFixed(2)}×</div>
            <input type="range" min={0.5} max={1.2} step={0.05} value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">Pitch: {pitch.toFixed(2)}</div>
            <input type="range" min={0.8} max={1.3} step={0.05} value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} className="w-full accent-blue-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">Voice (★ = American)</div>
            <select value={voiceIdx} onChange={e => setVoiceIdx(parseInt(e.target.value))} className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs">
              {voices.map((v, i) => <option key={i} value={i}>{v.name}{v.lang === 'en-US' ? ' ★' : ''}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <button onClick={() => speak(text)} disabled={playing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">▶ Play</button>
          <button onClick={() => { synthRef.current.paused ? synthRef.current.resume() : synthRef.current.pause(); setStatus(synthRef.current.paused ? '⏸ Paused' : '▶ Resumed') }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">⏸ Pause</button>
          <button onClick={stop} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">⏹ Stop</button>
          <button onClick={() => speak(text, 0.6)} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm hover:bg-amber-200">🐢 Slow (0.6×)</button>
          <button onClick={playWBW} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">🔍 Word by word</button>
        </div>
        {status && <div className="mt-2 text-xs text-gray-500">{status}</div>}
      </div>

      {/* Recording & AI analysis */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-1">🎙️ Record yourself & get AI feedback</h2>
        <p className="text-xs text-gray-400 mb-4">Listen first, then record yourself saying the same text. Uses speech recognition to compare what you said with what you should have said.</p>
        <Recorder targetText={text} onFeedback={(data, tx, sec) => setFeedback({ ...data, transcript: tx, seconds: sec })} />
        {feedback && (
          <div className="mt-4 bg-white border border-blue-200 rounded-xl p-4">
            <div className="font-semibold text-blue-700 mb-3">📊 Analysis Results</div>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500">Your pace:</span> <span className={`font-semibold ${feedback.wpm >= 100 && feedback.wpm <= 165 ? 'text-green-600' : 'text-amber-600'}`}>{feedback.wpm || 0} wpm</span></div>
              <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500">Missed words:</span> <span className={`font-semibold ${(feedback.missed_words?.length || 0) === 0 ? 'text-green-600' : 'text-red-600'}`}>{feedback.missed_words?.length === 0 ? 'None ✓' : feedback.missed_words?.slice(0, 5).join(', ')}</span></div>
            </div>
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{feedback.feedback}</div>
            {feedback.transcript && <div className="mt-3 text-xs text-gray-400 bg-gray-50 p-2 rounded"><strong>What the app heard:</strong> {feedback.transcript}</div>}
          </div>
        )}
      </div>

      {/* Quick words */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-3">Quick words — click to load & play</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_WORDS.map(w => (
            <button key={w} onClick={() => loadAndPlay(w)} className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs hover:bg-blue-100 transition-colors">{w}</button>
          ))}
        </div>
      </div>

      {/* Sentences */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-3">Sentences & paragraphs</h2>
        <div className="flex gap-2 mb-4">
          {['data', 'conversation', 'paragraphs'].map(t => (
            <button key={t} onClick={() => setSentTab(t)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${sentTab === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200'}`}>
              {t === 'data' ? 'Data & Work' : t === 'conversation' ? 'Everyday conversation' : 'Full paragraphs'}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {QUICK_SENTS[sentTab].map((s, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex-1 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{s}</div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => loadAndPlay(s)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">▶</button>
                <button onClick={() => { setText(s); setTimeout(() => speak(s, 0.6), 200) }} className="px-2 py-1 bg-amber-500 text-white rounded text-xs hover:bg-amber-600">🐢</button>
                <button onClick={() => { setText(s); setTimeout(playWBW, 200) }} className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600">🔍</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-3">What to listen for</h2>
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
          <div className="bg-blue-50 p-3 rounded-lg"><strong className="text-blue-700 block mb-1">Word stress</strong>me-DAL-lion · rec-om-MEN-da-tion · or-CHES-tra-tion · val-i-DA-tion · im-ple-men-TA-tion</div>
          <div className="bg-green-50 p-3 rounded-lg"><strong className="text-green-700 block mb-1">Sentence ending</strong>Statements → voice DOWN ↘<br/>Questions → voice UP ↗<br/>"The pipeline is ready." ↘</div>
          <div className="bg-amber-50 p-3 rounded-lg"><strong className="text-amber-700 block mb-1">Shadowing method</strong>1. Listen at 0.85× — just hear<br/>2. Play at 0.6× — hear each sound<br/>3. Play and speak simultaneously<br/>4. Record yourself alone &amp; compare</div>
          <div className="bg-purple-50 p-3 rounded-lg"><strong className="text-purple-700 block mb-1">Sentence rhythm</strong>Content words LAND (nouns, verbs).<br/>Function words float (the, is, a).<br/>"The PIPE-line is REA-dy for val-i-DA-tion."</div>
        </div>
      </div>
    </div>
  )
}
