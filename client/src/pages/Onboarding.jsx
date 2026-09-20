import { useState } from 'react'
import { useUser } from '../context/UserContext'

const INDUSTRIES = [
  'Technology / Software', 'Data & Analytics', 'Finance & Banking',
  'Healthcare & Pharma', 'Consulting', 'Manufacturing', 'Retail & E-commerce',
  'Education', 'Government', 'Media & Marketing', 'Other'
]

const WORK_ENVIRONMENTS = [
  { value: 'corporate', label: '🏢 Large corporation (1000+ employees)' },
  { value: 'midsize', label: '🏬 Mid-size company (100–1000 employees)' },
  { value: 'startup', label: '🚀 Startup or small company (<100 employees)' },
  { value: 'consulting', label: '💼 Consulting / client-facing' },
  { value: 'remote', label: '🌐 Fully remote / distributed team' },
]

const AUDIENCES = [
  { value: 'senior_leadership', label: 'Senior leadership & executives' },
  { value: 'cross_functional', label: 'Cross-functional stakeholders' },
  { value: 'technical_team', label: 'Technical team members' },
  { value: 'clients', label: 'External clients or customers' },
  { value: 'mixed', label: 'Mixed — all of the above' },
]

const CHALLENGES = [
  { value: 'small_talk', label: '☕ Small talk & building rapport with colleagues' },
  { value: 'presenting', label: '🎤 Presenting confidently to large groups' },
  { value: 'escalating', label: '⚠️ Escalating problems and raising blockers' },
  { value: 'pitching', label: '💡 Pitching ideas and influencing decisions' },
  { value: 'explaining_technical', label: '🔄 Explaining technical concepts to non-technical people' },
  { value: 'cultural_differences', label: '🌍 Navigating cultural communication differences' },
  { value: 'pronunciation', label: '🔊 Pronunciation and being clearly understood' },
  { value: 'writing', label: '✉️ Writing professional emails and messages' },
  { value: 'leading_meetings', label: '📋 Leading and facilitating meetings' },
  { value: 'confidence', label: '💪 General confidence and speaking up' },
]

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'India', 'Singapore', 'Germany', 'Netherlands', 'Other'
]

const ENGLISH_LEVELS = [
  { value: 'native', label: 'English is my native language' },
  { value: 'fluent', label: 'Fluent — I work in English daily but it is my second language' },
  { value: 'professional', label: 'Professional — I am comfortable but want to sound more natural' },
  { value: 'intermediate', label: 'Intermediate — I sometimes struggle to find the right words' },
]

function ProgressBar({ step, total }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>Step {step} of {total}</span>
        <span>{Math.round((step / total) * 100)}% complete</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  )
}

