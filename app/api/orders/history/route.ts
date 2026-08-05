import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function GET() {
  try {
    // Ambil data transaksi yang sudah SELESAI atau BATAL
    const historyOrders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.SELESAI, OrderStatus.BATAL],
        },
      },
      include: {
        items: {
          include: {
            menu: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Transaksi terbaru di atas
      },
    })

    return NextResponse.json(historyOrders)
  } catch (error) {
    console.error('Error fetching order history:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data riwayat transaksi!' },
      { status: 500 }
    )
  }
}