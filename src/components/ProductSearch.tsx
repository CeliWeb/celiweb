'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { searchProductsAction } from '@/app/productos/actions'

interface Product {
  id: string
  rnpa: string
  marca: string
  nombreFantasia: string
  denominacionventa: string
  TipoProducto: string
  Estado: string
  activo: string
}

export default function ProductSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const search = useCallback((searchQuery: string, pageNum: number) => {
    if (!searchQuery.trim()) {
      setResults([])
      setTotal(0)
      setTotalPages(0)
      return
    }

    startTransition(async () => {
      const data = await searchProductsAction(searchQuery, pageNum)
      setResults(data.products)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    })
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPage(1)
      search(query, 1)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, search])

  const goToPage = (newPage: number) => {
    setPage(newPage)
    search(query, newPage)
  }

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por marca, nombre, descripción o tipo..."
          className="w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isPending && (
        <div className="text-center py-8 text-gray-500">Buscando...</div>
      )}

      {!isPending && query && results.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron productos para "{query}"
        </div>
      )}

      {!isPending && results.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              {total} resultado{total !== 1 ? 's' : ''}
              {totalPages > 1 && ` — Página ${page} de ${totalPages}`}
            </p>
          </div>

          <div className="space-y-3">
            {results.map((product) => (
              <div
                key={product.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-gray-900">
                      {product.marca}
                    </h3>
                    {product.nombreFantasia && product.nombreFantasia !== 'NO REGISTRA' && (
                      <p className="text-lg text-gray-600 mt-0.5">
                        {product.nombreFantasia}
                      </p>
                    )}
                    <p className="text-gray-500 mt-2 leading-relaxed">
                      {product.denominacionventa}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {product.TipoProducto}
                      </span>
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          product.Estado === 'VIGENTE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {product.Estado}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-400 shrink-0">
                    <div className="bg-gray-50 px-2 py-1 rounded">
                      RNPA: {product.rnpa}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-12 text-gray-400">
          Ingresá un término de búsqueda para encontrar productos libres de
          gluten
        </div>
      )}
    </div>
  )
}
