export const MAX_RATING = 5

type Props = {
  rating: number
}

export function StarRating({ rating }: Props) {
  const filled = Math.round(rating)
  return (
    <span className="star-rating" aria-label={`5점 만점에 ${rating}점`}>
      {'★'.repeat(filled)}
      <span className="star-rating__empty">{'★'.repeat(MAX_RATING - filled)}</span>
    </span>
  )
}
