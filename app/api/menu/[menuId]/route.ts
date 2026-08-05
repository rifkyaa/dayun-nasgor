import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const { menuId } = await params
    const body = await req.json()

    // 1. Destructure & pisahkan field 'category' serta 'image'
    const { category, image, imageUrl, id, createdAt, updatedAt, ...restData } = body

    // 2. Petakan data ke payload yang dikenal oleh Prisma
    const updatePayload: any = { ...restData }

    // Jika dikirim 'image' dari frontend, ubah jadi 'imageUrl' untuk Prisma
    if (image !== undefined || imageUrl !== undefined) {
      updatePayload.imageUrl = imageUrl || image || ''
    }

    // 3. Penanganan relasi Category
    if (typeof category === 'string' && category.trim() !== '') {
      let existingCategory = await prisma.category.findFirst({
        where: { name: category },
      })

      if (!existingCategory) {
        existingCategory = await prisma.category.create({
          data: {
            name: category,
            slug: slugify(category),
          },
        })
      }

      updatePayload.category = {
        connect: { id: existingCategory.id },
      }
    }

    // 4. Update data ke Prisma
    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: updatePayload,
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      message: 'Menu berhasil diperbarui!',
      menu: updatedMenu,
    })
  } catch (error) {
    console.error('Error updating menu:', error)
    return NextResponse.json(
      { message: 'Gagal memperbarui menu!' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const { menuId } = await params
    await prisma.menu.delete({ where: { id: menuId } })
    return NextResponse.json({ message: 'Menu berhasil dihapus!' })
  } catch (error) {
    console.error('Error deleting menu:', error)
    return NextResponse.json(
      { message: 'Gagal menghapus menu!' },
      { status: 500 }
    )
  }
}