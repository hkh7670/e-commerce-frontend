import { useState, type SubmitEvent } from 'react'
import { getApiErrorMessage } from '../lib/http'
import { MAX_RATING } from './StarRating'

const CONTENT_MAX_LENGTH = 2000
const RATING_OPTIONS = Array.from({ length: MAX_RATING }, (_, index) => index + 1)

type Props = {
  initialRating?: number
  initialContent?: string
  submitLabel: string
  onSubmit: (rating: number, content: string) => Promise<void>
  onCancel: () => void
}

export function ReviewForm({
  initialRating = 0,
  initialContent = '',
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [rating, setRating] = useState(initialRating)
  const [content, setContent] = useState(initialContent)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    if (rating < 1) {
      setError('별점을 선택해주세요.')
      return
    }
    if (!content.trim()) {
      setError('후기 내용을 입력해주세요.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(rating, content.trim())
    } catch (err) {
      setError(getApiErrorMessage(err, '후기를 저장하지 못했습니다.'))
      setSubmitting(false)
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form__rating" role="group" aria-label="별점">
        {RATING_OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            className={value <= rating ? 'active' : undefined}
            aria-label={`${value}점`}
            aria-pressed={value === rating}
            onClick={() => setRating(value)}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={content}
        maxLength={CONTENT_MAX_LENGTH}
        placeholder="상품에 대한 솔직한 후기를 남겨주세요."
        aria-label="후기 내용"
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="review-form__counter">
        {content.length.toLocaleString()} / {CONTENT_MAX_LENGTH.toLocaleString()}
      </div>
      {error && <div className="error-banner">{error}</div>}
      <div className="review-form__actions">
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
          {submitting ? '저장 중...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
