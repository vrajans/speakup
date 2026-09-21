import { UserProvider, useUser } from './context/UserContext'
import Onboarding from './pages/Onboarding'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import TodaySession from './pages/TodaySession'
import AICoach from './pages/AICoach'
import PronunciationStudio from './pages/PronunciationStudio'
import RecordingLibrary from './pages/RecordingLibrary'
import Vocabulary from './pages/Vocabulary'
import PowerSentences from './pages/PowerSentences'
import Journal from './pages/Journal'
import HabitTracker from './pages/HabitTracker'
import Settings from './pages/Settings'
import { useState } from 'react'
import Admin from './pages/Admin'


const PAGES = {
  dashboard: Dashboard,
  today: TodaySession,
  coach: AICoach,
  pronunciation: PronunciationStudio,
  recordings: RecordingLibrary,
  vocabulary: Vocabulary,
  sentences: PowerSentences,
  journal: Journal,
  habits: HabitTracker,
  settings: Settings,
  admin: Admin
}

function AppInner() {
  const { user, profile, loading } = useUser()
  const [page, setPage] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">🎤</div>
          <div className="font-semibold text-lg">Loading SpeakUp...</div>
        </div>
      </div>
    )
  }

  // Show onboarding if no user or onboarding not complete
  if (!user || !profile || !profile.onboarding_complete) {
    return <Onboarding />
  }

  const PageComponent = PAGES[page] || Dashboard

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="flex-1 overflow-y-auto">
        <PageComponent onNavigate={setPage} />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <AppInner />
    </UserProvider>
  )
}
