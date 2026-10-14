import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ReviewForm } from '../components/ReviewForm'
import { orderApi, reviewApi } from '../lib/api'
import { useToastStore } from '../store/toastStore'
import type { OrderDetail, OrderItem, OrderStatus } from '../types'

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

export function OrderDetailPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [writingOrderItemId, setWritingOrderItemId] = useState<number | null>(null)

  const load = () => {
    if (!orderId) return
    setLoading(true)
    orderApi
      .get(Number(orderId))
      .then(setOrder)
      .finally(() => setLoading(false))
  }

  useEffect(load, [orderId])

  const handleCancel = async () => {
    if (!orderId || !confirm('주문을 취소하시겠습니까?')) return
    setActionLoading(true)
    setError(null)
    try {
      await orderApi.cancel(Number(orderId))
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문 취소에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReturn = async () => {
    if (!orderId || !confirm('반품을 요청하시겠습니까?')) return
    setActionLoading(true)
    setError(null)
    try {
      await orderApi.requestReturn(Number(orderId))
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : '반품 요청에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateReview = async (orderItemId: number, rating: number, content: string) => {
    const review = await reviewApi.create(orderItemId, { rating, content, imageUrl: null })
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            itemList: prev.itemList.map((item) =>
              item.orderItemId === orderItemId ? { ...item, reviewId: review.reviewId } : item,
            ),
          }
        : prev,
    )
    setWritingOrderItemId(null)
    useToastStore.getState().show('후기가 등록되었습니다.')
  }

  const renderReviewAction = (item: OrderItem) => {
    if (item.reviewId !== null) {
      return (
        <Link to="/account/reviews" className="btn btn-outline btn-sm">
          내 후기 보기
        </Link>
      )
    }
    if (writingOrderItemId === item.orderItemId) {
      return (
        <ReviewForm
          submitLabel="후기 등록"
          onSubmit={(rating, content) => handleCreateReview(item.orderItemId, rating, content)}
          onCancel={() => setWritingOrderItemId(null)}
        />
      )
    }
    return (
      <button
        className="btn btn-outline btn-sm"
        onClick={() => setWritingOrderItemId(item.orderItemId)}
      >
        후기 쓰기
      </button>
    )
  }

  if (loading) {
    return <div className="loading-state">불러오는 중...</div>
  }

  if (!order) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>주문을 찾을 수 없습니다</h2>
        </div>
      </div>
    )
  }

  const canCancel = order.status === 'PENDING_PAYMENT' || order.status === 'PAID'
  const canReturn = order.status === 'DELIVERED'
  const canReview = order.status === 'DELIVERED'

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', maxWidth: 760 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 'var(--space-5)' }}>주문 상세</h1>

      {error && <div className="error-banner">{error}</div>}

      <div className="order-card">
        <div className="order-card__header">
          <span>주문번호 {order.orderUid}</span>
          <span className={`badge ${STATUS_BADGE_CLASS[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <div style={{ padding: 'var(--space-5)' }}>
          {order.itemList.map((item) => (
            <div key={item.orderItemId}>
              <div className="summary-row">
                <span>
                  {item.productName} ({item.optionName}) x {item.count}
                </span>
                <span>{(item.price * item.count).toLocaleString()}원</span>
              </div>
              {canReview && <div className="order-item-review">{renderReviewAction(item)}</div>}
            </div>
          ))}
          <div className="summary-row">
            <span>배송비</span>
            <span>{order.deliveryPrice.toLocaleString()}원</span>
          </div>
          {order.couponDiscountPrice > 0 && (
            <div className="summary-row">
              <span>쿠폰 할인</span>
              <span>-{order.couponDiscountPrice.toLocaleString()}원</span>
            </div>
          )}
          {order.pointDiscountPrice > 0 && (
            <div className="summary-row">
              <span>포인트 사용</span>
              <span>-{order.pointDiscountPrice.toLocaleString()}원</span>
            </div>
          )}
          <div className="summary-row total">
            <span>총 결제금액</span>
            <span>{order.totalPrice.toLocaleString()}원</span>
          </div>
        </div>
      </div>

      {(canCancel || canReturn) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-4)',
          }}
        >
          {canCancel && (
            <button className="btn btn-outline" disabled={actionLoading} onClick={handleCancel}>
              주문 취소
            </button>
          )}
          {canReturn && (
            <button className="btn btn-outline" disabled={actionLoading} onClick={handleReturn}>
              반품 요청
            </button>
          )}
        </div>
      )}
    </div>
  )
}
