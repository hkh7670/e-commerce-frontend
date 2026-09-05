import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderApi } from '../lib/api'
import type { OrderStatus, OrderSummary, PageResponse } from '../types'

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '결제대기',
  PAID: '결제완료',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소됨',
  RETURNING: '반품중',
  RETURNED: '반품완료',
}

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'badge-pending',
  PAID: 'badge-paid',
  SHIPPING: 'badge-shipping',
  DELIVERED: 'badge-delivered',
  CANCELLED: 'badge-cancelled',
  RETURNING: 'badge-returning',
  RETURNED: 'badge-returned',
}

const PAGE_SIZE = 10

export function MyOrdersPage() {
  const [page, setPage] = useState(0)
  const [orderPage, setOrderPage] = useState<PageResponse<OrderSummary> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    orderApi
      .list(page, PAGE_SIZE)
      .then(setOrderPage)
      .finally(() => setLoading(false))
  }, [page])

  if (loading) {
    return <div className="loading-state">불러오는 중...</div>
  }

  if (!orderPage || orderPage.content.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>주문 내역이 없습니다</h2>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            쇼핑하러 가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', maxWidth: 760 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 'var(--space-5)' }}>주문내역</h1>

      {orderPage.content.map((order) => (
        <div className="order-card" key={order.orderId}>
          <div className="order-card__header">
            <span>주문번호 {order.orderUid}</span>
            <span className={`badge ${STATUS_BADGE_CLASS[order.status]}`}>
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          <div className="order-card__body">
            <div>
              <p style={{ fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                {order.representativeProductName}
                {order.itemCount > 1 && ` 외 ${order.itemCount - 1}건`}
              </p>
              <p className="price__won" style={{ fontWeight: 800, fontSize: 16 }}>
                {order.totalPrice.toLocaleString()}
              </p>
            </div>
            <div className="order-card__actions">
              <Link to={`/orders/${order.orderId}`} className="btn btn-outline btn-sm">
                상세보기
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          이전
        </button>
        <button className="active">{page + 1}</button>
        <button disabled={!orderPage.hasNext} onClick={() => setPage((p) => p + 1)}>
          다음
        </button>
      </div>
    </div>
  )
}
