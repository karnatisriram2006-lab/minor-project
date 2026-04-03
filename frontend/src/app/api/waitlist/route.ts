import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const res = await fetch(`${backendUrl}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed' }))
      return NextResponse.json({ message: err.message }, { status: res.status })
    }

    return NextResponse.json({ message: 'Added to waitlist' })
  } catch {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
