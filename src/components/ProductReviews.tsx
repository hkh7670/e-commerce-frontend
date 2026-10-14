import { useEffect, useState } from 'react'
import { reviewApi } from '../lib/api'
import { formatDateDot } from '../lib/date'
import { getApiErrorMessage } from '../lib/http'
import type { PageResponse, Review, ReviewRating, ReviewSummary } from '../types'
import { StarRating } from './StarRating'

const PAGE_SIZE = 10
const RATING_ROWS: ReviewRating[] = ['5', '4', '3', '2', '1']

type Props = {
  productId: number
}

export function ProductReviews({ productId }: Props) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [page, setPage] = useState(0)
  const [reviewPage, setReviewPage] = useState<PageResponse<Review> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    reviewApi
      .summary(productId)
      .then((data) => !ignore && setSummary(data))
      .catch((err) => !ignore && setError(getApiErrorMessage(err, '후기를 불러오지 못했습니다.')))
    return () => {
      ignore = true
    }
  }, [productId])

  useEffect(() => {
    let ignore = false
    reviewApi
      .listByProduct(productId, page, PAGE_SIZE)
      .then((data) => !ignore && setReviewPage(data))
      .catch((err) => !ignore && setError(getApiErrorMessage(err, '후기를 불러오지 못했습니다.')))
    return () => {
      ignore = true
    }
  }, [productId, page])

  return (
    <section className="product-reviews">
      <h2 className="product-reviews__title">
        상품 후기 {summary && <span>({summary.reviewCount.toLocaleString()})</span>}
      </h2>

      {error && <div className="error-banner">{error}</div>}

      {!error && !summary && <div className="loading-state">불러오는 중...</div>}

      {summary && summary.reviewCount === 0 && (
        <p className="product-reviews__empty">아직 작성된 후기가 없습니다.</p>
      )}

      {summary && summary.reviewCount > 0 && (
        <div className="review-summary">
          <div className="review-summary__average">
            <strong>{summary.averageRating.toFixed(1)}</strong>
            <StarRating rating={summary.averageRating} />
          </div>
          <ul className="review-summary__distribution">
            {RATING_ROWS.map((rating) => {
              const count = summary.ratingCounts[rating]
              const percent = (count / summary.reviewCount) * 100
              return (
                <li key={rating}>
                  <span>{rating}점</span>
                  <span className="review-summary__bar">
                    <span style={{ width: `${percent}%` }} />
                  </span>
                  <span>{count.toLocaleString()}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {reviewPage && reviewPage.content.length > 0 && (
        <>
          <ul className="review-list">
            {reviewPage.content.map((review) => (
              <li key={review.reviewId} className="review-item">
                <div className="review-item__meta">
                  <StarRating rating={review.rating} />
                  <span>{review.reviewerName}</span>
                  <span>{formatDateDot(review.createdAt)}</span>
                </div>
                <p className="review-item__content">{review.content}</p>
                {review.imageUrl && (
                  <img className="review-item__image" src={review.imageUrl} alt="후기 이미지" />
                )}
              </li>
            ))}
          </ul>

          {reviewPage.totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                이전
              </button>
              <button className="active">{page + 1}</button>
              <button disabled={!reviewPage.hasNext} onClick={() => setPage((p) => p + 1)}>
                다음
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
