import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const restaurantId = parseInt(id)

  if (isNaN(restaurantId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  })

  if (!restaurant) {
    return NextResponse.json(
      { error: 'Restaurante no encontrado' },
      { status: 404 }
    )
  }

  const existingVote = await prisma.vote.findUnique({
    where: {
      restaurantId_userId: {
        restaurantId,
        userId: session.user.id,
      },
    },
  })

  if (existingVote) {
    return NextResponse.json({ error: 'Ya votaste este lugar' }, { status: 400 })
  }

  await prisma.vote.create({
    data: {
      restaurantId,
      userId: session.user.id,
    },
  })

  const voteCount = await prisma.vote.count({
    where: { restaurantId },
  })

  return NextResponse.json({ votes: voteCount })
}
