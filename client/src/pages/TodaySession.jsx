import { useState, useEffect, useRef } from 'react'

const SESSIONS = [
  {
    day: 1, theme: "Know your voice",
    steps: [
      {
        id: 'warmup', meta: "Step 1 · 3 min", title: "Voice warm-up", mins: "Before any recording",
        content: `<div class="space-y-3 text-sm text-gray-700 leading-relaxed">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
            <strong class="text-blue-700 block mb-1">4-breath reset</strong>
            Breathe in for 4 counts. Hold for 2. Out for 6. Repeat 4 times. Feel your shoulders drop.
          </div>
          <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
            <strong class="text-blue-700 block mb-1">Articulation sentence — say 3 times slowly</strong>
            "Azure Data Factory pipeline delivers validated data to the Gold layer every night at 2 AM."<br/>Exaggerate every consonant.
          </div>
          <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
            <strong class="text-blue-700 block mb-1">Downward inflection — say 5 times</strong>
            "The pipeline is ready for validation." — voice goes DOWN on "validation." Not up like a question. Down like a certainty.
          </div>
          <div class="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-xs">
            💡 Your voice is a muscle. Warm it up before any high-stakes speaking.
          </div>
        </div>`,
        hasRec: false
      },
      {
        id: 'status', meta: "Step 2 · 5 min", title: "Read & record — Status update", mins: "Record on phone · Listen back immediately",
        script: `Good morning, everyone. I want to give a quick update on the Data and Analytics program for this week.

WHAT WE COMPLETED:
We completed the ingestion pipeline for the Sales Intelligence dataset in Azure Data Factory. The pipeline now pulls from Dynamics 365 and lands data in the Bronze layer. This unblocks the Power BI team — they were waiting on this feed to build the executive dashboard.

WHAT WE ARE FOCUSED ON:
The team is working on the Bronze-to-Silver transformation in dbt. We are validating data quality rules against the Customer PII fields. Target is Silver layer sign-off by Thursday.

ONE RISK I WANT TO FLAG:
We have a dependency on Data Governance for the encryption policy approval. Submitted nine days ago — SLA is five business days. Following up with Sarah today. If not resolved by Wednesday, Silver layer sign-off shifts by two days.

That is my update. Happy to go deeper on anything.`,
        tip: "Read at 70% of your natural speed. Pause 1 full second after every period. Listen back immediately. Note the ONE thing you want to fix.",
        hasRec: true,
        recType: "status-update"
      },
      {
        id: 'smalltalk', meta: "Step 3 · 3 min", title: "Small talk rehearsal", mins: "Say each opener 5 times",
        content: `<div class="space-y-3 text-sm text-gray-700">
          <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
            <strong class="text-green-700 block mb-1">Option A — connect over their work</strong>
            "Hey — before we start, the new Fabric workspace you set up last week made our onboarding so much smoother. Have you done many Fabric migrations?"
          </div>
          <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
            <strong class="text-green-700 block mb-1">Option B — warm personal opener</strong>
            "Hey, how is your week going? I am still adjusting to Texas summers — 105 degrees when I landed! Does it ever feel normal?"
          </div>
          <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
            <strong class="text-green-700 block mb-1">Option C — curious about them</strong>
            "Before we jump in — how long have you been on the Data Platform side at Microsoft? I am still learning how all the teams connect."
          </div>
          <div class="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-xs">
            💡 Your only goal today: use ONE of these before a real meeting. Starting is the entire skill you are building this week.
          </div>
        </div>`,
        hasRec: false
      }
    ]
  },
  {
    day: 2, theme: "Escalation & assertive language",
    steps: [
      {
        id: 'assertion', meta: "Step 1 · 3 min", title: "Assertion warm-up", mins: "Full confidence — no hedging",
        content: `<div class="space-y-3 text-sm text-gray-700">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
            <strong class="text-blue-700 block mb-1">Say each phrase 5 times with a complete sentence</strong>
            "My recommendation is Option A."<br/>"My recommendation is that we escalate this today."<br/>"My recommendation is a 30-minute sync this week."<br/><br/>After each sentence — pause 1 full second. The pause IS the confidence.
          </div>
        </div>`,
        hasRec: false
      },
      {
        id: 'escalation', meta: "Step 2 · 5 min", title: "Read & record — Escalation script", mins: "Does it sound like ownership?",
        script: `I want to flag a risk that needs this group's attention — and I want to be transparent about it early so we can act before it affects delivery.

We have a dependency on the Data Governance team to approve the PII encryption policy for the Customer 360 dataset. I submitted the request on September 18th — that is eleven business days ago. Our agreed SLA is five business days.

The impact is specific: without this approval, we cannot promote Customer data from Silver to Gold in our Fabric workspace. This delays the Customer Analytics dashboard, which is committed to business stakeholders for October 1st.

I have already followed up twice — once by email on the 22nd, and once by Teams on the 25th. I am not here to assign blame. I need escalation support.

My ask is simple: can someone connect me with the Data Governance lead this week? I am confident this resolves quickly once we have the right people in the room.`,
        tip: "Listen for: Does it sound like you own the problem? Or does it sound like complaining? The difference is 'I need escalation support' vs 'nobody is helping me.'",
        hasRec: true,
        recType: "escalation"
      },
      {
        id: 'pitch', meta: "Step 3 · 3 min", title: "Opportunity pitch practice", mins: "Read once — then say from memory",
        content: `<div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r text-sm text-gray-700 leading-relaxed">
          I noticed something while working on the architecture last week — I think it has a real business case.<br/><br/>
          Right now, four teams are each building separate ingestion pipelines in Azure Data Factory. Each one is custom-built, independently maintained, with different naming conventions and error-handling patterns. We are solving the same problem four times.<br/><br/>
          I believe there is an opportunity to build a single reusable ingestion framework — parameterized ADF templates with standardised logging and schema validation. Any new data source onboarded in two days instead of two weeks.<br/><br/>
          A four-week investment saves approximately thirty percent of engineering time on every future pipeline. With eight more data domains in Q1, the math works strongly in our favour.<br/><br/>
          Would it be valuable to give me fifteen minutes in our next one-to-one to walk through a one-pager?
        </div>
        <div class="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-xs mt-3">
          💡 The closing line is everything: "Would it be valuable" positions you as offering value, not asking for attention.
        </div>`,
        hasRec: false
      }
    ]
  },
  {
    day: 3, theme: "Presentation confidence",
    steps: [
      {
        id: 'pace', meta: "Step 1 · 3 min", title: "Pace & pause drill", mins: "Slower than you think",
        content: `<div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r text-sm text-gray-700 leading-relaxed">
          <strong class="text-blue-700 block mb-2">Count-to-2 drill</strong>
          Say each sentence. Then count silently to 2 before the next one.<br/><br/>
          "The pipeline is ready." [2 seconds]<br/>
          "The data model is approved." [2 seconds]<br/>
          "We will go live on October 15th." [2 seconds]<br/><br/>
          Do this 5 times. This pace sounds confident and in control to American audiences. It feels unnaturally slow to you. It sounds perfect to them.
        </div>`,
        hasRec: false
      },
      {
        id: 'presentation', meta: "Step 2 · 5 min", title: "Read & record — Presentation opening", mins: "Video record if possible",
        script: `Good morning, everyone. Thank you for joining the Q3 Data and Analytics Program Review. I know everyone is busy — I want to make sure these forty minutes are worth your time.

My name is [your name]. I am the Project Manager leading the Data and Analytics delivery workstream. I work across Azure Data Platform, Microsoft Fabric, and Power BI.

Today I will cover three areas.

First — where we are against the Q3 roadmap. What we committed to, what we delivered, and what shifted — and why.

Second — the two biggest technical decisions we made this quarter and the business outcomes they are driving.

Third — what I need from this group to hit our Q4 targets. I will be specific about the asks.

Questions are welcome throughout. Let me start with the roadmap.`,
        tip: "Most important moment: Pause after 'three areas.' Count one full second silently. That pause signals control and confidence to every person in the room.",
        hasRec: true,
        recType: "presentation"
      },
      {
        id: 'analogies', meta: "Step 3 · 3 min", title: "Analogy practice", mins: "Say each — then without reading",
        content: `<div class="space-y-3 text-sm text-gray-700">
          <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r">
            <strong class="text-purple-700 block mb-1">Medallion architecture for non-technical stakeholders</strong>
            "Think of our data like gold ore — raw and messy when it comes in, refined through our Bronze, Silver, and Gold layers, and minted into business-ready reports at the end."
          </div>
          <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r">
            <strong class="text-purple-700 block mb-1">Pipeline failure — no jargon</strong>
            "When the pipeline breaks, think of it like a delivery truck not arriving — the store shelves are empty but the warehouse is completely fine. No data was lost."
          </div>
          <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r">
            <strong class="text-purple-700 block mb-1">Foundation work</strong>
            "Right now we are at the plumbing stage — the pipes have to be in the walls before you can turn on the tap."
          </div>
        </div>`,
        hasRec: false
      }
    ]
  }
]

