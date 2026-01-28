import Papa from 'papaparse'
import fs from 'fs'
import path from 'path'

export interface Product {
  id: string
  rnpa: string
  marca: string
  nombreFantasia: string
  denominacionventa: string
  TipoProducto: string
  Estado: string
  activo: string
}

let cachedProducts: Product[] | null = null

export function getProducts(): Product[] {
  if (cachedProducts) return cachedProducts

  const csvPath = path.join(process.cwd(), 'productos.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')

  const result = Papa.parse<Product>(csvContent, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
  })

  cachedProducts = result.data
  return cachedProducts
}

export function searchProducts(query: string): Product[] {
  const products = getProducts()
  const searchTerm = query.toLowerCase().trim()

  if (!searchTerm) return []

  return products.filter((product) => {
    const searchFields = [
      product.marca,
      product.nombreFantasia,
      product.denominacionventa,
      product.TipoProducto,
    ]

    return searchFields.some(
      (field) => field && field.toLowerCase().includes(searchTerm)
    )
  })
}