function SelectCard({ selected, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm
        ${selected ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200'}`}>
      {children}
    </button>
  )
}

function MultiSelectCard({ selected, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm flex items-center gap-3
        ${selected ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200'}`}>
      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all
        ${selected ? 'bg-blue-600 text-white' : 'border-2 border-gray-300'}`}>
        {selected && <span className="text-xs">✓</span>}
      </div>
      {children}
    </button>
  )
}

export default function Onboarding() {
  const { login } = useUser()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', role: '', industry: '',
    years_experience: '', english_level: '', native_language: '',
    years_in_english_env: '', work_country: 'United States',
    work_environment: '', primary_audience: '',
    challenges: [], goal_90_days: '', goal_long_term: '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleChallenge = (val) => {
    setForm(f => ({
      ...f,
      challenges: f.challenges.includes(val)
        ? f.challenges.filter(c => c !== val)
        : f.challenges.length < 3 ? [...f.challenges, val] : f.challenges
    }))
  }

  const next = () => { setError(''); setStep(s => s + 1) }
  const back = () => { setError(''); setStep(s => s - 1) }

  const finish = async () => {
    if (!form.goal_90_days.trim()) {
      setError('Please write your 90-day goal before continuing.')
      return
    }
    setSaving(true)
    setError('')

    try {
      // Step 1: Register user
      console.log('Registering user:', form.name, form.email)
      const regRes = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email })
      })

      if (!regRes.ok) {
        const txt = await regRes.text()
        throw new Error(`Registration failed (${regRes.status}): ${txt}`)
      }

      const regData = await regRes.json()
      console.log('Registration response:', regData)

      if (!regData.user) {
        throw new Error(regData.error || 'Registration returned no user')
      }

      const userId = regData.user.id
      console.log('User created with ID:', userId)

      // Step 2: Save profile
      const profilePayload = {
        role: form.role,
        industry: form.industry,
        years_experience: parseInt(form.years_experience) || 0,
        english_level: form.english_level,
        native_language: form.native_language,
        years_in_english_env: form.years_in_english_env,
        work_country: form.work_country,
        work_environment: form.work_environment,
        primary_audience: form.primary_audience,
        challenges: form.challenges,
        goal_90_days: form.goal_90_days,
        goal_long_term: form.goal_long_term,
      }

      console.log('Saving profile for user:', userId, profilePayload)
      const profRes = await fetch(`/api/users/${userId}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload)
      })

      if (!profRes.ok) {
        const txt = await profRes.text()
        throw new Error(`Profile save failed (${profRes.status}): ${txt}`)
      }

      const profData = await profRes.json()
      console.log('Profile saved:', profData)

      // Step 3: Login (set global user state)
      await login(regData.user, { ...profData, name: form.name })
      console.log('Login complete — redirecting to dashboard')

    } catch (e) {
      console.error('Onboarding error:', e)
      setError(`Something went wrong: ${e.message}. Please check the server is running and try again.`)
    }

    setSaving(false)
  }

  // ── STEP 0: WELCOME ───────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎤</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SpeakUp</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your personal communication coaching platform. 90 days to communicate with clarity, confidence, and influence.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Your name</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="What should we call you?"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Email <span className="text-gray-400 font-normal">(to save your progress)</span>
              </label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            {error && <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg">{error}</div>}
            <button type="button"
              onClick={() => {
                if (!form.name.trim()) { setError('Please enter your name'); return }
                if (!form.email.trim()) { setError('Please enter your email'); return }
                next()
              }}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-2">
              Get started →
            </button>
          </div>
          <div className="mt-6 text-center">
            <button type="button" onClick={() => setStep(99)}
              className="text-xs text-gray-400 hover:text-gray-600">
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────
  if (step === 99) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <button type="button" onClick={() => setStep(0)}
            className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">← Back</button>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your email to pick up where you left off.</p>
          <div className="space-y-4">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            {error && <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg">{error}</div>}
            <button type="button"
              onClick={async () => {
                setSaving(true); setError('')
                try {
                  const r = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.email })
                  })
                  const data = await r.json()
                  if (!data.user) throw new Error(data.error || 'Account not found. Please check your email.')
                  await login(data.user, data.profile)
                } catch (e) {
                  setError(e.message)
                }
                setSaving(false)
              }}
              disabled={saving}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Finding account...' : 'Sign in →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const TOTAL = 5

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full max-h-screen overflow-y-auto">
        <ProgressBar step={step} total={TOTAL} />

        {/* STEP 1: Professional background */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your professional background</h2>
            <p className="text-gray-500 text-sm mb-6">This personalises your scripts and coaching to your actual work.</p>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Your current role / job title</label>
                <input type="text" value={form.role} onChange={e => set('role', e.target.value)}
                  placeholder="e.g. Data Analytics PM, Software Engineer, Finance Manager"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Industry</label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map(ind => (
                    <SelectCard key={ind} selected={form.industry === ind} onClick={() => set('industry', ind)}>{ind}</SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Years of professional experience</label>
                <div className="flex gap-2 flex-wrap">
                  {['1-3', '4-7', '8-12', '13-20', '20+'].map(y => (
                    <button type="button" key={y} onClick={() => set('years_experience', y)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm transition-all
                        ${form.years_experience === y ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-gray-200 text-gray-600 hover:border-blue-200'}`}>
                      {y} years
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Language & location */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Language & location</h2>
            <p className="text-gray-500 text-sm mb-6">Shapes how we coach your pronunciation and cultural communication.</p>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Your English proficiency</label>
                <div className="space-y-2">
                  {ENGLISH_LEVELS.map(l => (
                    <SelectCard key={l.value} selected={form.english_level === l.value} onClick={() => set('english_level', l.value)}>
                      {l.label}
                    </SelectCard>
                  ))}
                </div>
              </div>
              {form.english_level && form.english_level !== 'native' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Your native language</label>
                    <input type="text" value={form.native_language} onChange={e => set('native_language', e.target.value)}
                      placeholder="e.g. Tamil, Hindi, Spanish, Mandarin..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">How long working primarily in English?</label>
                    <div className="flex gap-2 flex-wrap">
                      {['Less than 1 year', '1-3 years', '3-7 years', '7+ years'].map(y => (
                        <button type="button" key={y} onClick={() => set('years_in_english_env', y)}
                          className={`px-4 py-2 rounded-xl border-2 text-sm transition-all
                            ${form.years_in_english_env === y ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' : 'border-gray-200 text-gray-600 hover:border-blue-200'}`}>
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Where are you working?</label>
                <div className="grid grid-cols-2 gap-2">
                  {COUNTRIES.map(c => (
                    <SelectCard key={c} selected={form.work_country === c} onClick={() => set('work_country', c)}>{c}</SelectCard>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Work context */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your work context</h2>
            <p className="text-gray-500 text-sm mb-6">Helps us create role-play scenarios that match your real workplace.</p>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Work environment</label>
                <div className="space-y-2">
                  {WORK_ENVIRONMENTS.map(e => (
                    <SelectCard key={e.value} selected={form.work_environment === e.value} onClick={() => set('work_environment', e.value)}>
                      {e.label}
                    </SelectCard>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Who do you communicate with most?</label>
                <div className="space-y-2">
                  {AUDIENCES.map(a => (
                    <SelectCard key={a.value} selected={form.primary_audience === a.value} onClick={() => set('primary_audience', a.value)}>
                      {a.label}
                    </SelectCard>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Challenges */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your biggest communication challenges</h2>
            <p className="text-gray-500 text-sm mb-1">Select up to 3. Your program will focus on these first.</p>
            <p className="text-xs text-blue-600 font-medium mb-5">{form.challenges.length}/3 selected</p>
            <div className="space-y-2">
              {CHALLENGES.map(c => (
                <MultiSelectCard key={c.value} selected={form.challenges.includes(c.value)} onClick={() => toggleChallenge(c.value)}>
                  <span>{c.label}</span>
                </MultiSelectCard>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Goals */}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your communication goals</h2>
            <p className="text-gray-500 text-sm mb-6">Being specific makes coaching 10× more effective.</p>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">In 90 days, I want to be able to...</label>
                <textarea rows={3} value={form.goal_90_days} onChange={e => set('goal_90_days', e.target.value)}
                  placeholder="e.g. Present confidently to senior leadership without anxiety. Start small talk naturally with American colleagues..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  My bigger career vision is... <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea rows={2} value={form.goal_long_term} onChange={e => set('goal_long_term', e.target.value)}
                  placeholder="e.g. Become a trusted advisor to senior leadership. Build reputation as a Data & AI thought leader..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              {/* Summary */}
              <div className="bg-blue-50 rounded-xl p-4 text-sm">
                <div className="font-semibold text-blue-800 mb-2">Your personalized program</div>
                <div className="space-y-1.5 text-blue-700">
                  <div>👤 <strong>{form.name}</strong> · {form.role} · {form.industry}</div>
                  <div>🌍 {form.work_country} · {form.english_level !== 'native' ? `${form.native_language} speaker` : 'Native English speaker'}</div>
                  <div>🎯 Focus: {form.challenges.join(', ') || 'not selected yet'}</div>
                  <div>🏢 {form.work_environment} · {form.primary_audience?.replace(/_/g, ' ')}</div>
                </div>
                <div className="mt-3 text-xs text-blue-600">All scripts, vocabulary, and coaching will be personalised to your exact situation.</div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-4 rounded-xl">
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button type="button" onClick={back}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              ← Back
            </button>
          )}
          {step < TOTAL && (
            <button type="button" onClick={next}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Continue →
            </button>
          )}
          {step === TOTAL && (
            <button type="button" onClick={finish} disabled={saving}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
              {saving ? '⏳ Setting up your program...' : '🚀 Start my 90-day program →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
