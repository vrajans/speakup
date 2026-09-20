export default function PageShell({ title, subtitle, children }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-10">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </header>
      {children}
    </div>
  )
}
