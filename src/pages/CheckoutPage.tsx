import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { couponApi, deliveryOptionApi, orderApi, pointApi } from '../lib/api'
import { getApiErrorMessage } from '../lib/http'
import { useCartStore } from '../store/cartStore'
import type { DeliveryOption, MemberCoupon } from '../types'

const TOSS_CLIENT_KEY =
  import.meta.env.VITE_TOSS_CLIENT_KEY ?? 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'

function calculateCouponDiscount(coupon: MemberCoupon | undefined, productTotal: number): number {
  if (!coupon) return 0
  if (coupon.discountType === 'FIXED') {
    return Math.min(coupon.discountValue, productTotal)
  }
  const percentageDiscount = Math.floor((productTotal * coupon.discountValue) / 100)
  return coupon.maxDiscountPrice !== null
    ? Math.min(percentageDiscount, coupon.maxDiscountPrice)
    : percentageDiscount
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const selectedProductOptionIds = useCartStore((state) => state.selectedProductOptionIds)
  const selectedItems = items.filter((item) =>
    selectedProductOptionIds.includes(item.productOptionId),
  )
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([])
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)
  const [coupons, setCoupons] = useState<MemberCoupon[]>([])
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null)
  const [pointBalance, setPointBalance] = useState(0)
  const [usePointAmount, setUsePointAmount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedItems.length === 0) {
      navigate('/cart')
      return
    }
    Promise.all([deliveryOptionApi.list(), couponApi.list(), pointApi.getBalance()]).then(
      ([options, couponList, points]) => {
        setDeliveryOptions(options)
        setSelectedOptionId(options[0]?.id ?? null)
        setCoupons(couponList)
        setPointBalance(points.usableAmount)
      },
    )
  }, [selectedItems.length, navigate])

  const productTotal = selectedItems.reduce((sum, item) => sum + item.price * item.count, 0)
  const deliveryPrice = deliveryOptions.find((o) => o.id === selectedOptionId)?.price ?? 0
  const selectedCoupon = coupons.find((c) => c.memberCouponId === selectedCouponId)
  const couponDiscount = calculateCouponDiscount(selectedCoupon, productTotal)
  const maxUsablePoint = Math.max(
    0,
    Math.min(pointBalance, productTotal + deliveryPrice - couponDiscount - 1),
  )
  const pointDiscount = Math.min(usePointAmount, maxUsablePoint)
  const totalPrice = productTotal + deliveryPrice - couponDiscount - pointDiscount

  const handleSelectCoupon = (couponId: number | null) => {
    setSelectedCouponId(couponId)
    const coupon = coupons.find((c) => c.memberCouponId === couponId)
    const discount = calculateCouponDiscount(coupon, productTotal)
    const cap = Math.max(0, Math.min(pointBalance, productTotal + deliveryPrice - discount - 1))
    setUsePointAmount((prev) => Math.min(prev, cap))
  }

  const handlePay = async () => {
    if (!selectedOptionId) return
    setSubmitting(true)
    setError(null)
    try {
      const order = await orderApi.create(
        selectedOptionId,
        selectedItems.map((item) => ({ productOptionId: item.productOptionId, count: item.count })),
        selectedCouponId,
        pointDiscount,
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
      setError(getApiErrorMessage(err, '주문/결제 요청에 실패했습니다.'))
      setSubmitting(false)
      try {
        const [refreshedCoupons, refreshedPoints] = await Promise.all([
          couponApi.list(),
          pointApi.getBalance(),
        ])
        setCoupons(refreshedCoupons)
        setPointBalance(refreshedPoints.usableAmount)
        if (!refreshedCoupons.some((c) => c.memberCouponId === selectedCouponId)) {
          setSelectedCouponId(null)
        }
      } catch {
        // 목록 갱신 실패는 무시 — 원래 에러 메시지가 이미 표시됨
      }
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

      <div className="summary-card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="section-heading">
          <h2 style={{ fontSize: 16 }}>쿠폰</h2>
        </div>
        {coupons.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            사용 가능한 쿠폰이 없습니다.
          </p>
        ) : (
          <div className="option-list">
            <div
              className={`option-item${selectedCouponId === null ? ' selected' : ''}`}
              onClick={() => handleSelectCoupon(null)}
            >
              <span>쿠폰 사용 안 함</span>
            </div>
            {coupons.map((coupon) => {
              const disabled = productTotal < coupon.minOrderPrice
              return (
                <div
                  key={coupon.memberCouponId}
                  className={`option-item${selectedCouponId === coupon.memberCouponId ? ' selected' : ''}`}
                  onClick={() => !disabled && handleSelectCoupon(coupon.memberCouponId)}
                  style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                >
                  <span>
                    {coupon.couponName}
                    {disabled &&
                      ` (${coupon.minOrderPrice.toLocaleString()}원 이상 구매 시 사용 가능)`}
                  </span>
                  <strong>
                    {coupon.discountType === 'FIXED'
                      ? `${coupon.discountValue.toLocaleString()}원 할인`
                      : `${coupon.discountValue}% 할인`}
                  </strong>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="summary-card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="section-heading">
          <h2 style={{ fontSize: 16 }}>포인트 (보유 {pointBalance.toLocaleString()}원)</h2>
        </div>
        <div className="field">
          <label htmlFor="usePointAmount">사용할 포인트</label>
          <input
            id="usePointAmount"
            type="number"
            min={0}
            max={maxUsablePoint}
            disabled={pointBalance === 0}
            value={usePointAmount}
            onChange={(e) =>
              setUsePointAmount(Math.max(0, Math.min(Number(e.target.value) || 0, maxUsablePoint)))
            }
          />
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
        {couponDiscount > 0 && (
          <div className="summary-row">
            <span>쿠폰 할인</span>
            <span>-{couponDiscount.toLocaleString()}원</span>
          </div>
        )}
        {pointDiscount > 0 && (
          <div className="summary-row">
            <span>포인트 사용</span>
            <span>-{pointDiscount.toLocaleString()}원</span>
          </div>
        )}
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
