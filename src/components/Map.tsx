'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Restaurant {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  _count: { votes: number }
  user: { name: string | null }
}

interface MapProps {
  restaurants: Restaurant[]
  onVote: (id: number) => void
  isAuthenticated: boolean
}

const VALIDATED_THRESHOLD = 5

const validatedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const pendingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function SetViewOnLoad({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])
  return null
}

export default function Map({ restaurants, onVote, isAuthenticated }: MapProps) {
  const [userLocation, setUserLocation] = useState<[number, number]>([-34.6037, -58.3816])
  const [locationDetected, setLocationDetected] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
          setLocationDetected(true)
        },
        () => {
          console.log('No se pudo obtener ubicación, usando Buenos Aires')
        }
      )
    }
  }, [])

  return (
    <MapContainer
      center={userLocation}
      zoom={13}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SetViewOnLoad center={userLocation} />
      {locationDetected && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold">Tu ubicación</p>
            </div>
          </Popup>
        </Marker>
      )}
      {restaurants.map((restaurant) => {
        const isValidated = restaurant._count.votes >= VALIDATED_THRESHOLD
        return (
          <Marker
            key={restaurant.id}
            position={[restaurant.lat, restaurant.lng]}
            icon={isValidated ? validatedIcon : pendingIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg">{restaurant.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{restaurant.address}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      isValidated
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {isValidated ? 'Validado' : 'Pendiente'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {restaurant._count.votes} votos
                  </span>
                </div>
                {isAuthenticated && !isValidated && (
                  <button
                    onClick={() => onVote(restaurant.id)}
                    className="mt-3 w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Validar lugar
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Agregado por {restaurant.user.name || 'Anónimo'}
                </p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
