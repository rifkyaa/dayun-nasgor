'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, Plus, RefreshCw, Pencil, Trash2, X, AlertCircle } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface MenuItem {
  id: string
  name: string
  category?: string | null
  categoryRelation?: { name: string } | null
  price: number
  isAvailable: boolean
  image: string
  description?: string | null
}

export default function KelolaMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('SEMUA')

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Nasi Goreng',
    price: '',
    image: '',
    description: '',
    isAvailable: true,
  })

  // 1. Fetch Menu dari Database MySQL
  const fetchMenus = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/menu?all=true')
      if (res.ok) {
        const data = await res.json()
        setMenus(data)
      }
    } catch (err) {
      showToast.error('Gagal Mengambil Data', 'Terjadi kesalahan saat memuat menu.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  // 2. Toggle Status Stok Tersedia / Habis ke Database
  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus

    // Optimistic UI Update
    setMenus((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: newStatus } : item))
    )

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus }),
      })

      if (!res.ok) throw new Error('Gagal update status')

      if (newStatus) {
        showToast.success('Stok Diperbarui', 'Menu diset TERSEDIA.')
      } else {
        showToast.warning('Stok Diperbarui', 'Menu diset HABIS.')
      }
    } catch (err) {
      // Revert status jika gagal
      setMenus((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isAvailable: currentStatus } : item))
      )
      showToast.error('Gagal Mengubah Status', 'Terjadi kesalahan pada server.')
    }
  }

  // 3. Open Modal for Create or Edit
  const handleOpenModal = (menu?: MenuItem) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        name: menu.name,
        category: getCategoryName(menu), // <-- Pakai helper ini agar bertipe string pasti
        price: String(menu.price),
        image: menu.image || '',
        description: menu.description || '',
        isAvailable: menu.isAvailable,
      })
    } else {
      setEditingMenu(null)
      setFormData({
        name: '',
        category: 'Nasi Goreng',
        price: '',
        image: '',
        description: '',
        isAvailable: true,
      })
    }
    setIsModalOpen(true)
  }

  // 4. Submit Create / Update Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.price) {
      showToast.warning('Form Belum Lengkap', 'Nama dan Harga menu wajib diisi.')
      return
    }

    try {
      setIsSubmitting(true)
      const url = editingMenu ? `/api/menu/${editingMenu.id}` : '/api/menu'
      const method = editingMenu ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
        }),
      })

      if (!res.ok) throw new Error('Gagal menyimpan menu')

      showToast.success(
        editingMenu ? 'Menu Diperbarui!' : 'Menu Baru Ditambahkan!',
        `Berhasil menyimpan ${formData.name}.`
      )

      setIsModalOpen(false)
      fetchMenus()
    } catch (err) {
      showToast.error('Gagal Menyimpan', 'Terjadi kesalahan pada server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 5. Hapus Menu
  const handleDeleteMenu = (id: string, name: string) => {
    showToast.confirmCancel(
      'Hapus Menu?',
      `Apakah Anda yakin ingin menghapus "${name}" dari catalog?`,
      async () => {
        try {
          const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Gagal menghapus')

          showToast.error('Menu Dihapus', `Menu ${name} berhasil dihapus.`)
          fetchMenus()
        } catch (err) {
          showToast.error('Gagal Menghapus', 'Menu tidak dapat dihapus.')
        }
      }
    )
  }

  // Helper ekstrak nama kategori secara fleksibel
  const getCategoryName = (item: any): string => {
    if (!item) return 'Lainnya'

    if (typeof item.category === 'object' && item.category !== null && item.category.name) {
      return item.category.name
    }

    if (item.categoryRelation?.name) {
      return item.categoryRelation.name
    }

    if (typeof item.category === 'string' && item.category.trim() !== '') {
      return item.category
    }

    return 'Lainnya'
  }

  // Ekstrak daftar kategori unik secara dinamis
  const categoriesList = [
    'SEMUA',
    ...Array.from(
      new Set(
        menus.map((m) => getCategoryName(m))
      )
    ),
  ]

  // Filter Query Logic
  const filteredMenus = menus.filter((item) => {
    const itemCat = getCategoryName(item)
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itemCat.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchCategory = selectedCategory === 'SEMUA' || itemCat === selectedCategory
    return matchSearch && matchCategory
  })

  // Helper mengecek ketersediaan stok secara aman
  const checkIsAvailable = (item: any): boolean => {
    if (item === null || item === undefined) return false
    // Cek apakah field bernama isAvailable, available, atau is_available
    if (typeof item.isAvailable === 'boolean') return item.isAvailable
    if (typeof item.available === 'boolean') return item.available
    if (typeof item.is_available === 'boolean') return item.is_available
    // Default jika tidak ada nilai boolean: anggap true (Tersedia)
    return true
  }
  

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Menu & Stok</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur ketersediaan porsi, harga, dan catalog menu Dayun Nasgor.
          </p>
        </div>

        {/* Right Controls: Search + Refresh + Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchMenus}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-slate-700 transition-all shadow-2xs cursor-pointer"
            title="Refresh Catalog"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#7A1517]' : ''} />
          </button>

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] transition-all shadow-2xs"
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center gap-2 bg-[#7A1517] hover:bg-[#5B0E10] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus size={16} />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {categoriesList.map((cat, index) => (
          <button
            key={`${cat}-${index}`} // <-- KUNCI FIX: Memastikan key 100% Unik & Tidak Duplikat
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#7A1517] text-white shadow-2xs'
                : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Cards Catalog */}
      {isLoading && menus.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <RefreshCw size={28} className="animate-spin text-[#7A1517] mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">Memuat catalog menu...</p>
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 space-y-2">
          <AlertCircle size={36} className="text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Menu Tidak Ditemukan</p>
          <p className="text-xs text-slate-400">Coba gunakan kata kunci pencarian lainnya.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMenus.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                {/* Image Container with Category Badge & Action Buttons */}
                <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={item.image || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    fill
                    className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                      !item.isAvailable ? 'grayscale opacity-75' : ''
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />

                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-3 py-1 rounded-lg shadow-2xs">
                    {getCategoryName(item)}
                  </span>

                  {/* Edit & Delete Quick Overlay Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 bg-white/90 hover:bg-white text-slate-700 hover:text-[#7A1517] rounded-lg shadow-2xs transition-colors cursor-pointer"
                      title="Edit Menu"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(item.id, item.name)}
                      className="p-1.5 bg-white/90 hover:bg-white text-slate-700 hover:text-red-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
                      title="Hapus Menu"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Info Details */}
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h3>
                  <p className="text-xs font-extrabold text-[#7A1517]">
                    Rp {(item.price ?? 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Bottom Stock Switch Toggle */}
              <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex items-center justify-between">
                {/* Badge Status */}
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                    checkIsAvailable(item)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {checkIsAvailable(item) ? 'Tersedia' : 'Habis'}
                </span>

                {/* Saklar Toggle */}
                <button
                  type="button"
                  onClick={() => toggleAvailability(item.id, checkIsAvailable(item))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    checkIsAvailable(item) ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      checkIsAvailable(item) ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TAMBAH / EDIT MENU */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">
                {editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Menu</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Nasi Goreng Spesial Dayun"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517] cursor-pointer"
                  >
                    <option value="Nasi Goreng">Nasi Goreng</option>
                    <option value="Otokowok">Otokowok</option>
                    <option value="Mie Goreng">Mie Goreng</option>
                    <option value="Kwetiaw">Kwetiaw</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Tambahan">Tambahan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="20000"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Foto Menu</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1517]/20 focus:border-[#7A1517]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#7A1517] hover:bg-[#5B0E10] text-white rounded-xl font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : editingMenu ? 'Simpan Perubahan' : 'Tambah Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}