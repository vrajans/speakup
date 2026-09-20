const SENTENCES = [
  {c:"work",t:"My recommendation is Option A — transaction-level grain with date partitioning by region.",w:"'My recommendation is' is the most important phrase a PM can own. Use it every single day."},
  {c:"work",t:"I want to flag a risk early so we can act before it affects our delivery timeline.",w:"Flagging early is what separates reactive PMs from trusted ones. This phrase signals ownership."},
  {c:"work",t:"The impact is specific — without this decision by Thursday, the October 15th milestone shifts by two weeks.",w:"Specific impact with specific dates gets attention immediately. Vague impact gets ignored."},
  {c:"work",t:"I have already followed up twice — once by email on the 22nd, and once by Teams on the 25th.",w:"Document your effort before escalating. Nobody can say you did not try. This keeps you credible."},
  {c:"work",t:"Before I answer, let me make sure I understand your question — are you asking about the timeline or the approach?",w:"Buys thinking time and signals precision. Very powerful in high-stakes conversations."},
  {c:"work",t:"That is slightly outside today's scope, but worth a deeper conversation — can we take it offline so we keep the group on track?",w:"Manages meeting scope without shutting anyone down. Senior leaders appreciate this."},
  {c:"influence",t:"Would it be valuable if I put together a one-page proposal on this for our next sync?",w:"'Would it be valuable' positions your work as serving them. Not asking permission — offering value."},
  {c:"influence",t:"I noticed a pattern across four teams that I think represents a real opportunity — do you have five minutes?",w:"'I noticed a pattern' signals analytical thinking. This is how influential PMs open conversations."},
  {c:"influence",t:"The one thing I want everyone to leave this meeting knowing is that the foundation we built in Q3 makes Q4 delivery significantly faster.",w:"Use this to close any presentation. It signals confidence and strategic clarity."},
  {c:"influence",t:"I am not here to assign blame — I want to understand what is blocking governance and how we fix it together.",w:"Deflates political tension immediately. Keeps the room focused on solutions."},
  {c:"smalltalk",t:"Hey — before we start, how has your week been going? Anything interesting happening on your end?",w:"Simple, warm, open-ended. Works in every professional context. The question at the end is not optional."},
  {c:"smalltalk",t:"I am still getting used to Texas summers — it was 105 degrees when I landed from India last year! Does it ever feel normal?",w:"Sharing a light personal story builds connection fast. Humor about your own experience is always safe."},
  {c:"smalltalk",t:"I saw that you were traveling last week — was it work or were you able to enjoy it a little?",w:"Referencing something they shared shows you pay attention. This is the highest form of small talk."},
  {c:"smalltalk",t:"I am still learning how all the teams connect at Microsoft — the org structure here is genuinely fascinating. How long have you been on this team?",w:"Admitting you are learning and expressing curiosity disarms any awkwardness."},
  {c:"questions",t:"Help me understand your concern — are you saying the timeline is the issue, or the approach itself?",w:"Clarifies before responding. Shows you listen carefully, not just react."},
  {c:"questions",t:"What would success look like for you on this — what does the business outcome need to be?",w:"Shifts conversation from features to outcomes. Shows business maturity that senior leaders notice."},
  {c:"questions",t:"Is there a constraint I am not aware of that is driving this requirement?",w:"Gentle, non-confrontational way to push back on an unclear or unrealistic ask."},
  {c:"questions",t:"Can I confirm you are the decision-maker on this, or is there someone else we should bring into the conversation?",w:"Critical PM skill. Ask this early — saves weeks of getting the wrong person to approve things."},
  {c:"bridge",t:"Think of our data architecture like a water treatment plant — raw water comes in, gets filtered and cleaned in stages, and comes out safe to use.",w:"An analogy any CFO or VP can understand immediately. Explains medallion architecture in 20 seconds."},
  {c:"bridge",t:"Right now we are at the plumbing stage — the pipes have to be in the walls before you can turn on the tap.",w:"Perfect for explaining foundation work to stakeholders who want dashboards immediately."},
  {c:"bridge",t:"When the pipeline breaks, think of it like a delivery truck not arriving — the store shelves are empty but the warehouse is completely fine. No data was lost.",w:"Explains a data incident without any technical jargon. Immediate business understanding, no panic."},
  {c:"personal",t:"I am doing really well, thank you — it has been a busy week but I am making good progress. How about you?",w:"Always turn 'how are you' back to them. The question at the end is the entire skill of small talk."},
  {c:"personal",t:"I have been in IT for sixteen years — started as a developer in 2009, moved through architecture and program management. Data and AI is where I want to build my next chapter.",w:"Professional self-introduction that shows depth and direction. Practice until it flows."},
  {c:"personal",t:"I really appreciate you taking the time to explain that — it gave me a perspective I did not have before.",w:"Genuine, specific appreciation builds relationships. Say it specifically, not generically."},
  {c:"personal",t:"No worries at all — I know how busy everything gets. Whenever you have a moment works perfectly for me.",w:"This is the American professional way to say it is fine. The casual tone matters — practice it."},
]

const CATS = {all:'All',work:'Work',influence:'Influence',smalltalk:'Small talk',questions:'Questions',bridge:'Tech → Business',personal:'Personal'}
const CHIP = {work:'bg-blue-100 text-blue-700',influence:'bg-purple-100 text-purple-700',smalltalk:'bg-green-100 text-green-700',questions:'bg-amber-100 text-amber-700',bridge:'bg-teal-100 text-teal-700',personal:'bg-red-100 text-red-700'}

import { useState } from 'react'
export default function PowerSentences({ onNavigate }) {
  const [cat, setCat] = useState('all')
  const filtered = SENTENCES.filter(s => cat === 'all' || s.c === cat)
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Power Sentences</h1>
      <p className="text-gray-500 text-sm mb-5">Read each sentence aloud 3 times until it feels natural. Click 🔊 to load into Pronunciation Studio.</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(CATS).map(([k,v]) => <button key={k} onClick={() => setCat(k)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${cat === k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200'}`}>{v}</button>)}
      </div>
      <div className="space-y-4">
        {filtered.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CHIP[s.c]}`}>{s.c}</span>
            <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 text-sm text-gray-800 leading-8 italic">"{s.t}"</div>
            <div className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2"><strong>Why this works:</strong> {s.w}</div>
            <button onClick={() => { if (onNavigate) { localStorage.setItem('pron-load', s.t); onNavigate('pronunciation') } }} className="mt-3 text-xs text-blue-600 hover:text-blue-800">🔊 Hear this in Pronunciation Studio →</button>
          </div>
        ))}
      </div>
    </div>
  )
}
