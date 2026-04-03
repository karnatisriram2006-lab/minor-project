import Link from "next/link"
import { Sparkles, MapPin, Users, Wallet, Shield, Globe, ChevronRight } from "lucide-react"

const faqs = [
  { q: "How does the AI itinerary generator work?", a: "Our AI uses Groq's Llama 3.3 model trained on Indian tourism data. It considers your destination, duration, budget, and interests to create a day-by-day plan with geographically optimized routes." },
  { q: "Is my trip data private?", a: "By default, trips are saved privately to your account. You can choose to make a trip public to share it with others via a link. We never share your data without consent." },
  { q: "How accurate is the budget planner?", a: "The budget planner uses AI-estimated splits based on historical cost data across 20+ Indian cities. Actual costs may vary by 10-20% depending on season and personal preferences." },
  { q: "Can I use YĀTRĀ offline?", a: "Yes! Visit the Offline page to download city packs with maps, guides, and saved itineraries. The PWA works without internet for previously loaded content." },
  { q: "How does companion matching work?", a: "We match travelers based on destination, dates, budget range, and shared interests using a weighted similarity score. Higher scores mean better compatibility." },
  { q: "Is the 'Near Me' feature accurate?", a: "Yes — it uses OpenStreetMap's Nominatim API to find real places near your GPS coordinates. Results include hospitals, police, restaurants, ATMs, and more." },
]

const features = [
  { icon: Sparkles, title: "AI Itinerary", desc: "Personalized day-by-day plans" },
  { icon: Wallet, title: "Budget Planner", desc: "Smart cost allocation" },
  { icon: MapPin, title: "Near Me", desc: "Real-time place finder" },
  { icon: Users, title: "Companions", desc: "Travel matching" },
  { icon: Shield, title: "Safety", desc: "Emergency contacts & SOS" },
  { icon: Globe, title: "Multi-language", desc: "Hindi, English & more" },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-3xl space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">How YĀTRĀ Works</h1>
          <p className="text-sm text-[#767676] dark:text-[#888]">Everything you need to know about the AI travel planner.</p>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm p-6">
          <h2 className="text-base font-bold mb-4">Core Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.title} className="flex flex-col items-center text-center p-4 rounded-xl bg-[#F7F7F7] dark:bg-[#222]">
                <f.icon className="h-6 w-6 text-[#FF5A5F] mb-2" />
                <p className="text-xs font-bold text-[#484848] dark:text-[#E0E0E0]">{f.title}</p>
                <p className="text-[10px] text-[#767676] dark:text-[#888] mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-base font-bold">Frequently Asked Questions</h2>
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm p-6 space-y-2">
              <h3 className="text-sm font-bold text-[#484848] dark:text-[#E0E0E0]">{faq.q}</h3>
              <p className="text-sm text-[#767676] dark:text-[#888] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-[#FF5A5F]/5 to-[#00A699]/5 rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] p-6 space-y-4">
          <h2 className="text-base font-bold">Tips for Best Results</h2>
          <ul className="space-y-2 text-sm text-[#767676] dark:text-[#888]">
            <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-[#FF5A5F] shrink-0 mt-0.5" />Be specific with interests — "History, Food, Photography" works better than "Everything"</li>
            <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-[#FF5A5F] shrink-0 mt-0.5" />Use realistic budgets — ₹15,000-30,000 is ideal for a 3-day domestic trip</li>
            <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-[#FF5A5F] shrink-0 mt-0.5" />Enable location for accurate "Near Me" results</li>
            <li className="flex items-start gap-2"><ChevronRight className="h-4 w-4 text-[#FF5A5F] shrink-0 mt-0.5" />Save trips to revisit them later or share with friends</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-[#EBEBEB] dark:border-[#2A2A2A] flex flex-wrap gap-4">
          <Link href="/contact" className="text-sm font-semibold text-[#FF5A5F] hover:underline">Still have questions? Contact us →</Link>
          <Link href="/privacy" className="text-sm font-semibold text-[#FF5A5F] hover:underline">Privacy Policy →</Link>
        </div>
      </div>
    </div>
  )
}
