import { PrismaClient, Role } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 Memulai proses Seeding Data...')

  // 1. Seed Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Mang Dayun',
      username: 'admin',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  })
  console.log('✅ Admin User Ready:', admin.username)

  // 2. Data Kategori & Menu Asli Dayun Nasgor (Gunakan imageUrl)
  const menuData = [
    {
      categoryName: 'Otokowok',
      slug: 'otokowok',
      items: [
        { name: 'Nasi Otokowok Chiken Katsu', price: 25000, isBestSeller: true, imageUrl: '/images/menus/otokowok-katsu.png' },
        { name: 'Nasi Otokowok Ati Ampela + Ayam', price: 20000, imageUrl: '/images/menus/otokowok-ati-ayam-suwir.png' },
        { name: 'Nasi Otokowok Ayam Suwir', price: 15000, imageUrl: '/images/menus/otokowok-ayam-suwir.png' },
        { name: 'Nasi Otokowok Ati Ampela', price: 15000, imageUrl: '/images/menus/otokowok-ati-ayam-suwir.png' },
      ],
    },
    {
      categoryName: 'Nasi Goreng',
      slug: 'nasi-goreng',
      items: [
        { name: 'Nasi Goreng Chiken Katsu', price: 25000, isBestSeller: true, imageUrl: '/images/menus/nasgor-ayam-suwir.png' },
        { name: 'Nasi Goreng Ati Ampela + Ayam', price: 20000, imageUrl: '/images/menus/nasgor-ayam-suwir.png' },
        { name: 'Nasi Goreng Ati Ampela', price: 15000, imageUrl: '/images/menus/nasgor-ayam-suwir.png' },
        { name: 'Nasi Goreng Ayam Suwir', price: 15000, imageUrl: '/images/menus/nasgor-ayam-suwir.png' },
      ],
    }, 
    {
      categoryName: 'Mie Goreng/Rebus',
      slug: 'mie-goreng-rebus',
      items: [
        { name: 'Mie Chiken Katsu', price: 25000, imageUrl: '/images/menus/mie-ayam-suwir.png' },
        { name: 'Mie Ati Ampela + Ayam', price: 20000, imageUrl: '/images/menus/mie-ayam-suwir.png' },
        { name: 'Mie Ati Ampela', price: 15000, imageUrl: '/images/menus/mie-ayam-suwir.png' },
        { name: 'Mie Ayam Suwir', price: 15000, imageUrl: '/images/menus/mie-ayam-suwir.png' },
      ],
    },
    {
      categoryName: 'Kwetiaw Goreng/Rebus',
      slug: 'kwetiaw-goreng-rebus',
      items: [
        { name: 'Kwetiaw Chiken Katsu', price: 25000, imageUrl: '/images/menus/kwetiaw-katsu.png' },
        { name: 'Kwetiaw Ati Ampela + Ayam', price: 20000, imageUrl: '/images/menus/kwetiaw-ayam-suwir.png' },
        { name: 'Kwetiaw Ati Ampela', price: 15000, imageUrl: '/images/menus/kwetiaw-ayam-suwir.png' },
        { name: 'Kwetiaw Ayam Suwir', price: 15000, imageUrl: '/images/menus/kwetiaw-ayam-suwir.png' },
      ],
    },
    {
      categoryName: 'Bihun Goreng',
      slug: 'bihun-goreng-rebus',
      items: [
        { name: 'Bihun Chiken Katsu', price: 25000, imageUrl: '/images/menus/bihun-katsu.png' },
        { name: 'Bihun Ati Ampela + Ayam', price: 20000, imageUrl: '/images/menus/bihun-ati-ayam.png' }, 
        { name: 'Bihun Ati Ampela', price: 15000, imageUrl: '/images/menus/bihun-ati-ampela.png' }, 
        { name: 'Bihun Ayam Suwir', price: 15000, imageUrl: '/images/menus/bihun-ayam-suwir.png' },
      ],
    },
    {
      categoryName: 'Capcay Goreng/Rebus',
      slug: 'capcay-goreng-rebus',
      items: [
        { name: 'Capcay Chiken Katsu', price: 25000, imageUrl: '/images/menus/capcay-katsu.png' },
        { name: 'Capcay Ati Ampela + Ayam', price: 20000, imageUrl: '/images/menus/capcay-ati-ayam.png' },
        { name: 'Capcay Ati Ampela', price: 15000, imageUrl: '/images/menus/capcay-ati-ampela.png' },
        { name: 'Capcay Ayam Suwir', price: 15000, imageUrl: '/images/menus/capcay-ayam-suwir.png' },
      ],
    },
  ]

  // 3. Loop Simpan Kategori & Menu
  for (const cat of menuData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.categoryName },
      create: {
        name: cat.categoryName,
        slug: cat.slug,
      },
    })

    console.log(`📁 Kategori Ready: ${category.name}`)

    for (const item of cat.items) {
      // Cari apakah menu sudah ada
      const existingMenu = await prisma.menu.findFirst({
        where: {
          name: item.name,
          categoryId: category.id,
        },
      })

      if (existingMenu) {
        // Update jika sudah ada
        await prisma.menu.update({
          where: { id: existingMenu.id },
          data: {
            price: item.price,
            imageUrl: item.imageUrl,
            isAvailable: true,
            isBestSeller: item.isBestSeller || false,
          },
        })
      } else {
        // Buat baru jika belum ada
        await prisma.menu.create({
          data: {
            categoryId: category.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            isAvailable: true,
            isBestSeller: item.isBestSeller || false,
          },
        })
      }
    }
  }

  console.log('🎉 Seeding Menu Sukses 100%!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })