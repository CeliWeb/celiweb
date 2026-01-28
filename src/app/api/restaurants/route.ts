import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { geocodeAddress } from '@/lib/nominatim'

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    include: {
      _count: {
        select: { votes: true },
      },
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(restaurants)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { name, address } = body

  if (!name || !address) {
    return NextResponse.json(
      { error: 'Nombre y dirección son requeridos' },
      { status: 400 }
    )
  }

  const geoResult = await geocodeAddress(address)

  if (!geoResult) {
    return NextResponse.json(
      { error: 'No se pudo validar la dirección' },
      { status: 400 }
    )
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      address: geoResult.display_name,
      lat: parseFloat(geoResult.lat),
      lng: parseFloat(geoResult.lon),
      userId: session.user.id,
    },
    include: {
      _count: {
        select: { votes: true },
      },
    },
  })

  return NextResponse.json(restaurant, { status: 201 })
}