function Recorder({ recType, sessionId, onSaved }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [saved, setSaved] = useState(false)
  const mediaRecRef = useRef(null)
  const srRef = useRef(null)
  const timerRef = useRef(null)
  const chunksRef = useRef([])

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      setTranscript('')
      setFeedback('')
      setSaved(false)
      setSeconds(0)

      const mr = new MediaRecorder(stream)
      mediaRecRef.current = mr
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: 'audio/webm' })
        setBlob(b)
        stream.getTracks().forEach(t => t.stop())
      }

      // Speech recognition
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SR) {
        const sr = new SR()
        sr.continuous = true; sr.interimResults = true; sr.lang = 'en-US'
        sr.onresult = e => {
          let t = ''
          for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + ' '
          setTranscript(t.trim())
        }
        sr.onerror = () => {}
        srRef.current = sr
        sr.start()
      }

      mr.start()
      setRecording(true)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch (e) {
      alert('Microphone access needed. Please allow it in your browser settings.')
    }
  }

  const stopRec = () => {
    if (mediaRecRef.current) mediaRecRef.current.stop()
    if (srRef.current) { try { srRef.current.stop() } catch (e) {} }
    clearInterval(timerRef.current)
    setRecording(false)
  }

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const saveRec = async () => {
    if (!blob) return
    const fd = new FormData()
    fd.append('audio', blob, `recording-${Date.now()}.webm`)
    fd.append('type', recType)
    fd.append('transcript', transcript)
    fd.append('duration_seconds', seconds)
    const wpm = seconds > 0 && transcript ? Math.round(transcript.split(' ').length / (seconds / 60)) : 0
    fd.append('wpm', wpm)
    if (sessionId) fd.append('session_id', sessionId)
    const r = await fetch('/api/recordings/upload', { method: 'POST', body: fd })
    const data = await r.json()
    setSaved(true)
    if (onSaved) onSaved(data.id)
    return data.id
  }

  const getAIFeedback = async () => {
    setLoadingFeedback(true)
    const recId = await saveRec()
    const wpm = seconds > 0 && transcript ? Math.round(transcript.split(' ').length / (seconds / 60)) : 0
    const r = await fetch('/api/ai/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script_type: recType, transcript, duration_seconds: seconds, wpm, confidence_score: 3 })
    })
    const data = await r.json()
    setFeedback(data.feedback || data.error || 'Could not get feedback.')
    if (recId && data.feedback) {
      await fetch(`/api/recordings/${recId}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_feedback: data.feedback })
      })
    }
    setLoadingFeedback(false)
  }

  const downloadRec = () => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `speakup-${recType}-${new Date().toISOString().slice(0, 10)}.webm`
    a.click()
  }

  return (
    <div className={`mt-4 border-2 rounded-xl p-4 transition-all ${recording ? 'border-red-400 bg-red-50' : 'border-dashed border-gray-300 bg-gray-50'}`}>
      {/* Waveform bars */}
      <div className="flex items-center justify-center gap-1 h-10 mb-3">
        {[6, 14, 8, 22, 10, 6, 18, 12, 8, 20, 10, 6, 16].map((h, i) => (
          <div key={i} className={`w-1 rounded-full transition-all ${recording ? 'bg-red-400' : 'bg-gray-300'}`}
            style={{ height: recording ? `${h}px` : '4px', animation: recording ? `wave ${0.6 + i * 0.05}s ease-in-out infinite alternate` : 'none' }} />
        ))}
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 tabular-nums">{fmt(seconds)}</div>
        <div className="text-xs text-gray-500 mt-1">
          {recording ? '🔴 Recording — speak clearly' : blob ? `✓ Recorded ${fmt(seconds)}` : 'Press Record to start'}
        </div>
      </div>
      {transcript && (
        <div className="mt-3 text-xs text-gray-500 bg-white border border-gray-200 rounded p-2 max-h-16 overflow-y-auto">
          <strong>Heard:</strong> {transcript}
        </div>
      )}
      <div className="flex gap-2 mt-3 flex-wrap justify-center">
        {!recording && !blob && <button onClick={startRec} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 flex items-center gap-2">⏺ Record</button>}
        {recording && <button onClick={stopRec} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">⏹ Stop</button>}
        {blob && !recording && (
          <>
            <button onClick={startRec} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">⏺ Record again</button>
            <button onClick={downloadRec} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">⬇ Save audio</button>
            <button onClick={getAIFeedback} disabled={loadingFeedback} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loadingFeedback ? '⏳ Analysing...' : '🧠 Analyse & save'}
            </button>
          </>
        )}
      </div>
      {feedback && (
        <div className="mt-4 bg-white border border-blue-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed">
          <div className="font-semibold text-blue-700 mb-2">🧠 AI Coaching Feedback</div>
          <div className="whitespace-pre-wrap">{feedback}</div>
        </div>
      )}
      {saved && !feedback && <div className="text-center text-green-600 text-xs mt-2 font-medium">✓ Recording saved to library</div>}
    </div>
  )
}

function StepCard({ step, sessionId, index }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-3">
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{step.meta}</div>
          <div className="text-sm font-semibold text-gray-900 mt-0.5">{step.title}</div>
          <div className="text-xs text-gray-400">{step.mins}</div>
        </div>
        <div className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          {step.content && <div className="mt-4" dangerouslySetInnerHTML={{ __html: step.content }} />}
          {step.script && (
            <div className="mt-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 text-sm text-gray-800 leading-8 font-mono whitespace-pre-wrap">{step.script}</div>
              {step.tip && <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">{step.tip}</div>}
            </div>
          )}
          {step.hasRec && <Recorder recType={step.recType} sessionId={sessionId} />}
        </div>
      )}
    </div>
  )
}

export default function TodaySession({ refreshStats }) {
  const [sessionId, setSessionId] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [reflection, setReflection] = useState('')
  const [score, setScore] = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setTotalSessions(d.total_sessions || 0)).catch(() => {})
  }, [])

  const dayIdx = totalSessions % SESSIONS.length
  const session = SESSIONS[dayIdx]
  const dayNumber = totalSessions + 1
  const phase = totalSessions > 60 ? 3 : totalSessions > 30 ? 2 : 1
  const phaseColors = ['bg-blue-50 text-blue-800', 'bg-teal-50 text-teal-800', 'bg-purple-50 text-purple-800']
  const phaseIcons = ['🔵', '🟢', '🟣']

  const logSession = async () => {
    const today = new Date().toISOString().slice(0, 10)
    const r = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, day_number: dayNumber, theme: session.theme, completed: 1, score, reflection })
    })
    const data = await r.json()
    setSessionId(data.id)
    setCompleted(true)
    setSaved(true)
    setTotalSessions(s => s + 1)
    if (refreshStats) refreshStats()
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Today's Session</h1>
      <p className="text-gray-500 text-sm mb-5">15 minutes. Every day. This is where improvement actually happens.</p>

      {/* Phase banner */}
      <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${phaseColors[phase - 1]}`}>
        <div className="text-2xl">{phaseIcons[phase - 1]}</div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-70">Phase {phase} · Day {dayNumber} of 90</div>
          <div className="font-bold text-lg">Today: {session.theme}</div>
        </div>
      </div>

      {/* Steps */}
      {session.steps.map((step, i) => (
        <StepCard key={step.id} step={step} sessionId={sessionId} index={i} />
      ))}

      {/* Log session */}
      <div className="bg-white rounded-xl border border-green-300 shadow-sm p-5 mt-4">
        <h3 className="font-semibold text-gray-800 mb-3">Complete this session</h3>
        <textarea
          rows={2}
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="One sentence: what did you notice about your communication today?"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none"
        />
        <div className="flex gap-4 items-center flex-wrap mt-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Confidence today</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setScore(n)} className={`text-xl transition-colors ${n <= score ? 'text-amber-400' : 'text-gray-200'}`}>★</button>
              ))}
            </div>
          </div>
          <button
            onClick={logSession}
            disabled={saved}
            className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 mt-4"
          >
            {saved ? '✓ Session logged!' : '✓ Complete session'}
          </button>
        </div>
        {saved && (
          <div className="mt-3 text-green-600 text-sm font-medium">
            🎉 Session {dayNumber} complete! Great work. Come back tomorrow for Day {dayNumber + 1}.
          </div>
        )}
      </div>

      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
