import ProductSearch from '@/components/ProductSearch'

export default function ProductosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Productos Libres de Gluten
        </h1>
        <p className="text-gray-600 mt-2">
          Buscá productos aptos para celíacos en el listado oficial de ANMAT
        </p>
      </div>

      <ProductSearch />
    </div>
  )
}
