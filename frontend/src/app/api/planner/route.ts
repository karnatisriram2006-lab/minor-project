import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { geocodeCity } from '@/lib/geocodingService'

// Simple in-memory rate limiter (per IP) for planner endpoint
const plannerRate: Map<string, number[]> = new Map()
function rateLimit(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const arr = plannerRate.get(ip) || []
  const recent = arr.filter(t => now - t < windowMs)
  if (recent.length >= max) return false
  recent.push(now)
  plannerRate.set(ip, recent)
  return true
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in an hour.' }, { status: 429 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Server misconfigured: GROQ_API_KEY missing' }, { status: 500 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const destination = body?.destination ?? 'Goa'
  const duration = Number.isFinite(body?.duration) ? Number(body.duration) : 3
  const budget = Number(body?.budget) || 10000
  const budgetTier = body?.budgetTier ?? 'economy'
  const interests = Array.isArray(body?.interests) ? body.interests : []
  const language = body?.language ?? 'English'
  const originLat = body?.originLat ? Number(body.originLat) : undefined
  const originLng = body?.originLng ? Number(body.originLng) : undefined

  // Optional origin info and distance (if originLat/originLng provided, compute distance to destination)
  let originInfo = ''
  if (typeof originLat === 'number' && typeof originLng === 'number') {
    originInfo = `Origin: ${originLat.toFixed(6)},${originLng.toFixed(6)}. `
  }
  let distanceInfoKm = 0
  let destCoords: { lat: number; lng: number } | null = null
  try {
    const d = await geocodeCity(destination)
    if (d) destCoords = { lat: d.lat, lng: d.lng }
  } catch {
    destCoords = null
  }
  if (originLat != null && originLng != null && destCoords) {
    try {
      const osrm = await fetch(`http://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destCoords.lng},${destCoords.lat}?overview=false`)
      const data = await osrm.json()
      const dist = data?.routes?.[0]?.distance ?? 0
      distanceInfoKm = dist / 1000
    } catch {
      distanceInfoKm = 0
    }
  }
  const originSnippet = (typeof originLat === 'number' && typeof originLng === 'number')
    ? `If origin coordinates are provided, start Day 1 with a stop named "Origin" at lat ${originLat}, lng ${originLng} time "Now". `
    : ''
  const systemPrompt = `You are ARIA, a travel itinerary generator for YĀTRĀ. Create a realistic, optimized day-by-day itinerary for India. ${originSnippet}Start from the origin if provided and include realistic place names, coordinates and costs. Distance to destination: ${distanceInfoKm.toFixed(2)} km if known. Respond only with JSON and costs in ₹.`
  const userMessage = `Plan a ${duration}-day trip to ${destination}, India. ${originInfo}Distance to destination: ${distanceInfoKm.toFixed(2)} km. Budget: ₹${budget} total (${budgetTier} tier). Interests: ${interests.join(', ')}. Produce a detailed day-by-day itinerary including stops, times, categories, coordinates, and costs. Ensure geographic feasibility and reasonable travel times. Language: ${language}`

  const groq = new Groq({ apiKey })
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [ { role: 'system', content: systemPrompt }, { role: 'user', content: userMessage } ],
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices?.[0]?.delta?.content ?? ''
            controller.enqueue(encoder.encode(text))
          }
        } catch (e) {
          console.error('[GROQ Planner STREAM ERROR]', e)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[GROQ Planner ERROR]', err)
    return NextResponse.json({ error: 'Failed to generate itinerary' }, { status: 500 })
  }
}
