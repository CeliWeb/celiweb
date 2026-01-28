import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
const MAX_REQUESTS = 30

const requests = new Map<string, { count: number; resetTime: number }>()

function getRateLimitStatus(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = requests.get(ip)

  if (!record || now > record.resetTime) {
    requests.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: MAX_REQUESTS - record.count }
}

export function middleware(request: NextRequest) {
  // Solo aplicar a rutas de API (excepto auth)
  if (!request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Obtener IP del cliente
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown'

  // Verificar origen (solo permitir requests del mismo dominio)
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  // En desarrollo permitir localhost
  const allowedOrigins = [
    `http://${host}`,
    `https://${host}`,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]

  const isValidOrigin = !origin || allowedOrigins.some(allowed => origin.startsWith(allowed))
  const isValidReferer = !referer || allowedOrigins.some(allowed => referer.startsWith(allowed))

  if (!isValidOrigin && !isValidReferer) {
    return NextResponse.json(
      { error: 'Acceso no autorizado' },
      { status: 403 }
    )
  }

  // Rate limiting
  const { allowed, remaining } = getRateLimitStatus(ip)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intentá de nuevo en un minuto.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        }
      }
    )
  }

  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Remaining', String(remaining))

  return response
}

export const config = {
  matcher: '/api/:path*',
}
