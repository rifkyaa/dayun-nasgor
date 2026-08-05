import { PrismaClient, Role } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log(' Memulai proses Seeding Data...')

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
  console.log('Admin User Ready:', admin.username)

  // 2. Data Kategori & Menu Asli Dayun Nasgor
  const menuData = [
    {
      categoryName: 'Otokowok',
      slug: 'otokowok',
      items: [
        { name: 'Nasi Otokowok Chiken Katsu', price: 25000, isBestSeller: true },
        { name: 'Nasi Otokowok Ati Ampela + Ayam', price: 20000 },
        { name: 'Nasi Otokowok Ayam Suwir', price: 15000 },
        { name: 'Nasi Otokowok Ati Ampela', price: 15000 },
      ],
    },
    {
      categoryName: 'Nasi Goreng',
      slug: 'nasi-goreng',
      items: [
        { name: 'Nasi Goreng Chiken Katsu', price: 25000, isBestSeller: true },
        { name: 'Nasi Goreng Ati Ampela + Ayam', price: 20000 },
        { name: 'Nasi Goreng Ati Ampela', price: 15000 },
        { name: 'Nasi Goreng Ayam Suwir', price: 15000 },
        { name: 'Nasi Goreng Mawud', price: 15000 },
      ],
    },
    {
      categoryName: 'Mie Goreng/Rebus',
      slug: 'mie-goreng-rebus',
      items: [
        { name: 'Mie Chiken Katsu', price: 25000 },
        { name: 'Mie Ati Ampela + Ayam', price: 20000 },
        { name: 'Mie Ati Ampela', price: 15000 },
        { name: 'Mie Ayam Suwir', price: 15000 },
      ],
    },
    {
      categoryName: 'Kwetiaw Goreng/Rebus',
      slug: 'kwetiaw-goreng-rebus',
      items: [
        { name: 'Kwetiaw Chiken Katsu', price: 25000 },
        { name: 'Kwetiaw Ati Ampela + Ayam', price: 20000 },
        { name: 'Kwetiaw Ati Ampela', price: 15000 },
        { name: 'Kwetiaw Ayam Suwir', price: 15000 },
      ],
    },
    {
      categoryName: 'Bihun Goreng/Rebus',
      slug: 'bihun-goreng-rebus',
      items: [
        { name: 'Bihun Chiken Katsu', price: 25000 },
        { name: 'Bihun Ati Ampela + Ayam', price: 20000 },
        { name: 'Bihun Ati Ampela', price: 15000 },
        { name: 'Bihun Ayam Suwir', price: 15000 },
      ],
    },
    {
      categoryName: 'Capcay Goreng/Rebus',
      slug: 'capcay-goreng-rebus',
      items: [
        { name: 'Capcay Chiken Katsu', price: 25000 },
        { name: 'Capcay Ati Ampela + Ayam', price: 20000 },
        { name: 'Capcay Ati Ampela', price: 15000 },
        { name: 'Capcay Ayam Suwir', price: 15000 },
      ],
    },
  ]

  // 3. Loop untuk Simpan Kategori & Menu ke Database
  for (const cat of menuData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.categoryName },
      create: {
        name: cat.categoryName,
        slug: cat.slug,
      },
    })

    console.log(`Kategori Created: ${category.name}`)

    for (const item of cat.items) {
      await prisma.menu.create({
        data: {
          categoryId: category.id,
          name: item.name,
          price: item.price,
          isAvailable: true,
          isBestSeller: item.isBestSeller || false,
        },
      })
    }
  }

  console.log('Seeding Menu Sukses 100%!')
}

main()
  .catch((e) => {
    console.error('Seeding Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })