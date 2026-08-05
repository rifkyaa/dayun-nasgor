import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper untuk generate slug otomatis dari nama kategori
const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

// GET: Fetch List Menu (Mendukung format Admin Flat & Customer Category Nested)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const isAll = searchParams.get('all') === 'true'

    // 1. RESPONSE UNTUK DASHBOARD ADMIN (?all=true)
    // Kembalikan flat list menu + include objek relasi category
    if (isAll) {
      const menus = await prisma.menu.findMany({
        include: {
          category: true, // Sertakan relasi category agar badge & filter di admin tidak 'Lainnya'
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(menus)
    }

    // 2. RESPONSE UNTUK LANDING PAGE CUSTOMER (/api/menu)
    // Kembalikan struktur category bertingkat (nested)
    const categories = await prisma.category.findMany({
      include: {
        menus: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data menu!' },
      { status: 500 }
    )
  }
}

// POST: Tambah Menu Baru dari Admin
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, category, price, isAvailable, image, imageUrl, description } = body

    if (!name || !price) {
      return NextResponse.json(
        { message: 'Nama dan harga wajib diisi!' },
        { status: 400 }
      )
    }

    const categoryName = category || 'Nasi Goreng'

    let existingCategory = await prisma.category.findFirst({
      where: { name: categoryName },
    })

    if (!existingCategory) {
      existingCategory = await prisma.category.create({
        data: {
          name: categoryName,
          slug: slugify(categoryName),
        },
      })
    }

    const newMenu = await prisma.menu.create({
      data: {
        name,
        price: Number(price),
        isAvailable: isAvailable ?? true,
        imageUrl: imageUrl || image || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
        description: description || '',
        categoryId: existingCategory.id,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(
      { message: 'Menu berhasil ditambahkan!', menu: newMenu },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating menu:', error)
    return NextResponse.json(
      { message: 'Gagal menambah menu baru!' },
      { status: 500 }
    )
  }
}