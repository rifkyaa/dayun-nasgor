import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function GET() {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // 1. Ambil SEMUA pesanan hari ini beserta Menu dan Kategori
    const allTodayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        items: {
          include: { 
            menu: {
              include: { category: true } // <-- DITAMBAHKAN AGAR KATEGORI TERBACA
            } 
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter pesanan yang sudah SELESAI saja untuk hitung Omset & Top Menu
    const completedOrders = allTodayOrders.filter(
      (o) => o.status === OrderStatus.SELESAI
    )

    // 2. Hitung Total Omset & Total Porsi Selesai
    const totalOmset = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    
    let totalPorsi = 0
    let totalTatSeconds = 0

    completedOrders.forEach((o) => {
      const orderItems = o.items || (o as any).orderItems || []
      orderItems.forEach((item: any) => {
        totalPorsi += item.quantity || 1
      })

      const finishTime = o.updatedAt ? new Date(o.updatedAt).getTime() : new Date().getTime()
      const startTime = new Date(o.createdAt).getTime()
      totalTatSeconds += Math.max(0, Math.floor((finishTime - startTime) / 1000))
    })

    const avgTatMinutes = completedOrders.length > 0 
      ? Math.round(totalTatSeconds / completedOrders.length / 60) 
      : 4

    // 3. Top 4 Menu Terlaris Hari Ini
    const menuSalesMap: Record<string, { id: string; name: string; category: string; sold: number; image: string }> = {}

    completedOrders.forEach((order) => {
      const orderItems = order.items || (order as any).orderItems || []
      orderItems.forEach((item: any) => {
        const menuId = item.menuId || item.menu?.id
        if (!menuId) return

        const menuName = item.menu?.name || 'Menu Dayun'
        const catName = item.menu?.category?.name || 'Nasgor'
        
        // Ambil imageUrl terbaru dari relasi menu
        const img = item.menu?.imageUrl || item.menu?.image || '/images/menus/default.jpg'

        if (!menuSalesMap[menuId]) {
          menuSalesMap[menuId] = {
            id: menuId,
            name: menuName,
            category: catName,
            sold: 0,
            image: img,
          }
        } else {
          // Pastikan image di-update jika sebelumnya kosong
          if (!menuSalesMap[menuId].image && img) {
            menuSalesMap[menuId].image = img
          }
        }

        menuSalesMap[menuId].sold += item.quantity || 1
      })
    })

    const topMenus = Object.values(menuSalesMap)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4)

    // Format daftar pemesan untuk UI
    const recentOrders = allTodayOrders.map((o) => {
      const orderItems = o.items || (o as any).orderItems || []
      const itemsSummary = orderItems
        .map((i: any) => `${i.quantity || 1}x ${i.menu?.name || 'Menu'}`)
        .join(', ')

      const timeStr = new Date(o.createdAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })

      return {
        id: o.id,
        orderNumber: (o as any).orderNumber || o.id.slice(-5).toUpperCase(),
        customerName: o.customerName || 'Pelanggan',
        orderType: o.orderType === 'TAKE_AWAY' ? 'Takeaway' : (o.tableNumber || 'Dine In'),
        paymentMethod: (o as any).paymentMethod || 'TUNAI',
        totalAmount: o.totalAmount,
        status: o.status,
        timeStr,
        itemsSummary,
      }
    })

    return NextResponse.json({
      todayDateStr: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      summary: {
        totalOmset,
        totalPorsi,
        avgTatMinutes,
        targetPorsi: 150,
      },
      topMenus,
      recentOrders, // <-- DATA BARU: Daftar Pemesan Hari Ini!
    })
  } catch (error) {
    console.error('Error fetching dashboard API:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data dashboard' },
      { status: 500 }
    )
  }
}