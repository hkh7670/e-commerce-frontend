import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deliveryOptionApi, orderApi } from '../lib/api'
import { useCartStore } from '../store/cartStore'
import type { DeliveryOption } from '../types'

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY ?? 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const selectedProductOptionIds = useCartStore((state) => state.selectedProductOptionIds)
  const selectedItems = items.filter((item) => selectedProductOptionIds.includes(item.productOptionId))
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([])
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedItems.length === 0) {
      navigate('/cart')
      return
    }
    deliveryOptionApi.list().then((options) => {
      setDeliveryOptions(options)
      setSelectedOptionId(options[0]?.id ?? null)
    })
  }, [selectedItems.length, navigate])

  const productTotal = selectedItems.reduce((sum, item) => sum + item.price * item.count, 0)
  const deliveryPrice = deliveryOptions.find((o) => o.id === selectedOptionId)?.price ?? 0
  const totalPrice = productTotal + deliveryPrice

  const handlePay = async () => {
    if (!selectedOptionId) return
    setSubmitting(true)
    setError(null)
    try {
      const order = await orderApi.create(
        selectedOptionId,
        selectedItems.map((item) => ({ productOptionId: item.productOptionId, count: item.count })),
      )

      const tossPayments = window.TossPayments?.(TOSS_CLIENT_KEY)
      if (!tossPayments) {
        throw new Error('결제 모듈을 불러오지 못했습니다.')
      }

      await tossPayments.requestPayment('CARD', {
        amount: order.totalPrice,
        orderId: order.orderUid,
        orderName:
          selectedItems.length > 1
            ? `${selectedItems[0].productName} 외 ${selectedItems.length - 1}건`
            : selectedItems[0].productName,
        successUrl: `${window.location.origin}/orders/complete`,
        failUrl: `${window.location.origin}/checkout`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문/결제 요청에 실패했습니다.')
      setSubmitting(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 'var(--space-5)' }}>주문/결제</h1>

      {error && <div className="error-banner">{error}</div>}

      <div className="summary-card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="section-heading">
          <h2 style={{ fontSize: 16 }}>주문 상품 {selectedItems.length}건</h2>
        </div>
        {selectedItems.map((item) => (
          <div className="summary-row" key={item.productOptionId}>
            <span>
              {item.productName} ({item.optionName}) x {item.count}
            </span>
            <span>{(item.price * item.count).toLocaleString()}원</span>
          </div>
        ))}
      </div>

      <div className="summary-card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="section-heading">
          <h2 style={{ fontSize: 16 }}>배송 옵션</h2>
        </div>
        <div className="option-list">
          {deliveryOptions.map((option) => (
            <div
              key={option.id}
              className={`option-item${selectedOptionId === option.id ? ' selected' : ''}`}
              onClick={() => setSelectedOptionId(option.id)}
            >
              <span>{option.name}</span>
              <strong>{option.price.toLocaleString()}원</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-row">
          <span>상품금액</span>
          <span>{productTotal.toLocaleString()}원</span>
        </div>
        <div className="summary-row">
          <span>배송비</span>
          <span>{deliveryPrice.toLocaleString()}원</span>
        </div>
        <div className="summary-row total">
          <span>총 결제금액</span>
          <span>{totalPrice.toLocaleString()}원</span>
        </div>
        <button
          className="btn btn-primary btn-block"
          style={{ marginTop: 'var(--space-4)' }}
          disabled={submitting || !selectedOptionId}
          onClick={handlePay}
        >
          {submitting ? '처리 중...' : `${totalPrice.toLocaleString()}원 결제하기`}
        </button>
      </div>
    </div>
  )
}
