import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderType, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import { generateFCFSOrderNumber, getActiveFCFSQueue } from '@/lib/fcfs' // 👈 IMPORT LIB FCFS

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerName, tableNumber, orderType, paymentMethod, items } = body

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Nama pemesan dan item pesanan wajib diisi!' },
        { status: 400 }
      )
    }

    const selectedPaymentMethod = 
      paymentMethod === 'TUNAI_KASIR' 
        ? PaymentMethod.TUNAI_KASIR 
        : PaymentMethod.QRIS

    // 💥 GUNAKAN LOGIK FCFS DARI LIB 💥
    const orderNumber = await generateFCFSOrderNumber()

    let subtotal = 0
    const orderItemsData = []

    for (const item of items) {
      const menuItem = await prisma.menu.findUnique({
        where: { id: item.menuId },
      })

      if (!menuItem) {
        return NextResponse.json(
          { message: `Menu dengan ID ${item.menuId} tidak ditemukan!` },
          { status: 404 }
        )
      }

      subtotal += menuItem.price * item.quantity
      orderItemsData.push({
        menuId: item.menuId,
        quantity: item.quantity,
        price: menuItem.price,
        note: item.note || null,
      })
    }

    const tax = 0
    const totalAmount = subtotal + tax

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        orderType: orderType === 'TAKE_AWAY' ? OrderType.TAKE_AWAY : OrderType.DINE_IN,
        tableNumber: tableNumber ? String(tableNumber) : null,
        status: OrderStatus.PENDING,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: PaymentStatus.UNPAID,
        subtotal,
        tax,
        totalAmount,
        items: { create: orderItemsData },
        logs: {
          create: {
            status: OrderStatus.PENDING,
            notes: `Pesanan baru dibuat pelanggan via (${selectedPaymentMethod})`,
          },
        },
      },
      include: {
        items: { include: { menu: true } },
      },
    })

    return NextResponse.json({ message: 'Pesanan berhasil dibuat!', order: newOrder }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memproses pesanan!' }, { status: 500 })
  }
}

// GET: Mengambil Antrean FCFS Aktif
export async function GET() {
  try {
    // 💥 GUNAKAN LOGIK FCFS DARI LIB 💥
    const orders = await getActiveFCFSQueue()
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data antrean!' }, { status: 500 })
  }
}