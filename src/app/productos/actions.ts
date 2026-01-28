'use server'

import { searchProducts } from '@/lib/csv'

interface SearchResult {
  products: {
    id: string
    rnpa: string
    marca: string
    nombreFantasia: string
    denominacionventa: string
    TipoProducto: string
    Estado: string
    activo: string
  }[]
  total: number
  page: number
  totalPages: number
}

const DEFAULT_LIMIT = 20

export async function searchProductsAction(
  query: string,
  page: number = 1
): Promise<SearchResult> {
  if (!query.trim()) {
    return { products: [], total: 0, page: 1, totalPages: 0 }
  }

  const limit = DEFAULT_LIMIT
  const allResults = searchProducts(query)
  const total = allResults.length
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const products = allResults.slice(offset, offset + limit)

  return { products, total, page, totalPages }
}
