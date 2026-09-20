import { useState, useEffect } from 'react'

const VOCAB = [
  {w:"Medallion architecture",c:"technical",d:"Bronze→Silver→Gold data layers",eg:"Our data follows a medallion architecture — raw in Bronze, validated in Silver, business-ready in Gold."},
  {w:"Data lineage",c:"technical",d:"Tracking where data comes from and transforms",eg:"We have full data lineage in Purview — every column traces back to its source system."},
  {w:"Schema validation",c:"technical",d:"Checking data structure matches expected format",eg:"The pipeline failed because schema validation caught an unexpected column added upstream."},
  {w:"Orchestration",c:"technical",d:"Coordinating timing and sequence of jobs",eg:"ADF handles the orchestration — it triggers dbt runs after ingestion completes."},
  {w:"Data contract",c:"technical",d:"Agreement on data format, quality, and SLA",eg:"We need a formal data contract with the upstream team before building dependencies."},
  {w:"Semantic layer",c:"technical",d:"Business-friendly definitions on top of raw data",eg:"Power BI pulls from the semantic layer — analysts never touch raw tables."},
  {w:"Stakeholder alignment",c:"business",d:"Ensuring key people agree on goals",eg:"Before finalising the roadmap, I want stakeholder alignment across all four teams."},
  {w:"Risk mitigation",c:"business",d:"Actions to reduce likelihood or impact of problems",eg:"Our risk mitigation plan is a two-week buffer in the Q4 schedule."},
  {w:"Change control",c:"business",d:"Formal process for reviewing scope changes",eg:"Any addition to the data model after sign-off must go through change control."},
  {w:"Bandwidth",c:"business",d:"Capacity to take on more work",eg:"I want to check your bandwidth before adding this to your plate this sprint."},
  {w:"Visibility",c:"business",d:"Attention or awareness from leadership",eg:"Presenting at the Q3 review gives our team visibility with senior leadership."},
  {w:"Would it be helpful if",c:"influence",d:"Low-pressure way to offer a proposal",eg:"Would it be helpful if I put together a one-page proposal on the reusable pipeline framework?"},
  {w:"My recommendation is",c:"influence",d:"Owning a position with confidence",eg:"My recommendation is Option A — transaction-level grain with date partitioning."},
  {w:"I want to be transparent",c:"influence",d:"Signals honesty before difficult news",eg:"I want to be transparent about a risk that could affect our October deadline."},
  {w:"I am not here to assign blame",c:"influence",d:"Deflates politics, focuses on solutions",eg:"I am not here to assign blame — I want to understand what is blocking this and fix it."},
  {w:"What I am seeing is",c:"influence",d:"Data-backed observation opener",eg:"What I am seeing is that four teams are rebuilding the same ingestion patterns independently."},
  {w:"Touch base",c:"conversation",d:"Check in briefly with someone",eg:"Can we touch base later this week to align on the timeline?"},
  {w:"Loop in",c:"conversation",d:"Include someone in a conversation",eg:"Let me loop in Sarah — she has context on the governance side."},
  {w:"Circle back",c:"conversation",d:"Return to a topic later",eg:"That is a good question — let me circle back to you on that by end of day."},
  {w:"Take it offline",c:"conversation",d:"Continue discussion outside current meeting",eg:"Can we take it offline so we keep the group on track?"},
  {w:"Move the needle",c:"conversation",d:"Make meaningful progress",eg:"That decision will really move the needle on our Q4 delivery timeline."},
  {w:"Heads up",c:"conversation",d:"Advance warning or notice",eg:"Just wanted to give you a heads up — the governance review may take longer than expected."},
  {w:"How are you holding up",c:"cultural",d:"Checking on someone's wellbeing when busy",eg:"I know this has been a tough sprint — how are you holding up?"},
  {w:"I appreciate you",c:"cultural",d:"Expressing genuine thanks for someone's effort",eg:"I really appreciate you jumping on this so quickly — it made a big difference."},
  {w:"That is a great point",c:"cultural",d:"Acknowledging someone's contribution before responding",eg:"That is a great point — and I want to build on that with what I am seeing in the data."},
  {w:"Fair enough",c:"cultural",d:"Accepting a point or conceding gracefully",eg:"Fair enough — I can see why the timeline feels aggressive from your team's side."},
  {w:"No worries",c:"cultural",d:"Informal way to say it is fine",eg:"No worries at all — I know how busy everything gets."},
  {w:"Reach out",c:"cultural",d:"Contact someone, initiate communication",eg:"Feel free to reach out anytime if questions come up before our next sync."},
  {w:"Let me think about that",c:"cultural",d:"Buying time to consider thoughtfully",eg:"Let me think about that for a moment — I want to give you a considered answer."},
  {w:"Does that make sense",c:"cultural",d:"Checking understanding politely",eg:"Does that make sense? I want to make sure I explained it clearly."},
]

const CATS = ['all','technical','business','influence','conversation','cultural','mastered']
const CAT_LABELS = {all:'All',technical:'Technical',business:'Business',influence:'Influence',conversation:'Conversation',cultural:'American culture',mastered:'Mastered ✓'}

export default function Vocabulary() {
  const [statuses, setStatuses] = useState({})
  const [cat, setCat] = useState('all')

  useEffect(() => {
    fetch('/api/vocab').then(r => r.json()).then(rows => {
      const s = {}; rows.forEach(r => s[r.word] = r.status); setStatuses(s)
    }).catch(() => {})
  }, [])

  const cycle = async (word, category) => {
    const cur = statuses[word] || 'new'
    const next = cur === 'new' ? 'practicing' : cur === 'practicing' ? 'mastered' : 'new'
    setStatuses(s => ({ ...s, [word]: next }))
    await fetch('/api/vocab/upsert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word, status: next, category }) }).catch(() => {})
  }

  const filtered = VOCAB.filter(v => cat === 'all' ? true : cat === 'mastered' ? statuses[v.w] === 'mastered' : v.c === cat)
  const mastered = Object.values(statuses).filter(s => s === 'mastered').length

  const stColor = { new: 'text-gray-400', practicing: 'text-amber-600', mastered: 'text-green-600' }
  const stLabel = { new: 'Not started', practicing: 'Practicing', mastered: '✓ Mastered' }
  const cardBg = { new: 'bg-white', practicing: 'bg-amber-50 border-amber-200', mastered: 'bg-green-50 border-green-200' }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Vocabulary Library</h1>
      <p className="text-gray-500 text-sm mb-2">Click any word to cycle: New → Practicing → Mastered. Covers work, influence, and everyday American conversation.</p>
      <div className="text-sm text-gray-500 mb-5">{mastered} of {VOCAB.length} words mastered</div>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATS.map(c => <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${cat === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200'}`}>{CAT_LABELS[c]}</button>)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(v => {
          const st = statuses[v.w] || 'new'
          return (
            <div key={v.w} onClick={() => cycle(v.w, v.c)} className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${cardBg[st]}`}>
              <div className="font-semibold text-gray-900 text-sm">{v.w}</div>
              <div className="text-xs text-gray-500 mt-1 leading-relaxed">{v.d}</div>
              <div className="text-xs text-blue-600 mt-2 italic leading-relaxed">"{v.eg}"</div>
              <div className={`text-xs font-bold mt-2 ${stColor[st]}`}>{stLabel[st]}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
