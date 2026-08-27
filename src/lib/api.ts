import { http } from './http'
import type {
  AuthToken,
  CartResponse,
  Category,
  CommonResponse,
  DeliveryOption,
  MemberInfo,
  OAuthLoginResult,
  OrderCreateResponse,
  OrderDetail,
  OrderStatusChangeResponse,
  PageResponse,
  PaymentConfirmResponse,
  ProductDetail,
  ProductSummary,
  OrderSummary,
} from '../types'

function unwrap<T>(data: CommonResponse<T>): T {
  if (data.data === null) {
    throw new Error(data.resultMsg)
  }
  return data.data
}

export const productApi = {
  list: async (params: { categoryId?: number; keyword?: string; page?: number; size?: number }) => {
    const res = await http.get<CommonResponse<PageResponse<ProductSummary>>>('/api/v1/products', { params })
    return unwrap(res.data)
  },
  get: async (productId: number) => {
    const res = await http.get<CommonResponse<ProductDetail>>(`/api/v1/products/${productId}`)
    return unwrap(res.data)
  },
}

export const categoryApi = {
  list: async () => {
    const res = await http.get<CommonResponse<Category[]>>('/api/v1/categories')
    return unwrap(res.data)
  },
}

export const deliveryOptionApi = {
  list: async () => {
    const res = await http.get<CommonResponse<DeliveryOption[]>>('/api/v1/delivery-options')
    return unwrap(res.data)
  },
}

export const orderApi = {
  create: async (deliveryOptionId: number, items: { productOptionId: number; count: number }[]) => {
    const res = await http.post<CommonResponse<OrderCreateResponse>>('/api/v1/orders', {
      deliveryOptionId,
      items,
    })
    return unwrap(res.data)
  },
  list: async (page: number, size: number) => {
    const res = await http.get<CommonResponse<PageResponse<OrderSummary>>>('/api/v1/orders', {
      params: { page, size },
    })
    return unwrap(res.data)
  },
  get: async (orderId: number) => {
    const res = await http.get<CommonResponse<OrderDetail>>(`/api/v1/orders/${orderId}`)
    return unwrap(res.data)
  },
  cancel: async (orderId: number) => {
    const res = await http.post<CommonResponse<OrderStatusChangeResponse>>(`/api/v1/orders/${orderId}/cancel`)
    return unwrap(res.data)
  },
  requestReturn: async (orderId: number) => {
    const res = await http.post<CommonResponse<OrderStatusChangeResponse>>(`/api/v1/orders/${orderId}/return`)
    return unwrap(res.data)
  },
}

export const paymentApi = {
  confirm: async (paymentKey: string, orderId: string, amount: number) => {
    const res = await http.post<CommonResponse<PaymentConfirmResponse>>('/api/v1/payments/confirm', {
      paymentKey,
      orderId,
      amount,
    })
    return unwrap(res.data)
  },
}

export const cartApi = {
  get: async () => {
    const res = await http.get<CommonResponse<CartResponse>>('/api/v1/cart')
    return unwrap(res.data)
  },
  addItem: async (productOptionId: number, count: number) => {
    const res = await http.post<CommonResponse<CartResponse>>('/api/v1/cart/items', { productOptionId, count })
    return unwrap(res.data)
  },
  updateCount: async (productOptionId: number, count: number) => {
    const res = await http.patch<CommonResponse<CartResponse>>(`/api/v1/cart/items/${productOptionId}`, { count })
    return unwrap(res.data)
  },
  removeItem: async (productOptionId: number) => {
    const res = await http.delete<CommonResponse<CartResponse>>(`/api/v1/cart/items/${productOptionId}`)
    return unwrap(res.data)
  },
}

export const memberApi = {
  getMyself: async () => {
    const res = await http.get<CommonResponse<MemberInfo>>('/api/v1/members/myself')
    return unwrap(res.data)
  },
}

export const authApi = {
  signUp: async (payload: {
    firstName: string
    lastName: string
    birthDate: string
    phoneNumber: string
    email: string
    password: string
  }) => {
    const res = await http.post<CommonResponse<AuthToken>>('/api/v1/auth/email/sign-up', payload)
    return unwrap(res.data)
  },
  login: async (email: string, password: string) => {
    const res = await http.post<CommonResponse<AuthToken>>('/api/v1/auth/email/login', { email, password })
    return unwrap(res.data)
  },
  oauthExchange: async (code: string) => {
    const res = await http.post<CommonResponse<OAuthLoginResult>>('/api/v1/auth/oauth/exchange', { code })
    return unwrap(res.data)
  },
  oauthSignUp: async (payload: {
    tempToken: string
    lastName: string
    firstName: string
    birthDate: string
    phoneNumber: string
  }) => {
    const res = await http.post<CommonResponse<AuthToken>>('/api/v1/auth/oauth/sign-up', payload)
    return unwrap(res.data)
  },
}
