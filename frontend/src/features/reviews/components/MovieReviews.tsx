import { useId } from 'react'

import { SectionHeading } from '../../../shared/components/SectionHeading'
import { useMovieReviews } from '../hooks/useReviews'
import { ReviewCard } from './ReviewCard'
import styles from './ReviewList.module.css'

/** Avaliações de um filme, da mais recente para a mais antiga (a ordem vem da API). */
export function MovieReviews({ movieId }: { movieId: string }) {
  const headingId = useId()
  const reviews = useMovieReviews(movieId)

  return (
    <section aria-labelledby={headingId}>
      <SectionHeading id={headingId}>Avaliações</SectionHeading>

      {reviews.isPending && <p className={styles.message}>Carregando avaliações…</p>}
      {reviews.isError && (
        <p role="alert" className={styles.message}>
          Não foi possível carregar as avaliações.
        </p>
      )}
      {reviews.data?.length === 0 && (
        <p className={styles.message}>Ninguém avaliou este filme ainda.</p>
      )}
      {reviews.data && reviews.data.length > 0 && (
        <ul role="list" className={styles.list}>
          {reviews.data.map((review) => (
            <li key={review.sk_movie_review_id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
