export interface SchemaErrorInfo {
  fieldName: string | null
  fieldValue: unknown
  message: string | null
}

export interface SchemaErrorResponse {
  errorList: SchemaErrorInfo[]
}

export interface CommonResponse<T> {
  resultCode: string
  resultMsg: string
  data: T | null
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

export type CategoryLevel = 'LARGE' | 'MEDIUM' | 'SMALL'

export interface Category {
  id: number
  parentId: number | null
  name: string
  level: CategoryLevel
}

export interface ProductSummary {
  id: number
  name: string
  price: number
  imageUrl: string | null
  stockCount: number
  categoryId: number | null
  vendorName: string | null
}

export interface ProductOption {
  id: number
  name: string
  price: number
  stockCount: number
}

export interface ProductDetail {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  productOptions: ProductOption[]
  categoryId: number | null
  categoryName: string | null
  vendorId: number | null
  vendorName: string | null
}

export interface DeliveryOption {
  id: number
  name: string
  price: number
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNING'
  | 'RETURNED'

export interface OrderCreateResponse {
  orderId: number
  orderUid: string
  productTotalPrice: number
  deliveryPrice: number
  totalPrice: number
}

export interface OrderItem {
  productId: number
  productName: string
  productOptionId: number
  optionName: string
  price: number
  count: number
}

export interface OrderDetail {
  orderId: number
  orderUid: string
  productTotalPrice: number
  deliveryPrice: number
  totalPrice: number
  status: OrderStatus
  isPaid: boolean
  itemList: OrderItem[]
}

export interface OrderSummary {
  orderId: number
  orderUid: string
  status: OrderStatus
  totalPrice: number
  representativeProductName: string
  itemCount: number
}

export interface OrderStatusChangeResponse {
  orderId: number
  orderUid: string
  status: OrderStatus
}

export type JoinProvider = 'EMAIL' | 'GOOGLE' | 'KAKAO' | 'NAVER'

export interface MemberInfo {
  firstName: string
  lastName: string
  joinProvider: JoinProvider
}

export interface AuthToken {
  grantType: string
  accessToken: string
  refreshToken: string
}

export type OAuthLoginStatus = 'LOGIN' | 'NEED_SIGN_UP'

export interface OAuthLoginResult {
  status: OAuthLoginStatus
  tempToken: string | null
  accessToken: string | null
  refreshToken: string | null
}

export interface PaymentConfirmResponse {
  paymentId: number
  orderId: number
  orderUid: string
  paymentKey: string
  amount: number
  status: string
  method: string | null
  approvedAt: string | null
}

export interface CartItem {
  productOptionId: number
  productId: number
  productName: string
  optionName: string
  price: number
  imageUrl: string | null
  count: number
  soldOut: boolean
}

export interface CartResponse {
  items: CartItem[]
}
