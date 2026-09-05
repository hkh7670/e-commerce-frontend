import { create } from 'zustand'
import { cartApi } from '../lib/api'
import { getApiErrorMessage } from '../lib/http'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  selectedProductOptionIds: number[]
  knownProductOptionIds: number[]
  loading: boolean
  pendingProductOptionId: number | null
  error: string | null
  fetchCart: () => Promise<void>
  addItem: (productOptionId: number, count: number) => Promise<void>
  updateCount: (productOptionId: number, count: number) => Promise<void>
  removeItem: (productOptionId: number) => Promise<void>
  toggleSelect: (productOptionId: number) => void
  selectAll: () => void
  deselectAll: () => void
  reset: () => void
}

interface Selection {
  selectedProductOptionIds: number[]
  knownProductOptionIds: number[]
}

function reconcileSelection(
  items: CartItem[],
  prevSelected: number[],
  prevKnown: number[],
): Selection {
  const prevSelectedSet = new Set(prevSelected)
  const prevKnownSet = new Set(prevKnown)

  const selectedProductOptionIds = items
    .filter(
      (item) =>
        !item.soldOut &&
        (prevSelectedSet.has(item.productOptionId) || !prevKnownSet.has(item.productOptionId)),
    )
    .map((item) => item.productOptionId)

  const knownProductOptionIds = items.map((item) => item.productOptionId)

  return { selectedProductOptionIds, knownProductOptionIds }
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  selectedProductOptionIds: [],
  knownProductOptionIds: [],
  loading: false,
  pendingProductOptionId: null,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null })
    try {
      const response = await cartApi.get()
      const selection = reconcileSelection(
        response.items,
        get().selectedProductOptionIds,
        get().knownProductOptionIds,
      )
      set({ items: response.items, ...selection, loading: false })
    } catch (error) {
      set({ loading: false, error: getApiErrorMessage(error, '장바구니를 불러오지 못했습니다.') })
      throw error
    }
  },

  addItem: async (productOptionId, count) => {
    set({ pendingProductOptionId: productOptionId, error: null })
    try {
      const response = await cartApi.addItem(productOptionId, count)
      const selection = reconcileSelection(
        response.items,
        get().selectedProductOptionIds,
        get().knownProductOptionIds,
      )
      set({ items: response.items, ...selection, pendingProductOptionId: null })
    } catch (error) {
      set({
        pendingProductOptionId: null,
        error: getApiErrorMessage(error, '장바구니에 담지 못했습니다.'),
      })
      throw error
    }
  },

  updateCount: async (productOptionId, count) => {
    set({ pendingProductOptionId: productOptionId, error: null })
    try {
      const response = await cartApi.updateCount(productOptionId, count)
      const selection = reconcileSelection(
        response.items,
        get().selectedProductOptionIds,
        get().knownProductOptionIds,
      )
      set({ items: response.items, ...selection, pendingProductOptionId: null })
    } catch (error) {
      set({
        pendingProductOptionId: null,
        error: getApiErrorMessage(error, '수량을 변경하지 못했습니다.'),
      })
      throw error
    }
  },

  removeItem: async (productOptionId) => {
    set({ pendingProductOptionId: productOptionId, error: null })
    try {
      const response = await cartApi.removeItem(productOptionId)
      const selection = reconcileSelection(
        response.items,
        get().selectedProductOptionIds,
        get().knownProductOptionIds,
      )
      set({ items: response.items, ...selection, pendingProductOptionId: null })
    } catch (error) {
      set({
        pendingProductOptionId: null,
        error: getApiErrorMessage(error, '삭제하지 못했습니다.'),
      })
      throw error
    }
  },

  toggleSelect: (productOptionId) => {
    const item = get().items.find((i) => i.productOptionId === productOptionId)
    if (!item || item.soldOut) {
      return
    }
    const selected = get().selectedProductOptionIds
    set({
      selectedProductOptionIds: selected.includes(productOptionId)
        ? selected.filter((id) => id !== productOptionId)
        : [...selected, productOptionId],
    })
  },

  selectAll: () => {
    set({
      selectedProductOptionIds: get()
        .items.filter((item) => !item.soldOut)
        .map((item) => item.productOptionId),
    })
  },

  deselectAll: () => {
    set({ selectedProductOptionIds: [] })
  },

  reset: () => {
    set({
      items: [],
      selectedProductOptionIds: [],
      knownProductOptionIds: [],
      loading: false,
      pendingProductOptionId: null,
      error: null,
    })
  },
}))
