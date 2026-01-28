'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import AddRestaurantForm from '@/components/AddRestaurantForm'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      Cargando mapa...
    </div>
  ),
})

interface Restaurant {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  _count: { votes: number }
  user: { name: string | null }
}

export default function Home() {
  const { data: session } = useSession()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await fetch('/api/restaurants')
      const data = await response.json()
      setRestaurants(data)
    } catch (error) {
      console.error('Error cargando restaurantes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  const handleAddRestaurant = async (data: { name: string; address: string }) => {
    const response = await fetch('/api/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al agregar restaurante')
    }

    await fetchRestaurants()
    setShowAddForm(false)
  }

  const handleVote = async (restaurantId: number) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/vote`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchRestaurants()
      } else {
        const error = await response.json()
        alert(error.error)
      }
    } catch (error) {
      console.error('Error votando:', error)
    }
  }

  return (
    <div className="h-[calc(100vh-57px)] relative">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          Cargando...
        </div>
      ) : (
        <Map
          restaurants={restaurants}
          onVote={handleVote}
          isAuthenticated={!!session}
        />
      )}

      {session && (
        <div className="absolute top-4 right-4 z-[1000]">
          {showAddForm ? (
            <AddRestaurantForm
              onSubmit={handleAddRestaurant}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-600"
            >
              + Agregar Restaurante
            </button>
          )}
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Validado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
            <span>Pendiente</span>
          </div>
        </div>
      </div>
    </div>
  )
}
