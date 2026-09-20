import PageShell from '../components/PageShell'

export default function TodaysSession() {
  return (
    <PageShell title="Today's Session" subtitle="Your daily practice block.">
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">The guided session flow lands here — theme, drills, and an end-of-day reflection.</p>
      </div>
    </PageShell>
  )
}
