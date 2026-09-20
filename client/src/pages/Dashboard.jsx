import { useUser } from '../context/UserContext'

const PHASE_INFO = [
  { name: 'Foundation', desc: 'Clarity & Confidence', color: 'blue', icon: '🔵' },
  { name: 'Fluency', desc: 'Proactive & Persuasive', color: 'teal', icon: '🟢' },
  { name: 'Influence', desc: 'Visible & Memorable', color: 'purple', icon: '🟣' },
]

const CHALLENGE_LABELS = {
  small_talk: '☕ Small talk',
  presenting: '🎤 Presentations',
  escalating: '⚠️ Escalation',
  pitching: '💡 Pitching ideas',
  explaining_technical: '🔄 Tech-to-business',
  cultural_differences: '🌍 Cultural comms',
  pronunciation: '🔊 Pronunciation',
  writing: '✉️ Professional writing',
  leading_meetings: '📋 Leading meetings',
  confidence: '💪 Confidence',
}

export default function Dashboard({ onNavigate }) {
  const { user, profile, stats } = useUser()
  const phase = stats?.phase || 1
  const phaseInfo = PHASE_INFO[phase - 1]
  const challenges = Array.isArray(profile?.challenges) ? profile.challenges : []
  const name = user?.name?.split(' ')[0] || 'there'

  const p1 = Math.min(100, Math.round((Math.min(stats?.total_sessions || 0, 30) / 30) * 100))
  const p2 = (stats?.total_sessions || 0) > 30 ? Math.min(100, Math.round(((Math.min(stats?.total_sessions || 0, 60) - 30) / 30) * 100)) : 0
  const p3 = (stats?.total_sessions || 0) > 60 ? Math.min(100, Math.round(((Math.min(stats?.total_sessions || 0, 90) - 60) / 30) * 100)) : 0

  return (
    <div className="p-8 max-w-4xl">
      {/* Personalised greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Good to see you, {name} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">
          {profile?.role && `${profile.role}${profile.industry ? ` · ${profile.industry}` : ''} · `}
          Day {(stats?.total_sessions || 0) + 1} of your 90-day program
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Day Streak', value: stats?.streak || 0, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Sessions Done', value: stats?.total_sessions || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Wins Logged', value: stats?.wins || 0, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Words Mastered', value: stats?.mastered_vocab || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Current phase banner */}
      <div className={`bg-${phaseInfo.color}-50 border border-${phaseInfo.color}-200 rounded-xl p-4 mb-5 flex items-center gap-3`}>
        <div className="text-2xl">{phaseInfo.icon}</div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Phase {phase} of 3</div>
          <div className="font-bold text-gray-900">{phaseInfo.name} — {phaseInfo.desc}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {phase === 1 && 'Mastering scripts, eliminating filler words, first intentional small talk'}
            {phase === 2 && 'Scripts become natural. Volunteering insights. Pitching real opportunities.'}
            {phase === 3 && 'Presenting with authority. People seek your perspective.'}
          </div>
        </div>
      </div>

      {/* Personalized focus areas */}
      {challenges.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-gray-800 mb-3">Your focus areas this program</h2>
          <div className="flex flex-wrap gap-2">
            {challenges.map((c, i) => (
              <div key={c} className={`px-3 py-1.5 rounded-full text-sm font-medium ${i === 0 ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                {i === 0 && '⭐ '}{CHALLENGE_LABELS[c] || c.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">All scripts, coaching, and vocabulary are personalised around these challenges.</p>
        </div>
      )}

      {/* Goal */}
      {profile?.goal_90_days && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-gray-800 mb-2">Your 90-day goal</h2>
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg text-sm leading-relaxed text-gray-800 italic">
            "{profile.goal_90_days}"
          </div>
        </div>
      )}

      {/* Progress bars */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4">90-day progress</h2>
        {[
          { label: 'Phase 1 — Foundation (Days 1–30)', pct: p1, color: 'bg-blue-500' },
          { label: 'Phase 2 — Fluency (Days 31–60)', pct: p2, color: 'bg-teal-500' },
          { label: 'Phase 3 — Influence (Days 61–90)', pct: p3, color: 'bg-purple-500' },
        ].map(p => (
          <div key={p.label} className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1 font-medium"><span>{p.label}</span><span>{p.pct}%</span></div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${p.color} rounded-full transition-all duration-500`} style={{ width: `${p.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Start practicing now</h2>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => onNavigate('today')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">⚡ Today's Session</button>
          <button onClick={() => onNavigate('coach')} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">🤖 AI Coach</button>
          <button onClick={() => onNavigate('pronunciation')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">🔊 Pronunciation</button>
          <button onClick={() => onNavigate('journal')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">📓 Log a win</button>
        </div>
      </div>
    </div>
  )
}
