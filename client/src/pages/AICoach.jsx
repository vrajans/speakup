import { useState, useRef, useEffect } from 'react'

const SCENARIOS = [
  { id: 'free', icon: '💬', label: 'Free coaching', opening: "Hello! I am your AI Communication Coach. I am here every day to help you practice, improve, and build confidence.\n\nYou can ask me to role-play a scenario, give feedback on a script, coach you on a specific situation, or help you prepare for any meeting or presentation.\n\nWhat would you like to work on today?" },
  { id: 'status', icon: '📋', label: 'Status update', opening: "[David speaking]\nHey, good timing — I have about five minutes before my next call. Go ahead with your update. What is the status on the Data and Analytics program this week?" },
  { id: 'blocker', icon: '⚠️', label: 'Escalation', opening: "[Jennifer speaking]\nI got your meeting invite and it said urgent. What is going on? What do you need from me?" },
  { id: 'pitch', icon: '💡', label: 'Pitch an idea', opening: "[Marcus speaking]\nSo you said you had something to run by me. We have about fifteen minutes. What is on your mind?" },
  { id: 'smalltalk', icon: '☕', label: 'Small talk', opening: "[Alex — camera just turned on]\nOh hey! Looks like we are both early today. These back-to-back meetings, honestly... How is your morning going?" },
  { id: 'presentation', icon: '🎤', label: 'Presentation Q&A', opening: "[Robert — interrupting after your opening]\nBefore you go further — you mentioned deliverable delays earlier this quarter. How many milestones slipped, and what specifically caused them?" },
  { id: 'intro', icon: '👤', label: 'Introduce yourself', opening: "[Sarah speaking]\nHi! I am Sarah — I am the data architect on this project. Great to finally put a face to the name. Tell me a bit about yourself — what is your background?" },
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm flex-shrink-0 mt-1">🤖</div>}
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
        {msg.content.split('\n').map((line, i) => (
          <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
        ))}
      </div>
      {isUser && <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm flex-shrink-0 mt-1">👤</div>}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 justify-start">
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
        {[0, 150, 300].map(d => (
          <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
    </div>
  )
}

export default function AICoach() {
  const [scene, setScene] = useState('free')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('Ready')
  const msgsRef = useRef(null)
  const inputRef = useRef(null)

  const initScene = (sceneId) => {
    const sc = SCENARIOS.find(s => s.id === sceneId)
    setScene(sceneId)
    setMessages([{ role: 'assistant', content: sc.opening }])
    setInput('')
  }

  useEffect(() => { initScene('free') }, [])

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)
    setStatus('Thinking...')
    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scene, messages: newMessages })
      })
      const data = await r.json()
      const reply = data.content || data.error || 'Something went wrong. Please try again.'
      setMessages([...newMessages, { role: 'assistant', content: reply }])
      setStatus('Ready')
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Connection error. Please check that your server is running and your API key is set in .env' }])
      setStatus('Error')
    }
    setLoading(false)
  }

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-base">🤖</div>
        <div>
          <div className="font-semibold text-gray-900">AI Communication Coach</div>
          <div className="text-xs text-gray-400">Role-play · Feedback · Guidance</div>
        </div>
        <div className={`ml-auto text-xs px-2.5 py-1 rounded-full font-semibold ${status === 'Ready' ? 'bg-green-100 text-green-700' : status === 'Error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
          {status}
        </div>
      </div>

      {/* Scenario pills */}
      <div className="flex gap-2 flex-wrap px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        {SCENARIOS.map(sc => (
          <button
            key={sc.id}
            onClick={() => initScene(sc.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${scene === sc.id ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200'}`}
          >
            {sc.icon} {sc.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={msgsRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-gray-50">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            onKeyDown={onKey}
            rows={1}
            placeholder="Type your response… (Enter to send, Shift+Enter for new line)"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-blue-400 bg-gray-50 leading-relaxed"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 flex-shrink-0 text-base"
          >
            ➤
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1.5 px-1">Select a scenario above to start a role-play, or chat freely for coaching.</div>
      </div>
    </div>
  )
}
