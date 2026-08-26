import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// 💥 IMPORT HELPER FCFS 💥
import { calculateFCFSQueuePosition, calculateRemainingCookingTime } from '@/lib/fcfs'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID tidak valid' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
        ],
      },
      include: {
        items: { include: { menu: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ message: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    // 💥 LOGIK FCFS DIPANGGIL DI SINI 💥
    const queuePosition = await calculateFCFSQueuePosition(order.createdAt)
    const remainingSeconds = calculateRemainingCookingTime(order.status, order.updatedAt)

    return NextResponse.json({
      ...order,
      queuePosition,
      remainingSeconds,
    })
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil detail pesanan' }, { status: 500 })
  }
}