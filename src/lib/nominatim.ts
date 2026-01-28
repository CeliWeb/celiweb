export interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

export async function geocodeAddress(
  address: string
): Promise<NominatimResult | null> {
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: '1',
  })

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        'User-Agent': 'CeliWeb/1.0',
      },
    }
  )

  if (!response.ok) return null

  const results: NominatimResult[] = await response.json()
  return results[0] || null
}
