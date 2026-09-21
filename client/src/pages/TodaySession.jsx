import { useState, useEffect, useRef } from 'react'
import { useUser } from '../context/UserContext'

const SESSIONS = [
  {
    day: 1, theme: "Know your voice",
    steps: [
      {
        id: 'warmup', meta: "Step 1 · 3 min", title: "Voice warm-up", mins: "Before any recording",
        content: `<div class="space-y-3 text-sm text-gray-700 leading-relaxed">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
            <strong class="text-blue-700 block mb-1">4-breath reset</strong>
            In for 4 counts. Hold 2. Out for 6. Repeat 4 times. Feel your shoulders drop.
          </div>
          <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
            <strong class="text-blue-700 block mb-1">Articulation — say 3 times slowly</strong>
            "Azure Data Factory pipeline delivers validated data to the Gold layer every night at 2 AM."
          </div>
          <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
            <strong class="text-blue-700 block mb-1">Downward inflection — say 5 times</strong>
            "The pipeline is ready for validation." — voice DOWN on "validation." Not up. Down.
          </div>
          <div class="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-xs mt-2">
            💡 Your voice is a muscle. Warm it up before any high-stakes speaking.
          </div>
        </div>`,
        hasRec: false
      },
      {
        id: 'status', meta: "Step 2 · 5 min", title: "Read & record — Status update", mins: "Record on phone · Listen back",
        script: `Good morning, everyone. I want to give a quick update on the Data and Analytics program for this week.\n\nWHAT WE COMPLETED:\nWe completed the ingestion pipeline for the Sales Intelligence dataset in Azure Data Factory. The pipeline now pulls from Dynamics 365 and lands data in the Bronze layer. This unblocks the Power BI team.\n\nWHAT WE ARE FOCUSED ON:\nThe team is working on the Bronze-to-Silver transformation in dbt. Target is Silver layer sign-off by Thursday.\n\nONE RISK I WANT TO FLAG:\nWe have a dependency on Data Governance for the encryption policy approval. Submitted nine days ago — SLA is five business days. Following up with Sarah today.\n\nThat is my update. Happy to go deeper on anything.`,
        tip: "Read at 70% of your natural speed. Pause 1 full second after every period. Listen back immediately.",
        hasRec: true, recType: "status-update"
      },
      {
        id: 'smalltalk', meta: "Step 3 · 3 min", title: "Small talk rehearsal", mins: "Say each opener 5 times",
        content: `<div class="space-y-3 text-sm text-gray-700">
          <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded-r"><strong class="text-green-700 block mb-1">Option A</strong>"Hey — before we start, the new Fabric workspace you set up made our onboarding so much smoother. Have you done many Fabric migrations?"</div>
          <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded-r"><strong class="text-green-700 block mb-1">Option B</strong>"Hey, how is your week going? I am still adjusting to Texas summers — 105 degrees when I landed! Does it ever feel normal?"</div>
          <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded-r"><strong class="text-green-700 block mb-1">Option C</strong>"Before we jump in — how long have you been on the Data Platform side? I am still learning how all the teams connect."</div>
          <div class="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-xs mt-2">💡 Goal: use ONE of these before a real meeting today.</div>
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
        content: `<div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r text-sm text-gray-700">
          <strong class="text-blue-700 block mb-2">Say each 5 times with a complete sentence</strong>
          "My recommendation is Option A."<br/>"My recommendation is that we escalate this today."<br/>"My recommendation is a 30-minute sync this week."<br/><br/>After each sentence — pause 1 full second. The pause IS the confidence.
        </div>`,
        hasRec: false
      },
      {
        id: 'escalation', meta: "Step 2 · 5 min", title: "Read & record — Escalation script", mins: "Does it sound like ownership?",
        script: `I want to flag a risk that needs this group's attention — and I want to be transparent about it early so we can act before it affects delivery.\n\nWe have a dependency on the Data Governance team to approve the PII encryption policy for the Customer 360 dataset. I submitted the request on September 18th — that is eleven business days ago. Our agreed SLA is five business days.\n\nThe impact is specific: without this approval, we cannot promote Customer data from Silver to Gold. This delays the Customer Analytics dashboard, committed to business stakeholders for October 1st.\n\nI have already followed up twice. I am not here to assign blame. I need escalation support.\n\nMy ask: can someone connect me with the Data Governance lead this week? I am confident this resolves quickly once we have the right people in the room.`,
        tip: "Listen for: does it sound like you own the problem? 'I need escalation support' vs 'nobody is helping me' — the difference is everything.",
        hasRec: true, recType: "escalation"
      },
      {
        id: 'pitch', meta: "Step 3 · 3 min", title: "Opportunity pitch practice", mins: "Read once — then from memory",
        content: `<div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r text-sm text-gray-700 leading-relaxed">
          I noticed something while working on the architecture last week — I think it has a real business case.<br/><br/>
          Right now, four teams are each building separate ingestion pipelines in Azure Data Factory. Each one is custom-built, independently maintained. We are solving the same problem four times.<br/><br/>
          I believe there is an opportunity to build a single reusable ingestion framework. Any new data source onboarded in two days instead of two weeks.<br/><br/>
          A four-week investment saves approximately thirty percent of engineering time on every future pipeline.<br/><br/>
          Would it be valuable to give me fifteen minutes in our next one-to-one to walk through a one-pager?
        </div>
        <div class="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-xs mt-3">💡 "Would it be valuable" positions you as offering value, not asking for attention.</div>`,
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
          Say each sentence then count silently to 2 before the next.<br/><br/>
          "The pipeline is ready." [2 seconds]<br/>
          "The data model is approved." [2 seconds]<br/>
          "We will go live on October 15th." [2 seconds]<br/><br/>
          Do this 5 times. This pace sounds confident and in control to American audiences.
        </div>`,
        hasRec: false
      },
      {
        id: 'presentation', meta: "Step 2 · 5 min", title: "Read & record — Presentation opening", mins: "Video record if possible",
        script: `Good morning, everyone. Thank you for joining the Q3 Data and Analytics Program Review. I know everyone is busy — I want to make sure these forty minutes are worth your time.\n\nMy name is [your name]. I am the Project Manager leading the Data and Analytics delivery workstream. I work across Azure Data Platform, Microsoft Fabric, and Power BI.\n\nToday I will cover three areas.\n\nFirst — where we are against the Q3 roadmap. What we committed to, what we delivered, and what shifted — and why.\n\nSecond — the two biggest technical decisions we made this quarter and the business outcomes they are driving.\n\nThird — what I need from this group to hit our Q4 targets.\n\nQuestions are welcome throughout. Let me start with the roadmap.`,
        tip: "Most important moment: pause after 'three areas.' Count one full second silently. That pause signals control to every person in the room.",
        hasRec: true, recType: "presentation"
      },
      {
        id: 'analogies', meta: "Step 3 · 3 min", title: "Analogy practice", mins: "Say each — then without reading",
        content: `<div class="space-y-3 text-sm text-gray-700">
          <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r"><strong class="text-purple-700 block mb-1">Medallion architecture</strong>"Think of our data like gold ore — raw when it comes in, refined through Bronze, Silver, and Gold layers, minted into business-ready reports at the end."</div>
          <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r"><strong class="text-purple-700 block mb-1">Pipeline failure</strong>"When the pipeline breaks, think of it like a delivery truck not arriving — the store shelves are empty but the warehouse is completely fine. No data was lost."</div>
          <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r"><strong class="text-purple-700 block mb-1">Foundation work</strong>"Right now we are at the plumbing stage — the pipes have to be in the walls before you can turn on the tap."</div>
        </div>`,
        hasRec: false
      }
    ]
  },
  {
    day: 4, theme: "Personal confidence & introduction",
    steps: [
      {
        id: 'intro_warmup', meta: "Step 1 · 3 min", title: "Introduction warm-up", mins: "Until it flows without thinking",
        content: `<div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r text-sm text-gray-700 leading-relaxed">
          I am doing really well, thank you. I have been in the US for about a year now, based in the Dallas area. Still getting used to the summers — 105 degrees was quite a shock coming from India!<br/><br/>
          I am a Data and Analytics Project Manager. Sixteen years in IT — started as a developer in 2009, moved through architecture, and for the last several years I have been leading end-to-end analytics programs.<br/><br/>
          What about you — how long have you been on this team?
        </div>
        <div class="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-xs mt-3">💡 The last question ends your answer gracefully and shows genuine interest.</div>`,
        hasRec: false
      },
      {
        id: 'intro_record', meta: "Step 2 · 5 min", title: "Record — Full introduction", mins: "How confident do you sound?",
        script: `I am doing really well, thank you for asking. I have been in the US for about a year now — based in the Dallas area. Still adjusting to the Texas summers, but genuinely enjoying the experience here.\n\nOn the work side, I am a Data and Analytics Project Manager. I have been in IT for sixteen years — started in 2009, worked across the full data stack from ETL development all the way through to leading end-to-end analytics programs at scale.\n\nMy real interest is the intersection of data engineering and business value — making sure the pipelines and models we build drive actual decisions, not just fill dashboards that nobody looks at.\n\nI have been with the Microsoft program for about six months now and I genuinely enjoy the complexity here. Every week I find something that impresses me.\n\nWhat about you — how long have you been on this side of the work?`,
        tip: "Record this and ask: do I sound like someone who believes what they are saying? That is the test.",
        hasRec: true, recType: "introduction"
      },
      {
        id: 'continuers', meta: "Step 3 · 3 min", title: "Conversation continuers", mins: "Say each naturally",
        content: `<div class="space-y-2 text-sm text-gray-700">
          <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded-r"><strong class="text-green-700 block mb-1">When they say something interesting</strong>"That is really interesting — tell me more about how that worked."</div>
          <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded-r"><strong class="text-green-700 block mb-1">Moving small talk to work</strong>"That is great to hear! Alright, shall we get started? I know everyone's time is valuable."</div>
          <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded-r"><strong class="text-green-700 block mb-1">When you did not hear clearly</strong>"I am sorry — could you say that again? I want to make sure I caught it correctly."</div>
        </div>`,
        hasRec: false
      }
    ]
  },
  {
    day: 5, theme: "Influence & weekly reflection",
    steps: [
      {
        id: 'influence_warmup', meta: "Step 1 · 3 min", title: "Influence language warm-up", mins: "Full confidence — no hesitation",
        content: `<div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r text-sm text-gray-700 leading-relaxed">
          <strong class="text-blue-700 block mb-2">Say each phrase 3 times — add a real sentence from your work</strong>
          "My recommendation is..." (what do you actually recommend this week?)<br/>
          "What I am seeing is..." (what did you actually observe?)<br/>
          "Would it be valuable if..." (what could you offer?)<br/>
          "I want to be transparent about..." (what is a real risk you are tracking?)<br/><br/>
          After each — pause. That pause is the confidence signal.
        </div>`,
        hasRec: false
      },
      {
        id: 'pitch_record', meta: "Step 2 · 5 min", title: "Record — Opportunity pitch", mins: "Do you sound like you believe it?",
        script: `I want to share something I noticed while working on the architecture last week. I think it has a real business case and I would like your input.\n\nRight now, four of our engineering teams — Sales, Finance, Operations, and HR — are each building separate ingestion pipelines in Azure Data Factory. Each one is custom-built, independently maintained, and uses different naming conventions and error-handling patterns.\n\nWhat I am seeing is that we are solving the same problem four times and creating four maintenance headaches instead of one.\n\nI believe there is an opportunity to build a single reusable ingestion framework — parameterized ADF templates with standardised logging, alerting, and schema validation built in. Any new data source could be onboarded in two days instead of two weeks.\n\nA rough estimate: a four-week investment to build the framework could save approximately thirty percent of engineering time on every future pipeline. With eight more data domains coming in Q1, the math works strongly in our favour.\n\nI am not asking for a decision today. Would it be valuable to give me fifteen minutes in our next one-to-one to walk through a one-page proposal?`,
        tip: "Record this and ask: do I sound like I believe the business case? If your voice goes up at the end of statements — do another take.",
        hasRec: true, recType: "pitch"
      },
      {
        id: 'reflection', meta: "Step 3 · 3 min", title: "Weekly reflection — say aloud", mins: "Speak your answers, do not write",
        content: `<div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r text-sm text-gray-700 leading-relaxed">
          <strong class="text-blue-700 block mb-2">Answer these out loud — one sentence each</strong>
          1. What was my best communication moment this week?<br/>
          2. What filler word did I use most — what will I replace it with next week?<br/>
          3. Did I start one non-work conversation this week? If not — what held me back?<br/>
          4. What is my one communication intention for next week?<br/><br/>
          Speaking these answers aloud is itself communication practice.
        </div>`,
        hasRec: false
      }
    ]
  }
]

function Recorder({ recType, sessionId, userId, onSaved }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const mrRef = useRef(null)
  const srRef = useRef(null)
  const timerRef = useRef(null)
  const chunksRef = useRef([])

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []; setTranscript(''); setFeedback(''); setSaved(false); setSeconds(0)
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
      mr.start(); setRecording(true)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch (e) { alert('Microphone access needed. Please allow it in your browser.') }
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
    a.download = `speakup-${recType}-${new Date().toISOString().slice(0, 10)}.webm`
    a.click()
  }

  const analyse = async () => {
    setLoading(true)
    const fd = new FormData()
    fd.append('audio', blob, `${Date.now()}.webm`)
    fd.append('type', recType)
    fd.append('transcript', transcript)
    fd.append('duration_seconds', seconds)
    fd.append('wpm', seconds > 0 && transcript ? Math.round(transcript.split(' ').length / (seconds / 60)) : 0)
    if (sessionId) fd.append('session_id', sessionId)
    if (userId) fd.append('user_id', userId)
    const uploadRes = await fetch('/api/recordings/upload', { method: 'POST', body: fd })
    const uploadData = await uploadRes.json()
    const recId = uploadData.id
    setSaved(true)

    const fbRes = await fetch('/api/ai/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script_type: recType, transcript, duration_seconds: seconds, confidence_score: 3 })
    })
    const fbData = await fbRes.json()
    setFeedback(fbData.feedback || fbData.error || 'Could not get feedback.')

    if (recId && fbData.feedback) {
      await fetch(`/api/recordings/${recId}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_feedback: fbData.feedback })
      })
    }
    setLoading(false)
    if (onSaved) onSaved()
  }

  return (
    <div className={`mt-4 border-2 rounded-xl p-4 transition-all ${recording ? 'border-red-400 bg-red-50' : 'border-dashed border-gray-300 bg-gray-50'}`}>
      <div className="flex items-center justify-center gap-1 h-10 mb-2">
        {[6,14,8,22,10,6,18,12,8,20,10,6,16].map((h,i) => (
          <div key={i} className={`w-1 rounded-full ${recording ? 'bg-red-400' : 'bg-gray-300'}`}
            style={{ height: recording ? `${h}px` : '4px', animation: recording ? `wave ${0.6+i*0.05}s ease-in-out infinite alternate` : 'none' }} />
        ))}
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 tabular-nums">{fmt(seconds)}</div>
        <div className="text-xs text-gray-500 mt-1">{recording ? '🔴 Recording — speak clearly' : blob ? `✓ ${fmt(seconds)} recorded` : 'Press Record to start'}</div>
      </div>
      {transcript && <div className="mt-2 text-xs text-gray-500 bg-white border border-gray-200 rounded p-2 max-h-12 overflow-y-auto">Heard: {transcript}</div>}
      <div className="flex gap-2 mt-3 flex-wrap justify-center">
        {!recording && !blob && <button onClick={start} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">⏺ Record</button>}
        {recording && <button onClick={stop} className="px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium">⏹ Stop</button>}
        {blob && !recording && <>
          <button onClick={start} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">⏺ Again</button>
          <button onClick={download} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">⬇ Save</button>
          <button onClick={analyse} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? '⏳ Analysing...' : '🧠 Analyse & save'}
          </button>
        </>}
      </div>
      {feedback && (
        <div className="mt-4 bg-white border border-blue-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed">
          <div className="font-semibold text-blue-700 mb-2">🧠 AI Coaching Feedback</div>
          <div className="whitespace-pre-wrap">{feedback}</div>
        </div>
      )}
      <style>{`@keyframes wave{from{transform:scaleY(0.3)}to{transform:scaleY(1)}}`}</style>
    </div>
  )
}

