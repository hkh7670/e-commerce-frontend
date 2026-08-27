import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

export function CartPage() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const items = useCartStore((state) => state.items)
  const selectedProductOptionIds = useCartStore((state) => state.selectedProductOptionIds)
  const loading = useCartStore((state) => state.loading)
  const error = useCartStore((state) => state.error)
  const pendingProductOptionId = useCartStore((state) => state.pendingProductOptionId)
  const fetchCart = useCartStore((state) => state.fetchCart)
  const updateCount = useCartStore((state) => state.updateCount)
  const removeItem = useCartStore((state) => state.removeItem)
  const toggleSelect = useCartStore((state) => state.toggleSelect)
  const selectAll = useCartStore((state) => state.selectAll)
  const deselectAll = useCartStore((state) => state.deselectAll)

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart().catch(() => {})
    }
  }, [isLoggedIn, fetchCart])

  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>로그인이 필요합니다</h2>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            로그인하러 가기
          </Link>
        </div>
      </div>
    )
  }

  if (loading && items.length === 0) {
    return <div className="loading-state">불러오는 중...</div>
  }

  if (error && items.length === 0) {
    return (
      <div className="container">
        <div className="error-banner">{error}</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>장바구니가 비어있습니다</h2>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    )
  }

  const selectableItems = items.filter((item) => !item.soldOut)
  const allSelected =
    selectableItems.length > 0 &&
    selectableItems.every((item) => selectedProductOptionIds.includes(item.productOptionId))
  const selectedItems = items.filter((item) => selectedProductOptionIds.includes(item.productOptionId))
  const productTotal = selectedItems.reduce((sum, item) => sum + item.price * item.count, 0)

  const handleToggleAll = () => {
    if (allSelected) {
      deselectAll()
    } else {
      selectAll()
    }
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 'var(--space-5)' }}>장바구니</h1>

      {error && <div className="error-banner">{error}</div>}

      <div className="cart-layout">
        <div>
          <div className="cart-select-all">
            <label>
              <input type="checkbox" checked={allSelected} onChange={handleToggleAll} />
              전체선택
            </label>
          </div>

          {items.map((item) => (
            <div className="cart-item" key={item.productOptionId}>
              <input
                type="checkbox"
                className="cart-item__checkbox"
                checked={selectedProductOptionIds.includes(item.productOptionId)}
                disabled={item.soldOut}
                onChange={() => toggleSelect(item.productOptionId)}
              />
              <div className="cart-item__image">
                {item.imageUrl && <img src={item.imageUrl} alt={item.productName} />}
              </div>
              <div className="cart-item__info">
                <p className="cart-item__name">
                  {item.productName} ({item.optionName})
                </p>
                {item.soldOut && <span className="stock-badge">품절</span>}
                <div className="qty-stepper" style={{ marginBottom: 'var(--space-3)' }}>
                  <button
                    disabled={item.soldOut || item.count <= 1 || pendingProductOptionId === item.productOptionId}
                    onClick={() => updateCount(item.productOptionId, item.count - 1).catch(() => {})}
                  >
                    -
                  </button>
                  <span>{item.count}</span>
                  <button
                    disabled={item.soldOut || pendingProductOptionId === item.productOptionId}
                    onClick={() => updateCount(item.productOptionId, item.count + 1).catch(() => {})}
                  >
                    +
                  </button>
                </div>
                <button
                  className="cart-item__remove"
                  disabled={pendingProductOptionId === item.productOptionId}
                  onClick={() => removeItem(item.productOptionId).catch(() => {})}
                >
                  삭제
                </button>
              </div>
              <strong className="price__won">{(item.price * item.count).toLocaleString()}</strong>
            </div>
          ))}
        </div>

        <div className="summary-card">
          <div className="summary-row">
            <span>상품금액</span>
            <span>{productTotal.toLocaleString()}원</span>
          </div>
          <div className="summary-row">
            <span>배송비</span>
            <span>주문 시 선택</span>
          </div>
          <div className="summary-row total">
            <span>총 상품금액</span>
            <span>{productTotal.toLocaleString()}원</span>
          </div>
          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 'var(--space-4)' }}
            disabled={selectedItems.length === 0}
            onClick={() => navigate('/checkout')}
          >
            주문하기
          </button>
        </div>
      </div>
    </div>
  )
}
