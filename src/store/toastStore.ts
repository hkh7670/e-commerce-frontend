import { create } from 'zustand'

interface ToastState {
  message: string | null
  show: (message: string) => void
  hide: () => void
}

let hideTimer: ReturnType<typeof setTimeout> | null = null

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  show: (message) => {
    if (hideTimer) {
      clearTimeout(hideTimer)
    }
    set({ message })
    hideTimer = setTimeout(() => set({ message: null }), 3000)
  },
  hide: () => {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    set({ message: null })
  },
}))
