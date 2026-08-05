import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { menu: true },
        },
      },
    })

    const unreadCount = recentOrders.filter(
      (o) => o.status !== 'SELESAI' && o.status !== 'BATAL'
    ).length

    const formattedNotifications = recentOrders.map((o) => {
      const timeStr = new Date(o.createdAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })

      const orderItems = o.items || (o as any).orderItems || []
      const itemsSummary = orderItems
        .map((i: any) => `${i.quantity || 1}x ${i.menu?.name || 'Menu'}`)
        .join(', ')

      return {
        id: o.id,
        title: `Pesanan Baru ${o.orderNumber || '#' + o.id.slice(-4).toUpperCase()}`,
        subtitle: `${o.customerName || 'Pelanggan'} (${o.orderType === 'TAKE_AWAY' ? 'Takeaway' : o.tableNumber || 'Dine In'})`,
        items: itemsSummary || 'Detail menu...',
        amount: o.totalAmount,
        time: `${timeStr} WIB`,
        status: o.status,
      }
    })

    return NextResponse.json({
      unreadCount,
      notifications: formattedNotifications,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil notifikasi' },
      { status: 500 }
    )
  }
}