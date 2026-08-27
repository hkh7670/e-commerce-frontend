import { Link } from 'react-router-dom'
import type { ProductSummary } from '../types'

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card__image">
        {product.imageUrl && <img src={product.imageUrl} alt={product.name} loading="lazy" />}
      </div>
      <div className="product-card__body">
        <p className="product-card__name">{product.name}</p>
        <div className="price-row">
          <span className="price price__won">{product.price.toLocaleString()}</span>
        </div>
        {product.stockCount === 0 && <span className="stock-badge">품절</span>}
      </div>
    </Link>
  )
}
