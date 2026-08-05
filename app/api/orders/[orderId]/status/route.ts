import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // 1. Await params & ambil orderid (huruf kecil)
    const resolvedParams = await params
    const orderId = resolvedParams.orderId

    if (!orderId) {
      return NextResponse.json(
        { message: 'Order ID tidak ditemukan!' },
        { status: 400 }
      )
    }

    // 2. Read Body Payload
    const body = await req.json()
    const { status } = body

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { message: 'Status pesanan tidak valid!' },
        { status: 400 }
      )
    }

    // 3. Otomatis set paymentStatus ke PAID jika DITERIMA / DIMASAK / SELESAI
    const updateData: {
      status: OrderStatus
      paymentStatus?: PaymentStatus
    } = {
      status: status as OrderStatus,
    }

    if (
      status === OrderStatus.DITERIMA ||
      status === OrderStatus.DIMASAK ||
      status === OrderStatus.SELESAI
    ) {
      updateData.paymentStatus = PaymentStatus.PAID
    }

    // 4. Update Status & Tambah Audit Log ke Database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...updateData,
        logs: {
          create: {
            status: status as OrderStatus,
            notes: `Status diubah menjadi ${status} oleh staff dapur/kasir`,
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

    return NextResponse.json({
      message: `Status pesanan berhasil diperbarui menjadi ${status}`,
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { message: 'Gagal memperbarui status pesanan!' },
      { status: 500 }
    )
  }
}