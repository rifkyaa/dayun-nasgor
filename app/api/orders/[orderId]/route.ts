import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    if (!orderId) {
      return NextResponse.json(
        { message: 'Order ID wajib diisi!' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menu: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Pesanan tidak ditemukan!' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order detail:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil detail pesanan!' },
      { status: 500 }
    )
  }
}