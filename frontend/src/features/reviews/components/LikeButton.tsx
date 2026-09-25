import { cx } from '../../../shared/lib/cx'
import { pluralize } from '../../../shared/lib/format'
import { useReviewLike } from '../hooks/useReviewLike'
import type { MovieReview } from '../types/review'
import styles from './LikeButton.module.css'

/** Coração com a contagem, como no Letterboxd: cinza, e laranja depois de curtir. */
export function LikeButton({ review }: { review: MovieReview }) {
  const { liked, toggle, isPending } = useReviewLike(review)

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-busy={isPending}
      onClick={toggle}
      className={cx(styles.like, liked && styles.liked)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.heart}>
        <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
      </svg>
      <span className="visually-hidden">Curtir </span>
      <span>{pluralize(review.curtidas, 'curtida', 'curtidas')}</span>
    </button>
  )
}
