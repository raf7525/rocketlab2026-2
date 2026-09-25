import { Link } from 'react-router'

import { Avatar } from '../../../shared/components/Avatar'
import { StarRating } from '../../../shared/components/StarRating'
import { cx } from '../../../shared/lib/cx'
import { tmdbImage } from '../../../shared/lib/images'
import type { MovieReview, ReviewedMovie } from '../types/review'
import { LikeButton } from './LikeButton'
import styles from './ReviewCard.module.css'

type Props = {
  review: MovieReview
  /** Quando a review aparece fora da página do filme, mostra pôster, título e ano. */
  movie?: ReviewedMovie
}

/** Review no formato do Letterboxd: filme, autor com a nota, resenha e curtidas. */
export function ReviewCard({ review, movie }: Props) {
  const movieUrl = movie && `/filmes/${movie.sk_movie_id}`

  return (
    <article className={cx(styles.review, movie && styles.withPoster)}>
      {movie && movieUrl && (
        // O título abaixo já leva ao filme; o pôster é um atalho só para o mouse.
        <Link to={movieUrl} tabIndex={-1} aria-hidden="true" className={styles.poster}>
          {movie.url_poster && (
            <img src={tmdbImage(movie.url_poster, 'w154')} alt="" loading="lazy" />
          )}
        </Link>
      )}

      <div className={styles.body}>
        {movie && movieUrl && (
          <h3 className={styles.movie}>
            <Link to={movieUrl} className={styles.movieTitle}>
              {movie.titulo}
            </Link>
            {movie.ano_lancamento ? (
              <span className={styles.year}>{movie.ano_lancamento}</span>
            ) : null}
          </h3>
        )}

        <p className={styles.byline}>
          <Avatar name={review.nome} />
          <span className={styles.author}>{review.nome}</span>
          <StarRating stars={review.estrelas} size="sm" />
        </p>

        <p className={styles.text}>{review.comentario}</p>

        <div className={styles.footer}>
          <LikeButton review={review} />
        </div>
      </div>
    </article>
  )
}
