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
          <h1 className="text-3xl font-black tracking-tight text-[#484848]">Looks like you took a wrong turn</h1>
          <p className="text-sm text-[#767676] leading-relaxed">
            Even the best explorers lose their way sometimes. Let&apos;s get you back on track.
          </p>
        </div>
        <Link href="/dashboard" className="inline-block">
          <button className="px-6 py-3 rounded-xl bg-[#FF5A5F] text-white font-semibold hover:bg-[#e14b51] transition-colors active:scale-[0.97]">
            Go back home
          </button>
        </Link>
      </div>
    </div>
  )
}
