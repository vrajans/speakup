import { useUser } from '../context/UserContext'

const NAV = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard', section: 'Overview' },
  { id: 'today', icon: '⚡', label: "Today's Session", badge: 'DO', section: null },
  { id: 'habits', icon: '🔥', label: 'Habit Tracker', section: null },
  { id: 'coach', icon: '🤖', label: 'AI Coach', badge: 'LIVE', section: 'Interactive' },
  { id: 'pronunciation', icon: '🔊', label: 'Pronunciation Studio', section: null },
  { id: 'recordings', icon: '🎙️', label: 'Recording Library', section: null },
  { id: 'vocabulary', icon: '📖', label: 'Vocabulary', section: 'Library' },
  { id: 'sentences', icon: '💬', label: 'Power Sentences', section: null },
  { id: 'journal', icon: '📓', label: 'Wins Journal', section: null },
  { id: 'settings', icon: '⚙️', label: 'Settings', section: 'Account' },
]

export default function Sidebar({ current, onNavigate }) {
  const { user, profile, stats, logout } = useUser()
  let lastSection = null

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="text-sm font-bold text-blue-600 tracking-wide">SPEAKUP</div>
        <div className="text-xs text-gray-400 mt-0.5">90-Day Communication Growth</div>
      </div>

      {/* User card */}
      {user && (
        <div className="px-3 py-3 border-b border-gray-100 bg-blue-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">{user.name}</div>
              <div className="text-xs text-gray-500 truncate">{profile?.role || 'Getting started'}</div>
            </div>
          </div>
          {profile?.challenges && (
            <div className="mt-2 flex flex-wrap gap-1">
              {(Array.isArray(profile.challenges) ? profile.challenges : JSON.parse(profile.challenges || '[]')).slice(0, 2).map(c => (
                <span key={c} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{c.replace(/_/g, ' ')}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2">
        {NAV.map(item => {
          const showSection = item.section && item.section !== lastSection
          if (item.section) lastSection = item.section
          return (
            <div key={item.id}>
              {showSection && (
                <div className="text-xs font-semibold text-gray-400 px-4 pt-4 pb-1 uppercase tracking-wider">{item.section}</div>
              )}
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-all border-l-2 text-left
                  ${current === item.id ? 'bg-blue-50 text-blue-600 border-blue-600 font-semibold' : 'text-gray-600 border-transparent hover:bg-gray-50'}`}
              >
                <span className="text-base w-4 text-center">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-xs bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>
                )}
              </button>
            </div>
          )
        })}
      </nav>

      {/* Streak + progress */}
      <div className="p-3 border-t border-gray-200">
        <div className="bg-amber-50 rounded-lg p-3 text-center mb-2">
          <div className="text-2xl font-bold text-amber-600">{stats?.streak || 0}</div>
          <div className="text-xs text-amber-600 font-semibold">🔥 Day Streak</div>
          <div className="text-xs text-gray-400 mt-1">
            {stats?.streak === 0 ? 'Start today' : stats?.streak < 7 ? 'Keep going!' : 'Amazing!'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">Phase {stats?.phase || 1} · {stats?.total_sessions || 0}/90 sessions</div>
          <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((stats?.total_sessions || 0) / 90) * 100)}%` }} />
          </div>
        </div>
        <button onClick={logout} className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 py-1">Sign out</button>
      </div>
    </div>
  )
}
