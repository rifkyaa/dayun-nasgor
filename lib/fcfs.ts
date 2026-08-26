// lib/fcfs.ts
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

/**
 * 1. Menghitung Nomor Urut Transaksi Harian (DYN-YYMMDD-XXX)
 */
export async function generateFCFSOrderNumber(): Promise<string> {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  // Hitung jumlah transaksi hari ini
  const todayOrdersCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  })

  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const dateStr = `${yy}${mm}${dd}`
  const sequenceNumber = String(todayOrdersCount + 1).padStart(3, '0')

  return `DYN-${dateStr}-${sequenceNumber}`
}

/**
 * 2. Menghitung Posisi Antrean Realtime Pelanggan (1, 2, 3...)
 *    Berdasarkan FCFS (pesanan aktif yang dibuat lebih awal)
 */
export async function calculateFCFSQueuePosition(orderCreatedAt: Date) {
  // Hitung berapa pesanan PENDING/DITERIMA/DIMASAK yang masuk SEBELUM order ini
  const activeOrdersAhead = await prisma.order.count({
    where: {
      status: { in: [OrderStatus.PENDING, OrderStatus.DITERIMA, OrderStatus.DIMASAK] },
      createdAt: { lt: orderCreatedAt },
    },
  })

  return activeOrdersAhead + 1 // Posisi antrean (1 = Paling depan)
}

/**
 * 3. Menghitung Sisa Waktu Countdown Dimasak (Standard 3.5 Menit = 210 Detik)
 */
export function calculateRemainingCookingTime(status: OrderStatus, updatedAt: Date): number {
  const COOKING_DURATION_SECONDS = 210 // 3.5 Menit

  if (status !== OrderStatus.DIMASAK) return 0

  const cookingStartedAt = new Date(updatedAt).getTime()
  const now = new Date().getTime()
  const elapsedSeconds = Math.floor((now - cookingStartedAt) / 1000)

  return Math.max(0, COOKING_DURATION_SECONDS - elapsedSeconds)
}

/**
 * 4. Mengambil Seluruh Antrean Aktif Dapur Berdasarkan Urutan FCFS (createdAt Ascending)
 */
export async function getActiveFCFSQueue() {
  return await prisma.order.findMany({
    where: {
      status: {
        in: [OrderStatus.PENDING, OrderStatus.DITERIMA, OrderStatus.DIMASAK],
      },
    },
    include: {
      items: {
        include: { menu: true },
      },
    },
    orderBy: {
      createdAt: 'asc', // 👈 PRINSIP FCFS: Yang datang pertama diurutkan paling atas
    },
  })
}