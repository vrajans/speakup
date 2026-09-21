import { useState, useEffect } from 'react'

const ADMIN_KEY = 'speakup-admin-2024'

const CHALLENGE_LABELS = {
  small_talk: 'Small talk', presenting: 'Presentations', escalating: 'Escalation',
  pitching: 'Pitching ideas', explaining_technical: 'Tech-to-business',
  cultural_differences: 'Cultural comms', pronunciation: 'Pronunciation',
  writing: 'Professional writing', leading_meetings: 'Leading meetings', confidence: 'Confidence'
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [overview, setOverview] = useState(null)
  const [users, setUsers] = useState([])
  const [activity, setActivity] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const login = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/overview`, {
        headers: { 'x-admin-key': password }
      })
      if (!r.ok) { setError('Wrong password'); setLoading(false); return }
      const data = await r.json()
      setOverview(data)
      setAuthed(true)
      loadAll(password)
    } catch (e) { setError('Connection error') }
    setLoading(false)
  }

  const loadAll = async (key) => {
    const k = key || password
    const [u, a] = await Promise.all([
      fetch('/api/admin/users', { headers: { 'x-admin-key': k } }).then(r => r.json()),
      fetch('/api/admin/activity', { headers: { 'x-admin-key': k } }).then(r => r.json()),
    ])
    setUsers(Array.isArray(u) ? u : [])
    setActivity(Array.isArray(a) ? a : [])
  }

  const maxActivity = Math.max(...activity.map(a => a.sessions), 1)

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🔐</div>
            <h1 className="text-xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-gray-500 text-sm mt-1">SpeakUp admin dashboard</p>
          </div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Admin password"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 mb-3" />
          {error && <div className="text-red-600 text-xs mb-3">{error}</div>}
          <button onClick={login} disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Checking...' : 'Enter →'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white px-8 py-4 flex items-center justify-between">
        <div>
          <div className="font-bold text-lg">SpeakUp Admin</div>
          <div className="text-gray-400 text-xs">Usage dashboard · Confidential</div>
        </div>
        <button onClick={() => loadAll()} className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600">↻ Refresh</button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="flex gap-6">
          {['overview', 'users', 'activity'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 text-sm font-medium border-b-2 transition-all capitalize
                ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto">

        {/* OVERVIEW TAB */}
        {tab === 'overview' && overview && (
          <div>
            {/* Key metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total users', value: overview.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Completed onboarding', value: overview.completedOnboarding, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Total sessions', value: overview.totalSessions, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Active this week', value: overview.activeWeek, color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map(m => (
                <div key={m.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-5 mb-5">
              {/* More stats */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Activity</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Active today', value: overview.activeToday },
                    { label: 'Total recordings', value: overview.totalRecordings },
                    { label: 'Journal entries', value: overview.totalJournal },
                    { label: 'Conversion (signup → onboarding)', value: `${overview.totalUsers > 0 ? Math.round((overview.completedOnboarding / overview.totalUsers) * 100) : 0}%` },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{s.label}</span>
                      <span className="font-semibold text-gray-900">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top challenges */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Top challenges users selected</h3>
                {overview.topChallenges?.length === 0 && <p className="text-gray-400 text-sm">No data yet</p>}
                {overview.topChallenges?.map(([challenge, count]) => (
                  <div key={challenge} className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{CHALLENGE_LABELS[challenge] || challenge}</span>
                      <span>{count} users</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(count / (overview.topChallenges[0]?.[1] || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Countries */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Users by country</h3>
                {overview.topCountries?.length === 0 && <p className="text-gray-400 text-sm">No data yet</p>}
                {overview.topCountries?.map(c => (
                  <div key={c.work_country} className="flex justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-600">{c.work_country}</span>
                    <span className="font-semibold">{c.count}</span>
                  </div>
                ))}
              </div>

              {/* Recent signups */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Recent signups</h3>
                {overview.recentSignups?.length === 0 && <p className="text-gray-400 text-sm">No signups yet</p>}
                {overview.recentSignups?.map((u, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.created_at?.slice(0, 10)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">{users.length} users total</h2>
            </div>
            <div className="space-y-3">
              {users.filter(u => u.email !== 'guest@speakup.local').map(u => (
                <div key={u.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}>
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.email} · Joined {u.created_at?.slice(0, 10)}</div>
                    </div>
                    <div className="flex gap-4 text-center">
                      <div><div className="font-bold text-blue-600">{u.total_sessions || 0}</div><div className="text-xs text-gray-400">sessions</div></div>
                      <div><div className="font-bold text-amber-600">{u.streak || 0}</div><div className="text-xs text-gray-400">streak</div></div>
                      <div>
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${u.onboarding_complete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.onboarding_complete ? '✓ Onboarded' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedUser?.id === u.id && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs font-semibold uppercase mb-2">Profile</div>
                        <div className="space-y-1">
                          <div><span className="text-gray-400">Role:</span> <span className="font-medium">{u.role || '—'}</span></div>
                          <div><span className="text-gray-400">Industry:</span> <span className="font-medium">{u.industry || '—'}</span></div>
                          <div><span className="text-gray-400">Country:</span> <span className="font-medium">{u.work_country || '—'}</span></div>
                          <div><span className="text-gray-400">English level:</span> <span className="font-medium capitalize">{u.english_level || '—'}</span></div>
                          {u.native_language && <div><span className="text-gray-400">Native language:</span> <span className="font-medium">{u.native_language}</span></div>}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs font-semibold uppercase mb-2">Program</div>
                        <div className="space-y-1">
                          <div><span className="text-gray-400">Sessions:</span> <span className="font-medium">{u.total_sessions || 0}</span></div>
                          <div><span className="text-gray-400">Streak:</span> <span className="font-medium">{u.streak || 0} days</span></div>
                          <div><span className="text-gray-400">Best streak:</span> <span className="font-medium">{u.longest_streak || 0} days</span></div>
                          <div><span className="text-gray-400">Last active:</span> <span className="font-medium">{u.last_session_date || 'Never'}</span></div>
                        </div>
                        {u.challenges?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {u.challenges.map(c => <span key={c} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{CHALLENGE_LABELS[c] || c}</span>)}
                          </div>
                        )}
                      </div>
                      {u.goal_90_days && (
                        <div className="col-span-2">
                          <div className="text-gray-500 text-xs font-semibold uppercase mb-1">90-day goal</div>
                          <div className="text-gray-700 italic text-sm bg-blue-50 p-2 rounded">"{u.goal_90_days}"</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {users.filter(u => u.email !== 'guest@speakup.local').length === 0 && (
                <div className="text-center py-12 text-gray-400">No users yet. Share the link to start getting signups.</div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {tab === 'activity' && (
          <div>
            <h2 className="font-semibold text-gray-800 mb-4">Session activity — last 14 days</h2>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              {activity.length === 0 && <div className="text-center py-8 text-gray-400">No activity data yet</div>}
              <div className="flex items-end gap-2 h-40">
                {activity.map(a => (
                  <div key={a.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-500 font-medium">{a.sessions}</div>
                    <div className="w-full bg-blue-500 rounded-t transition-all"
                      style={{ height: `${Math.max(4, (a.sessions / maxActivity) * 120)}px` }} />
                    <div className="text-xs text-gray-400 transform -rotate-45 origin-top-left whitespace-nowrap">
                      {a.date?.slice(5)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
                <div><div className="font-bold text-xl text-blue-600">{activity.reduce((s, a) => s + a.sessions, 0)}</div><div className="text-gray-400 text-xs">total sessions</div></div>
                <div><div className="font-bold text-xl text-green-600">{Math.max(...activity.map(a => a.sessions), 0)}</div><div className="text-gray-400 text-xs">best single day</div></div>
                <div><div className="font-bold text-xl text-purple-600">{Math.round(activity.reduce((s, a) => s + a.sessions, 0) / Math.max(activity.length, 1) * 10) / 10}</div><div className="text-gray-400 text-xs">avg per day</div></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
