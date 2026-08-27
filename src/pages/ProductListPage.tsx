import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categoryApi, productApi } from '../lib/api'
import { ProductCard } from '../components/ProductCard'
import type { Category, PageResponse, ProductSummary } from '../types'

const PAGE_SIZE = 20

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryId = searchParams.get('categoryId')
  const keyword = searchParams.get('keyword') ?? ''
  const page = Number(searchParams.get('page') ?? '0')

  const [categories, setCategories] = useState<Category[]>([])
  const [productPage, setProductPage] = useState<PageResponse<ProductSummary> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoryApi
      .list()
      .then((list) => setCategories(list.filter((c) => c.level === 'LARGE')))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    productApi
      .list({
        categoryId: categoryId ? Number(categoryId) : undefined,
        keyword: keyword || undefined,
        page,
        size: PAGE_SIZE,
      })
      .then(setProductPage)
      .finally(() => setLoading(false))
  }, [categoryId, keyword, page])

  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  const selectCategory = (id: number | null) => {
    const next = new URLSearchParams(searchParams)
    if (id === null) {
      next.delete('categoryId')
    } else {
      next.set('categoryId', String(id))
    }
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)' }}>
      <div className="breadcrumb">홈 &gt; 전체상품{keyword && ` &gt; "${keyword}" 검색결과`}</div>

      <div className="category-rail" style={{ marginBottom: 'var(--space-5)' }}>
        <button
          className={`category-chip${!categoryId ? ' active' : ''}`}
          onClick={() => selectCategory(null)}
        >
          전체
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-chip${Number(categoryId) === category.id ? ' active' : ''}`}
            onClick={() => selectCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">불러오는 중...</div>
      ) : !productPage || productPage.content.length === 0 ? (
        <div className="empty-state">
          <h2>상품이 없습니다</h2>
          <p>다른 카테고리나 검색어를 시도해보세요.</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {productPage.content.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="pagination">
            <button disabled={page === 0} onClick={() => goToPage(page - 1)}>
              이전
            </button>
            <button className="active">{page + 1}</button>
            <button disabled={!productPage.hasNext} onClick={() => goToPage(page + 1)}>
              다음
            </button>
          </div>
        </>
      )}
    </div>
  )
}
