export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EBEBEB] shadow-2xl p-10 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#FF5A5F]/10 flex items-center justify-center mx-auto text-[#FF5A5F]">
          <span style={{ fontSize: 40, fontWeight: 800 }}>404</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#484848]">Page not found</h1>
        <p className="text-[#767676] text-sm leading-relaxed">We couldn’t find the page you’re looking for. This might be a broken link or a mistyped URL.</p>
        <a href="/" className="inline-block">
          <button className="px-4 py-2 rounded-xl bg-[#FF5A5F] text-white font-semibold hover:bg-[#e14b51] transition-colors">
            Go Home
          </button>
        </a>
      </div>
    </div>
  )
}
