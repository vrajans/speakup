import { useState } from 'react'
import { useUser } from '../context/UserContext'

export default function Settings() {
  const { user, profile, logout, updateProfile } = useUser()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [goal, setGoal] = useState(profile?.goal_90_days || '')

  const saveGoal = async () => {
    setSaving(true)
    try {
      const r = await fetch(`/api/users/${user.id}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, goal_90_days: goal })
      })
      const data = await r.json()
      updateProfile({ ...profile, goal_90_days: goal })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {}
    setSaving(false)
  }

  const challenges = Array.isArray(profile?.challenges) ? profile.challenges : JSON.parse(profile?.challenges || '[]')

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-6">Your account and program configuration.</p>

      {/* Profile summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-3">Your profile</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2"><span className="text-gray-500 w-32">Name</span><span className="font-medium">{user?.name}</span></div>
          <div className="flex gap-2"><span className="text-gray-500 w-32">Email</span><span>{user?.email}</span></div>
          <div className="flex gap-2"><span className="text-gray-500 w-32">Role</span><span>{profile?.role}</span></div>
          <div className="flex gap-2"><span className="text-gray-500 w-32">Industry</span><span>{profile?.industry}</span></div>
          <div className="flex gap-2"><span className="text-gray-500 w-32">Location</span><span>{profile?.work_country}</span></div>
          <div className="flex gap-2"><span className="text-gray-500 w-32">English level</span><span className="capitalize">{profile?.english_level}</span></div>
          {profile?.native_language && <div className="flex gap-2"><span className="text-gray-500 w-32">Native language</span><span>{profile.native_language}</span></div>}
          <div className="flex gap-2"><span className="text-gray-500 w-32">Focus areas</span><div className="flex flex-wrap gap-1">{challenges.map(c => <span key={c} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{c.replace(/_/g,' ')}</span>)}</div></div>
        </div>
      </div>

      {/* Goal update */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-1">Your 90-day goal</h2>
        <p className="text-xs text-gray-400 mb-3">Update this as your goals evolve.</p>
        <textarea rows={3} value={goal} onChange={e => setGoal(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
        <div className="flex gap-3 mt-3 items-center">
          <button onClick={saveGoal} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save goal'}
          </button>
          {saved && <span className="text-green-600 text-sm font-medium">✓ Saved</span>}
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-1">Anthropic API Key</h2>
        <p className="text-xs text-gray-400 mb-3">Stored in your server's .env file. Get one at console.anthropic.com</p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-600">ANTHROPIC_API_KEY=sk-ant-...</div>
        <p className="text-xs text-gray-400 mt-2">To update: edit .env file in your project root and restart the server.</p>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5">
        <h2 className="font-semibold text-red-700 mb-1">Account</h2>
        <button onClick={logout} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100">Sign out of SpeakUp</button>
      </div>
    </div>
  )
}
