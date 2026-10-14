import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ReviewForm } from '../components/ReviewForm'
import { StarRating } from '../components/StarRating'
import { reviewApi } from '../lib/api'
import { formatDateDot } from '../lib/date'
import { getApiErrorMessage } from '../lib/http'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import type { PageResponse, Review } from '../types'

const PAGE_SIZE = 10

export function MyReviewsPage() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const [page, setPage] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [reviewPage, setReviewPage] = useState<PageResponse<Review> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }
    let ignore = false
    reviewApi
      .listMine(page, PAGE_SIZE)
      .then((data) => {
        if (!ignore) {
          setReviewPage(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(getApiErrorMessage(err, '후기를 불러오지 못했습니다.'))
        }
      })
    return () => {
      ignore = true
    }
  }, [isLoggedIn, page, reloadKey])

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

  const handleUpdate = async (review: Review, rating: number, content: string) => {
    // PATCH는 전체 교체라 기존 이미지를 다시 보내야 지워지지 않는다
    const updated = await reviewApi.update(review.reviewId, {
      rating,
      content,
      imageUrl: review.imageUrl,
    })
    setReviewPage((prev) =>
      prev
        ? {
            ...prev,
            content: prev.content.map((item) =>
              item.reviewId === updated.reviewId ? updated : item,
            ),
          }
        : prev,
    )
    setEditingReviewId(null)
    useToastStore.getState().show('후기가 수정되었습니다.')
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm('후기를 삭제하시겠습니까?')) {
      return
    }
    setDeletingReviewId(reviewId)
    setError(null)
    try {
      await reviewApi.remove(reviewId)
      const wasLastOnPage = reviewPage?.content.length === 1
      if (wasLastOnPage && page > 0) {
        setPage((p) => p - 1)
      } else {
        setReloadKey((key) => key + 1)
      }
      useToastStore.getState().show('후기가 삭제되었습니다.')
    } catch (err) {
      setError(getApiErrorMessage(err, '후기를 삭제하지 못했습니다.'))
    } finally {
      setDeletingReviewId(null)
    }
  }

  if (!reviewPage && !error) {
    return <div className="loading-state">불러오는 중...</div>
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', maxWidth: 760 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 'var(--space-5)' }}>내 후기</h1>

      {error && <div className="error-banner">{error}</div>}

      {reviewPage && reviewPage.content.length === 0 && (
        <div className="empty-state">
          <h2>작성한 후기가 없습니다</h2>
          <Link to="/orders" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            주문내역 보기
          </Link>
        </div>
      )}

      {reviewPage && reviewPage.content.length > 0 && (
        <>
          <ul className="review-list">
            {reviewPage.content.map((review) => (
              <li key={review.reviewId} className="review-item">
                <div className="review-item__header">
                  {review.productName === null ? (
                    <strong>삭제된 상품</strong>
                  ) : (
                    <Link to={`/products/${review.productId}`}>
                      <strong>{review.productName}</strong>
                    </Link>
                  )}
                  <span>{formatDateDot(review.createdAt)}</span>
                </div>

                {editingReviewId === review.reviewId ? (
                  <ReviewForm
                    initialRating={review.rating}
                    initialContent={review.content}
                    submitLabel="수정 완료"
                    onSubmit={(rating, content) => handleUpdate(review, rating, content)}
                    onCancel={() => setEditingReviewId(null)}
                  />
                ) : (
                  <>
                    <StarRating rating={review.rating} />
                    <p className="review-item__content">{review.content}</p>
                    {review.imageUrl && (
                      <img className="review-item__image" src={review.imageUrl} alt="후기 이미지" />
                    )}
                    <div className="review-item__actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditingReviewId(review.reviewId)}
                      >
                        수정
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        disabled={deletingReviewId === review.reviewId}
                        onClick={() => handleDelete(review.reviewId)}
                      >
                        삭제
                      </button>
                    </div>
                  </>
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
    </div>
  )
}
