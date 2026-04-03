import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  
  try {
    const res = await fetch(
      `${backendUrl}/api/nearby?${searchParams.toString()}`,
      { 
        headers: { 'User-Agent': 'IncredibleIndiaApp/1.0' },
        signal: AbortSignal.timeout(15000)
      }
    )
    
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error('[API Proxy /nearby Error]', error.message)
    return NextResponse.json(
      { message: 'Unable to fetch nearby places', error: error.message },
      { status: 502 }
    )
  }
}
