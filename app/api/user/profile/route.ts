import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id || session.user.name // Pastikan ID didapat dari session
    const { name, username, password } = await req.json()

    // 1. Cek apakah username baru sudah dipakai user lain
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      })
      if (existingUser) {
        return NextResponse.json(
          { message: 'Username sudah digunakan oleh akun lain!' },
          { status: 400 }
        )
      }
    }

    // 2. Siapkan data yang akan di-update
    const updateData: any = {
      ...(name && { name }),
      ...(username && { username }),
    }

    // 3. Jika password diisi, hash dengan bcrypt
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // 4. Update ke database via Prisma
    const updatedUser = await prisma.user.update({
      where: { username: (session.user as any).username || 'admin' },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Profil berhasil diperbarui!',
      user: {
        name: updatedUser.name,
        username: updatedUser.username,
      },
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { message: 'Gagal memperbarui profil!' },
      { status: 500 }
    )
  }
}