function StepCard({ step, sessionId, userId, index }) {
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
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 text-sm text-gray-800 leading-8 whitespace-pre-wrap">{step.script}</div>
              {step.tip && <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">{step.tip}</div>}
            </div>
          )}
          {step.hasRec && <Recorder recType={step.recType} sessionId={sessionId} userId={userId} />}
        </div>
      )}
    </div>
  )
}

export default function TodaySession({ refreshStats }) {
  const { user, profile, stats, refreshStats: ctxRefresh } = useUser()
  const [sessionId, setSessionId] = useState(null)
  const [reflection, setReflection] = useState('')
  const [score, setScore] = useState(0)
  const [saved, setSaved] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  // Use total_sessions from context stats — this is the key fix
  const totalSessions = stats?.total_sessions || 0
  const dayIdx = totalSessions % SESSIONS.length
  const session = SESSIONS[dayIdx]
  const dayNumber = totalSessions + 1
  const phase = totalSessions > 60 ? 3 : totalSessions > 30 ? 2 : 1

  // Check if already done today
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const lastDate = stats?.last_session_date
    if (lastDate === today) setAlreadyDone(true)
    else setAlreadyDone(false)
  }, [stats])

  const phaseColors = ['bg-blue-50 text-blue-800', 'bg-teal-50 text-teal-800', 'bg-purple-50 text-purple-800']
  const phaseIcons = ['🔵', '🟢', '🟣']

  const logSession = async () => {
    const today = new Date().toISOString().slice(0, 10)
    const r = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user?.id || 1,
        date: today,
        day_number: dayNumber,
        theme: session.theme,
        completed: 1,
        score,
        reflection
      })
    })
    const data = await r.json()
    setSessionId(data.id)
    setSaved(true)
    // Refresh stats so next visit shows next day
    if (ctxRefresh) await ctxRefresh(user?.id)
    if (refreshStats) refreshStats()
  }

  if (alreadyDone) {
    return (
      <div className="p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Today's Session</h1>
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center mt-6">
          <div className="text-5xl mb-4">✅</div>
          <div className="text-xl font-bold text-green-800 mb-2">Session complete for today!</div>
          <div className="text-gray-600 text-sm mb-4">You have already completed Day {totalSessions}'s session. Come back tomorrow for Day {totalSessions + 1}.</div>
          <div className="text-green-700 font-semibold">🔥 Streak: {stats?.streak || 0} days</div>
          <div className="mt-4 text-sm text-gray-500">Tomorrow's theme: <strong>{SESSIONS[totalSessions % SESSIONS.length]?.theme}</strong></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Today's Session</h1>
      <p className="text-gray-500 text-sm mb-5">15 minutes. Every day. This is where improvement actually happens.</p>

      <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${phaseColors[phase-1]}`}>
        <div className="text-2xl">{phaseIcons[phase-1]}</div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-70">Phase {phase} · Day {dayNumber} of 90</div>
          <div className="font-bold text-lg">Today: {session.theme}</div>
        </div>
      </div>

      {session.steps.map((step, i) => (
        <StepCard key={step.id} step={step} sessionId={sessionId} userId={user?.id} index={i} />
      ))}

      {!saved ? (
        <div className="bg-white rounded-xl border border-green-300 shadow-sm p-5 mt-4">
          <h3 className="font-semibold text-gray-800 mb-3">Complete this session</h3>
          <textarea rows={2} value={reflection} onChange={e => setReflection(e.target.value)}
            placeholder="One sentence: what did you notice about your communication today?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none" />
          <div className="flex gap-4 items-center flex-wrap mt-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Confidence today</div>
              <div className="flex gap-1">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setScore(n)} className={`text-xl ${n <= score ? 'text-amber-400' : 'text-gray-200'}`}>★</button>)}</div>
            </div>
            <button onClick={logSession} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 mt-4">
              ✓ Complete session
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mt-4">
          <div className="text-3xl mb-2">🎉</div>
          <div className="font-bold text-green-800">Day {dayNumber} complete!</div>
          <div className="text-sm text-green-600 mt-1">Come back tomorrow for Day {dayNumber + 1}: <strong>{SESSIONS[(dayIdx + 1) % SESSIONS.length]?.theme}</strong></div>
        </div>
      )}
    </div>
  )
}
