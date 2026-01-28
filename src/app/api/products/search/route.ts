import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/csv'

const DEFAULT_LIMIT = 20

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT)))

  if (!query.trim()) {
    return NextResponse.json({ products: [], total: 0, page, totalPages: 0 })
  }

  const allResults = searchProducts(query)
  const total = allResults.length
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const products = allResults.slice(offset, offset + limit)

  return NextResponse.json({ products, total, page, totalPages })
}
