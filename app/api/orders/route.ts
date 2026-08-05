import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderType, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'

// POST: Buat Pesanan Baru (Dari Pelanggan / Kasir)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      customerName, 
      tableNumber, 
      orderType, 
      paymentMethod, 
      items 
    } = body

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Nama pemesan dan item pesanan wajib diisi!' },
        { status: 400 }
      )
    }

    // 1. Tentukan Payment Method (QRIS atau TUNAI_KASIR)
    const selectedPaymentMethod = 
      paymentMethod === 'TUNAI_KASIR' 
        ? PaymentMethod.TUNAI_KASIR 
        : PaymentMethod.QRIS

    // 2. Buat orderNumber unik harian (e.g., #A041)
    const randomNum = Math.floor(100 + Math.random() * 900)
    const orderNumber = `#A${randomNum}`

    // 3. Hitung subtotal & totalAmount
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

      const itemSubtotal = menuItem.price * item.quantity
      subtotal += itemSubtotal

      orderItemsData.push({
        menuId: item.menuId,
        quantity: item.quantity,
        price: menuItem.price,
        note: item.note || null,
      })
    }

    const tax = 0
    const totalAmount = subtotal + tax

    // 4. Simpan Pesanan & Log Antrean ke DB MySQL
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
        items: {
          create: orderItemsData,
        },
        logs: {
          create: {
            status: OrderStatus.PENDING,
            notes: `Pesanan baru dibuat pelanggan via (${selectedPaymentMethod})`,
          },
        },
      },
      include: {
        items: {
          include: {
            menu: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: 'Pesanan berhasil dibuat!',
        order: newOrder,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { message: 'Gagal memproses pesanan!' },
      { status: 500 }
    )
  }
}

// GET: Ambil Antrean Pesanan Aktif untuk Dapur/Admin (FCFS)
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.DITERIMA, OrderStatus.DIMASAK], 
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
        createdAt: 'asc', 
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data antrean!' },
      { status: 500 }
    )
  }
}