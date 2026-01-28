'use client'

import { useState } from 'react'

interface AddRestaurantFormProps {
  onSubmit: (data: { name: string; address: string }) => Promise<void>
  onCancel: () => void
}

export default function AddRestaurantForm({
  onSubmit,
  onCancel,
}: AddRestaurantFormProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onSubmit({ name, address })
      setName('')
      setAddress('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="font-bold text-lg mb-4">Agregar Restaurante</h3>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nombre
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Nombre del restaurante"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Dirección
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Ej: Av. Corrientes 1234, Buenos Aires"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          La dirección será validada con OpenStreetMap
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Agregando...' : 'Agregar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
