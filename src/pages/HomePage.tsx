import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryApi, productApi } from '../lib/api'
import { ProductCard } from '../components/ProductCard'
import type { Category, ProductSummary } from '../types'

export function HomePage() {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([productApi.list({ page: 0, size: 10 }), categoryApi.list()])
      .then(([productPage, categoryList]) => {
        setProducts(productPage.content)
        setCategories(categoryList.filter((c) => c.level === 'LARGE'))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>오늘도 빠르고 알뜰하게</h1>
          <p>coupangish에서 필요한 걸 가장 빠르게 만나보세요.</p>
        </div>
      </section>

      <div className="container">
        <div className="category-rail" style={{ marginBottom: 'var(--space-6)' }}>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?categoryId=${category.id}`}
              className="category-chip"
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="section-heading">
          <h2>지금 인기있는 상품</h2>
          <Link to="/products">전체보기 &gt;</Link>
        </div>

        {loading ? (
          <div className="loading-state">불러오는 중...</div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
