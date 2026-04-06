"use client"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EBEBEB] shadow-2xl p-10 text-center space-y-6">
        {/* India travel themed SVG illustration */}
        <div className="w-24 h-24 mx-auto relative">
          <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="48" cy="48" r="44" fill="#FFF5F5" stroke="#FF5A5F" strokeWidth="2" strokeDasharray="4 4"/>
            <text x="48" y="42" textAnchor="middle" fontSize="28">🧭</text>
            <text x="48" y="72" textAnchor="middle" fontSize="14" fill="#767676">?</text>
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-[#484848]">Page not found</h1>
          <p className="text-sm text-[#767676] leading-relaxed">
            The page you requested could not be found. Explore India’s incredible destinations instead.
          </p>
        </div>
        <form onSubmit={e => { e.preventDefault(); const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement | null)?.value; if (q) window.location.assign(`/discover?q=${encodeURIComponent(q)}`) }} className="flex gap-2 justify-center mt-2">
          <input name="q" placeholder="Search destinations" className="px-4 py-2 rounded-md border border-[#EBEBEB] w-64" />
          <button type="submit" className="px-4 py-2 rounded-md bg-[#FF5A5F] text-white font-semibold">Search</button>
        </form>
        <div className="flex gap-3 justify-center mt-2">
          <Link href="/dashboard">
            <button className="px-6 py-3 rounded-xl bg-[#FF5A5F] text-white font-semibold hover:bg-[#e14b51] transition-colors">
              Go to Dashboard
            </button>
          </Link>
          <Link href="/trip-planner">
            <button className="px-6 py-3 rounded-xl bg-[#1F9BEA] text-white font-semibold hover:bg-[#1678c7] transition-colors">
              Plan a trip
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
