import { toast as sonnerToast } from 'sonner'

export const showToast = {
  // Notifikasi Sukses
  success: (title: string, description?: string) => {
    sonnerToast.success(title, {
      description,
      style: {
        background: '#F0FDF4', // Emerald Soft
        borderColor: '#16A34A',
        color: '#14532D',
      },
    })
  },

  // Notifikasi Info / Mulai Masak
  info: (title: string, description?: string) => {
    sonnerToast.info(title, {
      description,
      style: {
        background: '#FDFBF9', // Warm Cream
        borderColor: '#7A1517', // Maroon Dayun
        color: '#7A1517',
      },
    })
  },

  // Notifikasi Peringatan / Warning
  warning: (title: string, description?: string) => {
    sonnerToast.warning(title, {
      description,
      style: {
        background: '#FFFBEB', // Amber Soft
        borderColor: '#F59E0B',
        color: '#78350F',
      },
    })
  },

  // Notifikasi Error / Gagal
  error: (title: string, description?: string) => {
    sonnerToast.error(title, {
      description,
      style: {
        background: '#FEF2F2', // Red Soft
        borderColor: '#DC2626',
        color: '#7F1D1D',
      },
    })
  },

  // Custom Konfirmasi Pembatalan (Modal-like Toast)
  confirmCancel: (title: string, description: string, onConfirm: () => void) => {
    sonnerToast(title, {
      description,
      duration: 6000,
      style: {
        background: '#FDFBF9',
        borderColor: '#7A1517',
        borderWidth: '1.5px',
      },
      action: {
        label: 'Ya, Lanjutkan',
        onClick: onConfirm,
      },
      cancel: {
        label: 'Kembali',
        onClick: () => {},
      },
    })
  },
}