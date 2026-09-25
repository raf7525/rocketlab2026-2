import { useId } from 'react'

import { SectionHeading } from '../../../shared/components/SectionHeading'
import { usePopularReviews } from '../hooks/useReviews'
import { ReviewCard } from './ReviewCard'
import styles from './ReviewList.module.css'

/** As reviews mais curtidas de todos os filmes, como "Popular reviews" no Letterboxd. */
export function PopularReviews() {
  const headingId = useId()
  const reviews = usePopularReviews()

  return (
    <section aria-labelledby={headingId}>
      <SectionHeading id={headingId}>Reviews populares</SectionHeading>

      {reviews.isPending && <p className={styles.message}>Carregando reviews…</p>}
      {reviews.isError && (
        <p role="alert" className={styles.message}>
          Não foi possível carregar as reviews populares.
        </p>
      )}
      {reviews.data?.length === 0 && (
        <p className={styles.message}>Nenhuma review por aqui ainda.</p>
      )}
      {reviews.data && reviews.data.length > 0 && (
        <ul role="list" className={styles.list}>
          {reviews.data.map((review) => (
            <li key={review.sk_movie_review_id}>
              <ReviewCard review={review} movie={review.filme} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
