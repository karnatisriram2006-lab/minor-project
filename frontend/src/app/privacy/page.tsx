import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0F0F0F] text-[#484848] dark:text-[#E0E0E0] pt-6 pb-24 sm:pt-8 sm:pb-12 font-sans">
      <div className="container mx-auto px-6 max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-[#767676] dark:text-[#888]">Last updated: April 2026</p>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm p-8 space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold">1. Information We Collect</h2>
            <p className="text-sm text-[#767676] dark:text-[#888] leading-relaxed">
              We collect information you provide directly, such as your name, email, travel preferences, and trip itineraries. We also collect usage data like pages visited and features used to improve your experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
            <p className="text-sm text-[#767676] dark:text-[#888] leading-relaxed">
              Your information is used to personalize travel recommendations, generate AI itineraries, match travel companions, and improve our services. We never sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">3. Data Storage & Security</h2>
            <p className="text-sm text-[#767676] dark:text-[#888] leading-relaxed">
              Data is stored securely using MongoDB with encryption at rest. Authentication is handled via Firebase with JWT tokens. We implement industry-standard security measures to protect your information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">4. Location Data</h2>
            <p className="text-sm text-[#767676] dark:text-[#888] leading-relaxed">
              The "Near Me" feature uses your browser's geolocation API to find nearby places. Location data is processed in real-time and is not stored on our servers unless you explicitly save a location.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">5. Third-Party Services</h2>
            <p className="text-sm text-[#767676] dark:text-[#888] leading-relaxed">
              We use Firebase for authentication, Groq for AI processing, and OpenStreetMap for map data. Each service has its own privacy policy. We recommend reviewing them for a complete understanding.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">6. Your Rights</h2>
            <p className="text-sm text-[#767676] dark:text-[#888] leading-relaxed">
              You can request access to, correction of, or deletion of your personal data at any time by contacting us at privacy@yatra.app.
            </p>
          </section>

          <div className="pt-4 border-t border-[#EBEBEB] dark:border-[#2A2A2A]">
            <Link href="/contact" className="text-sm font-semibold text-[#FF5A5F] hover:underline">
              Contact us about privacy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
