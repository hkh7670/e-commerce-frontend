import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cartApi, orderApi, paymentApi } from '../lib/api'
import { useCartStore } from '../store/cartStore'
import { useToastStore } from '../store/toastStore'

type Status = 'confirming' | 'success' | 'error'

export function OrderCompletePage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<Status>('confirming')
  const [errorMessage, setErrorMessage] = useState('')
  const hasConfirmedRef = useRef(false)

  useEffect(() => {
    if (hasConfirmedRef.current) return
    hasConfirmedRef.current = true

    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) {
      setStatus('error')
      setErrorMessage('결제 정보가 올바르지 않습니다.')
      return
    }

    paymentApi
      .confirm(paymentKey, orderId, Number(amount))
      .then(async (confirmResult) => {
        setStatus('success')
        try {
          const order = await orderApi.get(confirmResult.orderId)
          await Promise.all(order.itemList.map((item) => cartApi.removeItem(item.productOptionId)))
          await useCartStore.getState().fetchCart()
        } catch {
          useToastStore.getState().show('장바구니 정리 중 문제가 발생했습니다.')
        }
      })
      .catch((err) => {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : '결제 승인에 실패했습니다.')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'confirming') {
    return <div className="loading-state">결제를 확인하는 중입니다...</div>
  }

  if (status === 'error') {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>결제 승인에 실패했습니다</h2>
          <p>{errorMessage}</p>
          <Link to="/orders" className="btn btn-outline" style={{ marginTop: 'var(--space-4)' }}>
            주문내역 확인하기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="empty-state">
        <h2>주문이 완료되었습니다</h2>
        <p>결제가 정상적으로 승인되었습니다.</p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-5)' }}>
          <Link to="/orders" className="btn btn-primary">
            주문내역 보기
          </Link>
          <Link to="/products" className="btn btn-outline">
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  )
}
