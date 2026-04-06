import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Simple in-memory rate limiter per IP (per-process). Not suitable for multi-instance deployments.
const rateMap = new Map<string, number[]>()
function rateLimit(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const arr = rateMap.get(ip) || []
  const recent = arr.filter(ts => now - ts < windowMs)
  if (recent.length >= max) return false
  recent.push(now)
  rateMap.set(ip, recent)
  return true
}

// POST /api/chat
// POST /api/chat
export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Server misconfigured: GROQ_API_KEY missing' }, { status: 500 })
  }
  const groq = new Groq({ apiKey })
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  // Rate limit: 10 requests per hour per IP
  if (!rateLimit(ip, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in an hour.' }, { status: 429 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  // Expected payload shapes:
  // { messages: [{ role: 'user'|'system'|'bot', content: string }], language?: string, systemPrompt?: string }
  const messagesFromBody: any[] = Array.isArray(body?.messages) ? body.messages : []
  const systemPrompt: string = body?.systemPrompt ??
    'You are YĀTRĀ, a helpful travel assistant for India. Respond concisely with actionable guidance.'
  const language: string = body?.language ?? 'English'

  // Build the conversation for the model
  const convo = [ { role: 'system', content: systemPrompt }, ...messagesFromBody ]

  // If a single user message is provided (legacy convenience)
  if (body?.message) {
    convo.push({ role: 'user', content: body.message })
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Fastest for chat
      messages: convo,
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
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
          // swallow streaming errors but surface a 500
          console.error('[GROQ Chat STREAM ERROR]', e)
        } finally {
          controller.close()
        }
      }
    })

    // Note: We always stream as plain text to the client
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[GROQ Chat ERROR]', err)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
