import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import type { ProductDetail } from '../types'

export function ProductDetailPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const addItem = useCartStore((state) => state.addItem)
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)
  const [count, setCount] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    productApi
      .get(Number(productId))
      .then((data) => {
        setProduct(data)
        setCount(1)
        setSelectedOptionId(data.productOptions.length === 1 ? data.productOptions[0].id : null)
      })
      .finally(() => setLoading(false))
  }, [productId])

  if (loading) {
    return <div className="loading-state">불러오는 중...</div>
  }

  if (!product) {
    return (
      <div className="empty-state">
        <h2>상품을 찾을 수 없습니다</h2>
      </div>
    )
  }

  const soldOut = product.productOptions.every((option) => option.stockCount === 0)
  const selectedOption = product.productOptions.find((option) => option.id === selectedOptionId) ?? null
  const minPrice = Math.min(...product.productOptions.map((option) => option.price))

  const handleAddToCart = async (): Promise<boolean> => {
    if (!selectedOption) return false
    if (!isLoggedIn) {
      navigate('/login')
      return false
    }
    setError(null)
    try {
      await addItem(selectedOption.id, count)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : '장바구니에 담지 못했습니다.')
      return false
    }
  }

  const handleBuyNow = async () => {
    const added = await handleAddToCart()
    if (added) {
      navigate('/cart')
    }
  }

  return (
    <div className="container">
      <div className="breadcrumb">
        홈 &gt; {product.categoryName ?? '전체상품'} &gt; {product.name}
      </div>

      <div className="product-detail">
        <div className="product-detail__image">
          {product.imageUrl && <img src={product.imageUrl} alt={product.name} />}
        </div>

        <div>
          <h1 className="product-detail__title">{product.name}</h1>
          {soldOut && <span className="stock-badge">품절</span>}
          <div className="product-detail__price">
            <span className="price__won">{(selectedOption ? selectedOption.price : minPrice).toLocaleString()}</span>
            {!selectedOption && '부터'}
          </div>

          <div className="product-detail__meta">
            <span>판매자: {product.vendorName ?? 'coupangish'}</span>
            <span>
              {!selectedOption
                ? '옵션을 선택해주세요'
                : selectedOption.stockCount === 0
                  ? '품절'
                  : `재고 ${selectedOption.stockCount}개`}
            </span>
          </div>

          {product.productOptions.length > 1 && (
            <div className="option-list" style={{ marginBottom: 'var(--space-4)' }}>
              {product.productOptions.map((option) => (
                <div
                  key={option.id}
                  className={`option-item${selectedOptionId === option.id ? ' selected' : ''}`}
                  onClick={() => option.stockCount > 0 && setSelectedOptionId(option.id)}
                  style={option.stockCount === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                >
                  <span>
                    {option.name}
                    {option.stockCount === 0 && ' (품절)'}
                  </span>
                  <strong>{option.price.toLocaleString()}원</strong>
                </div>
              ))}
            </div>
          )}

          <div className="product-detail__purchase-bar">
            <div className="qty-stepper">
              <button
                disabled={!selectedOption}
                onClick={() => setCount((c) => Math.max(1, c - 1))}
              >
                -
              </button>
              <span>{count}</span>
              <button
                disabled={!selectedOption}
                onClick={() => setCount((c) => Math.min(selectedOption?.stockCount ?? 1, c + 1))}
              >
                +
              </button>
            </div>
            {selectedOption && (
              <strong className="price__won">{(selectedOption.price * count).toLocaleString()}</strong>
            )}
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="product-detail__actions">
            <button
              className="btn btn-outline btn-block"
              disabled={!selectedOption || selectedOption.stockCount === 0}
              onClick={handleAddToCart}
            >
              장바구니 담기
            </button>
            <button
              className="btn btn-primary btn-block"
              disabled={!selectedOption || selectedOption.stockCount === 0}
              onClick={handleBuyNow}
            >
              바로 구매
            </button>
          </div>

          {product.description && <p className="product-detail__description">{product.description}</p>}
        </div>
      </div>
    </div>
  )
}
